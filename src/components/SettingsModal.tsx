import React, { useState } from 'react';
import { MerchantProfile, BusinessCategory } from '../types';
import {
  X,
  Save,
  Volume2,
  ShieldCheck,
  Check,
  AlertCircle,
  Building2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { MEXICAN_BANKS, validateCLABE, formatCLABE, detectBankByClabe } from '../lib/banks';
import { CATEGORY_TEMPLATES } from '../lib/storage';
import { announcePayment, triggerHaptic } from '../lib/soundbox';

interface SettingsModalProps {
  profile: MerchantProfile;
  onSaveProfile: (profile: MerchantProfile) => void;
  onResetOnboarding?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onSaveProfile,
  onResetOnboarding,
  onClose,
}) => {
  const [formData, setFormData] = useState<MerchantProfile>({ ...profile });
  const [clabeError, setClabeError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const detectedBank = detectBankByClabe(formData.clabe);

  const handleClabeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 18);
    let detectedBankCode = formData.bankCode;
    let detectedBankName = formData.bankName;

    if (clean.length >= 3) {
      const b = detectBankByClabe(clean);
      if (b) {
        detectedBankCode = b.code;
        detectedBankName = b.name;
      }
    }

    if (clean.length === 18) {
      const result = validateCLABE(clean);
      if (!result.valid) {
        setClabeError(result.error || 'CLABE inválida');
      } else {
        setClabeError('');
        if (result.bank) {
          detectedBankCode = result.bank.code;
          detectedBankName = result.bank.name;
        }
      }
    } else {
      setClabeError('');
    }

    setFormData({
      ...formData,
      clabe: clean,
      bankCode: detectedBankCode,
      bankName: detectedBankName,
    });
  };

  const handleTestVoice = () => {
    triggerHaptic();
    announcePayment(75, undefined, formData.voiceRate, formData.voicePitch);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    if (formData.clabe.length === 18) {
      const result = validateCLABE(formData.clabe);
      if (!result.valid) {
        setClabeError(result.error || 'CLABE inválida');
        return;
      }
    }

    onSaveProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const categoriesList: { id: BusinessCategory; label: string; emoji: string }[] = [
    { id: 'comida', label: 'Comida & Restaurante', emoji: '🍽️' },
    { id: 'abarrotes', label: 'Abarrotes & Tiendita', emoji: '🏪' },
    { id: 'belleza', label: 'Belleza & Barbería', emoji: '✂️' },
    { id: 'ropa', label: 'Ropa & Calzado', emoji: '👕' },
    { id: 'servicios', label: 'Servicios & Oficios', emoji: '🛠️' },
    { id: 'tecnologia', label: 'Tecnología & Papelería', emoji: '📱' },
    { id: 'general', label: 'Cobro General / Teclado', emoji: '📦' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-lg mx-auto bg-[#0d111a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111624]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Ajustes del Negocio & Cuenta
          </h3>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Section 1: Business Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              1. Datos del Comercio
            </h4>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                Nombre Comercial del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.stallName}
                onChange={(e) => setFormData({ ...formData, stallName: e.target.value })}
                placeholder="Ej. Abarrotes San Miguel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Giro del Negocio
              </label>
              <select
                value={formData.businessCategory || 'comida'}
                onChange={(e) =>
                  setFormData({ ...formData, businessCategory: e.target.value as BusinessCategory })
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              >
                {categoriesList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Ubicación o Eslogan (Opcional)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Ej. Mercado Central • Local 4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Section 2: Bank & CLABE */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              2. Cuenta Bancaria para Cobro
            </h4>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase text-slate-300">
                  CLABE Interbancaria (18 dígitos) *
                </label>
                {detectedBank && (
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase"
                    style={{
                      backgroundColor: `${detectedBank.brandColor}33`,
                      color: detectedBank.textColor === '#FFFFFF' ? '#60A5FA' : detectedBank.textColor,
                      border: `1px solid ${detectedBank.brandColor}66`,
                    }}
                  >
                    {detectedBank.shortName}
                  </span>
                )}
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={18}
                value={formData.clabe}
                onChange={(e) => handleClabeChange(e.target.value)}
                placeholder="012 180 00123456789 0"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-white font-mono text-xs tracking-wider focus:outline-none transition ${
                  clabeError ? 'border-red-500 text-red-300' : 'border-slate-700 focus:border-emerald-500'
                }`}
              />

              {clabeError && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{clabeError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                Nombre del Titular de la Cuenta *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre oficial del beneficiario"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Teléfono de Contacto / Dimo (Opcional)
              </label>
              <input
                type="tel"
                maxLength={10}
                value={formData.phoneDimo || ''}
                onChange={(e) =>
                  setFormData({ ...formData, phoneDimo: e.target.value.replace(/\D/g, '') })
                }
                placeholder="10 dígitos"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Section 3: Virtual Soundbox */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Bocina Virtual (Avisos de Voz)</span>
              </h4>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableVoice}
                  onChange={(e) => setFormData({ ...formData, enableVoice: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {formData.enableVoice && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <p className="text-[11px] text-slate-400">
                  La bocina virtual anunciará en voz alta en español cada cobro confirmado (ej. *"Pago recibido: setenta y cinco pesos"*).
                </p>
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-emerald-500/30 active:scale-95 transition"
                >
                  🔊 Probar sonido de bocina
                </button>
              </div>
            )}
          </div>

          {/* Section 4: Auto Bank Notification Detector */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <span>⚡</span>
                <span>Auto-Detección SPEI (Notificaciones)</span>
              </h4>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableBankAutoDetection}
                  onChange={(e) => setFormData({ ...formData, enableBankAutoDetection: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {formData.enableBankAutoDetection && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
                <p className="text-[11px] text-slate-400">
                  Detecta en tiempo real las notificaciones push de tu app bancaria (BBVA, Nu, MP, Banorte, STP, etc.) al recibir un SPEI y marca el cobro como pagado en automático.
                </p>
              </div>
            )}
          </div>

          {/* Section 4: Re-run setup */}
          {onResetOnboarding && (
            <div className="pt-2 border-t border-slate-800/80 text-center">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  onResetOnboarding();
                }}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1 mx-auto"
              >
                <RotateCcw className="w-3 h-3" /> Reiniciar Asistente de Configuración Inicial
              </button>
            </div>
          )}

          {/* Save Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition"
            >
              {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{saveSuccess ? '¡Guardado con Éxito!' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
