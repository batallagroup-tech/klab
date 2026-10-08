import React from 'react';
import { Delete, RotateCcw } from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface NumericKeypadProps {
  currentAmount: number;
  onDigit: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onAddQuickAmount: (amount: number) => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  currentAmount,
  onDigit,
  onClear,
  onBackspace,
  onAddQuickAmount,
}) => {
  const digits = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['.', '0', '00'],
  ];

  const quickAdders = [5, 10, 20, 50, 100];

  return (
    <div className="space-y-2 select-none">
      {/* Quick Adders Row */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 mr-0.5">Sumar:</span>
        {quickAdders.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              triggerHaptic();
              onAddQuickAmount(val);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-bold text-emerald-400 shrink-0 active:scale-95 transition"
          >
            +${val}
          </button>
        ))}
      </div>

      {/* Grid Keypad */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* Digits (3 cols) */}
        <div className="col-span-3 grid grid-cols-3 gap-1.5">
          {digits.map((row, rIdx) => (
            <React.Fragment key={rIdx}>
              {row.map((btn) => (
                <button
                  key={btn}
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    onDigit(btn);
                  }}
                  className="h-12 sm:h-13 rounded-xl bg-[#111622] hover:bg-[#161c2b] border border-slate-800/80 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 active:border-emerald-500/30 transition shadow-sm"
                >
                  {btn}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Action Column (1 col) */}
        <div className="col-span-1 grid grid-rows-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onBackspace();
            }}
            className="rounded-xl bg-[#17141f] hover:bg-red-950/30 border border-slate-800 text-red-400 flex flex-col items-center justify-center gap-0.5 active:scale-95 transition"
            title="Borrar dígito"
          >
            <Delete className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Borrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onClear();
            }}
            disabled={currentAmount === 0}
            className="rounded-xl bg-[#131622] hover:bg-slate-800 border border-slate-800 text-slate-400 disabled:opacity-40 disabled:pointer-events-none flex flex-col items-center justify-center gap-0.5 active:scale-95 transition"
            title="Limpiar monto manual"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400">Limpiar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
