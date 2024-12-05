import React, { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { sendMessage } from '../../lib/messaging';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface ContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  recipient: {
    id: string;
    type: 'lead' | 'customer';
    name: string;
    email?: string;
    phone?: string;
  };
}

export function ContactDialog({ isOpen, onClose, recipient }: ContactDialogProps) {
  const [channel, setChannel] = useState<'email' | 'sms'>('sms');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setIsSending(true);

    try {
      await sendMessage({
        contactId: recipient.id,
        contactType: recipient.type,
        channel,
        content: message.trim()
      });

      toast.success('Message sent successfully');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "!fixed !right-0 !left-auto !translate-x-0",
        "!h-screen !max-h-screen !rounded-none",
        "w-full sm:w-[440px] overflow-hidden"
      )}>
        <div className="flex flex-col h-full max-h-screen">
          <DialogHeader className="p-4 border-b border-border">
            <DialogTitle>Contact {recipient.name}</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <Tabs value={channel} onValueChange={(value: 'email' | 'sms') => setChannel(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email" disabled={!recipient.email}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </TabsTrigger>
                <TabsTrigger value="sms" disabled={!recipient.phone}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-4">
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
          </div>

          <div className="p-4 border-t border-border flex justify-end space-x-2">
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