import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DocumentItem, FolderItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yqmecaoepcvibbafejul.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable__GwoGiveWBNGCSzug8K5wA_bT_s2d_3';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseAnonKey.includes('placeholder') &&
  supabaseUrl !== 'https://your-project.supabase.co'
);

// Initialize Supabase Client
export const supabase: SupabaseClient | null = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export interface CloudDatabaseStatus {
  isConnected: boolean;
  projectRef: string;
  url: string;
  hasAuth: boolean;
  lastPing?: number;
  errorMessage?: string;
}

/**
 * Perform a live ping health-check against the Supabase backend
 */
export async function testSupabaseConnection(): Promise<CloudDatabaseStatus> {
  const status: CloudDatabaseStatus = {
    isConnected: false,
    projectRef: 'yubfmflrgfflxoenumdq',
    url: supabaseUrl,
    hasAuth: false,
  };

  if (!supabase) {
    status.errorMessage = 'Supabase SDK client non initialisé (clés manquantes)';
    return status;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    status.hasAuth = Boolean(sessionData?.session);

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        apikey: supabaseAnonKey,
      },
    });

    if (response.ok || response.status === 200 || response.status === 401 || response.status === 404) {
      status.isConnected = true;
      status.lastPing = Date.now();
    } else {
      status.errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (err: any) {
    status.isConnected = false;
    status.errorMessage = err?.message || 'Erreur de connexion réseau au serveur Supabase';
  }

  return status;
}

/**
 * Check if required database tables ('documents', 'folders', 'audit_logs') exist in Supabase
 */
export async function checkTablesExist(): Promise<{ documents: boolean; folders: boolean; audit_logs: boolean }> {
  const result = { documents: false, folders: false, audit_logs: false };
  if (!supabase) return result;

  try {
    const { error: docErr } = await supabase.from('documents').select('id').limit(1);
    result.documents = !docErr;

    const { error: foldErr } = await supabase.from('folders').select('id').limit(1);
    result.folders = !foldErr;

    const { error: logErr } = await supabase.from('audit_logs').select('id').limit(1);
    result.audit_logs = !logErr;
  } catch {
    // ignore
  }

  return result;
}

/**
 * Cloud Sync Helper: Upload local document metadata to Supabase 'documents' table
 */
export async function syncDocumentToSupabase(doc: DocumentItem): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    const primaryOcrText = doc.pages?.[0]?.ocrText || '';
    const primaryThumbnail = doc.pages?.[0]?.thumbnailUrl || '';

    const { error } = await supabase
      .from('documents')
      .upsert({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        folder_id: doc.folderId || null,
        created_at: new Date(doc.createdAt).toISOString(),
        updated_at: new Date(doc.updatedAt).toISOString(),
        page_count: doc.pages?.length || 1,
        tags: doc.tags || [],
        ocr_full_text: primaryOcrText,
        thumbnail_url: primaryThumbnail,
        pdf_size_estimate_bytes: doc.pdfSizeEstimateBytes || 0,
        is_favorite: doc.isFavorite || false,
        is_encrypted: doc.isEncrypted || false,
        pages_json: JSON.stringify(doc.pages || []),
      });

    if (error) {
      console.warn('[Supabase Sync Warning]', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Supabase Sync Error]', e);
    return false;
  }
}

/**
 * Cloud Sync Helper: Fetch documents from Supabase 'documents' table
 */
export async function fetchDocumentsFromSupabase(): Promise<DocumentItem[] | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data) return null;

    return data.map((item: any): DocumentItem => ({
      id: item.id,
      title: item.title,
      type: item.type || 'standard',
      folderId: item.folder_id || undefined,
      createdAt: new Date(item.created_at).getTime(),
      updatedAt: new Date(item.updated_at).getTime(),
      tags: item.tags || [],
      pdfSizeEstimateBytes: item.pdf_size_estimate_bytes || 0,
      isFavorite: item.is_favorite || false,
      isEncrypted: item.is_encrypted || false,
      isDeleted: false,
      pages: item.pages_json ? JSON.parse(item.pages_json) : [],
    }));
  } catch (e) {
    console.error('[Supabase Fetch Error]', e);
    return null;
  }
}

/**
 * Cloud Sync Helper: Upload local folders to Supabase 'folders' table
 */
export async function syncFolderToSupabase(folder: FolderItem): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('folders')
      .upsert({
        id: folder.id,
        name: folder.name,
        color: folder.color,
        created_at: new Date(folder.createdAt).toISOString(),
      });

    return !error;
  } catch (e) {
    console.error('[Supabase Folder Sync Error]', e);
    return false;
  }
}

/**
 * Storage Bucket Const
 */
export const SCANS_BUCKET_NAME = 'scanned-documents';

/**
 * Ensure Supabase Storage bucket 'scanned-documents' exists
 */
export async function ensureScansBucketExists(): Promise<boolean> {
  if (!supabase) {
    console.warn('[Supabase Storage] ⚠️ Supabase client not initialized.');
    return false;
  }
  try {
    console.log(`[Supabase Storage] 🔍 Step 1/3: Checking if bucket '${SCANS_BUCKET_NAME}' exists...`);
    const { data: buckets, error: listErr } = await supabase.storage.listBuckets();
    
    if (listErr) {
      console.warn(`[Supabase Storage Warning] Could not list buckets: ${listErr.message}`);
    }

    const exists = buckets?.some((b: any) => b.name === SCANS_BUCKET_NAME);
    
    if (exists) {
      console.log(`[Supabase Storage] ✅ Bucket '${SCANS_BUCKET_NAME}' is ready.`);
      return true;
    }

    console.log(`[Supabase Storage] 📦 Bucket '${SCANS_BUCKET_NAME}' not found. Attempting creation...`);
    const { error: createErr } = await supabase.storage.createBucket(SCANS_BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      fileSizeLimit: 10485760, // 10MB
    });

    if (createErr) {
      console.warn(`[Supabase Storage Notice] Bucket creation notice (${SCANS_BUCKET_NAME}):`, createErr.message);
    } else {
      console.log(`[Supabase Storage] ✅ Bucket '${SCANS_BUCKET_NAME}' created successfully.`);
    }

    return true;
  } catch (err) {
    console.warn('[Supabase Storage Exception]', err);
    return false;
  }
}

