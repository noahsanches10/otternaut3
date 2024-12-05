import { supabase } from './supabase';
import type { Message } from '../types/supabase';

interface SendMessageParams {
  contactId: string;
  contactType: 'lead' | 'customer';
  channel: 'email' | 'sms';
  content: string;
}

export async function sendMessage({ contactId, contactType, channel, content }: SendMessageParams): Promise<Message> {
  try {
    // First create the message record
    const { data: message, error: dbError } = await supabase
      .from('messages')
      .insert([{
        contact_id: contactId,
        contact_type: contactType,
        direction: 'outbound',
        channel,
        content,
        status: 'pending'
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // Get the integration credentials
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('provider', channel === 'email' ? 'resend' : 'twilio')
      .eq('enabled', true)
      .single();

    if (integrationError) throw integrationError;

    // Get the contact's details
    const { data: contact, error: contactError } = await supabase
      .from(contactType === 'lead' ? 'leads' : 'customers')
      .select('email, phone')
      .eq('id', contactId)
      .single();

    if (contactError) throw contactError;

    // Send the message through the appropriate channel
    if (channel === 'sms') {
      const { accountSid, authToken, phoneNumber: fromNumber } = integration.credentials;
      
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: contact.phone,
            Body: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send SMS');
      }

      // Update message status
      await supabase
        .from('messages')
        .update({ status: 'sent' })
        .eq('id', message.id);

      return { ...message, status: 'sent' };
    } else {
      // Email implementation will go here once Resend is set up
      throw new Error('Email sending not yet implemented');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    
    // Update message status to failed
    if (error.message) {
      await supabase
        .from('messages')
        .update({
          status: 'failed',
          metadata: { error: error.message }
        })
        .eq('id', message.id);
    }
    
    throw error;
  }
}