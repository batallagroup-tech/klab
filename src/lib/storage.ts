import { MerchantProfile, QuickProduct, SaleRecord, DailyStats, BusinessCategory } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'klab_merchant_profile',
  PRODUCTS: 'klab_quick_products',
  SALES: 'klab_sales_records',
  ONBOARDING_DONE: 'klab_onboarding_completed',
};

export const CATEGORY_TEMPLATES: Record<BusinessCategory, { label: string; emoji: string; products: QuickProduct[] }> = {
  abarrotes: {
    label: 'Abarrotes & Tiendita',
    emoji: '🏪',
    products: [
      { id: 'ab_1', name: 'Refresco 600ml', price: 18, emoji: '🥤', category: 'Bebidas' },
      { id: 'ab_2', name: 'Papas / Frituras', price: 20, emoji: '🥔', category: 'Snacks' },
      { id: 'ab_3', name: 'Galletas', price: 17, emoji: '🍪', category: 'Snacks' },
      { id: 'ab_4', name: 'Leche 1L', price: 28, emoji: '🥛', category: 'Lácteos' },
      { id: 'ab_5', name: 'Pan de Dulce', price: 12, emoji: '🥐', category: 'Panadería' },
      { id: 'ab_6', name: 'Huevo (1 Kg)', price: 42, emoji: '🥚', category: 'Básicos' },
      { id: 'ab_7', name: 'Garrafón Agua', price: 22, emoji: '🚰', category: 'Bebidas' },
      { id: 'ab_8', name: 'Cigarrillos (Suelto)', price: 8, emoji: '🚬', category: 'Varios' },
    ],
  },
  comida: {
    label: 'Comida & Restaurante',
    emoji: '🍽️',
    products: [
      { id: 'com_1', name: 'Platillo / Menú', price: 65, emoji: '🍲', category: 'Comida' },
      { id: 'com_2', name: 'Orden Tacos', price: 50, emoji: '🌮', category: 'Comida' },
      { id: 'com_3', name: 'Torta / Sándwich', price: 45, emoji: '🥪', category: 'Comida' },
      { id: 'com_4', name: 'Quesadilla / Antojito', price: 35, emoji: '🧀', category: 'Comida' },
      { id: 'com_5', name: 'Agua Fresca 1L', price: 25, emoji: '🧃', category: 'Bebidas' },
      { id: 'com_6', name: 'Café / Bebida Caliente', price: 20, emoji: '☕', category: 'Bebidas' },
      { id: 'com_7', name: 'Refresco', price: 18, emoji: '🥤', category: 'Bebidas' },
      { id: 'com_8', name: 'Postre', price: 30, emoji: '🍮', category: 'Postres' },
    ],
  },
  belleza: {
    label: 'Belleza & Barbería',
    emoji: '✂️',
    products: [
      { id: 'bel_1', name: 'Corte Caballero', price: 120, emoji: '💈', category: 'Cortes' },
      { id: 'bel_2', name: 'Corte Dama', price: 180, emoji: '💇‍♀️', category: 'Cortes' },
      { id: 'bel_3', name: 'Arreglo de Barba', price: 80, emoji: '🧔', category: 'Barbería' },
      { id: 'bel_4', name: 'Corte + Barba', price: 180, emoji: '✨', category: 'Paquetes' },
      { id: 'bel_5', name: 'Manicura / Uñas', price: 150, emoji: '💅', category: 'Uñas' },
      { id: 'bel_6', name: 'Pedicura', price: 200, emoji: '🦶', category: 'Cuidado' },
      { id: 'bel_7', name: 'Depilación / Cejas', price: 70, emoji: '👁️', category: 'Facial' },
      { id: 'bel_8', name: 'Cera / Pomada', price: 130, emoji: '🧴', category: 'Productos' },
    ],
  },
  ropa: {
    label: 'Ropa & Calzado',
    emoji: '👕',
    products: [
      { id: 'rop_1', name: 'Playera / Camiseta', price: 150, emoji: '👕', category: 'Prendas' },
      { id: 'rop_2', name: 'Pantalón / Jeans', price: 350, emoji: '👖', category: 'Prendas' },
      { id: 'rop_3', name: 'Sudadera / Chamarra', price: 450, emoji: '🧥', category: 'Prendas' },
      { id: 'rop_4', name: 'Vestido / Blusa', price: 280, emoji: '👗', category: 'Prendas' },
      { id: 'rop_5', name: 'Calzado / Tenis', price: 600, emoji: '👟', category: 'Calzado' },
      { id: 'rop_6', name: 'Accesorio / Gorra', price: 120, emoji: '🧢', category: 'Accesorios' },
      { id: 'rop_7', name: 'Calcetas / Ropa Int.', price: 50, emoji: '🧦', category: 'Básicos' },
      { id: 'rop_8', name: 'Bolsa / Mochila', price: 250, emoji: '🎒', category: 'Accesorios' },
    ],
  },
  servicios: {
    label: 'Servicios & Oficios',
    emoji: '🛠️',
    products: [
      { id: 'srv_1', name: 'Revisión / Diagnóstico', price: 100, emoji: '🔍', category: 'Servicios' },
      { id: 'srv_2', name: 'Mano de Obra Básica', price: 150, emoji: '🔧', category: 'Servicios' },
      { id: 'srv_3', name: 'Mantenimiento General', price: 300, emoji: '⚙️', category: 'Servicios' },
      { id: 'srv_4', name: 'Instalación Estándar', price: 250, emoji: '🔌', category: 'Servicios' },
      { id: 'srv_5', name: 'Servicio a Domicilio', price: 80, emoji: '🛵', category: 'Extras' },
      { id: 'srv_6', name: 'Refacción / Pieza', price: 200, emoji: '🔩', category: 'Materiales' },
      { id: 'srv_7', name: 'Lavado / Limpieza', price: 120, emoji: '🧼', category: 'Servicios' },
      { id: 'srv_8', name: 'Hora de Asesoría', price: 200, emoji: '📋', category: 'Honorarios' },
    ],
  },
  tecnologia: {
    label: 'Tecnología & Papelería',
    emoji: '📱',
    products: [
      { id: 'tec_1', name: 'Mica de Cristal Templado', price: 80, emoji: '📱', category: 'Accesorios' },
      { id: 'tec_2', name: 'Funda / Case Celular', price: 120, emoji: '🛡️', category: 'Accesorios' },
      { id: 'tec_3', name: 'Cable USB / Carga', price: 70, emoji: '🔌', category: 'Cables' },
      { id: 'tec_4', name: 'Cargador Rápido', price: 150, emoji: '⚡', category: 'Cargadores' },
      { id: 'tec_5', name: 'Audífonos', price: 90, emoji: '🎧', category: 'Audio' },
      { id: 'tec_6', name: 'Impresión / Copia', price: 3, emoji: '📄', category: 'Papelería' },
      { id: 'tec_7', name: 'Escaneo / Enmicado', price: 15, emoji: '📇', category: 'Papelería' },
      { id: 'tec_8', name: 'Recarga Saldo Teléfono', price: 50, emoji: '📶', category: 'Servicios' },
    ],
  },
  general: {
    label: 'Venta General / Teclado',
    emoji: '📦',
    products: [],
  },
};

