import { MerchantProfile, QuickProduct, SaleRecord } from '../types';
import { loadProfile, loadProducts, loadSales, saveProfile, saveProducts } from './storage';
import {
  getGoogleAccountInfo,
  signInWithGoogleDrive,
  signOutGoogleDrive,
  uploadToGoogleDrive,
  downloadFromGoogleDrive,
} from './googleDrive';

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual' | 'never';

export interface BackupMetadata {
  version: string;
  timestamp: number;
  dateStr: string;
  sizeBytes: number;
  productsCount: number;
  salesCount: number;
  totalSalesAmount: number;
  googleAccount?: string;
  driveFileId?: string;
  frequency: BackupFrequency;
  lastAutoBackup?: number;
}

export interface KlabBackupPayload {
  app: 'klab';
  version: string;
  createdAt: number;
  profile: MerchantProfile;
  products: QuickProduct[];
  sales: SaleRecord[];
  checksum?: string;
}

const BACKUP_META_KEY = 'klab_backup_metadata';
const BACKUP_GOOGLE_KEY = 'klab_backup_google_account';
const BACKUP_FREQ_KEY = 'klab_backup_frequency';
const BACKUP_LOCAL_SNAPSHOT_KEY = 'klab_backup_cloud_snapshot';

export function getBackupFrequency(): BackupFrequency {
  try {
    return (localStorage.getItem(BACKUP_FREQ_KEY) as BackupFrequency) || 'daily';
  } catch {
    return 'daily';
  }
}

export function setBackupFrequency(freq: BackupFrequency): void {
  try {
    localStorage.setItem(BACKUP_FREQ_KEY, freq);
  } catch (e) {
    console.error(e);
  }
}

export function getConnectedGoogleAccount(): string | null {
  try {
    return localStorage.getItem(BACKUP_GOOGLE_KEY);
  } catch {
    return null;
  }
}

export function setConnectedGoogleAccount(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(BACKUP_GOOGLE_KEY, email);
    } else {
      localStorage.removeItem(BACKUP_GOOGLE_KEY);
    }
  } catch (e) {
    console.error(e);
  }
}

