-- Add name fields to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Update the handle_new_user function to include name fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        first_name,
        last_name,
        company_name,
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
        new.raw_user_meta_data->>'first_name',
        new.raw_user_meta_data->>'last_name',
        new.raw_user_meta_data->>'company_name',
        ARRAY['Referral', 'Website', 'Cold-Call', 'Trade-Show', 'Social-Media', 'Other']::TEXT[],
        ARRAY['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost']::TEXT[],
        ARRAY['Lawn-Maintenance', 'Tree-Service', 'Pest-Control', 'Landscaping', 'Snow-Removal', 'Irrigation', 'Hardscaping']::TEXT[],
        ARRAY['One-Time', 'Semi-Annual', 'Tri-Annual', 'Quarterly', 'Bi-Monthly', 'Monthly', 'Custom']::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[],
        ARRAY[]::TEXT[]
    );
    RETURN new;
END;
$$ language plpgsql security definer;