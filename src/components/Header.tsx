import React from 'react';
import { MerchantProfile, DailyStats } from '../types';
import { Settings, Volume2, VolumeX, Store, TrendingUp, ShieldCheck, QrCode } from 'lucide-react';
import { MEXICAN_BANKS } from '../lib/banks';
import { triggerHaptic } from '../lib/soundbox';

interface HeaderProps {
  profile: MerchantProfile;
  dailyStats: DailyStats;
  onOpenSettings: () => void;
  onOpenStats: () => void;
  onOpenPoster: () => void;
  onToggleVoice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  dailyStats,
  onOpenSettings,
  onOpenStats,
  onOpenPoster,
  onToggleVoice,
}) => {
  const bank = MEXICAN_BANKS[profile.bankCode];

  return (
    <header className="px-4 pt-3 pb-2 bg-[#0d0f18]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-20">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Stall Avatar & Name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="relative shrink-0">
            {profile.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt={profile.stallName}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner">
                <Store className="w-5 h-5" />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0d0f18] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-white truncate leading-tight tracking-tight">
                {profile.stallName || 'Mi Puesto'}
              </h1>
              {bank && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider"
                  style={{ backgroundColor: `${bank.brandColor}33`, color: bank.textColor === '#FFFFFF' ? '#60A5FA' : bank.textColor, border: `1px solid ${bank.brandColor}66` }}
                >
                  {bank.shortName}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline shrink-0" />
              <span className="text-slate-300 font-mono text-[10px]">
                •••• {profile.clabe ? profile.clabe.slice(-4) : '0000'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-emerald-400 font-medium">0% com.</span>
            </p>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Daily Sales Pill */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenStats();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition"
            title="Corte del día"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <div className="text-left">
              <span className="text-[10px] block text-slate-400 font-medium leading-none">Hoy</span>
              <span className="text-xs font-bold text-emerald-400 font-mono leading-none">
                ${dailyStats.totalAmount.toLocaleString('es-MX')}
              </span>
            </div>
          </button>

          {/* Printable Poster Button */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenPoster();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-slate-300 active:scale-95 transition"
            title="Generar Cartel del Puesto"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Voice Soundbox Toggle */}
          <button
            onClick={() => {
              triggerHaptic();
              onToggleVoice();
            }}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition active:scale-95 ${
              profile.enableVoice
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-sm'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-500'
            }`}
            title={profile.enableVoice ? 'Bocina inteligente activada' : 'Bocina silenciada'}
          >
            {profile.enableVoice ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              triggerHaptic();
              onOpenSettings();
            }}
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex items-center justify-center text-slate-300 active:scale-95 transition"
            title="Ajustes"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
