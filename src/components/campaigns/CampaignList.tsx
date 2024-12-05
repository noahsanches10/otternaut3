import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Calendar, Users, Play, Pause, CheckCircle, Trash2, X, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import type { Campaign } from '../../types/supabase';
import toast from 'react-hot-toast';

interface CampaignListProps {
  searchTerm: string;
  campaigns: Campaign[];
  onViewCampaign: (campaign: Campaign) => void;
  onRefresh: (campaigns: Campaign[]) => void;
}

export function CampaignList({ searchTerm, campaigns, onViewCampaign, onRefresh }: CampaignListProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const refreshCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      onRefresh(data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
      console.error('Error:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: Campaign['status']) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Campaign ${status}`);
      await refreshCampaigns();
    } catch (error) {
      toast.error('Failed to update campaign status');
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .select();

      if (error) throw error;
      
      toast.success('Campaign deleted');
      await refreshCampaigns();
    } catch (error) {
      toast.error('Failed to delete campaign');
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Campaigns</h2>
      <div className="grid grid-cols-1 gap-4">
        {campaigns.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No campaigns found
          </div>
        )}
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className={cn(
              "flex items-center justify-between p-4",
              "bg-card rounded-lg border border-border",
              "hover:bg-accent hover:border-accent transition-all duration-200"
            )}
            onClick={() => onViewCampaign(campaign)}
          >
            <div className="flex items-center space-x-4">
              {campaign.type === 'email' ? (
                <Mail className="w-4 h-4 text-muted-foreground" />
              ) : (
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <h3 className="text-sm font-medium">{campaign.name}</h3>
                <div className="flex items-center space-x-4 mt-1">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                    campaign.status === 'active' && "bg-emerald-100 text-emerald-800",
                    campaign.status === 'draft' && "bg-gray-100 text-gray-800",
                    campaign.status === 'scheduled' && "bg-blue-100 text-blue-800",
                    campaign.status === 'paused' && "bg-yellow-100 text-yellow-800",
                    campaign.status === 'completed' && "bg-purple-100 text-purple-800"
                  )}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Users className="w-3 h-3 mr-1" />
                    {campaign.audience_filter.type === 'leads' ? 'All Leads' : 'All Customers'}
                  </div>
                  {campaign.schedule?.start_date && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(campaign.schedule.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="sm">
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {campaign.status === 'draft' && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(campaign.id, 'active');
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Activate
                  </DropdownMenuItem>
                )}
                {campaign.status === 'active' && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(campaign.id, 'paused');
                  }}>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </DropdownMenuItem>
                )}
                {campaign.status === 'paused' && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(campaign.id, 'active');
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </DropdownMenuItem>
                )}
                {(campaign.status === 'active' || campaign.status === 'paused') && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleStatusUpdate(campaign.id, 'completed');
                  }}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(campaign.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}