-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'sms', 'bulk')) NOT NULL,
    status TEXT CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')) NOT NULL,
    audience_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    schedule JSONB,
    stats JSONB NOT NULL DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "responses": 0}'::jsonb
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own campaigns"
    ON public.campaigns FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can create their own campaigns"
    ON public.campaigns FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own campaigns"
    ON public.campaigns FOR UPDATE
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can delete their own campaigns"
    ON public.campaigns FOR DELETE
    USING (
        auth.uid() = user_id
    );

-- Create campaign_templates table
CREATE TABLE IF NOT EXISTS public.campaign_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('email', 'sms')) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    variables TEXT[] DEFAULT ARRAY[]::TEXT[],
    category TEXT CHECK (category IN ('follow_up', 'promotion', 'announcement', 'reminder', 'custom')) NOT NULL
);

-- Enable RLS
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own templates"
    ON public.campaign_templates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own templates"
    ON public.campaign_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates"
    ON public.campaign_templates FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates"
    ON public.campaign_templates FOR DELETE
    USING (auth.uid() = user_id);