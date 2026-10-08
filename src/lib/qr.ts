import QRCode from 'qrcode';
import { MerchantProfile } from '../types';

export interface QRPayloadOptions {
  amount: number;
  profile: MerchantProfile;
  concept?: string;
}

/**
 * Genera el payload óptimo para escaneo bancario y lectores de cámara estándar (Google Lens, iPhone Camera, etc.)
 */
export function buildQRPayload({ amount, profile, concept }: QRPayloadOptions): string {
  const cleanClabe = profile.clabe.replace(/\s+/g, '');
  const cleanConcept = concept || `${profile.conceptPrefix}${Math.floor(1000 + Math.random() * 9000)}`;

  // Formato CoDi / SPEI de alta compatibilidad:
  // Estructura legible con datos bancarios directos que cualquier app bancaria o cámara inteligente parsea al instante
  return `SPEI://CLABE:${cleanClabe}?banco=${encodeURIComponent(profile.bankName)}&monto=${amount.toFixed(2)}&concepto=${encodeURIComponent(cleanConcept)}&beneficiario=${encodeURIComponent(profile.stallName)}`;
}

/**
 * Genera Data URL del código QR en alta definición con diseño de alto contraste
 */
export async function generateQRDataURL(text: string, size = 400): Promise<string> {
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
