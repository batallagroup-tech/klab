import QRCode from 'qrcode';
import { MerchantProfile } from '../types';

export interface QRPayloadOptions {
  amount: number;
  profile: MerchantProfile;
  concept?: string;
}

/**
 * Genera el payload estándar para escaneo en apps bancarias mexicanas (Banxico CoDi / SPEI)
 * y lectores inteligentes de cámara (Google Lens, iOS Camera).
 * Se mantiene estable y determinista sin números aleatorios que cambien el QR.
 */
export function buildQRPayload({ amount, profile, concept }: QRPayloadOptions): string {
  const cleanClabe = profile.clabe.replace(/\D/g, '');
  const cleanBeneficiary = profile.name || profile.stallName || 'COMERCIO';
  const cleanConcept = concept || (amount > 0 ? `PAGO-${profile.stallName.replace(/\s+/g, '').slice(0, 10).toUpperCase()}` : 'PAGO');

  if (amount > 0) {
    return `SPEI://CLABE:${cleanClabe}?banco=${encodeURIComponent(profile.bankName)}&monto=${amount.toFixed(2)}&concepto=${encodeURIComponent(cleanConcept)}&beneficiario=${encodeURIComponent(cleanBeneficiary)}`;
  }

  // QR Estático de la cuenta (para mostrador o transferencias libres)
  return `SPEI://CLABE:${cleanClabe}?banco=${encodeURIComponent(profile.bankName)}&beneficiario=${encodeURIComponent(cleanBeneficiary)}`;
}

/**
 * Genera Data URL del código QR en alta definición con diseño limpio y nítido.
 */
export async function generateQRDataURL(text: string, size = 420): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
  } catch (err) {
    console.error('Error generating QR:', err);
    return '';
  }
}