export function getLastBackupMetadata(): BackupMetadata | null {
  try {
    const raw = localStorage.getItem(BACKUP_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function generateBackupPayload(): KlabBackupPayload {
  const profile = loadProfile();
  const products = loadProducts();
  const sales = loadSales();

  return {
    app: 'klab',
    version: '1.0.3',
    createdAt: Date.now(),
    profile,
    products,
    sales,
  };
}

export async function createBackupNow(forceGoogleUpload = true): Promise<BackupMetadata> {
  const payload = generateBackupPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const sizeBytes = new Blob([jsonStr]).size;

  const totalAmount = payload.sales.reduce((acc, s) => acc + s.amount, 0);
  const now = Date.now();
  const dateFormatted = new Date(now).toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let driveFileId: string | undefined;
  let googleEmail = getConnectedGoogleAccount() || undefined;

  // Intentar subida nativa a Google Drive en segundo plano si está logueado
  if (forceGoogleUpload) {
    try {
      const gAccount = await getGoogleAccountInfo();
      if (gAccount.signedIn && gAccount.email) {
        googleEmail = gAccount.email;
        setConnectedGoogleAccount(gAccount.email);
        const driveResult = await uploadToGoogleDrive(jsonStr);
        if (driveResult.success) {
          driveFileId = driveResult.fileId;
          console.log('☁️ [Klab Backup] Respaldo subido con éxito a Google Drive:', driveResult.fileId);
        }
      }
    } catch (err) {
      console.warn('Google Drive silent upload not available or skipped:', err);
    }
  }

  const metadata: BackupMetadata = {
    version: payload.version,
    timestamp: now,
    dateStr: dateFormatted,
    sizeBytes,
    productsCount: payload.products.length,
    salesCount: payload.sales.length,
    totalSalesAmount: totalAmount,
    googleAccount: googleEmail,
    driveFileId,
    frequency: getBackupFrequency(),
    lastAutoBackup: now,
  };

  try {
    localStorage.setItem(BACKUP_META_KEY, JSON.stringify(metadata));
    localStorage.setItem(BACKUP_LOCAL_SNAPSHOT_KEY, jsonStr);
  } catch (e) {
    console.error('Error saving local backup snapshot:', e);
  }

  return metadata;
}

export async function restoreFromGoogleDrive(): Promise<{
  success: boolean;
  message: string;
  productsCount: number;
  salesCount: number;
}> {
  try {
    const driveData = await downloadFromGoogleDrive();
    if (!driveData.success || !driveData.jsonContent) {
      return {
        success: false,
        message: 'No se pudo descargar la copia de seguridad de Google Drive.',
        productsCount: 0,
        salesCount: 0,
      };
    }

    return restoreBackupFromJSON(driveData.jsonContent);
  } catch (err) {
    return {
      success: false,
      message: (err as Error).message || 'Error al conectar con Google Drive',
      productsCount: 0,
      salesCount: 0,
    };
  }
}

export async function exportBackupToFile(): Promise<void> {
  const payload = generateBackupPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `klab_backup_${dateStr}.json`;

  try {
    const file = new File([blob], fileName, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Copia de Seguridad Klab - ${dateStr}`,
        text: `Respaldo de ventas y catálogo de Klab (${payload.profile.stallName || 'Mi Negocio'})`,
        files: [file],
      });
      return;
    }
  } catch {
    // Fallback
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportAccountingCSV(): Promise<void> {
  const sales = loadSales();
  const profile = loadProfile();

  if (sales.length === 0) {
    throw new Error('No hay ventas registradas para exportar');
  }

  const headers = ['ID Folio', 'Fecha', 'Hora', 'Concepto', 'Metodo', 'Banco/Detalle', 'Monto MXN', 'Estado'];
  const rows = sales.map((s) => {
    const d = new Date(s.timestamp);
    const fecha = d.toLocaleDateString('es-MX');
    const hora = d.toLocaleTimeString('es-MX');
    const folio = `KLB-${s.id.slice(-6).toUpperCase()}`;
    const metodo = s.method === 'cash' ? 'Efectivo' : 'SPEI QR';
    const detalle = s.bankName || profile.bankName || 'SPEI Directo';
    const monto = s.amount.toFixed(2);
    const estado = s.status === 'completed' ? 'Pagado' : 'Pendiente';
    const concepto = `"${(s.itemsSummary || 'Venta').replace(/"/g, '""')}"`;

    return [folio, fecha, hora, concepto, metodo, `"${detalle}"`, monto, estado].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStr = new Date().toISOString().split('T')[0];
  const fileName = `corte_cuentas_klab_${dateStr}.csv`;

  try {
    const file = new File([blob], fileName, { type: 'text/csv' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Reporte Contable Klab - ${dateStr}`,
        text: `Historial de ingresos y cobros de ${profile.stallName || 'Klab'}`,
        files: [file],
      });
      return;
    }
  } catch {
    // Fallback
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function restoreBackupFromJSON(jsonString: string): {
  success: boolean;
  message: string;
  productsCount: number;
  salesCount: number;
} {
  try {
    const data = JSON.parse(jsonString) as KlabBackupPayload;

    if (!data.profile || !Array.isArray(data.products) || !Array.isArray(data.sales)) {
      return {
        success: false,
        message: 'El archivo no tiene el formato válido de copia de seguridad de Klab.',
        productsCount: 0,
        salesCount: 0,
      };
    }

    saveProfile(data.profile);
    saveProducts(data.products);
    localStorage.setItem('klab_sales_records', JSON.stringify(data.sales));

    return {
      success: true,
      message: `Copia de seguridad restaurada con éxito: ${data.products.length} productos y ${data.sales.length} ventas recuperadas.`,
      productsCount: data.products.length,
      salesCount: data.sales.length,
    };
  } catch (err) {
    return {
      success: false,
      message: `Error al leer el archivo: ${(err as Error).message}`,
      productsCount: 0,
      salesCount: 0,
    };
  }
}

export function checkAndRunAutoBackup(): void {
  const freq = getBackupFrequency();
  if (freq === 'never' || freq === 'manual') return;

  const meta = getLastBackupMetadata();
  const now = Date.now();
  const lastTime = meta?.timestamp || 0;

  const ONE_DAY = 24 * 60 * 60 * 1000;
  const ONE_WEEK = 7 * ONE_DAY;
  const ONE_MONTH = 30 * ONE_DAY;

  let shouldRun = false;
  if (freq === 'daily' && now - lastTime >= ONE_DAY) shouldRun = true;
  if (freq === 'weekly' && now - lastTime >= ONE_WEEK) shouldRun = true;
  if (freq === 'monthly' && now - lastTime >= ONE_MONTH) shouldRun = true;

  if (shouldRun) {
    createBackupNow();
  }
}
