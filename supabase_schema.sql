-- ====================================================================
-- BANONPDF - SUPABASE DATABASE SCHEMA MIGRATION
-- Project Ref: yubfmflrgfflxoenumdq
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/yubfmflrgfflxoenumdq/sql)
-- ====================================================================

-- 1. Create 'folders' table
CREATE TABLE IF NOT EXISTS public.folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create 'documents' table
CREATE TABLE IF NOT EXISTS public.documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'standard',
    folder_id TEXT REFERENCES public.folders(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    page_count INTEGER NOT NULL DEFAULT 1,
    ocr_full_text TEXT,
    thumbnail_url TEXT,
    pdf_size_estimate_bytes BIGINT DEFAULT 0,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_encrypted BOOLEAN NOT NULL DEFAULT FALSE,
    pages_json JSONB DEFAULT '[]'::jsonb,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create 'audit_logs' table (Directive Omega Security)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    severity TEXT NOT NULL DEFAULT 'info',
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies allowing public anon / authenticated access for client sync

-- Folders policies
DROP POLICY IF EXISTS "Allow anon read/write folders" ON public.folders;
CREATE POLICY "Allow anon read/write folders" ON public.folders
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Documents policies
DROP POLICY IF EXISTS "Allow anon read/write documents" ON public.documents;
CREATE POLICY "Allow anon read/write documents" ON public.documents
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Audit logs policies
DROP POLICY IF EXISTS "Allow anon read/write audit_logs" ON public.audit_logs;
CREATE POLICY "Allow anon read/write audit_logs" ON public.audit_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 5. Indexes for fast full-text search & folder queries
CREATE INDEX IF NOT EXISTS idx_documents_folder ON public.documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_updated ON public.documents(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(type);
