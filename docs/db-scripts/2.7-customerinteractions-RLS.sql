-- Enable RLS
ALTER TABLE public.customer_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own customer interactions"
    ON public.customer_interactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own customer interactions"
    ON public.customer_interactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer interactions"
    ON public.customer_interactions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own customer interactions"
    ON public.customer_interactions FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX customer_interactions_customer_id_idx ON public.customer_interactions(customer_id);
CREATE INDEX customer_interactions_created_at_idx ON public.customer_interactions(created_at DESC);