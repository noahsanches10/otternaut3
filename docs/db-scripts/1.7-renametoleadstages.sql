-- Rename columns in user_profiles table
ALTER TABLE public.user_profiles 
  RENAME COLUMN lead_statuses TO lead_stages;

ALTER TABLE public.user_profiles 
  RENAME COLUMN custom_lead_statuses TO custom_lead_stages;

-- Update the handle_new_user function to use the new column names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.user_profiles (
        id,
        first_name,
        last_name,
        company_name,
        lead_sources,
        lead_stages,
        service_types,
        service_frequencies,
        custom_lead_sources,
        custom_lead_stages,
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
