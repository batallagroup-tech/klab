export type BusinessCategory =
  | 'abarrotes'
  | 'comida'
  | 'belleza'
  | 'ropa'
  | 'servicios'
  | 'tecnologia'
  | 'general';

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
  name: string; // Nombre del titular de la cuenta
  stallName: string; // Nombre comercial del negocio
  businessCategory: BusinessCategory; // Giro del negocio
  tagline: string; // Ubicación o descripción corta
  logoUrl?: string; // Logo o foto del negocio
  clabe: string; // 18 dígitos reales
  bankCode: string; // 3 dígitos del banco
  bankName: string; // Nombre del banco
  phoneDimo?: string; // Teléfono para transferencias Dimo / SPEI
  enableVoice: boolean; // Bocina virtual (anuncio de pago por voz)
  voiceRate: number;
  voicePitch: number;
  enableHaptics: boolean;
  enableNfcTap: boolean;
  alwaysOnDisplay: boolean;
  isConfigured: boolean; // Ha completado el setup inicial
}

export interface QuickProduct {
  id: string;
  name: string;
  price: number;
  emoji: string;
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
