import React, { useState } from 'react';
import { Search, Mail, MessageSquare, Plus } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { ConversationList } from '../components/messages/ConversationList';
import { ConversationView } from '../components/messages/ConversationView';
import { NewMessageView } from '../components/messages/NewMessageView';
import { cn } from '../lib/utils';
import type { Message } from '../types/supabase';

export function Messages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'email' | 'sms'>('all');
  const [isComposing, setIsComposing] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    type: 'lead' | 'customer';
    name: string;
  } | null>(null);

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border space-y-4">
          <Button
            className="w-full"
            onClick={() => setIsComposing(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Message
          </Button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedChannel} onValueChange={(value: 'all' | 'email' | 'sms') => setSelectedChannel(value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Channels</SelectItem>
              <SelectItem value="email">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </div>
              </SelectItem>
              <SelectItem value="sms">
                <div className="flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ConversationList
          searchTerm={searchTerm}
          selectedChannel={selectedChannel}
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <ConversationView
            contactId={selectedConversation.id}
            contactType={selectedConversation.type}
            contactName={selectedConversation.name}
          />
        ) : isComposing ? (
          <NewMessageView onClose={() => setIsComposing(false)} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to view messages
          </div>
        )}
      </div>
    </div>
  );
}