-- Add archived column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT false;

-- Add archived_at column to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
