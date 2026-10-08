import { MerchantProfile, QuickProduct, SaleRecord, DailyStats } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'klab_merchant_profile',
  PRODUCTS: 'klab_quick_products',
  SALES: 'klab_sales_records',
};

export const DEFAULT_PROFILE: MerchantProfile = {
  name: 'Ramses Batalla',
  stallName: 'Tortas y Tacos El Inge',
  tagline: 'Facultad de Ingeniería • Local 4',
  clabe: '012180001234567890',
  bankCode: '012',
  bankName: 'BBVA México',
  phoneDimo: '7641311374',
  colorTheme: 'emerald',
  enableVoice: true,
  voiceRate: 1.0,
  voicePitch: 1.0,
  enableHaptics: true,
  enableNfcTap: true,
  alwaysOnDisplay: true,
  soundAlert: true,
  conceptPrefix: 'KLAB-',
};

export const DEFAULT_PRODUCTS: QuickProduct[] = [
  { id: 'p1', name: 'Torta Especial', price: 45, emoji: '🥪', color: '#10B981', category: 'Comida' },
  { id: 'p2', name: 'Orden 3 Tacos', price: 50, emoji: '🌮', color: '#F59E0B', category: 'Comida' },
  { id: 'p3', name: 'Quesadilla Gde', price: 35, emoji: '🧀', color: '#EAB308', category: 'Comida' },
  { id: 'p4', name: 'Refresco 600ml', price: 18, emoji: '🥤', color: '#EF4444', category: 'Bebidas' },
  { id: 'p5', name: 'Agua Fresca 1L', price: 25, emoji: '🧃', color: '#06B6D4', category: 'Bebidas' },
  { id: 'p6', name: 'Café de Olla', price: 15, emoji: '☕', color: '#8B5CF6', category: 'Bebidas' },
  { id: 'p7', name: 'Combo Completo', price: 65, emoji: '🍱', color: '#EC4899', category: 'Combos' },
  { id: 'p8', name: 'Postre / Flan', price: 20, emoji: '🍮', color: '#F97316', category: 'Postres' },
];

export function loadProfile(): MerchantProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: MerchantProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function loadProducts(): QuickProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) return DEFAULT_PRODUCTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_PRODUCTS;
  } catch {
    return DEFAULT_PRODUCTS;
  }
}

export function saveProducts(products: QuickProduct[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products:', e);
  }
}

export function loadSales(): SaleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SALES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveSale(sale: SaleRecord): SaleRecord[] {
  try {
    const current = loadSales();
    const updated = [sale, ...current].slice(0, 500);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getDailyStats(sales: SaleRecord[]): DailyStats {
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter((s) => {
    const saleDate = new Date(s.timestamp).toISOString().split('T')[0];
    return saleDate === today && s.status === 'completed';
  });

  const totalAmount = todaySales.reduce((acc, s) => acc + s.amount, 0);
  const totalSales = todaySales.length;
  const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0;

  const speiSalesCount = todaySales.filter((s) => s.method === 'spei_qr').length;
  const nfcSalesCount = todaySales.filter((s) => s.method === 'nfc_card').length;
  const cashSalesCount = todaySales.filter((s) => s.method === 'cash').length;

  return {
    date: today,
    totalAmount,
    totalSales,
    averageTicket,
    speiSalesCount,
    nfcSalesCount,
    cashSalesCount,
  };
}
