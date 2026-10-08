import { registerPlugin, PluginListenerHandle } from '@capacitor/core';

export interface BankPaymentEvent {
  amount: number;
  bank: string;
  title: string;
  text: string;
  timestamp: number;
}

export interface BankNotificationPluginInterface {
  isPermissionGranted(): Promise<{ granted: boolean }>;
  requestPermission(): Promise<void>;
  addListener(
    eventName: 'bankPaymentDetected',
    listenerFunc: (event: BankPaymentEvent) => void
  ): Promise<PluginListenerHandle>;
}

const BankNotification = registerPlugin<BankNotificationPluginInterface>('BankNotification');

export async function isNotificationAccessGranted(): Promise<boolean> {
  try {
    const result = await BankNotification.isPermissionGranted();
    return !!result?.granted;
  } catch (err) {
    console.warn('BankNotification plugin not available (e.g. running on web):', err);
    return false;
  }
}

export async function openNotificationAccessSettings(): Promise<void> {
  try {
    await BankNotification.requestPermission();
  } catch (err) {
    console.error('Error opening notification settings:', err);
  }
}

export async function listenToBankPayments(
  callback: (payment: BankPaymentEvent) => void
): Promise<() => void> {
  try {
    const handle = await BankNotification.addListener('bankPaymentDetected', (event) => {
      console.log('⚡ [Klab] Pago bancario detectado por notificación:', event);
      callback(event);
    });

    return () => {
      handle.remove();
    };
  } catch (err) {
    console.warn('Could not register bank payment listener:', err);
    return () => {};
  }
}
