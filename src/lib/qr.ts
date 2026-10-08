import QRCode from 'qrcode';
import { MerchantProfile } from '../types';

export interface QRPayloadOptions {
  amount: number;
  profile: MerchantProfile;
  concept?: string;
}

/**
 * Genera el enlace web oficial HTTPS que se abre inmediatamente en cualquier celular
 * (iPhone, Android, Google Lens, WhatsApp, etc.) sin arrojar "No se encontraron datos utilizables".
 * Muestra la presentación del puesto, marca Batalla Group, copia de CLABE en 1 clic y accesos a bancos.
 */
export function buildQRPayload({ amount, profile }: QRPayloadOptions): string {
  const cleanClabe = (profile.clabe || '').replace(/\D/g, '');
  const cleanBeneficiary = encodeURIComponent(profile.name || profile.stallName || 'Comercio');
  const cleanBiz = encodeURIComponent(profile.stallName || 'Puesto / Comercio');
  const cleanBank = encodeURIComponent(profile.bankName || 'Banco Receptor');
  const cleanPhone = encodeURIComponent(profile.phoneDimo || '');

  const baseUrl = 'https://batallagroup-tech.github.io/klab/pay.html';
  const query = `c=${cleanClabe}&b=${cleanBank}&n=${cleanBeneficiary}&s=${cleanBiz}&p=${cleanPhone}&m=${amount > 0 ? amount.toFixed(2) : '0'}`;

  return `${baseUrl}?${query}`;
}

/**
 * Genera Data URL del código QR en alta definición con diseño limpio y nítido.
 */
export async function generateQRDataURL(text: string, size = 450): Promise<string> {
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
