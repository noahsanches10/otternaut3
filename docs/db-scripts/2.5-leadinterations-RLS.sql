-- Enable RLS
ALTER TABLE public.lead_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own lead interactions"
    ON public.lead_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead interactions"
    ON public.lead_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead interactions"
    ON public.lead_interactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead interactions"
    ON public.lead_interactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX lead_interactions_lead_id_idx ON public.lead_interactions(lead_id);
CREATE INDEX lead_interactions_created_at_idx ON public.lead_interactions(created_at DESC);