import React, { useState, useEffect } from 'react';
import { MerchantProfile } from '../types';
import { X, Printer, Store, ShieldCheck } from 'lucide-react';
import { buildQRPayload, generateQRDataURL } from '../lib/qr';
import { formatCLABE, MEXICAN_BANKS } from '../lib/banks';
import { triggerHaptic } from '../lib/soundbox';

interface StallPosterModalProps {
  profile: MerchantProfile;
  onClose: () => void;
}

export const StallPosterModal: React.FC<StallPosterModalProps> = ({ profile, onClose }) => {
  const [posterQrUrl, setPosterQrUrl] = useState<string>('');
  const bank = MEXICAN_BANKS[profile.bankCode];

  useEffect(() => {
    // Generar QR fijo del puesto (sin monto específico para mostrador)
    const payload = buildQRPayload({ amount: 0, profile });
    generateQRDataURL(payload, 500).then(setPosterQrUrl);
  }, [profile]);

  const handlePrint = () => {
    triggerHaptic();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md mx-auto bg-[#0d111a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111624]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📄</span> Cartel de Cobro con QR para Mostrador
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

        {/* Poster Preview */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div
            id="printable-poster"
            className="bg-white text-slate-950 p-6 rounded-3xl shadow-2xl border-2 border-slate-300 text-center space-y-3"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <span>⚡</span> PAGA AQUÍ CON TU APP BANCARIA
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {profile.stallName || 'Mi Comercio'}
              </h2>
              {profile.tagline && (
                <p className="text-xs font-semibold text-slate-600 mt-0.5">{profile.tagline}</p>
              )}
            </div>

            {/* QR Code */}
            <div className="w-52 h-52 mx-auto bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center relative">
              {posterQrUrl ? (
                <img src={posterQrUrl} alt="QR del negocio" className="w-full h-full object-contain" />
              ) : (
                <div className="text-slate-400 text-xs">Cargando QR...</div>
              )}
            </div>

            {/* Bank details */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-left space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>BANCO: {bank?.name || profile.bankName}</span>
                <span className="text-emerald-700 font-extrabold">SPEI / CoDi</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-slate-950 tracking-wider">
                {formatCLABE(profile.clabe) || profile.clabe || 'Sin CLABE'}
              </div>
              <div className="text-[11px] text-slate-600">
                Beneficiario: <strong className="text-slate-900">{profile.name || profile.stallName}</strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-medium">
              Abre la app de tu banco (BBVA, Nu, Mercado Pago, Banorte, Azteca, Santander, etc.) y escanea este código.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cartel / Guardar en PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};
