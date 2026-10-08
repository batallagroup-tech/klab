import React, { useState } from 'react';
import { MerchantProfile, BusinessCategory, QuickProduct } from '../types';
import {
  Store,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MEXICAN_BANKS, validateCLABE, formatCLABE, detectBankByClabe } from '../lib/banks';
import { CATEGORY_TEMPLATES } from '../lib/storage';
import { triggerHaptic } from '../lib/soundbox';

interface OnboardingModalProps {
  initialProfile: MerchantProfile;
  onComplete: (profile: MerchantProfile, initialProducts: QuickProduct[]) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [stallName, setStallName] = useState<string>(initialProfile.stallName || '');
  const [tagline, setTagline] = useState<string>(initialProfile.tagline || '');
  const [category, setCategory] = useState<BusinessCategory>(initialProfile.businessCategory || 'comida');
  const [loadTemplates, setLoadTemplates] = useState<boolean>(true);

  const [clabe, setClabe] = useState<string>(initialProfile.clabe || '');
  const [ownerName, setOwnerName] = useState<string>(initialProfile.name || '');
  const [phoneDimo, setPhoneDimo] = useState<string>(initialProfile.phoneDimo || '');
  const [clabeError, setClabeError] = useState<string>('');

  const detectedBank = detectBankByClabe(clabe);

  const handleClabeChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 18);
    setClabe(clean);

    if (clean.length === 18) {
      const res = validateCLABE(clean);
      if (!res.valid) {
        setClabeError(res.error || 'CLABE inválida');
      } else {
        setClabeError('');
      }
    } else {
      setClabeError('');
    }
  };

  const handleNextStep = () => {
    triggerHaptic();
    if (step === 1) {
      if (!stallName.trim()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      if (clabe.length === 18) {
        const res = validateCLABE(clabe);
        if (!res.valid) {
          setClabeError(res.error || 'CLABE inválida');
          return;
        }
      }
      setStep(4);
    }
  };

  const handleFinish = () => {
    triggerHaptic();
    const finalBank = detectedBank || MEXICAN_BANKS['012'];

    const profile: MerchantProfile = {
      ...initialProfile,
      stallName: stallName.trim(),
      tagline: tagline.trim(),
      businessCategory: category,
      name: ownerName.trim() || stallName.trim(),
      clabe: clabe.trim(),
      bankCode: finalBank.code,
      bankName: finalBank.name,
      phoneDimo: phoneDimo.trim(),
      isConfigured: true,
    };

    const initialProducts = loadTemplates ? CATEGORY_TEMPLATES[category].products : [];
    onComplete(profile, initialProducts);
  };

  const categoriesList: { id: BusinessCategory; label: string; emoji: string; desc: string }[] = [
    { id: 'comida', label: 'Comida & Bebidas', emoji: '🍽️', desc: 'Restaurantes, tacos, cafeterías, fondas' },
    { id: 'abarrotes', label: 'Abarrotes & Tiendita', emoji: '🏪', desc: 'Minisúper, tienditas, misceláneas' },
    { id: 'belleza', label: 'Belleza & Barbería', emoji: '✂️', desc: 'Salones, estéticas, barberías, uñas' },
    { id: 'ropa', label: 'Ropa & Calzado', emoji: '👕', desc: 'Boutiques, zapaterías, accesorios' },
    { id: 'servicios', label: 'Servicios & Oficios', emoji: '🛠️', desc: 'Talleres, reparaciones, mantenimiento' },
    { id: 'tecnologia', label: 'Tecnología & Papelería', emoji: '📱', desc: 'Accesorios celular, copias, papelería' },
    { id: 'general', label: 'Cobro Directo / General', emoji: '📦', desc: 'Sin productos predefinidos, solo teclado' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#07090e]/95 backdrop-blur-lg flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-md mx-auto bg-[#0f1420] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Step Progress Bar */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800/80 bg-[#121827]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-xs">
                K
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Configuración de tu Terminal
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Paso {step} de 4
            </span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* STEP 1: BUSINESS NAME */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ¿Cómo se llama tu negocio?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Este nombre aparecerá en tu terminal, en el cartel con código QR y en los comprobantes de tus clientes.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-300 mb-1">
                    Nombre del Comercio / Puesto *
                  </label>
                  <input
                    type="text"
                    value={stallName}
                    onChange={(e) => setStallName(e.target.value)}
                    placeholder="Ej. Abarrotes San Miguel, Café Central..."
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Ubicación o Eslogan (Opcional)
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Ej. Centro Histórico • Local 12"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CATEGORY & PRESETS */}
          {step === 2 && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ¿Cuál es el giro de tu negocio?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecciona tu categoría para adaptar tu botonera de cobro rápido.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic();
                      setCategory(cat.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition ${
                      category === cat.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{cat.label}</div>
                        <div className="text-[10px] text-slate-400">{cat.desc}</div>
                      </div>
                    </div>
                    {category === cat.id && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {category !== 'general' && (
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={loadTemplates}
                    onChange={(e) => setLoadTemplates(e.target.checked)}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Precargar botones sugeridos de {CATEGORY_TEMPLATES[category].label} (podrás editarlos o borrarlos luego)</span>
                </label>
              )}
            </div>
          )}

          {/* STEP 3: BANK & CLABE */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ¿Dónde recibirás tus pagos?
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Ingresa tu cuenta bancaria real (CLABE de 18 dígitos). El dinero de las transferencias llegará directo a tu cuenta sin intermediarios.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase text-slate-300">
                      CLABE Interbancaria (18 dígitos) *
                    </label>
                    {detectedBank && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase"
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
                    value={clabe}
                    onChange={(e) => handleClabeChange(e.target.value)}
                    placeholder="Ej. 012 180 00123456789 0"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-white font-mono text-sm tracking-wider focus:outline-none transition ${
                      clabeError ? 'border-red-500 text-red-300' : 'border-slate-700 focus:border-emerald-500'
                    }`}
                  />

                  {clabe.length > 0 && clabe.length < 18 && (
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      {clabe.length}/18 dígitos ingresados
                    </span>
                  )}

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
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Nombre completo como aparece en tu banco"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Es el beneficiario que verá el cliente al escanear tu QR.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Teléfono celular (Opcional - Dimo / WhatsApp)
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneDimo}
                    onChange={(e) => setPhoneDimo(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10 dígitos (ej. 7641311374)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CONFIRMATION & READY */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  ¡Terminal lista para cobrar!
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Revisa los datos de tu comercio antes de iniciar.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Negocio:</span>
                  <strong className="text-white">{stallName}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Giro:</span>
                  <span className="text-emerald-400 font-semibold">{CATEGORY_TEMPLATES[category].label}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Banco receptor:</span>
                  <strong className="text-white">{detectedBank?.name || 'BBVA México'}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">CLABE:</span>
                  <span className="font-mono text-white">{formatCLABE(clabe) || 'Sin registrar'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Titular:</span>
                  <strong className="text-white">{ownerName || stallName}</strong>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cobro 0% comisión directo a tu cuenta bancaria.</span>
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-[#121827] flex items-center justify-between gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setStep(step - 1);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Atrás
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              disabled={step === 1 && !stallName.trim()}
              onClick={handleNextStep}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                step === 1 && !stallName.trim()
                  ? 'bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
              }`}
            >
              <span>Continuar</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Comenzar a Cobrar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