/**
 * Upload base64 image data URL to Supabase Storage 'scanned-documents' bucket
 */
export async function uploadImageDataUrlToSupabaseStorage(
  dataUrl: string,
  filename: string
): Promise<string> {
  if (!supabase || !dataUrl) {
    console.warn('[Supabase Storage Upload] ⚠️ Skipped: No client or empty dataUrl.');
    return dataUrl;
  }

  try {
    await ensureScansBucketExists();

    let blob: Blob;
    if (dataUrl.startsWith('data:')) {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      blob = new Blob([u8arr], { type: mime });
    } else {
      console.log(`[Supabase Storage Upload] ℹ️ Input is already an HTTP URL: ${dataUrl.slice(0, 40)}...`);
      return dataUrl;
    }

    const path = filename;
    console.log(`[Supabase Storage Upload] 🚀 Step 2/3: Uploading '${path}' (${(blob.size / 1024).toFixed(1)} KB) to bucket '${SCANS_BUCKET_NAME}'...`);

    const { error: uploadErr } = await supabase.storage
      .from(SCANS_BUCKET_NAME)
      .upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadErr) {
      console.warn(`[Supabase Storage Upload Notice] Warning while uploading '${path}': ${uploadErr.message}`);
    } else {
      console.log(`[Supabase Storage Upload] ✅ Upload of '${path}' succeeded!`);
    }

    const { data: publicUrlData } = supabase.storage
      .from(SCANS_BUCKET_NAME)
      .getPublicUrl(path);

    const publicUrl = publicUrlData?.publicUrl || dataUrl;
    console.log(`[Supabase Storage Upload] 🔗 Public URL generated: ${publicUrl}`);
    return publicUrl;
  } catch (err) {
    console.error('[Supabase Storage Upload Error]', err);
    return dataUrl;
  }
}

export interface SaveScanParams {
  title?: string;
  mode: 'ocr' | 'clean';
  ocrText?: string | null;
  originalImageUrl: string;
  processedImageUrl?: string | null;
  pageCount?: number;
}

/**
 * Save scan result (mode 'ocr' or 'clean') into Supabase 'scans' table
 */
export async function saveScanRecordToSupabase(params: SaveScanParams): Promise<{ success: boolean; data?: any; error?: string }> {
  if (!supabase) {
    console.error('[Supabase Save Scan] ❌ Error: Supabase client is not initialized.');
    return { success: false, error: 'Supabase client non initialisé' };
  }

  console.log(`\n======================================================`);
  console.log(`🚀 [Supabase Save Scan Process Started]`);
  console.log(`   - Mode: ${params.mode.toUpperCase()}`);
  console.log(`   - Page Count: ${params.pageCount || 1}`);
  console.log(`   - OCR Text Length: ${params.ocrText ? params.ocrText.length : 0} characters`);
  console.log(`======================================================\n`);

  try {
    const formattedTitle = params.title?.trim() || `Scan ${new Date().toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`;
    const timestamp = Date.now();

    // 1. Upload original image
    console.log(`[Supabase Save Scan] 📸 Uploading original image...`);
    const uploadedOriginalUrl = await uploadImageDataUrlToSupabaseStorage(
      params.originalImageUrl,
      `raw_${timestamp}.jpg`
    );

    // 2. Upload processed image if available
    let uploadedProcessedUrl: string | null = null;
    if (params.processedImageUrl) {
      console.log(`[Supabase Save Scan] ✨ Uploading processed image...`);
      uploadedProcessedUrl = await uploadImageDataUrlToSupabaseStorage(
        params.processedImageUrl,
        `processed_${timestamp}.jpg`
      );
    }

    // 3. Prepare payload for 'scans' table
    const payload = {
      title: formattedTitle,
      mode: params.mode,
      ocr_text: params.mode === 'ocr' ? (params.ocrText || null) : null,
      image_url: uploadedOriginalUrl || params.originalImageUrl,
      processed_image_url: uploadedProcessedUrl || params.processedImageUrl || null,
      page_count: params.pageCount || 1,
    };

    console.log(`[Supabase Save Scan] 💾 Step 3/3: Inserting record into table 'scans'...`, payload);

    const { data, error } = await supabase
      .from('scans')
      .insert([payload])
      .select();

    if (error) {
      console.error(`[Supabase Save Scan] ❌ Database Insert Error: ${error.message}`);
      return { success: false, error: error.message };
    }

    const savedRecord = data?.[0];
    console.log(`\n======================================================`);
    console.log(`🎉 [Supabase Save Scan Process Complete - SUCCESS]`);
    console.log(`   - Scan ID: ${savedRecord?.id}`);
    console.log(`   - Title: "${savedRecord?.title}"`);
    console.log(`   - Created At: ${savedRecord?.created_at}`);
    console.log(`======================================================\n`);

    return { success: true, data: savedRecord };
  } catch (err: any) {
    console.error('[Supabase Save Scan Exception]', err);
    return { success: false, error: err?.message || 'Erreur lors de la sauvegarde du scan' };
  }
}

