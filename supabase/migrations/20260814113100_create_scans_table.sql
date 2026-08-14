-- BANONPDF - SUPABASE MIGRATION: CREATE SCANS TABLE & SCANNED-DOCUMENTS STORAGE BUCKET POLICIES
-- File: supabase/migrations/20260814113100_create_scans_table.sql

-- 1. Create table public.scans with mode CHECK constraint
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    title TEXT,
    mode TEXT NOT NULL CHECK (mode IN ('ocr', 'clean')),
    ocr_text TEXT,
    image_url TEXT NOT NULL,
    processed_image_url TEXT,
    page_count INTEGER NOT NULL DEFAULT 1,
    user_id UUID
);

-- 2. Index on created_at column for chronological ordering optimization
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON public.scans (created_at DESC);

-- 3. Reusable trigger function for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION public.update_scans_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_scans_updated_at ON public.scans;
CREATE TRIGGER set_scans_updated_at
    BEFORE UPDATE ON public.scans
    FOR EACH ROW
    EXECUTE FUNCTION public.update_scans_updated_at_column();

-- 4. Enable Row Level Security (RLS) on public.scans table
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- 5. Temporary permissive RLS policy for development phase on scans table
DROP POLICY IF EXISTS "Allow public access for dev" ON public.scans;
CREATE POLICY "Allow public access for dev"
    ON public.scans
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Supabase Storage Bucket Initialization for 'scanned-documents'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('scanned-documents', 'scanned-documents', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET public = true;

-- 7. Storage Policies for 'scanned-documents' bucket (SELECT, INSERT, UPDATE)
DROP POLICY IF EXISTS "Public Read Access for scanned-documents" ON storage.objects;
CREATE POLICY "Public Read Access for scanned-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'scanned-documents');

DROP POLICY IF EXISTS "Public Insert Access for scanned-documents" ON storage.objects;
CREATE POLICY "Public Insert Access for scanned-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scanned-documents');

DROP POLICY IF EXISTS "Public Update Access for scanned-documents" ON storage.objects;
CREATE POLICY "Public Update Access for scanned-documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'scanned-documents');
