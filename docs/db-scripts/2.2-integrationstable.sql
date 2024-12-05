-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    provider TEXT CHECK (provider IN ('resend', 'twilio')) NOT NULL,
    credentials JSONB NOT NULL,
    enabled BOOLEAN DEFAULT false,
    last_verified_at TIMESTAMPTZ,
    UNIQUE (user_id, provider)
);

-- Enable RLS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own integrations"
    ON public.integrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own integrations"
    ON public.integrations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
    ON public.integrations FOR UPDATE
    USING (auth.uid() = user_id);