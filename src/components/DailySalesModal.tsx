import React from 'react';
import { SaleRecord, DailyStats } from '../types';
import { X, TrendingUp, Clock, CheckCircle2, Banknote, QrCode, CreditCard } from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface DailySalesModalProps {
  sales: SaleRecord[];
  dailyStats: DailyStats;
  onClose: () => void;
  onSelectSale?: (sale: SaleRecord) => void;
}

export const DailySalesModal: React.FC<DailySalesModalProps> = ({
  sales,
  dailyStats,
  onClose,
  onSelectSale,
}) => {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => {
    const d = new Date(s.timestamp).toISOString().split('T')[0];
    return d === today;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Corte de Caja Diario</span>
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

        {/* Stats Summary Cards */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#141829] border border-slate-800/80 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Hoy</span>
              <span className="text-base sm:text-lg font-black font-mono text-emerald-400 block">
                ${dailyStats.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-[#141829] border border-slate-800/80 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Cobros</span>
              <span className="text-base sm:text-lg font-black font-mono text-white block">
                {dailyStats.totalSales}
              </span>
            </div>

            <div className="bg-[#141829] border border-slate-800/80 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Promedio</span>
              <span className="text-base sm:text-lg font-black font-mono text-cyan-400 block">
                ${dailyStats.averageTicket.toFixed(0)}
              </span>
            </div>
          </div>

          {/* Breakdown Badges */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="py-2.5 px-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
              <span className="text-[10px] block text-emerald-300/80 font-bold">SPEI QR Directo (0% comisiones)</span>
              <strong className="font-mono text-sm">{dailyStats.speiSalesCount} ventas</strong>
            </div>
            <div className="py-2.5 px-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300">
              <span className="text-[10px] block text-slate-400 font-bold">Efectivo</span>
              <strong className="font-mono text-sm">{dailyStats.cashSalesCount} ventas</strong>
            </div>
          </div>

          {/* Sales History List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ventas de Hoy ({todaySales.length})
            </h4>

            {todaySales.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs bg-[#141829]/50 border border-slate-800/60 rounded-2xl">
                Aún no hay cobros registrados el día de hoy.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {todaySales.map((s) => {
                  const time = new Date(s.timestamp).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (onSelectSale) {
                          triggerHaptic();
                          onSelectSale(s);
                        }
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl bg-[#131726] border border-slate-800/90 transition ${
                        onSelectSale ? 'hover:border-emerald-500/40 hover:bg-[#161b2e] cursor-pointer active:scale-[0.99]' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${
                            s.method === 'cash'
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          }`}
                        >
                          {s.method === 'cash' ? (
                            <Banknote className="w-4 h-4" />
                          ) : (
                            <QrCode className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white leading-tight">
                            {s.itemsSummary || 'Cobro directo'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{time}</span>
                            <span>•</span>
                            <span className="capitalize font-medium">
                              {s.method === 'cash'
                                ? 'Efectivo'
                                : s.bankName
                                ? `SPEI (${s.bankName})`
                                : 'SPEI QR'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-sm font-black text-emerald-400 block">
                          +${s.amount.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Pagado
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
