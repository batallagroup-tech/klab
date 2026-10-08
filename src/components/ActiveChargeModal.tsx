import React, { useState, useEffect } from 'react';
import { MerchantProfile, CartItem, PaymentMethod, CardPaymentDetails } from '../types';
import {
  X,
  Copy,
  Check,
  Share2,
  Sparkles,
  Volume2,
  ShieldCheck,
  QrCode,
  CreditCard,
  Wifi,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { buildQRPayload, generateQRDataURL } from '../lib/qr';
import { formatCLABE, MEXICAN_BANKS } from '../lib/banks';
import { announcePayment, triggerHaptic } from '../lib/soundbox';
import { isNFCSupported, startNFCReader, simulateCardTap } from '../lib/nfc';
import { CashCalculatorModal } from './CashCalculatorModal';
import confetti from 'canvas-confetti';
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
  const [activeTab, setActiveTab] = useState<'qr' | 'nfc'>('qr');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isNfcProcessing, setIsNfcProcessing] = useState<boolean>(false);
  const [showCashCalculator, setShowCashCalculator] = useState<boolean>(false);
  const [lastCard, setLastCard] = useState<CardPaymentDetails | undefined>();

  const bank = MEXICAN_BANKS[profile.bankCode];
  const itemsSummary =
    items.length > 0
      ? items.map((i) => `${i.qty}x ${i.product.name}`).join(', ')
      : 'Venta rápida';

  useEffect(() => {
    let isMounted = true;
    const payload = buildQRPayload({ amount, profile });
    generateQRDataURL(payload, 450).then((url) => {
      if (isMounted) setQrUrl(url);
    });
    return () => {
      isMounted = false;
    };
  }, [amount, profile]);

  useEffect(() => {
    if (activeTab !== 'nfc' || isSuccess) return;

    let cleanup = () => {};
    startNFCReader((card) => {
      handleCardTapReceived(card);
    }).then((cancel) => {
      cleanup = cancel;
    });

    return () => {
      cleanup();
    };
  }, [activeTab, isSuccess]);

  const handleCopyCLABE = () => {
    triggerHaptic();
    const clean = profile.clabe.replace(/\s+/g, '');
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    triggerHaptic();
    const text = `💳 Pago a: ${profile.stallName}\n💵 Total: $${amount.toFixed(
      2
    )} MXN\n🏦 Banco: ${profile.bankName}\n🔢 CLABE: ${profile.clabe}\n⚡ Cobro rápido sin comisión`;
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

  const handleCardTapReceived = async (card: CardPaymentDetails) => {
    triggerHaptic();
    setIsNfcProcessing(true);
    setLastCard(card);

    setTimeout(async () => {
      setIsNfcProcessing(false);
      setIsSuccess(true);

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10B981', '#06B6D4', '#3B82F6', '#F59E0B'],
        });
      } catch (e) {
        console.warn(e);
      }

      if (profile.enableVoice) {
        await announcePayment(amount, undefined, profile.voiceRate, profile.voicePitch);
      }

      setTimeout(() => {
        onPaymentSuccess(amount, itemsSummary, 'nfc_card', card);
      }, 1500);
    }, 1200);
  };

  const handleConfirmSuccess = async (method: PaymentMethod = 'spei_qr') => {
    triggerHaptic();
    setIsSuccess(true);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }

    if (profile.enableVoice) {
      await announcePayment(amount, undefined, profile.voiceRate, profile.voicePitch);
    }

    setTimeout(() => {
      onPaymentSuccess(amount, itemsSummary, method);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end sm:justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-auto bg-[#0f121d] border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header Modal */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Terminal de Cobro Klab
            </span>
          </div>
          <button
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!isSuccess && (
          <div className="px-5 pt-3 pb-1 bg-[#101322] border-b border-slate-800/60">
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-[#0a0c14] border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setActiveTab('qr');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'qr'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QR / SPEI (0%)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  setActiveTab('nfc');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'nfc'
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wifi className="w-4 h-4 rotate-90 text-cyan-400" />
                <span>Tarjeta Contactless</span>
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-center">
          {isSuccess ? (
            /* Success View */
            <div className="py-10 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-24 h-24 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Check className="w-12 h-12 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-white">¡Cobro Confirmado!</h3>
                <p className="text-3xl font-black font-mono text-emerald-400 mt-1">
                  ${amount.toFixed(2)}{' '}
                  <span className="text-sm font-sans text-slate-400">MXN</span>
                </p>
                {lastCard && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-200 mt-2 font-mono">
                    <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                    <span>
                      {lastCard.brand} •••• {lastCard.last4}
                    </span>
                    <span className="text-emerald-400 font-bold">✓ Aprobada</span>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Generando ticket de compra digital...
                </p>
              </div>
            </div>
          ) : activeTab === 'qr' ? (
            /* Tab 1: QR & SPEI */
            <>
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-0.5">
                  {profile.stallName}
                </div>
                <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  <span className="text-emerald-400 text-3xl sm:text-4xl">$</span>
                  {amount.toFixed(2)}
                  <span className="text-xs sm:text-sm font-sans font-bold text-slate-400 ml-1.5 uppercase">
                    MXN
                  </span>
                </div>
                {itemsSummary && items.length > 0 && (
                  <p className="text-xs text-emerald-400/90 font-medium truncate mt-1">
                    {itemsSummary}
                  </p>
                )}
              </div>

              {/* QR Container */}
              <div className="relative mx-auto w-52 h-52 sm:w-60 sm:h-60 bg-white p-3 rounded-2xl shadow-xl shadow-black/60 flex items-center justify-center border-4 border-emerald-500/30">
                {qrUrl ? (
                  <img
                    src={qrUrl}
                    alt="Código QR de Pago"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 animate-pulse">
                    <QrCode className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-xl bg-slate-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-black text-xs shadow-lg">
                  Klab
                </div>
              </div>

              {/* Bank & CLABE Card */}
              <div className="bg-[#141829] border border-slate-800 rounded-2xl p-3 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {bank && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                        style={{
                          backgroundColor: `${bank.brandColor}33`,
                          color:
                            bank.textColor === '#FFFFFF' ? '#60A5FA' : bank.textColor,
                          border: `1px solid ${bank.brandColor}66`,
                        }}
                      >
                        {bank.name}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 truncate">
                      Titular: {profile.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    0% Comisión
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#0a0c14] border border-slate-800/90 rounded-xl p-2.5">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block leading-none mb-1">
                      CLABE Interbancaria (18 dígitos)
                    </span>
                    <span className="font-mono text-sm sm:text-base font-extrabold text-white tracking-wider block leading-tight">
                      {formatCLABE(profile.clabe) || profile.clabe}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyCLABE}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 active:scale-95 transition ${
                      copied
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copied ? 'Copiada' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleConfirmSuccess('spei_qr')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
                >
                  <Sparkles className="w-5 h-5 fill-slate-950" />
                  <span>Confirmar Depósito Recibido</span>
                  {profile.enableVoice && (
                    <Volume2 className="w-4 h-4 ml-1 opacity-80" />
                  )}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setShowCashCalculator(true);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Banknote className="w-3.5 h-3.5 text-amber-400" />
                    <span>💵 Pago en Efectivo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Compartir Datos</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Tarjeta Contactless / NFC */
            <div className="py-2 space-y-4">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-0.5">
                  Cobro con Tarjeta Contactless
                </span>
                <div className="text-4xl sm:text-5xl font-black font-mono text-white tracking-tight">
                  <span className="text-cyan-400 text-3xl sm:text-4xl">$</span>
                  {amount.toFixed(2)}
                  <span className="text-xs sm:text-sm font-sans font-bold text-slate-400 ml-1.5 uppercase">
                    MXN
                  </span>
                </div>
              </div>

              {/* NFC Card Radar Animation */}
              <div className="relative mx-auto w-56 h-56 bg-gradient-to-b from-[#12192d] to-[#0a0d18] border-2 border-cyan-500/40 rounded-3xl p-4 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-cyan-950/50">
                <div className="absolute w-40 h-40 rounded-full border border-cyan-500/30 animate-ping pointer-events-none" />
                <div className="absolute w-28 h-28 rounded-full border border-cyan-400/40 animate-pulse pointer-events-none" />

                <div className="relative z-10 w-20 h-20 rounded-2xl bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-lg shadow-cyan-500/30 mb-2">
                  <CreditCard className="w-10 h-10 animate-bounce" />
                </div>

                <div className="relative z-10 text-center">
                  <p className="text-xs font-black text-white leading-tight">
                    {isNfcProcessing
                      ? 'Procesando tarjeta...'
                      : 'Acerca la tarjeta al reverso'}
                  </p>
                  <p className="text-[10px] text-cyan-300/80 mt-0.5">
                    Visa • Mastercard • Apple Pay • Google Pay
                  </p>
                </div>
              </div>

              {/* NFC Sensor Notice */}
              <div className="bg-[#141829] border border-slate-800 rounded-2xl p-3 text-left space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    Lector NFC Activo
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                    Listo para leer
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pega la tarjeta con chip contactless a la parte trasera de este teléfono durante 1 segundo.
                </p>
              </div>

              {/* Tap Simulation Button */}
              <div className="pt-1 space-y-2">
                <button
                  type="button"
                  disabled={isNfcProcessing}
                  onClick={() => {
                    const sample = simulateCardTap('Visa');
                    handleCardTapReceived(sample);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-cyan-500/20"
                >
                  <CreditCard className="w-4 h-4 fill-slate-950" />
                  <span>
                    {isNfcProcessing
                      ? 'Autorizando transacción...'
                      : 'Simular Toque de Tarjeta (Test)'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Batalla Group Brand Footer */}
          <div className="pt-1 text-[10px] text-slate-500 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Facilitador tecnológico • Desarrollado por</span>
            <strong className="text-slate-300 font-semibold">Batalla Group</strong>
          </div>
        </div>
      </div>

      {/* Cash Calculator Sub-modal */}
      {showCashCalculator && (
        <CashCalculatorModal
          amount={amount}
          enableVoice={profile.enableVoice}
          onConfirmCash={() => {
            setShowCashCalculator(false);
            handleConfirmSuccess('cash');
          }}
          onClose={() => setShowCashCalculator(false)}
        />
      )}
    </div>
  );
};
