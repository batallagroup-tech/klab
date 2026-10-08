import React from 'react';
import { QuickProduct } from '../types';
import { Plus, Minus, SlidersHorizontal } from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface QuickButtonsGridProps {
  products: QuickProduct[];
  cart: Record<string, number>;
  onAddItem: (product: QuickProduct) => void;
  onRemoveItem: (product: QuickProduct) => void;
  onOpenProductManager: () => void;
}

export const QuickButtonsGrid: React.FC<QuickButtonsGridProps> = ({
  products,
  cart,
  onAddItem,
  onRemoveItem,
  onOpenProductManager,
}) => {
  if (products.length === 0) {
    return (
      <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400">Modo Cobro Directo con Teclado</span>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenProductManager();
          }}
          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 active:scale-95 transition"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar Botones Rápidos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span>⚡</span> Botonera Rápida
        </h2>
        <button
          type="button"
          onClick={() => {
            triggerHaptic();
            onOpenProductManager();
          }}
          className="text-[11px] text-slate-400 hover:text-emerald-400 font-semibold flex items-center gap-1 active:scale-95 transition"
        >
          <SlidersHorizontal className="w-3 h-3" /> Editar Catálogo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {products.map((p) => {
          const count = cart[p.id] || 0;
          const isSelected = count > 0;

          return (
            <div
              key={p.id}
              className={`relative rounded-2xl p-3 border transition-all duration-150 flex flex-col justify-between select-none ${
                isSelected
                  ? 'bg-emerald-950/20 border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'bg-[#111622] hover:bg-[#161c2b] border-slate-800/80 active:scale-[0.98]'
              }`}
            >
              {/* Tap anywhere on top to Add */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onAddItem(p);
                }}
                className="w-full text-left focus:outline-none"
              >
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="text-2xl">{p.emoji}</span>
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                        : 'bg-slate-800 text-emerald-400 border-slate-700'
                    }`}
                  >
                    ${p.price}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200 truncate leading-tight mb-1">
                  {p.name}
                </div>
              </button>

              {/* Quantity Controller */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 mt-1">
                {count > 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic();
                        onRemoveItem(p);
                      }}
                      className="w-6 h-6 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 flex items-center justify-center active:scale-90 transition"
                      title="Restar 1"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-extrabold font-mono text-emerald-300">
                      x{count}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerHaptic();
                        onAddItem(p);
                      }}
                      className="w-6 h-6 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 flex items-center justify-center active:scale-90 transition"
                      title="Sumar 1"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      onAddItem(p);
                    }}
                    className="w-full text-center text-[11px] font-bold text-slate-400 hover:text-emerald-400 py-0.5"
                  >
                    + Agregar
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
