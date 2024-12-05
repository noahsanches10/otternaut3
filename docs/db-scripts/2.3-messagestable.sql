-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    contact_id UUID NOT NULL,
    contact_type TEXT CHECK (contact_type IN ('lead', 'customer')) NOT NULL,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')) NOT NULL,
    channel TEXT CHECK (channel IN ('email', 'sms')) NOT NULL,
    content TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'sent', 'delivered', 'failed')) NOT NULL DEFAULT 'pending',
    metadata JSONB DEFAULT '{}'::jsonb,
    thread_id TEXT,
    read BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own messages"
    ON public.messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own messages"
    ON public.messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages"
    ON public.messages FOR UPDATE
    USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX messages_contact_idx ON public.messages (contact_id, contact_type);
CREATE INDEX messages_thread_idx ON public.messages (thread_id);
CREATE INDEX messages_created_at_idx ON public.messages (created_at DESC);