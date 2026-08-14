import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { DocumentItem, FolderItem } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yubfmflrgfflxoenumdq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
