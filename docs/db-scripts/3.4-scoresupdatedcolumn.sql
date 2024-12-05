-- Add scores_updated_at column and create indexes
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS scores_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS leads_total_score_idx ON public.leads(total_score);
CREATE INDEX IF NOT EXISTS leads_scores_updated_at_idx ON public.leads(scores_updated_at);

-- Add trigger to update scores_updated_at
CREATE OR REPLACE FUNCTION update_scores_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.scores_updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
