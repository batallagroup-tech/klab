import React, { useState, useEffect } from 'react';
import { MerchantProfile } from '../types';
import { X, Printer, Download, Store, ShieldCheck } from 'lucide-react';
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
    // Generar QR fijo del puesto (sin monto específico para que el cliente ponga el monto que quiera)
    const payload = buildQRPayload({ amount: 0, profile, concept: 'PAGO-PUESTO' });
    generateQRDataURL(payload, 600).then(setPosterQrUrl);
  }, [profile]);

  const handlePrint = () => {
    triggerHaptic();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto">
        {/* Header Modal */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>📄</span> Cartel Imprimible para tu Puesto
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

        {/* Printable Poster Container */}
        <div className="p-5 overflow-y-auto max-h-[75vh]">
          {/* Visual Poster Card */}
          <div
            id="printable-poster"
            className="bg-white text-slate-950 p-6 sm:p-8 rounded-3xl shadow-2xl border-4 border-slate-900 text-center relative overflow-hidden space-y-4"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-emerald-400 text-xs font-black uppercase tracking-widest">
              <span>⚡</span> PAGA AQUÍ CON CUALQUIER BANCO
            </div>

            {/* Stall Branding */}
            <div>
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.stallName}
                  className="w-20 h-20 mx-auto rounded-2xl object-cover ring-4 ring-emerald-500/30 mb-2"
                />
              ) : (
                <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-600 mb-2">
                  <Store className="w-8 h-8" />
                </div>
              )}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                {profile.stallName}
              </h2>
              {profile.tagline && (
                <p className="text-xs font-semibold text-slate-600 mt-1">{profile.tagline}</p>
              )}
            </div>

            {/* Big QR Code */}
            <div className="w-52 h-52 sm:w-60 sm:h-60 mx-auto bg-slate-50 p-3 rounded-2xl border-2 border-slate-900 shadow-inner flex items-center justify-center relative">
              {posterQrUrl && (
                <img src={posterQrUrl} alt="QR del puesto" className="w-full h-full object-contain" />
              )}
              <div className="absolute inset-0 m-auto w-12 h-12 rounded-xl bg-slate-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 font-black text-sm shadow-xl">
                Klab
              </div>
            </div>

            {/* Bank and CLABE Info */}
            <div className="bg-slate-100 border-2 border-slate-900 rounded-2xl p-3 text-left space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>BANCO: {bank?.name || profile.bankName}</span>
                <span className="text-emerald-700 font-extrabold">SPEI / CoDi</span>
              </div>
              <div className="font-mono text-base sm:text-lg font-black text-slate-950 tracking-wider">
                {formatCLABE(profile.clabe) || profile.clabe}
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Titular: <strong className="text-slate-900">{profile.name}</strong>
              </div>
            </div>

            {/* Supported Banks Row */}
            <div className="text-[10px] text-slate-600 font-bold uppercase tracking-wider flex items-center justify-center gap-2 pt-1">
              <span>BBVA</span> • <span>Nu</span> • <span>Mercado Pago</span> • <span>Banorte</span> • <span>Santander</span> • <span>Spin</span>
            </div>

            {/* Batalla Group Footer */}
            <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 flex items-center justify-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cobro seguro sin comisiones • Desarrollado por</span>
              <strong className="text-slate-900">Batalla Group</strong>
            </div>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="p-4 bg-[#131726] border-t border-slate-800 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            Imprímelo y pégalo en la pared o vitrina de tu puesto.
          </p>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 active:scale-95 transition shadow-lg shadow-emerald-500/20 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Cartel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
