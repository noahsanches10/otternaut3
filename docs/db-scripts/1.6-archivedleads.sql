-- Add archived column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived_at column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
