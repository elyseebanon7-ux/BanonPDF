-- ====================================================================
-- BANONPDF - SUPABASE DATABASE SCHEMA MIGRATION (100% FAIL-SAFE)
-- Project Ref: yubfmflrgfflxoenumdq
-- ====================================================================

-- 1. Table des dossiers (folders)
CREATE TABLE IF NOT EXISTS public.folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Table des documents (documents)
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'standard',
    folder_id TEXT,
    tags TEXT[] DEFAULT '{}',
    page_count INTEGER NOT NULL DEFAULT 1,
    ocr_full_text TEXT,
    thumbnail_url TEXT,
    pdf_size_estimate_bytes BIGINT DEFAULT 0,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    pages_json JSONB DEFAULT '[]'::jsonb,
    user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table du registre d'audit (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    severity TEXT NOT NULL DEFAULT 'info',
    user_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activer la sécurité RLS
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Folders Policy" ON public.folders;
DROP POLICY IF EXISTS "Public Documents Policy" ON public.documents;
DROP POLICY IF EXISTS "Public Audit Logs Policy" ON public.audit_logs;

-- Créer les politiques d'accès universel
CREATE POLICY "Public Folders Policy" ON public.folders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Documents Policy" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Audit Logs Policy" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
