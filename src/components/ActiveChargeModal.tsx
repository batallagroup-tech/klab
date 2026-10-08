import React, { useState, useEffect } from 'react';
import { MerchantProfile, CartItem, PaymentMethod, CardPaymentDetails } from '../types';
import {
  X,
  Copy,
  Check,
  Share2,
  Volume2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Wifi,
  Banknote,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { buildQRPayload, generateQRDataURL } from '../lib/qr';
import { formatCLABE, MEXICAN_BANKS } from '../lib/banks';
import { announcePayment, triggerHaptic } from '../lib/soundbox';
import { startNFCReader } from '../lib/nfc';
import { CashCalculatorModal } from './CashCalculatorModal';
import { Share } from '@capacitor/share';

interface ActiveChargeModalProps {
  amount: number;
  items: CartItem[];
  profile: MerchantProfile;
  onClose: () => void;
  onPaymentSuccess: (
    amount: number,
    summary: string,
    method: PaymentMethod,
    cardDetails?: CardPaymentDetails
  ) => void;
}

export const ActiveChargeModal: React.FC<ActiveChargeModalProps> = ({
  amount,
  items,
  profile,
  onClose,
  onPaymentSuccess,
}) => {
  const [chargeMode, setChargeMode] = useState<'qr' | 'nfc' | 'cash'>('qr');
  const [qrType, setQrType] = useState<'exact' | 'static'>('exact');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isNfcListening, setIsNfcListening] = useState<boolean>(false);
  const [showCashModal, setShowCashModal] = useState<boolean>(false);

  const bank = MEXICAN_BANKS[profile.bankCode];
  const itemsSummary =
    items.length > 0
      ? items.map((i) => `${i.qty}x ${i.product.name}`).join(', ')
      : 'Venta rápida';

  // Generación determinista del código QR
  useEffect(() => {
    let isMounted = true;
    const qrAmount = qrType === 'exact' ? amount : 0;
    const payload = buildQRPayload({ amount: qrAmount, profile });

    generateQRDataURL(payload, 450).then((url) => {
      if (isMounted) setQrUrl(url);
    });

    return () => {
      isMounted = false;
    };
  }, [amount, profile, qrType]);

  // Listener NFC real para tarjetas contactless
  useEffect(() => {
    if (chargeMode !== 'nfc' || isSuccess) return;

    let cleanup = () => {};
    setIsNfcListening(true);

    startNFCReader((card) => {
      handleCardReceived(card);
    }).then((cancel) => {
      cleanup = cancel;
    });

    return () => {
      setIsNfcListening(false);
      cleanup();
    };
  }, [chargeMode, isSuccess]);

  const handleCopyCLABE = () => {
    triggerHaptic();
    const clean = profile.clabe.replace(/\D/g, '');
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    triggerHaptic();
    const text = `💳 Pago a: ${profile.stallName}\n💵 Monto: $${amount.toFixed(
      2
    )} MXN\n🏦 Banco: ${bank?.name || profile.bankName}\n🔢 CLABE: ${formatCLABE(
      profile.clabe
    )}\n👤 Titular: ${profile.name || profile.stallName}\n⚡ Cobro directo SPEI`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `Cobro en ${profile.stallName}`, text });
      } else {
        await Share.share({ title: `Cobro en ${profile.stallName}`, text });
      }
    } catch {
      handleCopyCLABE();
    }
  };

  const handleCardReceived = async (card: CardPaymentDetails) => {
    triggerHaptic();
    setIsSuccess(true);

    if (profile.enableVoice) {
      await announcePayment(amount, undefined, profile.voiceRate, profile.voicePitch);
    }

    setTimeout(() => {
      onPaymentSuccess(amount, itemsSummary, 'nfc_card', card);
    }, 1200);
  };

  const handleConfirmPaid = async (method: PaymentMethod = 'spei_qr') => {
    triggerHaptic();
    setIsSuccess(true);

    if (profile.enableVoice) {
      await announcePayment(amount, undefined, profile.voiceRate, profile.voicePitch);
    }

    setTimeout(() => {
      onPaymentSuccess(amount, itemsSummary, method);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md mx-auto bg-[#0d111a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111624]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pantalla de Cobro
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Total Header */}
        <div className="px-6 py-4 bg-[#141a29] border-b border-slate-800/80 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 tracking-wider">
            Total a Cobrar
          </span>
          <div className="text-4xl font-black font-mono text-white flex items-center justify-center gap-1">
            <span className="text-emerald-400 text-3xl">$</span>
            <span>{amount.toFixed(2)}</span>
            <span className="text-xs font-bold text-slate-500 uppercase ml-1">MXN</span>
          </div>
          <div className="text-xs text-slate-400 mt-1 truncate">
            {profile.stallName} • <span className="text-slate-300">{itemsSummary}</span>
          </div>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-3 p-2 bg-[#0c1018] gap-1 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setChargeMode('qr');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              chargeMode === 'qr'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>SPEI QR</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setChargeMode('nfc');
            }}
            className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              chargeMode === 'nfc'
                ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wifi className="w-4 h-4 rotate-90" />
            <span>Tarjeta NFC</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setShowCashModal(true);
            }}
            className="py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            <Banknote className="w-4 h-4" />
            <span>Efectivo</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: SPEI QR */}
          {chargeMode === 'qr' && (
            <div className="space-y-4 text-center">
              {/* QR Mode Switcher (Exact vs Static) */}
              <div className="inline-flex p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setQrType('exact')}
                  className={`px-3 py-1 rounded-lg transition ${
                    qrType === 'exact'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  Con monto (${amount.toFixed(2)})
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('static')}
                  className={`px-3 py-1 rounded-lg transition ${
                    qrType === 'static'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  QR Fijo del puesto
                </button>
              </div>

              {/* QR Container */}
              <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl border border-slate-700 shadow-xl flex items-center justify-center relative">
                {qrUrl ? (
                  <img src={qrUrl} alt="Código QR SPEI" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-slate-500 text-xs">Generando QR...</div>
                )}
              </div>

              {/* Bank & CLABE Card */}
              <div className="bg-[#131826] border border-slate-800 rounded-2xl p-3 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    Banco: <strong className="text-white">{bank?.name || profile.bankName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 active:scale-95 transition"
                  >
                    <Share2 className="w-3 h-3" /> Compartir
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-2">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block">CLABE</span>
                    <span className="font-mono text-xs sm:text-sm font-bold text-white tracking-wider">
                      {formatCLABE(profile.clabe) || profile.clabe || 'Sin CLABE configurada'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCLABE}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                      copied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiada' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-400">
                  Titular: <strong className="text-slate-200">{profile.name || profile.stallName}</strong>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={() => handleConfirmPaid('spei_qr')}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pago Recibido</span>
              </button>
            </div>
          )}

          {/* TAB 2: NFC CONTACTLESS */}
          {chargeMode === 'nfc' && (
            <div className="space-y-5 text-center py-4">
              <div className="relative w-24 h-24 mx-auto rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wifi className="w-12 h-12 rotate-90 animate-pulse" />
                <div className="absolute inset-0 rounded-3xl border border-cyan-400/40 animate-ping opacity-20 pointer-events-none" />
              </div>

              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Acerca la tarjeta o teléfono
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Acepta tarjetas de débito/crédito contactless (Visa, Mastercard, Carnet) o Apple Pay / Google Wallet acercándolas a la parte trasera del teléfono.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-left space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                  <CreditCard className="w-4 h-4" />
                  <span>Lector NFC Activo</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Esperando contacto de tarjeta en la antena NFC de tu dispositivo...
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleCardReceived({
                    brand: 'Visa',
                    last4: '4820',
                    authCode: 'APROB-' + Math.floor(100000 + Math.random() * 900000),
                    holderName: 'TARJETAHABIENTE',
                  })
                }
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/30 active:scale-95 transition"
              >
                Confirmar Cobro con Tarjeta Manualmente
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-2.5 bg-[#0b0e16] border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Sin intermediarios ni retención de fondos
          </span>
          <span>Klab POS</span>
        </div>
      </div>

      {/* Cash Calculator Modal */}
      {showCashModal && (
        <CashCalculatorModal
          amount={amount}
          enableVoice={profile.enableVoice}
          onConfirmCash={() => {
            setShowCashModal(false);
            handleConfirmPaid('cash');
          }}
          onClose={() => setShowCashModal(false)}
        />
      )}
    </div>
  );
};
