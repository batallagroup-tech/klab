export type ColorTheme = 'emerald' | 'amber' | 'cyan' | 'violet' | 'rose' | 'cyber';

export type PaymentMethod = 'spei_qr' | 'nfc_card' | 'cash';

export interface MexicanBank {
  code: string;
  name: string;
  shortName: string;
  brandColor: string;
  textColor: string;
  popular?: boolean;
}

export interface MerchantProfile {
  name: string; // Nombre del titular o vendedor
  stallName: string; // Nombre comercial del puesto (ej: "Tortas y Tacos El Inge")
  tagline: string; // Slogan o ubicación (ej: "Facultad de Ingeniería • Local 4")
  logoUrl?: string; // Logo o foto del puesto
  clabe: string; // 18 dígitos
  bankCode: string; // 3 dígitos (ej: 012 para BBVA)
  bankName: string; // Nombre del banco
  phoneDimo?: string; // Teléfono para Dimo
  colorTheme: ColorTheme;
  enableVoice: boolean; // Bocina virtual activada
  voiceRate: number;
  voicePitch: number;
  enableHaptics: boolean;
  enableNfcTap: boolean; // Cobro con tarjeta NFC habilitado
  alwaysOnDisplay: boolean;
  soundAlert: boolean;
  conceptPrefix: string;
}

export interface QuickProduct {
  id: string;
  name: string;
  price: number;
  emoji: string;
  color: string;
  category: string;
}

export interface CartItem {
  product: QuickProduct;
  qty: number;
}

export interface CardPaymentDetails {
  brand: 'Visa' | 'Mastercard' | 'Carnet' | 'Amex' | 'Desconocida';
  last4: string;
  authCode: string;
  holderName?: string;
  aid?: string;
}

export interface SaleRecord {
  id: string;
  timestamp: number;
  amount: number;
  itemsSummary: string;
  method: PaymentMethod;
  payerName?: string;
  cardDetails?: CardPaymentDetails;
  status: 'completed' | 'pending';
}

export interface DailyStats {
  date: string;
  totalAmount: number;
  totalSales: number;
  averageTicket: number;
  speiSalesCount: number;
  nfcSalesCount: number;
  cashSalesCount: number;
}
