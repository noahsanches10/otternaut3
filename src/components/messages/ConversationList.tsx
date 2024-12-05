import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Mail, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import type { Message } from '../../types/supabase';

interface ConversationListProps {
  searchTerm: string;
  selectedChannel: 'all' | 'email' | 'sms';
  onSelectConversation: (conversation: { id: string; type: 'lead' | 'customer'; name: string }) => void;
  selectedConversationId?: string;
}

interface Conversation {
  contactId: string;
  contactType: 'lead' | 'customer';
  contactName: string;
  lastMessage: Message;
  unreadCount: number;
}

export function ConversationList({
  searchTerm,
  selectedChannel,
  onSelectConversation,
  selectedConversationId
}: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, [selectedChannel, searchTerm]);

  async function fetchConversations() {
    try {
      // Fetch the most recent message for each contact
      let query = supabase
        .from('messages')
        .select(`
          id,
          contact_id,
          contact_type,
          channel,
          content,
          created_at,
          status,
          read
        `)
        .order('created_at', { ascending: false });

      if (selectedChannel !== 'all') {
        query = query.eq('channel', selectedChannel);
      }

      const { data: messages, error } = await query;

      if (error) throw error;

      // Group messages by contact and get the latest one
      const conversationMap = new Map<string, Conversation>();
      
      for (const message of messages) {
        const key = `${message.contact_type}-${message.contact_id}`;
        
        if (!conversationMap.has(key)) {
          // Fetch contact name based on type
          const { data: contact } = await supabase
            .from(message.contact_type === 'lead' ? 'leads' : 'customers')
            .select('name, first_name, last_name')
            .eq('id', message.contact_id)
            .single();

          if (contact) {
            const contactName = contact.name || `${contact.first_name} ${contact.last_name}`;
            
            // Count unread messages
            const { count } = await supabase
              .from('messages')
              .select('id', { count: 'exact' })
              .eq('contact_id', message.contact_id)
              .eq('read', false);

            conversationMap.set(key, {
              contactId: message.contact_id,
              contactType: message.contact_type,
              contactName,
              lastMessage: message,
              unreadCount: count || 0
            });
          }
        }
      }

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
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
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-muted-foreground">
          No conversations found
        </div>
      ) : (
        <div className="divide-y divide-border">
          {conversations.map((conversation) => (
            <button
              key={`${conversation.contactType}-${conversation.contactId}`}
              onClick={() => onSelectConversation({
                id: conversation.contactId,
                type: conversation.contactType,
                name: conversation.contactName
              })}
              className={cn(
                "w-full p-4 text-left hover:bg-accent transition-colors",
                selectedConversationId === conversation.contactId && "bg-accent"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-medium">
                  {conversation.contactName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(conversation.lastMessage.created_at), 'MMM d, h:mm a')}
                </span>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                {conversation.lastMessage.channel === 'email' ? (
                  <Mail className="w-3 h-3 mr-1" />
                ) : (
                  <MessageSquare className="w-3 h-3 mr-1" />
                )}
                <span className="truncate">
                  {conversation.lastMessage.content}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-muted-foreground">
                  {conversation.lastMessage.status === 'delivered' ? (
                    <CheckCheck className="w-3 h-3 mr-1" />
                  ) : conversation.lastMessage.status === 'sent' ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : null}
                  {conversation.lastMessage.status.charAt(0).toUpperCase() + 
                   conversation.lastMessage.status.slice(1)}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                    {conversation.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}