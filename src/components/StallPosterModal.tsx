import React, { useState, useEffect } from 'react';
import { MerchantProfile } from '../types';
import { X, Printer, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
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
  const webPayUrl = buildQRPayload({ amount: 0, profile });

  useEffect(() => {
    // Generar QR fijo del puesto para mostrador (apunta al portal web universal)
    generateQRDataURL(webPayUrl, 520).then(setPosterQrUrl);
  }, [webPayUrl]);

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
              <span>⚡</span> PAGA AQUÍ CON CUALQUIER BANCO
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
            <div className="w-56 h-56 mx-auto bg-slate-50 p-2.5 rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center relative">
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
                <span className="text-emerald-700 font-extrabold">SPEI 0% Comisión</span>
              </div>
              <div className="font-mono text-sm sm:text-base font-black text-slate-950 tracking-wider">
                {formatCLABE(profile.clabe) || profile.clabe || 'Sin CLABE'}
              </div>
              <div className="text-[11px] text-slate-600">
                Titular: <strong className="text-slate-900">{profile.name || profile.stallName}</strong>
              </div>
            </div>

            <div className="space-y-1 text-[10px] text-slate-500 font-medium">
              <p>Escanea este código con la cámara de tu celular, Google Lens o tu app bancaria.</p>
              <p class="text-[9px] font-bold text-slate-400">Desarrollado por Batalla Group • Klab Pay</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Cartel / Guardar en PDF</span>
            </button>

            <a
              href={webPayUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 active:scale-95 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Probar enlace de pago en el navegador</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
