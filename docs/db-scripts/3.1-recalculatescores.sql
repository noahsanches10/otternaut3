-- Create function to recalculate scores when any scoring params change
CREATE OR REPLACE FUNCTION recalculate_lead_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- Reset scores when any scoring parameter changes
  IF OLD.scoring_params IS DISTINCT FROM NEW.scoring_params THEN
    -- If value thresholds changed
    IF OLD.scoring_params->'value' IS DISTINCT FROM NEW.scoring_params->'value' THEN
      UPDATE leads
      SET value_score = NULL,
          total_score = NULL
      WHERE user_id = NEW.id;
    END IF;

    -- If engagement parameters changed
    IF OLD.scoring_params->'engagement' IS DISTINCT FROM NEW.scoring_params->'engagement' THEN
      UPDATE leads
      SET engagement_score = NULL,
          total_score = NULL
      WHERE user_id = NEW.id;
    END IF;

    -- If timeline parameters changed
    IF OLD.scoring_params->'timeline' IS DISTINCT FROM NEW.scoring_params->'timeline' THEN
      UPDATE leads
      SET timeline_score = NULL,
          total_score = NULL
      WHERE user_id = NEW.id;
    END IF;

    -- If qualification parameters changed
    IF OLD.scoring_params->'qualification' IS DISTINCT FROM NEW.scoring_params->'qualification' THEN
      UPDATE leads
      SET qualification_score = NULL,
          total_score = NULL
      WHERE user_id = NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger to recalculate scores when scoring params change
DROP TRIGGER IF EXISTS scoring_params_changed ON user_profiles;
CREATE TRIGGER scoring_params_changed
  AFTER UPDATE OF scoring_params ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_lead_scores();