export const DEFAULT_PROFILE: MerchantProfile = {
  name: '',
  stallName: '',
  businessCategory: 'general',
  tagline: '',
  clabe: '',
  bankCode: '012',
  bankName: 'BBVA México',
  phoneDimo: '',
  enableVoice: true,
  voiceRate: 1.0,
  voicePitch: 1.0,
  enableHaptics: true,
  enableBankAutoDetection: true,
  alwaysOnDisplay: true,
  isConfigured: false,
};

export function isOnboardingCompleted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
  } catch {
    return false;
  }
}

export function setOnboardingCompleted(completed = true): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, completed ? 'true' : 'false');
  } catch (e) {
    console.error(e);
  }
}

export function loadProfile(): MerchantProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_PROFILE, ...parsed };
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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

export function deleteSale(saleId: string): SaleRecord[] {
  try {
    const current = loadSales();
    const updated = current.filter((s) => s.id !== saleId);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearTodaySales(): SaleRecord[] {
  try {
    const today = new Date().toISOString().split('T')[0];
    const current = loadSales();
    const updated = current.filter((s) => {
      const saleDate = new Date(s.timestamp).toISOString().split('T')[0];
      return saleDate !== today;
    });
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearAllSales(): SaleRecord[] {
  try {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify([]));
    return [];
  } catch {
    return [];
  }
}

export function resetAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.SALES);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE);
  } catch (e) {
    console.error('Error resetting all data:', e);
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
  const cashSalesCount = todaySales.filter((s) => s.method === 'cash').length;

  return {
    date: today,
    totalAmount,
    totalSales,
    averageTicket,
    speiSalesCount,
    cashSalesCount,
  };
}
