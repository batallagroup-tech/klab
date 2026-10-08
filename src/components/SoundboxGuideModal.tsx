import React from 'react';
import { X, Volume2, ShieldCheck, CheckCircle, BellRing, Smartphone } from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface SoundboxGuideModalProps {
  onClose: () => void;
}

export const SoundboxGuideModal: React.FC<SoundboxGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>¿Cómo funciona la Bocina Virtual Klab?</span>
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-left">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BellRing className="w-6 h-6 animate-bounce" />
            </div>
            <h4 className="text-base font-extrabold text-white">Tu teléfono canta los pagos gratis</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              No necesitas comprar bocinas de $800 pesos ni pagar comisiones de Mercado Pago o Clip.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 bg-[#141829] border border-slate-800/80 rounded-2xl p-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <div className="text-xs">
                <strong className="text-white block font-bold mb-0.5">El cliente escanea y transfiere</strong>
                <p className="text-slate-400">
                  Transfiere desde su app de BBVA, Nu, Mercado Pago, Banorte, Santander, etc.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#141829] border border-slate-800/80 rounded-2xl p-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <div className="text-xs">
                <strong className="text-white block font-bold mb-0.5">Llega la alerta de tu banco</strong>
                <p className="text-slate-400">
                  Tu app bancaria te notifica: <em>"Recibiste $45.00 de Transferencia..."</em>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-[#141829] border border-slate-800/80 rounded-2xl p-3">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <div className="text-xs">
                <strong className="text-white block font-bold mb-0.5">Klab lo canta en voz alta</strong>
                <p className="text-slate-400">
                  El altavoz del celular suena: <strong>"¡Pago de 45 pesos recibido!" 🔔</strong> y la pantalla se pone verde.
                </p>
              </div>
            </div>
          </div>

          {/* Supported Banks */}
          <div className="bg-[#141829] border border-slate-800 rounded-2xl p-3.5 space-y-2">
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              Bancos Compatibles en México
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {['BBVA', 'Nu México', 'Mercado Pago', 'Spin by OXXO', 'Banorte', 'Citibanamex', 'Santander', 'Banco Azteca', 'Hey Banco', 'HSBC', 'Bancoppel', 'Klar', 'Ualá'].map((b) => (
                <span
                  key={b}
                  className="px-2 py-1 rounded-lg bg-slate-800/90 border border-slate-700 text-[10px] font-bold text-slate-200"
                >
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Batalla Group Footer */}
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tecnología 100% segura y privada • Desarrollado por </span>
            <strong className="text-slate-300">Batalla Group</strong>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#131726] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs active:scale-95 transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
