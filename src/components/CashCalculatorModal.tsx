import React, { useState } from 'react';
import { X, Banknote, Check, Volume2, ArrowRight } from 'lucide-react';
import { triggerHaptic, announcePayment } from '../lib/soundbox';

interface CashCalculatorModalProps {
  amount: number;
  enableVoice: boolean;
  onConfirmCash: () => void;
  onClose: () => void;
}

export const CashCalculatorModal: React.FC<CashCalculatorModalProps> = ({
  amount,
  enableVoice,
  onConfirmCash,
  onClose,
}) => {
  const [receivedStr, setReceivedStr] = useState<string>('');

  const receivedNum = parseFloat(receivedStr) || 0;
  const change = Math.max(0, receivedNum - amount);
  const isExactOrHigher = receivedNum >= amount;

  const quickBills = [50, 100, 200, 500];

  const handleSetBill = (val: number) => {
    triggerHaptic();
    setReceivedStr(val.toString());
  };

  const handleFinish = () => {
    triggerHaptic();
    if (enableVoice && change > 0) {
      // Opcional: decir el cambio por voz
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(`Cambio de ${Math.round(change)} pesos`);
        u.lang = 'es-MX';
        window.speechSynthesis.speak(u);
      }
    }
    onConfirmCash();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Banknote className="w-4 h-4" />
            <span>Calculadora de Cambio (Efectivo)</span>
          </h3>
          <button
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-center">
          {/* Total Due */}
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-400 block mb-0.5">
              Total a Pagar
            </span>
            <div className="text-3xl font-black font-mono text-white tracking-tight">
              ${amount.toFixed(2)} <span className="text-xs font-sans text-slate-400">MXN</span>
            </div>
          </div>

          {/* Quick Bills Selector */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Billete recibido del cliente:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {quickBills.map((bill) => (
                <button
                  key={bill}
                  type="button"
                  onClick={() => handleSetBill(bill)}
                  className={`py-2 px-1 rounded-xl border text-xs font-mono font-black transition active:scale-95 ${
                    receivedNum === bill
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-800/90 text-amber-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  ${bill}
                </button>
              ))}
            </div>
          </div>

          {/* Manual Received Input */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] uppercase font-bold text-slate-400 block">
              O ingresa monto recibido:
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-slate-400 font-mono text-sm font-bold">
                $
              </span>
              <input
                type="number"
                step="any"
                value={receivedStr}
                onChange={(e) => setReceivedStr(e.target.value)}
                placeholder="0.00"
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-[#0a0c14] border border-slate-700 font-mono text-lg font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Change Display Box */}
          {receivedNum > 0 && (
            <div
              className={`p-3.5 rounded-2xl border text-center transition animate-in zoom-in-95 duration-150 ${
                isExactOrHigher
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                  : 'bg-red-950/40 border-red-500/40 text-red-400'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block mb-0.5">
                {isExactOrHigher ? '💵 Cambio / Vuelto a Entregar' : 'Falta dinero'}
              </span>
              <div className="text-3xl font-black font-mono tracking-tight">
                ${change.toFixed(2)}
              </div>
            </div>
          )}

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleFinish}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-amber-500/20"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Confirmar Pago y Generar Ticket</span>
          </button>
        </div>
      </div>
    </div>
  );
};
