import React from 'react';
import { ArrowLeft, Calendar, Users, Mail, MessageSquare, Layers } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { Campaign } from '../../types/supabase';

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
}

export function CampaignDetail({ campaign, onBack }: CampaignDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-semibold">{campaign.name}</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-3 space-y-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-medium mb-4">Campaign Content</h2>
            {campaign.type === 'bulk' ? (
              <div className="space-y-4">
                {campaign.content.messages?.map((message, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      {message.type === 'email' ? (
                        <Mail className="w-4 h-4" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      <span className="font-medium">
                        {message.type === 'email' ? 'Email Message' : 'SMS Message'}
                      </span>
                    </div>
                    {message.subject && (
                      <div className="mb-2">
                        <span className="text-sm font-medium">Subject: </span>
                        <span className="text-sm">{message.subject}</span>
                      </div>
                    )}
                    <div className="text-sm whitespace-pre-wrap">{message.body}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {campaign.content.subject && (
                  <div className="mb-4">
                    <span className="font-medium">Subject: </span>
                    <span>{campaign.content.subject}</span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.content.body || '' }} />
              </div>
            )}
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-medium mb-4">Campaign Performance</h2>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{campaign.stats.sent}</div>
                <div className="text-sm text-muted-foreground">Messages Sent</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{campaign.stats.opened}</div>
                <div className="text-sm text-muted-foreground">Opens</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{campaign.stats.clicked}</div>
                <div className="text-sm text-muted-foreground">Clicks</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-semibold">{campaign.stats.responses}</div>
                <div className="text-sm text-muted-foreground">Responses</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-lg font-medium mb-4">Campaign Details</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Type</div>
                <div className="flex items-center">
                  {campaign.type === 'email' ? (
                    <Mail className="w-4 h-4 mr-2" />
                  ) : campaign.type === 'sms' ? (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Layers className="w-4 h-4 mr-2" />
                  )}
                  {campaign.type.charAt(0).toUpperCase() + campaign.type.slice(1)} Campaign
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className={cn(
                  "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                  campaign.status === 'active' && "bg-emerald-100 text-emerald-800",
                  campaign.status === 'draft' && "bg-gray-100 text-gray-800",
                  campaign.status === 'scheduled' && "bg-blue-100 text-blue-800",
                  campaign.status === 'paused' && "bg-yellow-100 text-yellow-800",
                  campaign.status === 'completed' && "bg-purple-100 text-purple-800"
                )}>
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Audience</div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  {campaign.audience_filter.type === 'leads' ? 'All Leads' : 'All Customers'}
                </div>
              </div>
              {campaign.schedule?.start_date && (
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Schedule</div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(campaign.schedule.start_date).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}