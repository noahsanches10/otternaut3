import React from 'react';
import { BarChart3, TrendingUp, Users, Mail, MessageSquare, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Campaign } from '../../types/supabase';

interface CampaignDashboardProps {
  campaigns: Campaign[];
}

export function CampaignDashboard({ campaigns }: CampaignDashboardProps) {
  const stats = {
    total: campaigns.length,
    active: campaigns.filter(c => c.status === 'active').length,
    completed: campaigns.filter(c => c.status === 'completed').length,
    totalSent: campaigns.reduce((sum, c) => sum + c.stats.sent, 0),
    totalOpened: campaigns.reduce((sum, c) => sum + c.stats.opened, 0),
    totalClicked: campaigns.reduce((sum, c) => sum + c.stats.clicked, 0),
  };

  const openRate = stats.totalSent > 0 
    ? ((stats.totalOpened / stats.totalSent) * 100).toFixed(1)
    : '0';

  const clickRate = stats.totalOpened > 0
    ? ((stats.totalClicked / stats.totalOpened) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
              <h3 className="text-2xl font-semibold mt-1">{stats.total}</h3>
            </div>
            <div className="bg-primary/10 p-2 rounded-full">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              <span>{stats.active} Active</span>
            </div>
            <span className="mx-2">•</span>
            <span>{stats.completed} Completed</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Messages Sent</p>
              <h3 className="text-2xl font-semibold mt-1">{stats.totalSent}</h3>
            </div>
            <div className="bg-emerald-500/10 p-2 rounded-full">
              <Mail className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <div className="flex items-center">
              <Mail className="w-3 h-3 mr-1" />
              <span>{campaigns.filter(c => c.type === 'email').length} Email</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center">
              <MessageSquare className="w-3 h-3 mr-1" />
              <span>{campaigns.filter(c => c.type === 'sms').length} SMS</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Open Rate</p>
              <h3 className="text-2xl font-semibold mt-1">{openRate}%</h3>
            </div>
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Users className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <span>{stats.totalOpened} Opens</span>
            <span className="mx-2">•</span>
            <span>From {stats.totalSent} Sent</span>
          </div>
        </div>

        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Click Rate</p>
              <h3 className="text-2xl font-semibold mt-1">{clickRate}%</h3>
            </div>
            <div className="bg-purple-500/10 p-2 rounded-full">
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-muted-foreground">
            <span>{stats.totalClicked} Clicks</span>
            <span className="mx-2">•</span>
            <span>From {stats.totalOpened} Opens</span>
          </div>
        </div>
      </div>
    </div>
  );
}