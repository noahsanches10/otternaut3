-- Create lead_interactions table
CREATE TABLE IF NOT EXISTS public.lead_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    lead_id UUID REFERENCES public.leads(id) NOT NULL,
    type TEXT CHECK (type IN ('Meeting', 'Call', 'Text', 'Email')) NOT NULL,
    notes TEXT,
    sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);