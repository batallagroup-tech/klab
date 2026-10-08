import { registerPlugin } from '@capacitor/core';

export interface GoogleAccountInfo {
  signedIn: boolean;
  email?: string;
  displayName?: string;
}

export interface GoogleDriveBackupPluginInterface {
  getSignedInAccount(): Promise<GoogleAccountInfo>;
  signIn(): Promise<{ success: boolean; email: string; displayName?: string }>;
  signOut(): Promise<{ success: boolean }>;
  uploadBackup(options: { jsonContent: string }): Promise<{
    success: boolean;
    fileId: string;
    email: string;
    timestamp: number;
  }>;
  downloadBackup(): Promise<{
    success: boolean;
    jsonContent: string;
    email: string;
    timestamp: number;
  }>;
}

const GoogleDriveBackup = registerPlugin<GoogleDriveBackupPluginInterface>('GoogleDriveBackup');

export async function getGoogleAccountInfo(): Promise<GoogleAccountInfo> {
  try {
    return await GoogleDriveBackup.getSignedInAccount();
  } catch (err) {
    console.warn('GoogleDriveBackup getSignedInAccount error (e.g. running on web):', err);
    return { signedIn: false };
  }
}

export async function signInWithGoogleDrive(): Promise<{
  success: boolean;
  email: string;
  displayName?: string;
}> {
  return await GoogleDriveBackup.signIn();
}

export async function signOutGoogleDrive(): Promise<void> {
  try {
    await GoogleDriveBackup.signOut();
  } catch (err) {
    console.error('Error signing out Google Drive:', err);
  }
}

export async function uploadToGoogleDrive(jsonContent: string): Promise<{
  success: boolean;
  fileId: string;
  email: string;
  timestamp: number;
}> {
  return await GoogleDriveBackup.uploadBackup({ jsonContent });
}

export async function downloadFromGoogleDrive(): Promise<{
  success: boolean;
  jsonContent: string;
  email: string;
  timestamp: number;
}> {
  return await GoogleDriveBackup.downloadBackup();
}
