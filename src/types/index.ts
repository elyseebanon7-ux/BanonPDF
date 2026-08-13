export type FilterType = 'original' | 'magic' | 'bw' | 'grayscale' | 'contrast' | 'whiteboard';

export type DocumentType = 'standard' | 'id_card' | 'receipt' | 'business_card' | 'whiteboard' | 'book';

export interface Point {
  x: number; // percentage (0 - 100) or pixel
  y: number;
}

export interface QuadCorners {
  topLeft: Point;
  topRight: Point;
  bottomRight: Point;
  bottomLeft: Point;
}

export interface ScanPage {
  id: string;
  originalImageUrl: string;
  processedImageUrl: string;
  thumbnailUrl: string;
  corners: QuadCorners;
  rotation: number; // 0, 90, 180, 270
  filter: FilterType;
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  ocrText?: string;
  ocrLanguage?: string;
  ocrConfidence?: number;
  extractedData?: {
    type: 'business_card' | 'table' | 'barcode' | 'text';
    vCard?: {
      name?: string;
      title?: string;
      company?: string;
      email?: string;
      phone?: string;
      website?: string;
    };
    tableCsv?: string;
    barcodeContent?: string;
  };
  createdAt: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: DocumentType;
  folderId?: string;
  tags: string[];
  pages: ScanPage[];
  isFavorite: boolean;
  isEncrypted: boolean;
  isDeleted: boolean;
  deletedAt?: number;
  pdfUrl?: string;
  pdfSizeEstimateBytes?: number;
  createdAt: number;
  updatedAt: number;
  signature?: {
    imageDataUrl: string;
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    pageIndex: number;
  };
  watermark?: {
    text: string;
    opacity: number;
  };
}

export interface FolderItem {
  id: string;
  name: string;
  color: string;
  parentFolderId?: string;
  createdAt: number;
}

export type SubscriptionTier = 'free' | 'premium' | 'business';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  tier: SubscriptionTier;
  scansThisMonth: number;
  ocrPagesThisMonth: number;
  cloudStorageUsedBytes: number;
  cloudStorageLimitBytes: number;
  mfaEnabled: boolean;
  biometricsEnabled: boolean;
  e2eeEnabled: boolean;
  isLoggedIn?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: 'LOGIN' | 'DOCUMENT_SCAN' | 'OCR_EXECUTE' | 'PDF_EXPORT' | 'E2EE_ENCRYPT' | 'SHARE_LINK_GENERATE' | 'SECURITY_ALERT';
  details: string;
  ipAddress: string;
  deviceInfo: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface CloudSyncStatus {
  isOnline: boolean;
  pendingSyncCount: number;
  lastSyncedAt?: number;
  isSyncing: boolean;
}
