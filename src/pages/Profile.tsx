import React, { useState, useEffect } from 'react';
import { Plus, X, Save, RotateCcw, Building2, Settings2, Calculator } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { DEFAULT_LEAD_SOURCES, DEFAULT_LEAD_STATUSES, DEFAULT_FREQUENCIES, DEFAULT_SERVICE_TYPES } from '../lib/constants';
import { updateProfileDefaults, updateCustomFields, restoreDefaults } from '../lib/profile';
import type { UserProfile, Service } from '../types/supabase';
import toast from 'react-hot-toast';

export function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newLeadSource, setNewLeadSource] = useState('');
  const [newLeadStage, setNewLeadStage] = useState('');
  const [newFrequency, setNewFrequency] = useState('');
  const [editedSources, setEditedSources] = useState<string[]>([]);
  const [editedStages, setEditedStages] = useState<string[]>([]);
  const [newServiceType, setNewServiceType] = useState('');
  const [editedServiceTypes, setEditedServiceTypes] = useState<string[]>([]);
  const [editedFrequencies, setEditedFrequencies] = useState<string[]>([]);
  const [businessInfo, setBusinessInfo] = useState({
    role: '',
    industry: '',
    location: '',
    currency: 'USD',
    website: '',
    description: ''
  });

  const [scoringParams, setScoringParams] = useState<UserProfile['scoring_params']>({
    value: {
      threshold_low: 1000,
      threshold_medium: 5000,
      threshold_high: 10000
    },
    engagement: {
      min_interactions: 1,
      optimal_interactions: 3,
      recency_weight: 7
    },
    timeline: {
      overdue_penalty: 3,
      upcoming_bonus: 2,
      optimal_days_ahead: 7
    },
    qualification: {
      stage_weights: {
        new: 2,
        contacted: 4,
        qualified: 6,
        negotiation: 8,
        won: 10,
        lost: 0
      }
    }
  });

  const handleRestoreDefaults = (type: 'sources' | 'stages' | 'services' | 'frequencies') => {
    if (!profile?.id) return;

    const restore = async () => {
      const { success, error } = await restoreDefaults(profile.id, type);
      if (success) {
        await fetchProfile();
        toast.success('Defaults restored successfully');
      } else {
        toast.error('Failed to restore defaults');
      }
    }
    restore();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      if (profile.scoring_params) {
        setScoringParams(profile.scoring_params);
      }
      setEditedSources(profile.lead_sources?.length ? profile.lead_sources : [...DEFAULT_LEAD_SOURCES]);
      setEditedStages(profile.lead_stages?.length ? profile.lead_stages : [...DEFAULT_LEAD_STATUSES]);
      setEditedServiceTypes(profile.service_types?.length ? profile.service_types : [...DEFAULT_SERVICE_TYPES]);
      setEditedFrequencies(profile.service_frequencies?.length ? profile.service_frequencies : DEFAULT_FREQUENCIES.map(f => f.name));
    }
  }, [profile]);

  async function fetchProfile() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddLeadSource(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !newLeadSource.trim()) return;
    
    const { success } = await updateCustomFields(
      profile.id,
      'custom_lead_sources',
      [...profile.custom_lead_sources, newLeadSource.trim()]
    );
    
    if (success) {
      await fetchProfile();
      setNewLeadSource('');
      toast.success('Lead source added');
    } else {
      toast.error('Failed to add lead source');
    }
  }

  async function handleRemoveLeadSource(source: string) {
    if (!profile) return;

    const { success } = await updateCustomFields(
      profile.id,
      'custom_lead_sources',
      profile.custom_lead_sources.filter(s => s !== source)
    );
    
    if (success) {
      await fetchProfile();
      toast.success('Lead source removed');
    } else {
      toast.error('Failed to remove lead source');
    }
  }

  async function handleAddLeadStage(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !newLeadStage.trim()) return;
    if (profile.custom_lead_stages?.length >= 7) {
      toast.error('Maximum of 7 lead stages allowed');
      return;
    }

    try {
      const updatedStages = [...(profile.custom_lead_stages || []), newLeadStage.trim()];
      const { error } = await supabase
        .from('user_profiles')
        .update({ custom_lead_stages: updatedStages })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, custom_lead_stages: updatedStages });
      setNewLeadStage('');
      toast.success('Lead stage added');
    } catch (error) {
      toast.error('Failed to add lead stage');
    }
  }

  async function handleRemoveLeadStage(stage: string) {
    if (!profile) return;

    // Remove stage weight when removing a custom stage
    const updatedStageWeights = { ...scoringParams.qualification.stage_weights };
    delete updatedStageWeights[stage];
    
    setScoringParams(prev => ({
      ...prev,
      qualification: {
        ...prev.qualification,
        stage_weights: updatedStageWeights
      }
    }));

    try {
      const updatedStages = (profile.custom_lead_stages || []).filter(s => s !== stage);
      const { error } = await supabase
        .from('user_profiles')
        .update({
          custom_lead_stages: updatedStages,
          scoring_params: {
            ...scoringParams,
            qualification: {
              ...scoringParams.qualification,
              stage_weights: updatedStageWeights
            }
          }
        })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, custom_lead_stages: updatedStages });
      toast.success('Lead stage removed');
    } catch (error) {
      toast.error('Failed to remove lead stage');
    }
  }

  async function handleAddServiceType(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !newServiceType.trim()) return;

    try {
      const updatedTypes = [...profile.custom_service_types, newServiceType.trim()];
      const { error } = await supabase
        .from('user_profiles')
        .update({ custom_service_types: updatedTypes })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, custom_service_types: updatedTypes });
      setNewServiceType('');
      toast.success('Service type added');
    } catch (error) {
      toast.error('Failed to add service type');
    }
  }

  async function handleRemoveServiceType(type: string) {
    if (!profile) return;

    try {
      const updatedTypes = profile.custom_service_types.filter(t => t !== type);
      const { error } = await supabase
        .from('user_profiles')
        .update({ custom_service_types: updatedTypes })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, custom_service_types: updatedTypes });
      toast.success('Service type removed');
    } catch (error) {
      toast.error('Failed to remove service type');
    }
  }

  async function handleAddFrequency(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !newFrequency.trim()) return;

    try {
      const updatedFrequencies = [...(profile.custom_service_frequencies || []), newFrequency.trim()];
      const { error } = await supabase
        .from('user_profiles')
        .update({ custom_service_frequencies: updatedFrequencies })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, custom_service_frequencies: updatedFrequencies });
      setNewFrequency('');
      toast.success('Frequency added');
    } catch (error) {
      toast.error('Failed to add frequency');
    }
  }

  async function handleRemoveFrequency(frequency: string) {
    if (!profile) return;

    try {
      const updatedFrequencies = (profile.custom_service_frequencies || []).filter(f => f !== frequency);
      const { error } = await supabase
        .from('user_profiles')
        .update({ custom_service_frequencies: updatedFrequencies })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile({ ...profile, custom_service_frequencies: updatedFrequencies });
      toast.success('Frequency removed');
    } catch (error) {
      toast.error('Failed to remove frequency');
    }
  }

  async function handleUpdateDefaults() {
    if (!profile) return;

    const { success, error } = await updateProfileDefaults(profile.id, {
      lead_sources: editedSources,
      lead_stages: editedStages,
      service_types: editedServiceTypes,
      service_frequencies: editedFrequencies
    });
    
    if (success) {
      await fetchProfile();
      toast.success('Default values updated');
    } else {
      toast.error('Failed to update defaults');
    }
  }

  function handleRemoveDefault(type: 'source' | 'stage', value: string) {
    if (type === 'source') {
      setEditedSources(prev => prev.filter(s => s !== value));
    } else if (type === 'stage') {
      setEditedStages(prev => prev.filter(s => s !== value));
    } else if (type === 'service') {
      setEditedServiceTypes(prev => prev.filter(s => s !== value));
    } else if (type === 'frequency') {
      setEditedFrequencies(prev => prev.filter(s => s !== value));
    }
  }

  function handleEditDefault(type: 'source' | 'stage', oldValue: string, newValue: string) {
    if (!newValue.trim()) return;

    if (type === 'source') {
      setEditedSources(prev => prev.map(s => s === oldValue ? newValue.trim() : s));
    } else if (type === 'stage') {
      setEditedStages(prev => prev.map(s => s === oldValue ? newValue.trim() : s));
    } else if (type === 'service') {
      setEditedServiceTypes(prev => prev.map(s => s === oldValue ? newValue.trim() : s));
    } else if (type === 'frequency') {
      setEditedFrequencies(prev => prev.map(s => s === oldValue ? newValue.trim() : s));
    }
  }

  async function handleUpdateScoringParams() {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ scoring_params: scoringParams })
        .eq('id', profile.id);

      if (error) throw error;
      toast.success('Scoring parameters updated');
    } catch (error) {
      toast.error('Failed to update scoring parameters');
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
      
      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business" className="flex items-center">
            <Building2 className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="fields" className="flex items-center">
            <Settings2 className="w-4 h-4 mr-2" />
            Custom Fields
          </TabsTrigger>
          <TabsTrigger value="scoring" className="flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            Lead Scoring
          </TabsTrigger>
        </TabsList>

        {/* Business Tab */}
        <TabsContent value="business" className="mt-6">
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Role</Label>
                <Input
                  value={businessInfo.role}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, role: e.target.value }))}
                  placeholder="e.g. Owner, Manager"
                />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input
                  value={businessInfo.industry}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g. Landscaping, Construction"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={businessInfo.location}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. New York, USA"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input
                  value={businessInfo.currency}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, currency: e.target.value }))}
                  placeholder="e.g. USD"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Website</Label>
                <Input
                  type="url"
                  value={businessInfo.website}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Business Description</Label>
                <textarea
                  value={businessInfo.description}
                  onChange={(e) => setBusinessInfo(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your business and services..."
                  className={cn(
                    "w-full rounded-md border border-input bg-background px-3 py-2",
                    "min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
            </div>
            <Button className="w-full">
              <Save className="w-4 h-4 mr-2" />
              Save Business Information
            </Button>
          </div>
        </TabsContent>

        {/* Custom Fields Tab */}
        <TabsContent value="fields" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lead Sources Section */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Lead Sources</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-card-foreground">Default Sources</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestoreDefaults('sources')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Defaults
                </Button>
              </div>
              {editedSources.map((source) => (
                <div key={source} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => handleEditDefault('source', source, e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-foreground w-full"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveDefault('source', source)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleUpdateDefaults} variant="outline" className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
            
            <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-card-foreground mb-2">Custom Sources</h3>
            <form onSubmit={handleAddLeadSource} className="flex gap-2">
              <input
                type="text"
                value={newLeadSource}
                onChange={(e) => setNewLeadSource(e.target.value)}
                placeholder="Enter new lead source"
                className={cn(
                  "flex-1 rounded-md border-input bg-background",
                  "text-foreground",
                  "focus:ring-2 focus:ring-ring"
                )}
              />
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </form>
            <div className="space-y-2">
              {profile?.custom_lead_sources.map((source) => (
                <div
                  key={source}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                >
                  <span>{source}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLeadSource(source)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>

        {/* Lead Stages Section */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Lead Stages</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-card-foreground">Default Stages</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestoreDefaults('stages')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Defaults
                </Button>
              </div>
              {editedStages.map((stage) => (
                <div key={stage} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => handleEditDefault('stage', stage, e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-foreground w-full"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveDefault('stage', stage)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleUpdateDefaults} variant="outline" className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
            
            <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-card-foreground mb-2">
              Custom Stages
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({(editedStages.length + (profile?.custom_lead_stages?.length || 0))}/7)
              </span>
            </h3>
            <form onSubmit={handleAddLeadStage} className="flex gap-2">
              <input
                type="text"
                value={newLeadStage}
                onChange={(e) => setNewLeadStage(e.target.value)}
                placeholder="Enter new lead stage"
                className={cn(
                  "flex-1 rounded-md border-input bg-background",
                  "text-foreground",
                  "focus:ring-2 focus:ring-ring"
                )}
                disabled={profile?.custom_lead_stages?.length >= 7}
              />
              <Button
                type="submit"
                disabled={profile?.custom_lead_stages?.length >= 7}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </form>
            <div className="space-y-2">
              {profile?.custom_lead_stages?.map((stage) => (
                <div
                  key={stage}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                >
                  <span>{stage}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLeadStage(stage)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
        
        {/* Service Types Section */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Service Types</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-card-foreground">Default Types</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestoreDefaults('services')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Defaults
                </Button>
              </div>
              {editedServiceTypes.map((type) => (
                <div key={type} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => handleEditDefault('service', type, e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-foreground w-full"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveDefault('service', type)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleUpdateDefaults} variant="outline" className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-card-foreground mb-2">Custom Types</h3>
              <form onSubmit={handleAddServiceType} className="flex gap-2">
                <input
                  type="text"
                  value={newServiceType}
                  onChange={(e) => setNewServiceType(e.target.value)}
                  placeholder="Enter new service type"
                  className={cn(
                    "flex-1 rounded-md border-input bg-background",
                    "text-foreground",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </form>
              <div className="space-y-2 mt-2">
                {profile?.custom_service_types?.map((type) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                  >
                    <span>{type}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveServiceType(type)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Service Frequencies Section */}
        <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Service Frequencies</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-card-foreground">Default Frequencies</h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestoreDefaults('frequencies')}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore Defaults
                </Button>
              </div>
              {editedFrequencies.map((frequency) => (
                <div key={frequency} className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <input
                    type="text"
                    value={frequency}
                    onChange={(e) => handleEditDefault('frequency', frequency, e.target.value)}
                    className="bg-transparent border-none focus:ring-0 text-foreground w-full"
                  />
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveDefault('frequency', frequency)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button onClick={handleUpdateDefaults} variant="outline" className="w-full mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-card-foreground mb-2">Custom Frequencies</h3>
              <form onSubmit={handleAddFrequency} className="flex gap-2">
                <input
                  type="text"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  placeholder="Enter new frequency"
                  className={cn(
                    "flex-1 rounded-md border-input bg-background",
                    "text-foreground",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
                <Button type="submit">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </form>
              <div className="space-y-2 mt-2">
                {profile?.custom_service_frequencies?.map((frequency) => (
                  <div key={frequency} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span>{frequency}</span>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveFrequency(frequency)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </div>
        </TabsContent>

        {/* Lead Scoring Tab */}
        <TabsContent value="scoring" className="mt-6">
      <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Calculator className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold">Lead Scoring</h2>
              <p className="text-sm text-muted-foreground">Configure scoring parameters</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Value Thresholds */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Value Score Thresholds</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Low</label>
                <input
                  type="number"
                  value={scoringParams.value.threshold_low}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    value: {
                      ...prev.value,
                      threshold_low: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Medium</label>
                <input
                  type="number"
                  value={scoringParams.value.threshold_medium}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    value: {
                      ...prev.value,
                      threshold_medium: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">High</label>
                <input
                  type="number"
                  value={scoringParams.value.threshold_high}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    value: {
                      ...prev.value,
                      threshold_high: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Engagement Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Engagement Parameters</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Min Interactions</label>
                <input
                  type="number"
                  value={scoringParams.engagement.min_interactions}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    engagement: {
                      ...prev.engagement,
                      min_interactions: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Optimal Interactions</label>
                <input
                  type="number"
                  value={scoringParams.engagement.optimal_interactions}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    engagement: {
                      ...prev.engagement,
                      optimal_interactions: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Recency Weight (Days)</label>
                <input
                  type="number"
                  value={scoringParams.engagement.recency_weight}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    engagement: {
                      ...prev.engagement,
                      recency_weight: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Timeline Parameters */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Timeline Parameters</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Overdue Penalty (Points/Day)</label>
                <input
                  type="number"
                  value={scoringParams.timeline.overdue_penalty}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    timeline: {
                      ...prev.timeline,
                      overdue_penalty: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Upcoming Bonus (Points/Day)</label>
                <input
                  type="number"
                  value={scoringParams.timeline.upcoming_bonus}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    timeline: {
                      ...prev.timeline,
                      upcoming_bonus: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Optimal Days Ahead</label>
                <input
                  type="number"
                  value={scoringParams.timeline.optimal_days_ahead}
                  onChange={(e) => setScoringParams(prev => ({
                    ...prev,
                    timeline: {
                      ...prev.timeline,
                      optimal_days_ahead: Number(e.target.value)
                    }
                  }))}
                  className={cn(
                    "w-full rounded-md border border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                />
              </div>
            </div>
          </div>

          {/* Stage Weights */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Stage Weights (0-10)</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(scoringParams.qualification.stage_weights).map(([stage, weight]) => (
                <div key={stage}>
                  <label className="block text-xs text-muted-foreground mb-1">
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={weight}
                    onChange={(e) => setScoringParams(prev => ({
                      ...prev,
                      qualification: {
                        ...prev.qualification,
                        stage_weights: {
                          ...prev.qualification.stage_weights,
                          [stage]: Number(e.target.value)
                        }
                      }
                    }))}
                    className={cn(
                      "w-full rounded-md border border-input bg-background",
                      "text-foreground shadow-sm",
                      "focus:ring-2 focus:ring-ring"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleUpdateScoringParams} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Save Scoring Parameters
          </Button>
        </div>
      </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}