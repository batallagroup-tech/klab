import React, { useState, useEffect } from 'react';
import { MerchantProfile, CartItem, PaymentMethod } from '../types';
import {
  X,
  Copy,
  Check,
  Share2,
  Volume2,
  ShieldCheck,
  QrCode,
  Banknote,
  CheckCircle2,
  Sparkles,
  BellRing,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { buildQRPayload, generateQRDataURL } from '../lib/qr';
import { formatCLABE, MEXICAN_BANKS } from '../lib/banks';
import { announcePayment, triggerHaptic } from '../lib/soundbox';
import {
  listenToBankPayments,
  isNotificationAccessGranted,
  openNotificationAccessSettings,
  BankPaymentEvent,
} from '../lib/bankDetector';
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
    payerOrBank?: string
  ) => void;
}

export const ActiveChargeModal: React.FC<ActiveChargeModalProps> = ({
  amount,
  items,
  profile,
  onClose,
  onPaymentSuccess,
}) => {
  const [chargeMode, setChargeMode] = useState<'qr' | 'cash'>('qr');
  const [qrType, setQrType] = useState<'exact' | 'static'>('exact');
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showCashModal, setShowCashModal] = useState<boolean>(false);
  const [isPermissionOk, setIsPermissionOk] = useState<boolean | null>(null);
  const [lastDetectedAlert, setLastDetectedAlert] = useState<string | null>(null);

  const bank = MEXICAN_BANKS[profile.bankCode];
  const itemsSummary =
    items.length > 0
      ? items.map((i) => `${i.qty}x ${i.product.name}`).join(', ')
      : 'Venta rápida';

  // Verificar estado del permiso de notificaciones bancarias
  useEffect(() => {
    isNotificationAccessGranted().then((granted) => {
      setIsPermissionOk(granted);
    });
  }, []);

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

  // Listener nativo en tiempo real de notificaciones bancarias (BBVA, Nu, MP, STP, etc.)
  useEffect(() => {
    if (isSuccess) return;

    let cleanup = () => {};

    listenToBankPayments((payment: BankPaymentEvent) => {
      console.log('⚡ [ActiveCharge] Evento recibido en vista:', payment);
      setLastDetectedAlert(`${payment.bank}: $${payment.amount.toFixed(2)}`);

      // Si el monto coincide (o si es un cobro activo y cae depósito positivo)
      triggerHaptic();
      setIsSuccess(true);

      if (profile.enableVoice) {
        announcePayment(payment.amount || amount, undefined, profile.voiceRate, profile.voicePitch);
      }

      setTimeout(() => {
        onPaymentSuccess(
          amount,
          itemsSummary,
          'spei_qr',
          `${payment.bank} (Auto)`
        );
      }, 1400);
    }).then((unsub) => {
      cleanup = unsub;
    });

    return () => {
      cleanup();
    };
  }, [amount, isSuccess, itemsSummary, onPaymentSuccess, profile]);

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
    )}\n👤 Titular: ${profile.name || profile.stallName}\n⚡ Cobro directo SPEI 0% comisiones`;

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

  const handleManualConfirm = async () => {
    triggerHaptic();
    setIsSuccess(true);

    if (profile.enableVoice) {
      await announcePayment(amount, undefined, profile.voiceRate, profile.voicePitch);
    }

    setTimeout(() => {
      onPaymentSuccess(amount, itemsSummary, 'spei_qr', 'SPEI Manual');
    }, 1200);
  };

  const handleEnableDetector = async () => {
    triggerHaptic();
    await openNotificationAccessSettings();
    setTimeout(() => {
      isNotificationAccessGranted().then((granted) => setIsPermissionOk(granted));
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md mx-auto bg-[#0d111a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111624]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Terminal de Cobro
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
        <div className="grid grid-cols-2 p-2 bg-[#0c1018] gap-1.5 border-b border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setChargeMode('qr');
            }}
            className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              chargeMode === 'qr'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>SPEI QR Bancario</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              setShowCashModal(true);
            }}
            className="py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-slate-400 hover:text-slate-200 bg-slate-900/40 hover:bg-slate-800/60 transition"
          >
            <Banknote className="w-4 h-4 text-amber-400" />
            <span>Efectivo & Cambio</span>
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
                  className={`px-3 py-1.5 rounded-lg transition ${
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
                  className={`px-3 py-1.5 rounded-lg transition ${
                    qrType === 'static'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'text-slate-400'
                  }`}
                >
                  QR Fijo del negocio
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

              {/* Live Bank Detector Badge */}
              <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-left flex items-start gap-2.5">
                <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-slate-200">
                      Detector Automático de Transferencias
                    </span>
                    {isPermissionOk ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        En vivo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnableDetector}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-0.5"
                      >
                        Activar acceso <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {lastDetectedAlert
                      ? `🔔 Detectado: ${lastDetectedAlert}`
                      : `Escuchando alertas de ${bank?.name || 'tu banco'} al caer el SPEI.`}
                  </p>
                </div>
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
                    <Share2 className="w-3.5 h-3.5" />
                    Enviar datos
                  </button>
                </div>

                <div className="flex items-center justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800/80">
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      CLABE Interbancaria
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">
                      {formatCLABE(profile.clabe)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyCLABE}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 active:scale-95 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400">
                  Titular: <span className="text-slate-200 font-medium">{profile.name || profile.stallName}</span>
                </div>
              </div>

              {/* Manual Confirm Button */}
              <button
                type="button"
                onClick={handleManualConfirm}
                disabled={isSuccess}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.99] ${
                  isSuccess
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                }`}
              >
                {isSuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 animate-bounce" />
                    <span>¡Pago Confirmado!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Confirmar Pago Recibido</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#0a0d14] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SPEI Directo a tu banco (0% comisiones)</span>
          </div>

          <div className="flex items-center gap-1">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Bocina {profile.enableVoice ? 'Activada' : 'Muda'}</span>
          </div>
        </div>
      </div>

      {/* Cash calculator sub-modal */}
      {showCashModal && (
        <CashCalculatorModal
          totalAmount={amount}
          onClose={() => setShowCashModal(false)}
          onConfirmPayment={() => {
            setShowCashModal(false);
            onPaymentSuccess(amount, itemsSummary, 'cash');
          }}
        />
      )}
    </div>
  );
};
