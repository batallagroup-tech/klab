import React, { useState } from 'react';
import { MerchantProfile, ColorTheme } from '../types';
import { X, Save, Volume2, ShieldCheck, Camera, Check, AlertCircle } from 'lucide-react';
import { MEXICAN_BANKS, validateCLABE } from '../lib/banks';
import { announcePayment, triggerHaptic } from '../lib/soundbox';

interface SettingsModalProps {
  profile: MerchantProfile;
  onSaveProfile: (profile: MerchantProfile) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ profile, onSaveProfile, onClose }) => {
  const [formData, setFormData] = useState<MerchantProfile>({ ...profile });
  const [clabeError, setClabeError] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const handleClabeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 18);
    let detectedBankCode = formData.bankCode;
    let detectedBankName = formData.bankName;

    if (clean.length >= 3) {
      const code = clean.substring(0, 3);
      if (MEXICAN_BANKS[code]) {
        detectedBankCode = code;
        detectedBankName = MEXICAN_BANKS[code].name;
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
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
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>⚙️</span> Ajustes & Personalización del Puesto
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Logo / Photo & Stall Name */}
          <div className="flex items-center gap-4 bg-[#141829] border border-slate-800/80 rounded-2xl p-3.5">
            <div className="relative group">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Logo"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <Camera className="w-6 h-6" />
                </div>
              )}
              <label className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition text-[10px] font-bold text-white">
                Cambiar
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1 space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400 block">
                Nombre de tu Puesto o Negocio
              </label>
              <input
                type="text"
                value={formData.stallName}
                onChange={(e) => setFormData({ ...formData, stallName: e.target.value })}
                placeholder="ej: Tortas y Tacos El Inge"
                required
                className="w-full px-3 py-1.5 rounded-xl bg-[#0a0c14] border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Owner & Tagline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400 block">
                Titular de la Cuenta (Nombre)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre completo"
                required
                className="w-full px-3 py-2 rounded-xl bg-[#141829] border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400 block">
                Ubicación o Lema
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="ej: Afuera de la Facultad"
                className="w-full px-3 py-2 rounded-xl bg-[#141829] border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* CLABE & Bank Selection */}
          <div className="bg-[#141829] border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase text-slate-300 block">
                  CLABE Interbancaria (18 dígitos)
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {formData.clabe.length}/18
                </span>
              </div>
              <input
                type="text"
                value={formData.clabe}
                onChange={(e) => handleClabeChange(e.target.value)}
                placeholder="012180001234567890"
                maxLength={18}
                required
                className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-slate-700 font-mono text-sm sm:text-base font-bold text-emerald-400 tracking-wider focus:outline-none focus:border-emerald-500"
              />
              {clabeError ? (
                <p className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 inline shrink-0" />
                  {clabeError}
                </p>
              ) : formData.clabe.length === 18 ? (
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                  <Check className="w-3.5 h-3.5 inline shrink-0" />
                  CLABE válida según algoritmo Banxico
                </p>
              ) : null}
            </div>

            {/* Bank Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase text-slate-400 block">
                Banco Receptor
              </label>
              <select
                value={formData.bankCode}
                onChange={(e) => {
                  const b = MEXICAN_BANKS[e.target.value];
                  setFormData({
                    ...formData,
                    bankCode: e.target.value,
                    bankName: b ? b.name : formData.bankName,
                  });
                }}
                className="w-full px-3 py-2 rounded-xl bg-[#0a0c14] border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-emerald-500"
              >
                {Object.values(MEXICAN_BANKS).map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Soundbox Voice Settings */}
          <div className="bg-[#141829] border border-slate-800 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  Bocina Virtual (Anunciador por Voz)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Canta los pagos en voz alta cuando se reciben
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.enableVoice}
                onChange={(e) => setFormData({ ...formData, enableVoice: e.target.checked })}
                className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
              />
            </div>

            {formData.enableVoice && (
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Probar Voz ("¡Pago de $75!")</span>
                </button>
                <span className="text-[10px] text-slate-500">Español México (es-MX)</span>
              </div>
            )}
          </div>

          {/* Batalla Group Badge info */}
          <div className="text-[10px] text-slate-500 flex items-center justify-center gap-1 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Klab v1.0.0 • Desarrollado por </span>
            <strong className="text-slate-300">Batalla Group</strong>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg ${
                saveSuccess
                  ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
              }`}
            >
              {saveSuccess ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
              <span>{saveSuccess ? '¡Ajustes Guardados!' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
