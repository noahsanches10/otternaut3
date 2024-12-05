-- Drop existing check_service_type function and trigger
DROP TRIGGER IF EXISTS validate_service_type ON leads;
DROP FUNCTION IF EXISTS check_service_type();

-- Create new function to check service types that handles both default and custom types
CREATE OR REPLACE FUNCTION check_service_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow NULL values
  IF NEW.service_type IS NULL THEN
    RETURN NEW;
  END IF;

  -- Check if service_type exists in user's service_types or custom_service_types
  -- Use lower case for case-insensitive comparison
  IF EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = NEW.user_id
    AND (
      LOWER(NEW.service_type) = ANY(ARRAY_LOWER(service_types))
      OR LOWER(NEW.service_type) = ANY(ARRAY_LOWER(custom_service_types))
    )
  ) THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Invalid service type: %. Must be one of the configured service types.', NEW.service_type;
END;
$$ LANGUAGE plpgsql;

-- Create function to convert array elements to lowercase
CREATE OR REPLACE FUNCTION ARRAY_LOWER(arr text[])
RETURNS text[] AS $$
  SELECT ARRAY(
    SELECT LOWER(x)
    FROM unnest(arr) AS x
  );
$$ LANGUAGE SQL IMMUTABLE;

-- Recreate trigger with new function
CREATE TRIGGER validate_service_type
  BEFORE INSERT OR UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION check_service_type();

-- Update existing leads to ensure service_types are valid
UPDATE leads l
SET service_type = NULL
WHERE service_type IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM user_profiles p
  WHERE p.id = l.user_id
  AND (
    LOWER(l.service_type) = ANY(ARRAY_LOWER(p.service_types))
    OR LOWER(l.service_type) = ANY(ARRAY_LOWER(p.custom_service_types))
  )
);