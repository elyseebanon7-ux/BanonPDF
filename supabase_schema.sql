-- BANONPDF - CREATION DES TABLES SUPABASE (3 TABLES UNIQUEMENT)

CREATE TABLE IF NOT EXISTS public.folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6',
    user_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    details TEXT,
    severity TEXT NOT NULL DEFAULT 'info',
    user_id TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
