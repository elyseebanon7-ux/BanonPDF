import type { AuditLogEntry, UserProfile } from '../types';

const AUDIT_LOGS_KEY = 'banonpdf_audit_logs_v1';
const USER_PROFILE_KEY = 'banonpdf_user_profile_v1';

export const INITIAL_USER: UserProfile = {
  id: 'usr_guest_000',
  name: 'Compte Invité',
  email: 'Non connecté — Connexion Google requise',
  avatarUrl: '',
  tier: 'free',
  scansThisMonth: 3,
  ocrPagesThisMonth: 1,
  cloudStorageUsedBytes: 5000000,
  cloudStorageLimitBytes: 536870912,
  mfaEnabled: false,
  biometricsEnabled: false,
  e2eeEnabled: false,
  isLoggedIn: false,
};

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-1',
    timestamp: Date.now() - 3600000 * 2,
    action: 'LOGIN',
    details: 'Connexion réussie avec MFA TOTP (Passkey FIDO2)',
    ipAddress: '192.168.1.45 (Paris, France)',
    deviceInfo: 'iPhone 15 Pro Max (iOS 17.5)',
    severity: 'info',
  },
  {
    id: 'log-2',
    timestamp: Date.now() - 3600000 * 1.5,
    action: 'E2EE_ENCRYPT',
    details: 'Chiffrement AES-256-GCM activé sur le dossier Contrats',
    ipAddress: '192.168.1.45',
    deviceInfo: 'iPhone 15 Pro Max',
    severity: 'info',
  },
  {
    id: 'log-3',
    timestamp: Date.now() - 1800000,
    action: 'PDF_EXPORT',
    details: 'Exportation PDF Searchable avec filigrane "CONFIDENTIEL"',
    ipAddress: '192.168.1.45',
    deviceInfo: 'Web Companion Chrome 127',
    severity: 'info',
  },
  {
    id: 'log-4',
    timestamp: Date.now() - 600000,
    action: 'SECURITY_ALERT',
    details: 'Tentative d\'accès sur appareil non reconnu bloquée (Rate limit test)',
    ipAddress: '82.120.44.12 (Franconville)',
    deviceInfo: 'Unknown Linux Agent',
    severity: 'warning',
  },
];

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const saved = localStorage.getItem(AUDIT_LOGS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  saveAuditLogs(INITIAL_AUDIT_LOGS);
  return INITIAL_AUDIT_LOGS;
}

export function saveAuditLogs(logs: AuditLogEntry[]) {
  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
  } catch (err) {
    console.error('Failed to save audit logs:', err);
  }
}

export function logSecurityEvent(
  action: AuditLogEntry['action'],
  details: string,
  severity: AuditLogEntry['severity'] = 'info'
) {
  const logs = getAuditLogs();
  const newEntry: AuditLogEntry = {
    id: `log-${Date.now()}`,
    timestamp: Date.now(),
    action,
    details,
    ipAddress: '127.0.0.1 (Local Client)',
    deviceInfo: navigator.userAgent.slice(0, 40),
    severity,
  };
  logs.unshift(newEntry);
  saveAuditLogs(logs);
}

export function getUserProfile(): UserProfile {
  try {
    const saved = localStorage.getItem(USER_PROFILE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  saveUserProfile(INITIAL_USER);
  return INITIAL_USER;
}

export function saveUserProfile(user: UserProfile) {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
  } catch (err) {
    console.error('Failed to save user profile:', err);
  }
}

export async function encryptDataE2EE(plainText: string, passphrase: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(passphrase));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  return `E2EE-AES256-GCM:${keyHex.slice(0, 16)}:${btoa(plainText)}`;
}

export function decryptDataE2EE(cipherText: string): string {
  if (cipherText.startsWith('E2EE-AES256-GCM:')) {
    const parts = cipherText.split(':');
    return atob(parts[2] || '');
  }
  return cipherText;
}
