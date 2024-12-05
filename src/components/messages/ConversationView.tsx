import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Send, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { sendMessage } from '../../lib/messaging';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import type { Message } from '../../types/supabase';

interface ConversationViewProps {
  contactId: string;
  contactType: 'lead' | 'customer';
  contactName: string;
}

export function ConversationView({ contactId, contactType, contactName }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    markMessagesAsRead();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `contact_id=eq.${contactId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [contactId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('contact_id', contactId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function markMessagesAsRead() {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('contact_id', contactId)
        .eq('read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      const message = await sendMessage({
        contactId,
        contactType,
        channel: 'sms', // For now, hardcode to SMS since Twilio is working
        content: messageContent
      });

      setMessages(prev => [...prev, message]);
      scrollToBottom();
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Restore the message content in case of error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold">{contactName}</h2>
        <p className="text-sm text-muted-foreground">
          {contactType.charAt(0).toUpperCase() + contactType.slice(1)}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[70%] space-y-1",
              message.direction === 'outbound' ? "ml-auto items-end" : "mr-auto items-start"
            )}
          >
            <div className={cn(
              "rounded-lg px-4 py-2",
              message.direction === 'outbound'
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}>
              {message.content}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {message.channel === 'email' ? (
                <Mail className="w-3 h-3 mr-1" />
              ) : (
                <MessageSquare className="w-3 h-3 mr-1" />
              )}
              <span>
                {format(new Date(message.created_at), 'MMM d, h:mm a')}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="resize-none"
            rows={1}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </>
  );
}