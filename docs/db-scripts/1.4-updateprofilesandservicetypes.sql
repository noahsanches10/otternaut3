-- Add new columns to existing profiles if they don't exist
DO $$ 
BEGIN
    -- Drop existing customers table if it exists
    DROP TABLE IF EXISTS public.customers;

    -- Create new customers table with updated schema
    CREATE TABLE IF NOT EXISTS public.customers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        user_id UUID REFERENCES auth.users(id) NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        company_name TEXT,
        email TEXT,
        phone TEXT,
        source TEXT,
        property_street1 TEXT,
        property_street2 TEXT,
        property_city TEXT,
        property_state TEXT,
        property_zip TEXT,
        property_country TEXT DEFAULT 'United States',
        billing_same_as_property BOOLEAN DEFAULT true,
        billing_street1 TEXT,
        billing_street2 TEXT,
        billing_city TEXT,
        billing_state TEXT,
        billing_zip TEXT,
        billing_country TEXT,
        service_type TEXT,
        service_frequency TEXT,
        line_items JSONB DEFAULT '[]'::jsonb,
        notes TEXT,
        sale_value DECIMAL
    );

    -- Enable RLS on customers table
    ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for customers
    CREATE POLICY "Users can view their own customers" ON customers
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can create their own customers" ON customers
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own customers" ON customers
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own customers" ON customers
        FOR DELETE USING (auth.uid() = user_id);

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' AND column_name = 'service_types') THEN
        ALTER TABLE public.user_profiles ADD COLUMN service_types TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' AND column_name = 'custom_service_types') THEN
        ALTER TABLE public.user_profiles ADD COLUMN custom_service_types TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' AND column_name = 'service_frequencies') THEN
        ALTER TABLE public.user_profiles ADD COLUMN service_frequencies TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'user_profiles' AND column_name = 'custom_service_frequencies') THEN
        ALTER TABLE public.user_profiles ADD COLUMN custom_service_frequencies TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Add default service types and frequencies to existing profiles
UPDATE public.user_profiles
SET 
    service_types = ARRAY[
        'Lawn-Maintenance',
        'Tree-Service',
        'Pest-Control',
        'Landscaping',
        'Snow-Removal',
        'Irrigation',
        'Hardscaping'
    ]::TEXT[]
WHERE service_types IS NULL OR service_types = '{}';

UPDATE public.user_profiles
SET 
    service_frequencies = ARRAY[
        'One-Time',
        'Semi-Annual',
        'Tri-Annual',
        'Quarterly',
        'Bi-Monthly',
        'Monthly',
        'Custom'
    ]::TEXT[]
WHERE service_frequencies IS NULL OR service_frequencies = '{}';

-- Create or replace the trigger function to include service defaults
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        lead_sources,
        lead_statuses,
        service_types,
        service_frequencies,
        custom_lead_sources,
        custom_lead_statuses,
        custom_service_types,
        custom_service_frequencies
    )
    VALUES (
        new.id,
        ARRAY['Referral', 'Website', 'Cold-Call', 'Trade-Show', 'Social-Media', 'Other']::TEXT[],
        ARRAY['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost']::TEXT[],
        ARRAY[
            'Lawn-Maintenance',
            'Tree-Service',
            'Pest-Control',
            'Landscaping',
            'Snow-Removal',
            'Irrigation',
            'Hardscaping'
        ]::TEXT[],
        ARRAY[
            'One-Time',
            'Semi-Annual',
            'Tri-Annual',
            'Quarterly',
            'Bi-Monthly',
            'Monthly',
            'Custom'
        ]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[]
    );
    RETURN new;
END;
$$ language plpgsql security definer;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();