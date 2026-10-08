import React, { useRef, useState } from 'react';
import { SaleRecord, MerchantProfile } from '../types';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  CheckCircle2,
  Store,
  ShieldCheck,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { formatCLABE, MEXICAN_BANKS } from '../lib/banks';
import { triggerHaptic } from '../lib/soundbox';
import { Share } from '@capacitor/share';

interface DigitalReceiptModalProps {
  sale: SaleRecord;
  profile: MerchantProfile;
  onClose: () => void;
  onNewSale: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  sale,
  profile,
  onClose,
  onNewSale,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const bank = MEXICAN_BANKS[profile.bankCode];

  const dateFormatted = new Date(sale.timestamp).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeFormatted = new Date(sale.timestamp).toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const folio = `#KLB-${sale.id.slice(-6).toUpperCase()}`;

  // Formato para enviar por WhatsApp
  const generateWhatsAppMessage = (): string => {
    return (
      `🧾 *COMPROBANTE DE COMPRA ${folio}*\n` +
      `🏪 *${profile.stallName}*\n` +
      `📅 ${dateFormatted} a las ${timeFormatted}\n\n` +
      `📦 *Detalle:* ${sale.itemsSummary || 'Venta'}\n` +
      `💵 *TOTAL PAGADO:* $${sale.amount.toFixed(2)} MXN\n` +
      `💳 *Método:* ${
        sale.method === 'nfc_card'
          ? `Tarjeta ${sale.cardDetails?.brand || ''} (••••${sale.cardDetails?.last4 || ''})`
          : sale.method === 'cash'
          ? 'Efectivo'
          : `SPEI QR (${bank?.name || profile.bankName})`
      }\n` +
      `✓ *Estado:* PAGADO Y CONFIRMADO\n\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `⚡ *Cobro sin comisiones procesado con Klab*\n` +
      `🛡️ *Desarrollado por Batalla Group* (batallagroup.com)`
    );
  };

  const handleShareWhatsApp = async () => {
    triggerHaptic();
    const text = generateWhatsAppMessage();
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareSystem = async () => {
    triggerHaptic();
    const text = generateWhatsAppMessage();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Comprobante ${profile.stallName}`,
          text,
        });
      } else {
        await Share.share({
          title: `Comprobante ${profile.stallName}`,
          text,
        });
      }
    } catch {
      handleCopyText();
    }
  };

  const handleCopyText = () => {
    triggerHaptic();
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-sm mx-auto bg-[#0f121d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-[#131726]">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Ticket de Compra Digital</span>
          </div>
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

        {/* Ticket Body (Stylized Thermal Paper with Dark Fintech aesthetic) */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="bg-gradient-to-b from-[#15192c] to-[#101322] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-xl relative overflow-hidden text-center space-y-3.5">
            {/* Top Teeth Design Decor */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

            {/* Stall Logo / Icon */}
            <div>
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt={profile.stallName}
                  className="w-14 h-14 mx-auto rounded-2xl object-cover ring-2 ring-emerald-500/30 mb-2"
                />
              ) : (
                <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-2">
                  <Store className="w-6 h-6" />
                </div>
              )}
              <h3 className="text-lg font-black text-white leading-tight">
                {profile.stallName}
              </h3>
              {profile.tagline && (
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {profile.tagline}
                </p>
              )}
            </div>

            {/* Folio & Date */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 py-1.5 border-y border-dashed border-slate-700/80">
              <span>FOLIO: {folio}</span>
              <span>
                {dateFormatted} • {timeFormatted}
              </span>
            </div>

            {/* Items Breakdown */}
            <div className="text-left space-y-1 py-1">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Concepto / Consumo:
              </div>
              <p className="text-xs font-semibold text-slate-200 bg-[#0c0e17] p-2.5 rounded-xl border border-slate-800">
                {sale.itemsSummary || 'Venta de mostrador'}
              </p>
            </div>

            {/* Total Paid Display */}
            <div className="bg-[#0b0e1a] border border-emerald-500/30 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Total Pagado
              </span>
              <div className="text-3xl font-black font-mono text-emerald-400 tracking-tight">
                ${sale.amount.toFixed(2)}{' '}
                <span className="text-xs font-sans text-slate-400 uppercase font-bold">
                  MXN
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-center gap-1 font-medium">
                <span>Método:</span>
                <strong className="text-white">
                  {sale.method === 'nfc_card'
                    ? `Tarjeta Contactless (••••${sale.cardDetails?.last4 || ''})`
                    : sale.method === 'cash'
                    ? 'Efectivo'
                    : 'SPEI QR Directo'}
                </strong>
              </div>
            </div>

            {/* Official Batalla Group Seal */}
            <div className="pt-2 border-t border-dashed border-slate-700/80 text-[10px] text-slate-400 space-y-1">
              <div className="inline-flex items-center gap-1 text-emerald-400 font-extrabold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Comprobante Digital Oficial</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Tecnología de cobro sin comisiones desarrollada por{' '}
                <strong className="text-slate-300 font-bold">Batalla Group</strong>
              </p>
            </div>
          </div>

          {/* Quick Actions (WhatsApp, Copy, Share) */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-emerald-500/20"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Enviar Ticket por WhatsApp al Cliente</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado' : 'Copiar Texto'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareSystem}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compartir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-[#131726] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              triggerHaptic();
              onNewSale();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition shadow-lg shadow-emerald-500/20"
          >
            <Sparkles className="w-4 h-4 fill-slate-950" />
            <span>Siguiente Cobro (Nueva Venta)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
