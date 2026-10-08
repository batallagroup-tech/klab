import { MexicanBank } from '../types';

export const MEXICAN_BANKS: Record<string, MexicanBank> = {
  '012': { code: '012', name: 'BBVA México', shortName: 'BBVA', brandColor: '#004481', textColor: '#FFFFFF', popular: true },
  '638': { code: '638', name: 'Nu México (Financiera)', shortName: 'Nu', brandColor: '#820AD1', textColor: '#FFFFFF', popular: true },
  '722': { code: '722', name: 'Mercado Pago Wallet', shortName: 'Mercado Pago', brandColor: '#009EE3', textColor: '#FFFFFF', popular: true },
  '684': { code: '684', name: 'Spin by OXXO (Compropago)', shortName: 'Spin OXXO', brandColor: '#EA580C', textColor: '#FFFFFF', popular: true },
  '072': { code: '072', name: 'Banorte', shortName: 'Banorte', brandColor: '#EB0029', textColor: '#FFFFFF', popular: true },
  '002': { code: '002', name: 'Citibanamex', shortName: 'Banamex', brandColor: '#002D72', textColor: '#FFFFFF', popular: true },
  '014': { code: '014', name: 'Santander México', shortName: 'Santander', brandColor: '#EC0000', textColor: '#FFFFFF', popular: true },
  '127': { code: '127', name: 'Banco Azteca', shortName: 'Azteca', brandColor: '#00833E', textColor: '#FFFFFF', popular: true },
  '058': { code: '058', name: 'Hey Banco / Banregio', shortName: 'Hey Banco', brandColor: '#0A0A0A', textColor: '#FF0055', popular: true },
  '021': { code: '021', name: 'HSBC México', shortName: 'HSBC', brandColor: '#DB0011', textColor: '#FFFFFF', popular: true },
  '044': { code: '044', name: 'Scotiabank Inverlat', shortName: 'Scotiabank', brandColor: '#EC111A', textColor: '#FFFFFF', popular: true },
  '137': { code: '137', name: 'Bancoppel', shortName: 'Bancoppel', brandColor: '#2563EB', textColor: '#FACC15', popular: true },
  '138': { code: '138', name: 'Ualá (ABC Capital)', shortName: 'Ualá', brandColor: '#EF4444', textColor: '#FFFFFF' },
  '670': { code: '670', name: 'Klar (Servicios Financieros)', shortName: 'Klar', brandColor: '#10B981', textColor: '#FFFFFF' },
  '846': { code: '846', name: 'STP (Sistema de Transferencias)', shortName: 'STP', brandColor: '#0284C7', textColor: '#FFFFFF' },
  '036': { code: '036', name: 'Banco Inbursa', shortName: 'Inbursa', brandColor: '#059669', textColor: '#FFFFFF' },
  '062': { code: '062', name: 'Afirme', shortName: 'Afirme', brandColor: '#16A34A', textColor: '#FFFFFF' },
  '042': { code: '042', name: 'Mifel', shortName: 'Mifel', brandColor: '#2563EB', textColor: '#FFFFFF' },
};

/**
 * Valida la CLABE Interbancaria mexicana según la norma de Banco de México (Banxico).
 * Estructura de 18 dígitos:
 * - 3 dígitos: Código del banco
 * - 3 dígitos: Código de plaza / sucursal
 * - 11 dígitos: Número de cuenta
 * - 1 dígito: Dígito de control (módulo 10 ponderado [3, 7, 1...])
 */
export function validateCLABE(clabe: string): { valid: boolean; bank?: MexicanBank; error?: string } {
  const clean = clabe.replace(/\s+/g, '');

  if (!/^\d+$/.test(clean)) {
    return { valid: false, error: 'La CLABE solo debe contener números.' };
  }

  if (clean.length !== 18) {
    return { valid: false, error: `Debe tener exactamente 18 dígitos (actualmente tiene ${clean.length}).` };
  }

  const bankCode = clean.substring(0, 3);
  const bank = MEXICAN_BANKS[bankCode] || {
    code: bankCode,
    name: `Banco (${bankCode})`,
    shortName: `Banco ${bankCode}`,
    brandColor: '#3B82F6',
    textColor: '#FFFFFF',
  };

  // Cálculo del dígito de control ponderado de Banxico
  const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const digit = parseInt(clean[i], 10);
    const weight = weights[i];
    sum += (digit * weight) % 10;
  }

  const expectedControlDigit = (10 - (sum % 10)) % 10;
  const actualControlDigit = parseInt(clean[17], 10);

  if (expectedControlDigit !== actualControlDigit) {
    return {
      valid: false,
      bank,
      error: 'El dígito de control no coincide. Revisa que no haya números intercambiados.',
    };
  }

  return { valid: true, bank };
}

export function formatCLABE(clabe: string): string {
  const clean = clabe.replace(/\s+/g, '');
  if (!clean) return '';
  // Formato legible: 0121 8000 1234 5678 90
  return clean.replace(/(\d{4})(\d{4})(\d{4})(\d{4})(\d{2})/, '$1 $2 $3 $4 $5')
              .replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4 ')
              .replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 ')
              .replace(/(\d{4})(\d{4})/, '$1 $2 ');
}
