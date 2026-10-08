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

import {
  MerchantProfile,
  QuickProduct,
  CartItem,
  SaleRecord,
  DailyStats,
  PaymentMethod,
  CardPaymentDetails,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadProducts,
  saveProducts,
  loadSales,
  saveSale,
  getDailyStats,
} from './lib/storage';
import { triggerHaptic } from './lib/soundbox';
import { ArrowRight, Trash2, Volume2, ShieldCheck, Sparkles, HelpCircle, Wifi, QrCode } from 'lucide-react';
import { Toaster, toast } from 'sonner';

export const App: React.FC = () => {
  const [profile, setProfile] = useState<MerchantProfile>(loadProfile);
  const [products, setProducts] = useState<QuickProduct[]>(loadProducts);
  const [sales, setSales] = useState<SaleRecord[]>(loadSales);
  const [dailyStats, setDailyStats] = useState<DailyStats>(() => getDailyStats(loadSales()));

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
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);

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
    cardDetails?: CardPaymentDetails
  ) => {
    const newRecord: SaleRecord = {
      id: `sale_${Date.now()}`,
      timestamp: Date.now(),
      amount,
      itemsSummary: summary,
      method,
      cardDetails,
      status: 'completed',
    };

    const updated = saveSale(newRecord);
    setSales(updated);
    handleClear();
    setShowActiveCharge(false);

    // Automatically open digital receipt voucher
    setReceiptSale(newRecord);

    const methodLabel =
      method === 'nfc_card'
        ? `💳 Tarjeta ${cardDetails?.brand || ''} aprobada`
        : method === 'cash'
        ? '💵 Pago en efectivo'
        : '📱 SPEI QR recibido';

    toast.success(`¡Venta de $${amount.toFixed(2)} (${methodLabel}) registrada!`, {
      duration: 3500,
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

  return (
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-between max-w-md mx-auto relative select-none">
      <Toaster position="top-center" richColors theme="dark" />

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
        {/* Big Total Display Card */}
        <div className="bg-gradient-to-br from-[#121524] via-[#101320] to-[#0c0e17] border border-slate-800 rounded-3xl p-4 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <span>💵</span> Total a Cobrar
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
                <Trash2 className="w-3 h-3" /> Limpiar cuenta
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
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                <QrCode className="w-3 h-3" /> QR
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                <Wifi className="w-3 h-3 rotate-90" /> NFC
              </span>
            </div>
          </div>

          {/* Cart Breakdown Pills */}
          {cartItems.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 mt-2 border-t border-slate-800/80 no-scrollbar">
              {cartItems.map((item) => (
                <span
                  key={item.product.id}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-[11px] font-bold text-slate-200 shrink-0"
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-[11px] font-bold text-amber-300 shrink-0">
                  <span>⌨️</span> Extra: +${manualAmount.toFixed(2)}
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

      {/* Bottom Floating Charge Button */}
      <footer className="p-3.5 bg-[#0d0f18]/95 backdrop-blur-md border-t border-slate-800/80 sticky bottom-0 z-20 space-y-1.5">
        <button
          type="button"
          disabled={grandTotal <= 0}
          onClick={handleStartCharge}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all duration-150 shadow-xl ${
            grandTotal > 0
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 shadow-emerald-500/25 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 border border-slate-700/60 opacity-60 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-6 h-6 fill-slate-950" />
          <span>COBRAR ${grandTotal.toFixed(2)}</span>
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>

        <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            SPEI 0% y Tarjetas Contactless
          </span>
          <button
            type="button"
            onClick={() => setShowSoundboxGuide(true)}
            className="text-slate-400 hover:text-emerald-400 flex items-center gap-0.5"
          >
            <HelpCircle className="w-3 h-3" /> ¿Cómo funciona?
          </button>
        </div>
      </footer>

      {/* Modals */}
      {showActiveCharge && (
        <ActiveChargeModal
          amount={grandTotal}
          items={cartItems}
          profile={profile}
          onClose={() => setShowActiveCharge(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {showSettings && (
        <SettingsModal
          profile={profile}
          onSaveProfile={handleSaveProfile}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showPoster && (
        <StallPosterModal
          profile={profile}
          onClose={() => setShowPoster(false)}
        />
      )}

      {showProductManager && (
        <ProductManagerModal
          products={products}
          onSaveProducts={handleSaveProducts}
          onClose={() => setShowProductManager(false)}
        />
      )}

      {showDailyStats && (
        <DailySalesModal
          sales={sales}
          dailyStats={dailyStats}
          onClose={() => setShowDailyStats(false)}
          onSelectSale={(sale) => {
            setShowDailyStats(false);
            setReceiptSale(sale);
          }}
        />
      )}

      {showSoundboxGuide && (
        <SoundboxGuideModal
          onClose={() => setShowSoundboxGuide(false)}
        />
      )}

      {receiptSale && (
        <DigitalReceiptModal
          sale={receiptSale}
          profile={profile}
          onClose={() => setReceiptSale(null)}
          onNewSale={() => setReceiptSale(null)}
        />
      )}
    </div>
  );
};

export default App;
