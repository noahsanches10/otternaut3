-- Create function to ensure stage weights match current stages
CREATE OR REPLACE FUNCTION sync_stage_weights()
RETURNS TRIGGER AS $$
DECLARE
  all_stages TEXT[];
  stage TEXT;
  weights JSONB;
BEGIN
  -- Combine default and custom stages
  all_stages := NEW.lead_stages || COALESCE(NEW.custom_lead_stages, ARRAY[]::TEXT[]);
  
  -- Get current weights
  weights := COALESCE(NEW.scoring_params->'qualification'->'stage_weights', '{}'::jsonb);
  
  -- Add missing stages with default weight of 5
  FOREACH stage IN ARRAY all_stages
  LOOP
    IF NOT (weights ? stage) THEN
      weights := weights || jsonb_build_object(stage, 5);
    END IF;
  END LOOP;
  
  -- Remove weights for non-existent stages
  SELECT jsonb_object_agg(key, value)
  INTO weights
  FROM jsonb_each(weights)
  WHERE key = ANY(all_stages);
  
  -- Update scoring params with new weights
  NEW.scoring_params := jsonb_set(
    NEW.scoring_params,
    '{qualification,stage_weights}',
    weights
  );
  
  -- Recalculate scores for affected leads
  UPDATE leads
  SET qualification_score = NULL,
      total_score = NULL
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync weights when stages change
DROP TRIGGER IF EXISTS sync_stage_weights_trigger ON user_profiles;
CREATE TRIGGER sync_stage_weights_trigger
  BEFORE UPDATE OF lead_stages, custom_lead_stages ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sync_stage_weights();
