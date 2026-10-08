import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuickButtonsGrid } from './components/QuickButtonsGrid';
import { NumericKeypad } from './components/NumericKeypad';
import { ActiveChargeModal } from './components/ActiveChargeModal';
import { StallPosterModal } from './components/StallPosterModal';
import { SettingsModal } from './components/SettingsModal';
import { ProductManagerModal } from './components/ProductManagerModal';
import { DailySalesModal } from './components/DailySalesModal';
import { SoundboxGuideModal } from './components/SoundboxGuideModal';
import { DigitalReceiptModal } from './components/DigitalReceiptModal';
import { OnboardingModal } from './components/OnboardingModal';
import { BackupModal } from './components/BackupModal';

import {
  MerchantProfile,
  QuickProduct,
  CartItem,
  SaleRecord,
  DailyStats,
  PaymentMethod,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadProducts,
  saveProducts,
  loadSales,
  saveSale,
  getDailyStats,
  isOnboardingCompleted,
  setOnboardingCompleted,
} from './lib/storage';
import { checkAndRunAutoBackup } from './lib/backup';
import { triggerHaptic } from './lib/soundbox';
import { ArrowRight, Trash2, ShieldCheck, Sparkles, HelpCircle, Banknote, QrCode } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<MerchantProfile>(loadProfile);
  const [products, setProducts] = useState<QuickProduct[]>(loadProducts);
  const [sales, setSales] = useState<SaleRecord[]>(loadSales);
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => getDailyStats(loadSales()));

  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    return !isOnboardingCompleted() && !profile.isConfigured;
  });

  // Cart & Amount state
  const [cart, setCart] = useState<Record<string, number>>({});
  const [manualAmountStr, setManualAmountStr] = useState<string>('');

  // Modals state
  const [showActiveCharge, setShowActiveCharge] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showPoster, setShowPoster] = useState<boolean>(false);
  const [showProductManager, setShowProductManager] = useState<boolean>(false);
  const [showDailyStats, setShowDailyStats] = useState<boolean>(false);
  const [showSoundboxGuide, setShowSoundboxGuide] = useState<boolean>(false);
  const [showBackup, setShowBackup] = useState<boolean>(false);
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);

  // Auto-backup verification on app startup
  useEffect(() => {
    checkAndRunAutoBackup();
  }, []);

  // Sync daily stats whenever sales change
  useEffect(() => {
    setDailyStats(getDailyStats(sales));
  }, [sales]);

  // Calculate cart items and totals
  const cartItems: CartItem[] = Object.entries(cart)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return product ? { product, qty } : null;
    })
    .filter(Boolean) as CartItem[];

  const cartTotal = cartItems.reduce((acc, item) => acc + item.product.price * item.qty, 0);
  const manualAmount = parseFloat(manualAmountStr) || 0;
  const grandTotal = cartTotal + manualAmount;

  // Cart Handlers
  const handleAddItem = (p: QuickProduct) => {
    setCart((prev) => ({ ...prev, [p.id]: (prev[p.id] || 0) + 1 }));
  };

  const handleRemoveItem = (p: QuickProduct) => {
    setCart((prev) => {
      const current = prev[p.id] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[p.id];
        return next;
      }
      return { ...prev, [p.id]: current - 1 };
    });
  };

  // Keypad Handlers
  const handleDigit = (digit: string) => {
    if (digit === '.' && manualAmountStr.includes('.')) return;
    if (manualAmountStr.length >= 7) return;
    setManualAmountStr((prev) => (prev === '0' && digit !== '.' ? digit : prev + digit));
  };

  const handleClear = () => {
    setCart({});
    setManualAmountStr('');
  };

  const handleBackspace = () => {
    setManualAmountStr((prev) => prev.slice(0, -1));
  };

  const handleAddQuickAmount = (val: number) => {
    const current = parseFloat(manualAmountStr) || 0;
    setManualAmountStr((current + val).toString());
  };

  // Charge Trigger
  const handleStartCharge = () => {
    if (grandTotal <= 0) return;
    triggerHaptic();
    setShowActiveCharge(true);
  };

  // Payment Success Callback
  const handlePaymentSuccess = (
    amount: number,
    summary: string,
    method: PaymentMethod,
    bankName?: string
  ) => {
    const newRecord: SaleRecord = {
      id: `sale_${Date.now()}`,
      timestamp: Date.now(),
      amount,
      itemsSummary: summary,
      method,
      bankName,
      status: 'completed',
    };

    const updated = saveSale(newRecord);
    setSales(updated);
    handleClear();
    setShowActiveCharge(false);

    // Automatically open digital receipt voucher
    setReceiptSale(newRecord);

    const methodLabel = method === 'cash' ? 'Efectivo' : bankName ? `SPEI (${bankName})` : 'SPEI QR';

    toast.success(`Venta de $${amount.toFixed(2)} (${methodLabel}) registrada`, {
      duration: 3000,
    });
  };

  // Profile update
  const handleSaveProfile = (newProfile: MerchantProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  // Products update
  const handleSaveProducts = (newProducts: QuickProduct[]) => {
    saveProducts(newProducts);
    setProducts(newProducts);
  };

  // Handle data restored from backup
  const handleDataRestored = () => {
    const updatedProfile = loadProfile();
    const updatedProducts = loadProducts();
    const updatedSales = loadSales();
    setProfile(updatedProfile);
    setProducts(updatedProducts);
    setSales(updatedSales);
    setDailyStats(getDailyStats(updatedSales));
  };

  // Onboarding Complete
  const handleOnboardingComplete = (newProfile: MerchantProfile, initialProducts: QuickProduct[]) => {
    saveProfile(newProfile);
    setProfile(newProfile);
    saveProducts(initialProducts);
    setProducts(initialProducts);
    setOnboardingCompleted(true);
    setShowOnboarding(false);
    toast.success(`¡Bienvenido a Klab, ${newProfile.stallName}!`, {
      duration: 3500,
    });
  };

  return (
    <div className="min-h-screen bg-[#090c14] text-slate-100 flex flex-col justify-between max-w-md mx-auto relative select-none">
      <Toaster position="top-center" richColors theme="dark" />

      {/* Initial Setup Onboarding Modal if not configured */}
      {showOnboarding && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={handleOnboardingComplete}
        />
      )}

      {/* Header Bar */}
      <Header
        profile={profile}
        dailyStats={dailyStats}
        onOpenSettings={() => setShowSettings(true)}
        onOpenStats={() => setShowDailyStats(true)}
        onOpenPoster={() => setShowPoster(true)}
        onToggleVoice={() => {
          const nextVoice = !profile.enableVoice;
          handleSaveProfile({ ...profile, enableVoice: nextVoice });
          toast(nextVoice ? '🔊 Bocina virtual activada' : '🔇 Bocina silenciada', {
            duration: 1500,
          });
        }}
      />

      {/* Main Terminal Workspace */}
      <main className="flex-1 p-3.5 space-y-3 overflow-y-auto">
        {/* Total Display Card */}
        <div className="bg-[#101420] border border-slate-800 rounded-3xl p-4 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total a Cobrar
            </span>
            {grandTotal > 0 && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic();
                  handleClear();
                }}
                className="text-[11px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 active:scale-95 transition"
              >
                <Trash2 className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>

          {/* Big Amount Number */}
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-baseline">
              <span className="text-emerald-400 text-3xl sm:text-4xl mr-1">$</span>
              <span>{grandTotal.toFixed(2)}</span>
              <span className="text-xs sm:text-sm font-sans font-bold text-slate-500 ml-2 uppercase">
                MXN
              </span>
            </div>

            {/* Methods Badges */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <QrCode className="w-3 h-3" /> SPEI 0%
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                <Banknote className="w-3 h-3" /> Efectivo
              </span>
            </div>
          </div>

          {/* Cart Breakdown Pills */}
          {cartItems.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 mt-2 border-t border-slate-800/80 no-scrollbar">
              {cartItems.map((item) => (
                <span
                  key={item.product.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-bold text-slate-200 shrink-0"
                >
                  <span>{item.product.emoji}</span>
                  <span>
                    {item.qty}x {item.product.name}
                  </span>
                  <span className="text-emerald-400 font-mono text-[10px]">
                    (${item.qty * item.product.price})
                  </span>
                </span>
              ))}
              {manualAmount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-300 shrink-0">
                  <span>⌨️</span> +${manualAmount.toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Quick Products Grid */}
        <QuickButtonsGrid
          products={products}
          cart={cart}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onOpenProductManager={() => setShowProductManager(true)}
        />

        {/* Numeric Keypad */}
        <NumericKeypad
          currentAmount={manualAmount}
          onDigit={handleDigit}
          onClear={() => setManualAmountStr('')}
          onBackspace={handleBackspace}
          onAddQuickAmount={handleAddQuickAmount}
        />
      </main>

      {/* Charge Action Button */}
      <footer className="p-3.5 bg-[#0b0e17] border-t border-slate-800/90 shadow-2xl">
        <button
          type="button"
          onClick={handleStartCharge}
          disabled={grandTotal <= 0}
          className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-between transition active:scale-[0.99] shadow-xl ${
            grandTotal > 0
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/25'
              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed border border-slate-700/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-5 h-5 ${grandTotal > 0 ? 'fill-slate-950 text-slate-950' : 'text-slate-500'}`} />
            <span>Cobrar Venta</span>
          </div>

          <div className="flex items-center gap-2 font-mono text-base font-black">
            <span>${grandTotal.toFixed(2)}</span>
            <ArrowRight className="w-5 h-5" />
          </div>
        </button>
      </footer>

      {/* MODALS */}
      {/* 1. Active Charge Modal */}
      {showActiveCharge && (
        <ActiveChargeModal
          amount={grandTotal}
          items={cartItems}
          profile={profile}
          onClose={() => setShowActiveCharge(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* 2. Business Settings */}
      {showSettings && (
        <SettingsModal
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onOpenBackup={() => {
            setShowSettings(false);
            setShowBackup(true);
          }}
          onResetOnboarding={() => {
            setShowSettings(false);
            setShowOnboarding(true);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 3. Daily Sales / Corte de Caja */}
      {showDailyStats && (
        <DailySalesModal
          sales={sales}
          dailyStats={dailyStats}
          onOpenBackup={() => {
            setShowDailyStats(false);
            setShowBackup(true);
          }}
          onSelectSale={(sale) => {
            setShowDailyStats(false);
            setReceiptSale(sale);
          }}
          onClose={() => setShowDailyStats(false)}
        />
      )}

      {/* 4. Counter Poster (Cartel Imprimible) */}
      {showPoster && (
        <StallPosterModal
          profile={profile}
          onClose={() => setShowPoster(false)}
        />
      )}

      {/* 5. Product / Menu Manager */}
      {showProductManager && (
        <ProductManagerModal
          products={products}
          businessCategory={profile.businessCategory}
          onSaveProducts={handleSaveProducts}
          onClose={() => setShowProductManager(false)}
        />
      )}

      {/* 6. Virtual Soundbox Guide */}
      {showSoundboxGuide && (
        <SoundboxGuideModal
          profile={profile}
          onClose={() => setShowSoundboxGuide(false)}
        />
      )}

      {/* 7. Cloud Backup & Accounting Modal */}
      {showBackup && (
        <BackupModal
          onClose={() => setShowBackup(false)}
          onDataRestored={handleDataRestored}
        />
      )}

      {/* 8. Digital Receipt Voucher */}
      {receiptSale && (
        <DigitalReceiptModal
          sale={receiptSale}
          profile={profile}
          onClose={() => setReceiptSale(null)}
          onNewSale={() => {
            setReceiptSale(null);
            handleClear();
          }}
        />
      )}
    </div>
  );
};

export default App;
