import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Upload,
  Check,
  Calendar,
  HardDrive,
  Database,
  Mail,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Clock,
} from 'lucide-react';
import {
  BackupMetadata,
  BackupFrequency,
  getLastBackupMetadata,
  getBackupFrequency,
  setBackupFrequency,
  getConnectedGoogleAccount,
  setConnectedGoogleAccount,
  createBackupNow,
  exportBackupToFile,
  exportAccountingCSV,
  restoreBackupFromJSON,
} from '../lib/backup';
import { triggerHaptic } from '../lib/soundbox';
import { toast } from 'sonner';

interface BackupModalProps {
  onClose: () => void;
  onDataRestored?: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({ onClose, onDataRestored }) => {
  const [metadata, setMetadata] = useState<BackupMetadata | null>(getLastBackupMetadata());
  const [frequency, setFrequencyState] = useState<BackupFrequency>(getBackupFrequency());
  const [googleEmail, setGoogleEmail] = useState<string>(getConnectedGoogleAccount() || '');
  const [isEditingEmail, setIsEditingEmail] = useState<boolean>(false);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMetadata(getLastBackupMetadata());
  }, []);

  const handleFrequencyChange = (freq: BackupFrequency) => {
    triggerHaptic();
    setFrequencyState(freq);
    setBackupFrequency(freq);
    toast.success('Frecuencia de copia de seguridad actualizada');
  };

  const handleSaveEmail = () => {
    triggerHaptic();
    const clean = googleEmail.trim();
    setConnectedGoogleAccount(clean || null);
    setIsEditingEmail(false);
    toast.success(clean ? `Cuenta vinculada: ${clean}` : 'Cuenta de Google desvinculada');
  };

  const handleBackupNow = async () => {
    triggerHaptic();
    setIsBackingUp(true);

    try {
      const meta = await createBackupNow(googleEmail.trim() || undefined);
      setMetadata(meta);
      toast.success('¡Copia de seguridad realizada con éxito!', {
        description: `${meta.productsCount} productos y ${meta.salesCount} ventas respaldadas.`,
      });
    } catch (err) {
      toast.error(`Error al respaldar: ${(err as Error).message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleExportFile = async () => {
    triggerHaptic();
    try {
      await exportBackupToFile();
      toast.success('Archivo de respaldo exportado');
    } catch (err) {
      toast.error('No se pudo exportar el archivo');
    }
  };

  const handleExportAccounting = async () => {
    triggerHaptic();
    try {
      await exportAccountingCSV();
      toast.success('Reporte contable CSV generado con éxito');
    } catch (err) {
      toast.error((err as Error).message || 'No hay ventas para exportar');
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    triggerHaptic();
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = restoreBackupFromJSON(content);
        if (result.success) {
          toast.success('¡Restauración exitosa!', {
            description: result.message,
            duration: 4000,
          });
          setMetadata(getLastBackupMetadata());
          if (onDataRestored) {
            onDataRestored();
          }
        } else {
          toast.error(result.message);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg mx-auto bg-[#0d111a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111624]">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">
              Copia de Seguridad & Historial en la Nube
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Card 1: WhatsApp-style Last Backup Overview */}
          <div className="bg-[#131826] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Última Copia de Seguridad
                </span>
                <span className="text-sm font-bold text-white block mt-0.5">
                  {metadata ? metadata.dateStr : 'Sin copias registradas'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">
                  {metadata ? `${(metadata.sizeBytes / 1024).toFixed(1)} KB` : '0 KB'}
                </span>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mt-0.5">
                  {metadata?.googleAccount ? 'En la Nube' : 'Almacenada Local'}
                </span>
              </div>
            </div>

            {metadata && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-bold">Catálogo</span>
                  <strong className="text-slate-200 font-mono">{metadata.productsCount} items</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-bold">Ventas</span>
                  <strong className="text-slate-200 font-mono">{metadata.salesCount} cobros</strong>
                </div>
                <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] text-slate-400 block font-bold">Total Caja</span>
                  <strong className="text-emerald-400 font-mono">
                    ${metadata.totalSalesAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                  </strong>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition"
            >
              {isBackingUp ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CloudUpload className="w-4 h-4" />
              )}
              <span>{isBackingUp ? 'Creando copia...' : 'Hacer Copia de Seguridad Ahora'}</span>
            </button>
          </div>

          {/* Card 2: Google Drive & Frequency Settings */}
          <div className="bg-[#131826] border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ajustes de Google Drive & Nube</span>
            </h4>

            {/* Google Account Row */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">Cuenta de Google para Respaldo</span>
                {!isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(true)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold text-[11px]"
                  >
                    {googleEmail ? 'Cambiar cuenta' : '+ Vincular correo'}
                  </button>
                )}
              </div>

              {isEditingEmail ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="email"
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="ejemplo@gmail.com"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveEmail}
                    className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                  >
                    Guardar
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300 flex items-center justify-between">
                  <span>{googleEmail || 'No configurada (solo almacenamiento local)'}</span>
                  {googleEmail && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
              )}
            </div>

            {/* Frequency Selector (like WhatsApp) */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="block text-xs text-slate-300 font-medium">
                Guardar en la cuenta automáticamente
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                {[
                  { id: 'daily', label: 'Diariamente' },
                  { id: 'weekly', label: 'Semanal' },
                  { id: 'monthly', label: 'Mensual' },
                  { id: 'manual', label: 'Manual' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleFrequencyChange(item.id as BackupFrequency)}
                    className={`py-2 px-1 rounded-xl transition ${
                      frequency === item.id
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-sm'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Accounting & Reports for Merchants */}
          <div className="bg-[#131826] border border-slate-800 rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Historial de Cuentas & Contabilidad</span>
            </h4>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Exporta el desglose completo de todas tus ventas con folios, fechas, métodos de cobro y totales para llevar tus cuentas en Excel o enviárselo a tu contador.
            </p>

            <button
              type="button"
              onClick={handleExportAccounting}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Descargar Reporte de Ventas (Excel / CSV)</span>
            </button>

            {/* Raw Backup Export & Restore */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleExportFile}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>Exportar Archivo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  fileInputRef.current?.click();
                }}
                className="py-2 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Upload className="w-3.5 h-3.5 text-amber-400" />
                <span>Restaurar Copia</span>
              </button>
            </div>

            {/* Hidden file input for restore */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelected}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#0a0d14] border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tus datos son 100% privados y nunca se venden a terceros</span>
          </div>
        </div>
      </div>
    </div>
  );
};
