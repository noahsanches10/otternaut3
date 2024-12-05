import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, MessageSquare, Layers, ChevronDown, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { CampaignList } from '../components/campaigns/CampaignList';
import { CampaignBuilder } from '../components/campaigns/CampaignBuilder';
import { CampaignDetail } from '../components/campaigns/CampaignDetail';
import { CampaignDashboard } from '../components/campaigns/CampaignDashboard';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import type { Campaign } from '../types/supabase';

export function Campaigns() {
  const { session } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [campaignType, setCampaignType] = useState<'email' | 'sms' | 'bulk' | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    audience: 'all'
  });

  const refreshCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data);
    } catch (error) {
      toast.error('Failed to fetch campaigns');
      console.error('Error:', error);
    }
  };

  const handleSave = async (campaignData: Partial<Campaign>) => {
    try {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('campaigns')
        .insert([{
          ...campaignData,
          user_id: session.user.id
        }]);

      if (error) throw error;
      toast.success('Campaign created successfully');
      await refreshCampaigns();
      setIsCreating(false);
      setCampaignType(null);
    } catch (error) {
      toast.error('Failed to create campaign');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    refreshCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || campaign.type === filters.type;
    const matchesStatus = filters.status === 'all' || campaign.status === filters.status;
    const matchesAudience = filters.audience === 'all' || campaign.audience_filter.type === filters.audience;

    return matchesSearch && matchesType && matchesStatus && matchesAudience;
  });

  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => setSelectedCampaign(null)}
      />
    );
  }

  if (isCreating && campaignType) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create {campaignType.toUpperCase()} Campaign</h1>
          <Button
            variant="ghost"
            onClick={() => {
              setIsCreating(false);
              setCampaignType(null);
            }}
          >
            Cancel
          </Button>
        </div>
        <CampaignBuilder
          type={campaignType}
          onSave={handleSave}
          onCancel={() => {
            setIsCreating(false);
            setCampaignType(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.audience} onValueChange={(value) => setFilters(prev => ({ ...prev, audience: value }))}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue placeholder="All Audiences" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="leads">Leads</SelectItem>
                <SelectItem value="customers">Customers</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ type: 'all', status: 'all', audience: 'all' })}
              className="h-8 px-2"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Reset filters</span>
            </Button>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8">
              <Plus className="w-4 h-4 mr-1" />
              Create Campaign
              <ChevronDown className="w-4 h-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => {
              setIsCreating(true);
              setCampaignType('email');
            }}>
              <Mail className="w-4 h-4 mr-2" />
              Email Campaign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setIsCreating(true);
              setCampaignType('sms');
            }}>
              <MessageSquare className="w-4 h-4 mr-2" />
              SMS Campaign
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              setIsCreating(true);
              setCampaignType('bulk');
            }}>
              <Layers className="w-4 h-4 mr-2" />
              Bulk Campaign
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CampaignDashboard campaigns={filteredCampaigns} />

      <CampaignList
        searchTerm={searchTerm}
        campaigns={filteredCampaigns}
        onViewCampaign={setSelectedCampaign}
        onRefresh={setCampaigns}
      />
    </div>
  );
}