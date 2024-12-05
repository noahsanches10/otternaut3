-- Fix trigger function to properly handle default values
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
        custom_service_frequencies,
        scoring_params
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
        ARRAY[]::TEXT[],
        jsonb_build_object(
            'value', jsonb_build_object(
                'threshold_low', 1000,
                'threshold_medium', 5000,
                'threshold_high', 10000
            ),
            'engagement', jsonb_build_object(
                'min_interactions', 1,
                'optimal_interactions', 3,
                'recency_weight', 7
            ),
            'timeline', jsonb_build_object(
                'overdue_penalty', 3,
                'upcoming_bonus', 2,
                'optimal_days_ahead', 7
            ),
            'qualification', jsonb_build_object(
                'stage_weights', jsonb_build_object(
                    'new', 2,
                    'contacted', 4,
                    'qualified', 6,
                    'negotiation', 8,
                    'won', 10,
                    'lost', 0
                )
            )
        )
    );
    RETURN new;
END;
$$ language plpgsql security definer;

-- Create function to ensure arrays are never null
CREATE OR REPLACE FUNCTION ensure_arrays_not_null()
RETURNS trigger AS $$
BEGIN
    NEW.lead_sources := COALESCE(NEW.lead_sources, ARRAY[]::TEXT[]);
    NEW.lead_stages := COALESCE(NEW.lead_stages, ARRAY[]::TEXT[]);
    NEW.service_types := COALESCE(NEW.service_types, ARRAY[]::TEXT[]);
    NEW.service_frequencies := COALESCE(NEW.service_frequencies, ARRAY[]::TEXT[]);
    NEW.custom_lead_sources := COALESCE(NEW.custom_lead_sources, ARRAY[]::TEXT[]);
    NEW.custom_lead_stages := COALESCE(NEW.custom_lead_stages, ARRAY[]::TEXT[]);
    NEW.custom_service_types := COALESCE(NEW.custom_service_types, ARRAY[]::TEXT[]);
    NEW.custom_service_frequencies := COALESCE(NEW.custom_service_frequencies, ARRAY[]::TEXT[]);
    RETURN NEW;
END;
$$ language plpgsql;

-- Create trigger to ensure arrays are never null
DROP TRIGGER IF EXISTS ensure_arrays_not_null_trigger ON user_profiles;
CREATE TRIGGER ensure_arrays_not_null_trigger
    BEFORE INSERT OR UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_arrays_not_null();

-- Update existing profiles to ensure no null arrays
UPDATE public.user_profiles
SET
    lead_sources = COALESCE(lead_sources, ARRAY['Referral', 'Website', 'Cold-Call', 'Trade-Show', 'Social-Media', 'Other']::TEXT[]),
    lead_stages = COALESCE(lead_stages, ARRAY['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost']::TEXT[]),
    service_types = COALESCE(service_types, ARRAY['Lawn-Maintenance', 'Tree-Service', 'Pest-Control', 'Landscaping', 'Snow-Removal', 'Irrigation', 'Hardscaping']::TEXT[]),
    service_frequencies = COALESCE(service_frequencies, ARRAY['One-Time', 'Semi-Annual', 'Tri-Annual', 'Quarterly', 'Bi-Monthly', 'Monthly', 'Custom']::TEXT[]),
    custom_lead_sources = COALESCE(custom_lead_sources, ARRAY[]::TEXT[]),
    custom_lead_stages = COALESCE(custom_lead_stages, ARRAY[]::TEXT[]),
    custom_service_types = COALESCE(custom_service_types, ARRAY[]::TEXT[]),
    custom_service_frequencies = COALESCE(custom_service_frequencies, ARRAY[]::TEXT[]);