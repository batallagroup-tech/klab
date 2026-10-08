import React, { useState } from 'react';
import { SaleRecord, DailyStats } from '../types';
import {
  X,
  TrendingUp,
  Clock,
  CheckCircle2,
  Banknote,
  QrCode,
  FileSpreadsheet,
  Trash2,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { triggerHaptic } from '../lib/soundbox';

interface DailySalesModalProps {
  sales: SaleRecord[];
  dailyStats: DailyStats;
  onClose: () => void;
  onSelectSale?: (sale: SaleRecord) => void;
  onOpenBackup?: () => void;
  onDeleteSale?: (saleId: string) => void;
  onClearTodaySales?: () => void;
  onClearAllSales?: () => void;
}

export const DailySalesModal: React.FC<DailySalesModalProps> = ({
  sales,
  dailyStats,
  onClose,
  onSelectSale,
  onOpenBackup,
  onDeleteSale,
  onClearTodaySales,
  onClearAllSales,
}) => {
  const [confirmClearToday, setConfirmClearToday] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [deletingSaleId, setDeletingSaleId] = useState<string | null>(null);
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
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ventas de Hoy ({todaySales.length})
              </h4>
              {todaySales.length > 0 && onClearTodaySales && (
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic();
                    setConfirmClearToday(true);
                  }}
                  className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 active:scale-95 transition"
                >
                  <Trash2 className="w-3 h-3" /> Borrar Hoy
                </button>
              )}
            </div>

            {/* Confirmation Box for Clear Today */}
            {confirmClearToday && (
              <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-2xl space-y-2.5 text-center animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>¿Reiniciar el corte del día a $0.00?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Se borrarán los registros de cobro de hoy. Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      if (onClearTodaySales) onClearTodaySales();
                      setConfirmClearToday(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs active:scale-95 transition shadow-lg shadow-red-600/30"
                  >
                    Sí, borrar corte de hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearToday(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Confirmation Box for Clear All History */}
            {confirmClearAll && (
              <div className="p-3.5 bg-red-950/50 border border-red-500/50 rounded-2xl space-y-2.5 text-center animate-in fade-in">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-red-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>¿Vaciar todo el historial acumulado?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Se eliminarán todas las ventas pasadas registradas en el dispositivo.
                </p>
                <div className="flex gap-2 justify-center pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      if (onClearAllSales) onClearAllSales();
                      setConfirmClearAll(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs active:scale-95 transition shadow-lg shadow-red-600/30"
                  >
                    Sí, vaciar todo el historial
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmClearAll(false)}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

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
                  const isDeletingThis = deletingSaleId === s.id;

                  return (
                    <div
                      key={s.id}
                      className="p-3 rounded-xl bg-[#131726] border border-slate-800/90 transition hover:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div
                          onClick={() => {
                            if (onSelectSale) {
                              triggerHaptic();
                              onSelectSale(s);
                            }
                          }}
                          className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                        >
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
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white leading-tight truncate">
                              {s.itemsSummary || 'Cobro directo'}
                            </div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              <span>{time}</span>
                              <span>•</span>
                              <span className="capitalize font-medium truncate">
                                {s.method === 'cash'
                                  ? 'Efectivo'
                                  : s.bankName
                                  ? `SPEI (${s.bankName})`
                                  : 'SPEI QR'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <div className="text-right">
                            <span className="font-mono text-sm font-black text-emerald-400 block">
                              +${s.amount.toFixed(2)}
                            </span>
                            <span className="text-[9px] font-bold text-emerald-500 flex items-center justify-end gap-0.5">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Pagado
                            </span>
                          </div>

                          {onDeleteSale && (
                            <button
                              type="button"
                              title="Eliminar este cobro"
                              onClick={(e) => {
                                e.stopPropagation();
                                triggerHaptic();
                                setDeletingSaleId(isDeletingThis ? null : s.id);
                              }}
                              className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center justify-center active:scale-95 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Inline Delete Confirmation Card for this sale */}
                      {isDeletingThis && (
                        <div className="p-2.5 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center justify-between gap-2 animate-in fade-in">
                          <span className="text-[11px] text-red-300 font-bold">
                            ¿Eliminar venta de ${s.amount.toFixed(2)}?
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic();
                                if (onDeleteSale) onDeleteSale(s.id);
                                setDeletingSaleId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-black active:scale-95"
                            >
                              Eliminar
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingSaleId(null)}
                              className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-bold"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#131726] border-t border-slate-800 flex flex-col sm:flex-row gap-2">
          {onOpenBackup && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                onOpenBackup();
              }}
              className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel / Nube</span>
            </button>
          )}

          {sales.length > 0 && onClearAllSales && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setConfirmClearAll(true);
              }}
              className="py-2.5 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Vaciar Historial</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs active:scale-95 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
