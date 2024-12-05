import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import toast from 'react-hot-toast';

interface Integration {
  id: string;
  provider: 'resend' | 'twilio';
  credentials: Record<string, string>;
  enabled: boolean;
  last_verified_at: string | null;
}

export function Integrations() {
  const [isLoading, setIsLoading] = useState(true);
  const { session } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]); 
  const [resendForm, setResendForm] = useState({
    apiKey: '',
    fromEmail: '',
  });
  const [twilioForm, setTwilioForm] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  });
  const [isSaving, setIsSaving] = useState<'resend' | 'twilio' | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  async function fetchIntegrations() {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*');

      if (error) throw error;

      setIntegrations(data);

      // Pre-fill forms if integrations exist
      const resend = data.find(i => i.provider === 'resend');
      if (resend) {
        setResendForm({
          apiKey: resend.credentials.apiKey,
          fromEmail: resend.credentials.fromEmail
        });
      }

      const twilio = data.find(i => i.provider === 'twilio');
      if (twilio) {
        setTwilioForm({
          accountSid: twilio.credentials.accountSid,
          authToken: twilio.credentials.authToken,
          phoneNumber: twilio.credentials.phoneNumber
        });
      }
    } catch (error) {
      toast.error('Failed to fetch integrations');
    } finally {
      setIsLoading(false);
    }
  }

  async function saveResend() {
    if (!resendForm.apiKey || !resendForm.fromEmail) {
      toast.error('Please fill in all Resend fields');
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be logged in to save integrations');
      return;
    }

    setIsSaving('resend');
    try {
      const credentials = {
        apiKey: resendForm.apiKey,
        fromEmail: resendForm.fromEmail
      };

      const existing = integrations.find(i => i.provider === 'resend');
      
      if (existing) {
        const { error } = await supabase
          .from('integrations')
          .update({
            credentials,
            enabled: true,
            last_verified_at: null
          })
          .eq('id', existing.id)
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integrations')
          .insert([{
            user_id: session.user.id,
            provider: 'resend',
            credentials,
            enabled: true,
            last_verified_at: null
          }]);

        if (error) throw error;
      }

      toast.success('Resend integration saved');
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving Resend integration:', error);
      toast.error('Failed to save Resend integration');
    } finally {
      setIsSaving(null);
    }
  }

  async function saveTwilio() {
    if (!twilioForm.accountSid || !twilioForm.authToken || !twilioForm.phoneNumber) {
      toast.error('Please fill in all Twilio fields');
      return;
    }

    if (!session?.user?.id) {
      toast.error('You must be logged in to save integrations');
      return;
    }

    setIsSaving('twilio');
    try {
      const credentials = {
        accountSid: twilioForm.accountSid,
        authToken: twilioForm.authToken,
        phoneNumber: twilioForm.phoneNumber
      };

      const existing = integrations.find(i => i.provider === 'twilio');
      
      if (existing) {
        const { error } = await supabase
          .from('integrations')
          .update({
            credentials,
            enabled: true,
            last_verified_at: null
          })
          .eq('id', existing.id)
          .eq('user_id', session.user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('integrations')
          .insert([{
            user_id: session.user.id,
            provider: 'twilio',
            credentials,
            enabled: true,
            last_verified_at: null
          }]);

        if (error) throw error;
      }

      toast.success('Twilio integration saved');
      fetchIntegrations();
    } catch (error) {
      console.error('Error saving Twilio integration:', error);
      toast.error('Failed to save Twilio integration');
    } finally {
      setIsSaving(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Resend Integration */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Mail className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Resend</h2>
                <p className="text-sm text-muted-foreground">Email communication</p>
              </div>
            </div>
            {integrations.find(i => i.provider === 'resend')?.enabled && (
              <div className="flex items-center text-sm text-emerald-500">
                <Check className="w-4 h-4 mr-1" />
                Connected
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={resendForm.apiKey}
                onChange={(e) => setResendForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="re_..."
              />
            </div>
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                type="email"
                value={resendForm.fromEmail}
                onChange={(e) => setResendForm(prev => ({ ...prev, fromEmail: e.target.value }))}
                placeholder="notifications@yourdomain.com"
              />
            </div>
            <Button
              className="w-full"
              onClick={saveResend}
              disabled={isSaving === 'resend'}
            >
              {isSaving === 'resend' ? (
                <>Saving...</>
              ) : (
                <>Save</>
              )}
            </Button>
          </div>
        </div>

        {/* Twilio Integration */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-semibold">Twilio</h2>
                <p className="text-sm text-muted-foreground">SMS communication</p>
              </div>
            </div>
            {integrations.find(i => i.provider === 'twilio')?.enabled && (
              <div className="flex items-center text-sm text-emerald-500">
                <Check className="w-4 h-4 mr-1" />
                Connected
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Account SID</Label>
              <Input
                type="password"
                value={twilioForm.accountSid}
                onChange={(e) => setTwilioForm(prev => ({ ...prev, accountSid: e.target.value }))}
                placeholder="AC..."
              />
            </div>
            <div className="space-y-2">
              <Label>Auth Token</Label>
              <Input
                type="password"
                value={twilioForm.authToken}
                onChange={(e) => setTwilioForm(prev => ({ ...prev, authToken: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                value={twilioForm.phoneNumber}
                onChange={(e) => setTwilioForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="+1234567890"
              />
            </div>
            <Button
              className="w-full"
              onClick={saveTwilio}
              disabled={isSaving === 'twilio'}
            >
              {isSaving === 'twilio' ? (
                <>Saving...</>
              ) : (
                <>Save</>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex items-center p-4 bg-muted rounded-lg">
        <AlertCircle className="w-4 h-4 mr-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Your credentials are encrypted and stored securely. If messages fail to send, please verify your credentials are correct.
        </p>
      </div>
    </div>
  );
}