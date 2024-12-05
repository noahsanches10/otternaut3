import React, { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { CampaignBuilder } from './CampaignBuilder';
import { cn } from '../../lib/utils';
import type { Campaign } from '../../types/supabase';

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateCampaignDialog({ isOpen, onClose }: CreateCampaignDialogProps) {
  const [selectedType, setSelectedType] = useState<'email' | 'sms' | null>(null);

  const handleSave = async (campaignData: Partial<Campaign>) => {
    try {
      // TODO: Implement campaign creation with Supabase
      console.log('Creating campaign:', campaignData);
      onClose();
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[425px]",
        selectedType && "sm:max-w-[700px]"
      )}>
        <DialogHeader>
          <DialogTitle>
            {selectedType ? `Create ${selectedType.toUpperCase()} Campaign` : 'Create Campaign'}
          </DialogTitle>
        </DialogHeader>
        {selectedType ? (
          <CampaignBuilder
            type={selectedType}
            onSave={handleSave}
            onCancel={() => setSelectedType(null)}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                onClick={() => setSelectedType('email')}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-lg border-2",
                  "transition-colors duration-200",
                  "border-border hover:border-primary/50"
                )}
              >
                <Mail className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">Email Campaign</span>
              </button>
              <button
                onClick={() => setSelectedType('sms')}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-lg border-2",
                  "transition-colors duration-200",
                  "border-border hover:border-primary/50"
                )}
              >
                <MessageSquare className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">SMS Campaign</span>
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}