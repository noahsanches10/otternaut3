import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Search, X, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { sendMessage } from '../../lib/messaging';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface NewMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Recipient {
  id: string;
  type: 'lead' | 'customer';
  name: string;
  email?: string;
  phone?: string;
}

export function NewMessageDialog({ isOpen, onClose }: NewMessageDialogProps) {
  const [channel, setChannel] = useState<'email' | 'sms'>('sms');
  const [searchTerm, setSearchTerm] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRecipients();
    }
  }, [isOpen, searchTerm, channel]);

  async function fetchRecipients() {
    try {
      // Fetch leads
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, email, phone')
        .filter('archived', 'eq', false)
        .or(
          `name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `phone.ilike.%${searchTerm}%`
        )
        .limit(50);

      if (leadsError) throw leadsError;

      // Fetch customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, first_name, last_name, email, phone')
        .or(
          `first_name.ilike.%${searchTerm}%,` +
          `last_name.ilike.%${searchTerm}%,` +
          `email.ilike.%${searchTerm}%,` +
          `phone.ilike.%${searchTerm}%`
        )
        .limit(50);

      if (customersError) throw customersError;

      const formattedRecipients: Recipient[] = [
        ...leads.map(lead => ({
          id: lead.id,
          type: 'lead' as const,
          name: lead.name,
          email: lead.email,
          phone: lead.phone
        })),
        ...customers.map(customer => ({
          id: customer.id,
          type: 'customer' as const,
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email,
          phone: customer.phone
        }))
      ].filter(recipient => 
        channel === 'email' ? recipient.email : recipient.phone
      );

      setRecipients(formattedRecipients);
    } catch (error) {
      console.error('Error fetching recipients:', error);
      toast.error('Failed to fetch recipients');
    }
  }

  async function handleSend() {
    if (!selectedRecipients.length) {
      toast.error('Please select at least one recipient');
      return;
    }

    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      // Send message to each recipient
      await Promise.all(
        selectedRecipients.map(async (recipient) => {
          try {
            await sendMessage({
              contactId: recipient.id,
              contactType: recipient.type,
              channel,
              content: message.trim()
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to send to ${recipient.name}:`, error);
            failureCount++;
          }
        })
      );

      if (successCount > 0) {
        toast.success(`Message sent to ${successCount} recipient${successCount !== 1 ? 's' : ''}`);
      }
      
      if (failureCount > 0) {
        toast.error(`Failed to send to ${failureCount} recipient${failureCount !== 1 ? 's' : ''}`);
      }

      if (successCount > 0) {
        onClose();
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Tabs value={channel} onValueChange={(value: 'email' | 'sms') => setChannel(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" disabled={true}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </TabsTrigger>
              <TabsTrigger value="sms">
                <MessageSquare className="w-4 h-4 mr-2" />
                SMS
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div>
              <Label>To</Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search recipients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              {/* Selected Recipients */}
              {selectedRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRecipients.map((recipient) => (
                    <div
                      key={`${recipient.type}-${recipient.id}`}
                      className="flex items-center bg-primary/10 text-primary rounded-full px-3 py-1 text-sm"
                    >
                      <span>{recipient.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 ml-2 hover:bg-transparent"
                        onClick={() => setSelectedRecipients(prev => 
                          prev.filter(r => r.id !== recipient.id)
                        )}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Recipients List */}
              {searchTerm && (
                <div className="absolute z-10 mt-1 w-full bg-popover border border-border rounded-md shadow-md">
                  {recipients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No recipients found
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto">
                      {recipients.map((recipient) => {
                        const isSelected = selectedRecipients.some(r => r.id === recipient.id);
                        return (
                          <button
                            key={`${recipient.type}-${recipient.id}`}
                            className={cn(
                              "w-full px-3 py-2 text-left hover:bg-accent transition-colors",
                              "flex items-center justify-between",
                              isSelected && "bg-accent"
                            )}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedRecipients(prev => 
                                  prev.filter(r => r.id !== recipient.id)
                                );
                              } else {
                                setSelectedRecipients(prev => [...prev, recipient]);
                              }
                            }}
                          >
                            <div>
                              <div className="font-medium text-sm">
                                {recipient.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {channel === 'email' ? recipient.email : recipient.phone}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="text-primary">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="mt-1.5"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={isSending}>
              {isSending ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}