import React from 'react';
import { Delete, RotateCcw, Equal, Plus, Minus, X, Divide } from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface NumericKeypadProps {
  expression: string;
  evaluatedTotal: number;
  onDigit: (char: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEquals: () => void;
  onQuickAdd: (amount: number) => void;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({
  expression,
  evaluatedTotal,
  onDigit,
  onClear,
  onBackspace,
  onEquals,
  onQuickAdd,
}) => {
  const quickBils = [20, 50, 100, 200, 500];

  return (
    <div className="space-y-2 select-none">
      {/* Quick Cash Adder Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
        <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 mr-0.5">Sumar:</span>
        {quickBils.map((val) => (
          <button
            key={val}
            type="button"
            onClick={() => {
              triggerHaptic();
              onQuickAdd(val);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#111728] hover:bg-[#162038] border border-slate-800 text-xs font-mono font-bold text-emerald-400 shrink-0 active:scale-95 transition shadow-sm"
          >
            +${val}
          </button>
        ))}
      </div>

      {/* Main Full Arithmetic POS Keypad (4 columns x 5 rows) */}
      <div className="grid grid-cols-4 gap-1.5">
        {/* ROW 1: C, ⌫, ÷, × */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onClear();
          }}
          className="h-12 rounded-xl bg-[#1d1520] hover:bg-red-950/40 border border-red-900/40 text-red-400 font-bold text-base flex items-center justify-center active:scale-95 transition"
          title="Borrar todo"
        >
          <RotateCcw className="w-4 h-4 mr-1 text-red-400" />
          <span>C</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onBackspace();
          }}
          className="h-12 rounded-xl bg-[#161a29] hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold flex items-center justify-center active:scale-95 transition"
          title="Borrar último"
        >
          <Delete className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit(' / ');
          }}
          className="h-12 rounded-xl bg-[#13192e] hover:bg-indigo-950/40 border border-slate-800 text-cyan-400 font-bold text-lg flex items-center justify-center active:scale-95 transition"
        >
          <Divide className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit(' * ');
          }}
          className="h-12 rounded-xl bg-[#13192e] hover:bg-indigo-950/40 border border-slate-800 text-cyan-400 font-bold text-lg flex items-center justify-center active:scale-95 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ROW 2: 7, 8, 9, - */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('7');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('8');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('9');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          9
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit(' - ');
          }}
          className="h-12 rounded-xl bg-[#13192e] hover:bg-indigo-950/40 border border-slate-800 text-amber-400 font-bold text-lg flex items-center justify-center active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* ROW 3: 4, 5, 6, + */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('4');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('5');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('6');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          6
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit(' + ');
          }}
          className="h-12 rounded-xl bg-[#13192e] hover:bg-emerald-950/40 border border-slate-800 text-emerald-400 font-bold text-xl flex items-center justify-center active:scale-95 transition"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* ROW 4: 1, 2, 3, = (Span 2 rows for =) */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('1');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('2');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('3');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          3
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onEquals();
          }}
          className="row-span-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 border border-emerald-400 text-slate-950 font-black text-2xl flex items-center justify-center active:scale-95 transition shadow-lg shadow-emerald-500/20"
          title="Calcular total"
        >
          <Equal className="w-6 h-6 stroke-[3]" />
        </button>

        {/* ROW 5: 0, 00, . */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('0');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl sm:text-2xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          0
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('00');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-base sm:text-lg font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          00
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onDigit('.');
          }}
          className="h-12 sm:h-13 rounded-xl bg-[#111624] hover:bg-[#161c2e] border border-slate-800/90 text-white font-mono text-xl font-bold flex items-center justify-center active:scale-95 active:bg-emerald-500/10 transition shadow-sm"
        >
          .
        </button>
      </div>
    </div>
  );
};
