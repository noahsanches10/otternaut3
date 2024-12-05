-- Add new columns to existing profiles if they don't exist
DO $$ 
BEGIN
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
        'lawn-maintenance',
        'tree-service',
        'pest-control',
        'landscaping',
        'snow-removal',
        'irrigation',
        'hardscaping'
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
        ARRAY['referral', 'website', 'cold-call', 'trade-show', 'social_media', 'other']::TEXT[],
        ARRAY['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost']::TEXT[],
        ARRAY[
            'lawn-maintenance',
            'tree-service',
            'pest-control',
            'landscaping',
            'snow-removal',
            'irrigation',
            'hardscaping'
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