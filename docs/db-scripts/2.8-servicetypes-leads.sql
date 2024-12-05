-- Add service_type column to leads table
-- Add service_type column to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Add check constraint to ensure service_type matches user's service types
CREATE OR REPLACE FUNCTION check_service_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow NULL values
  IF NEW.service_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if service_type exists in user's service_types or custom_service_types
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = NEW.user_id
    AND (
      NEW.service_type = ANY(service_types)
      OR NEW.service_type = ANY(custom_service_types)
    )
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid service type';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate service_type
DROP TRIGGER IF EXISTS validate_service_type ON leads;
CREATE TRIGGER validate_service_type
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION check_service_type();