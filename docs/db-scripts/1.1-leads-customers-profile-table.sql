-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    address TEXT,
    projected_value DECIMAL,
    follow_up_date DATE,
    lead_source TEXT,
    status TEXT,
    notes TEXT
);

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    subscription_status TEXT CHECK (subscription_status IN ('active', 'inactive', 'pending')),
    subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'pro', 'enterprise'))
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    company_name TEXT,
    lead_sources TEXT[] DEFAULT ARRAY[]::TEXT[],
    lead_statuses TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_lead_sources TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_lead_statuses TEXT[] DEFAULT ARRAY[]::TEXT[]
);
