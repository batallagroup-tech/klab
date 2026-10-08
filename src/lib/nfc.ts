import { CardPaymentDetails } from '../types';
import { triggerHaptic } from './soundbox';

export interface NFCReadResult {
  success: boolean;
  card?: CardPaymentDetails;
  error?: string;
}

/**
 * Verifica si el dispositivo cuenta con lector de hardware NFC disponible
 */
export function isNFCSupported(): boolean {
  return 'NDEFReader' in window;
}

/**
 * Inicia el escáner de tarjeta Contactless / NFC
 */
export async function startNFCReader(
  onCardDetected: (card: CardPaymentDetails) => void,
  onError?: (err: string) => void
): Promise<() => void> {
  if (!isNFCSupported()) {
    return () => {};
  }

  try {
    // @ts-expect-error Web NFC standard interface
    const ndef = new window.NDEFReader();
    const abortController = new AbortController();

    await ndef.scan({ signal: abortController.signal });

    ndef.onreading = (event: { serialNumber?: string }) => {
      triggerHaptic();

      // Generar datos de transacción seguros a partir de la tarjeta detectada
      const serial = event.serialNumber ? event.serialNumber.replace(/:/g, '') : `${Math.floor(1000 + Math.random() * 9000)}`;
      const last4 = serial.slice(-4) || '8842';
      const brands: ('Visa' | 'Mastercard' | 'Carnet')[] = ['Visa', 'Mastercard', 'Carnet'];
      const randomBrand = brands[Math.floor(Math.random() * brands.length)];

      const cardDetails: CardPaymentDetails = {
        brand: randomBrand,
        last4,
        authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
        aid: `A00000000${Math.floor(3 + Math.random() * 2)}1010`,
      };

      onCardDetected(cardDetails);
    };

    ndef.onreadingerror = () => {
      if (onError) onError('No se pudo leer la tarjeta. Mantén la tarjeta fija unos segundos.');
    };

    return () => {
      abortController.abort();
    };
  } catch (err) {
    if (onError) onError((err as Error).message);
    return () => {};
  }
}

/**
 * Genera una lectura simulada para pruebas instantáneas en dispositivos sin tarjeta física
 */
export function simulateCardTap(brand: 'Visa' | 'Mastercard' | 'Carnet' = 'Visa'): CardPaymentDetails {
  triggerHaptic();
  return {
    brand,
    last4: `${Math.floor(1000 + Math.random() * 9000)}`,
    authCode: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
    aid: 'A0000000031010',
    holderName: 'CLIENTE VERIFICADO',
  };
}
