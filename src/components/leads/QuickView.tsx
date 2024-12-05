import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, DollarSign, Mail, Phone, MapPin, ArrowRight, Pencil, MessageSquare, Clock, Plus, Phone as PhoneIcon, Video, X, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ContactDialog } from '../messages/ContactDialog';
import { LeadScore } from './LeadScore';
import { InteractionForm } from './InteractionForm';
import { calculateLeadScore } from '../../lib/leadScoring';
import { cn } from '../../lib/utils';
import { formatValue } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { Lead, LeadInteraction } from '../../types/supabase';

interface QuickViewProps {
  lead: Lead | null;
  onClose: () => void;
  onEditLead: (lead: Lead) => void;
  onConvertToCustomer: (lead: Lead) => void;
}

export const QuickView = React.memo(function QuickView({ 
  lead, 
  onClose, 
  onEditLead, 
  onConvertToCustomer 
}: QuickViewProps) {
  if (!lead) return null;

  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'score' | 'activity'>('score');
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isAddingInteraction, setIsAddingInteraction] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<string | null>(null);
  const [newInteraction, setNewInteraction] = useState<{
    type: string;
    notes?: string;
    sentiment: string;
  }>({
    type: 'Call',
    sentiment: 'Neutral'
  });
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scores, setScores] = useState<{
    valueScore: number;
    engagementScore: number;
    timelineScore: number;
    qualificationScore: number;
    totalScore: number;
  } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (lead) {
      Promise.all([fetchInteractions(), fetchProfile()]);
    }
  }, [lead]);

  useEffect(() => {
    if (lead && profile && interactions.length >= 0) {
      updateLeadScore();
    }
  }, [lead, profile, interactions]);

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to fetch profile');
    }
  }, []);

  const updateLeadScore = useCallback(async () => {
    if (!lead || !profile) return;
    
    try {
      const newScores = await calculateLeadScore(lead, interactions, profile);
      setScores(newScores);
    } catch (error) {
      console.error('Error calculating lead score:', error);
      toast.error('Failed to calculate lead score');
    }
  }, [lead, profile, interactions]);

  const fetchInteractions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lead_interactions')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInteractions(data);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to fetch interactions');
    } finally {
      setIsLoading(false);
    }
  }, [lead?.id]);

  const timelineEvents = useMemo(() => [
    {
      type: 'created',
      date: new Date(lead.created_at),
      description: 'Lead created',
      id: null
    },
    ...interactions.map(interaction => ({
      type: interaction.type.toLowerCase(),
      date: new Date(interaction.created_at),
      description: `${interaction.type} - ${interaction.sentiment}`,
      notes: interaction.notes,
      sentiment: interaction.sentiment,
      id: interaction.id
    }))
  ], [lead.created_at, interactions]);

  const handleAddInteraction = useCallback(async () => {
    if (!newInteraction.type) return;
    if (!session?.user?.id) {
      toast.error('You must be logged in to add interactions');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('lead_interactions')
        .insert([{
          user_id: session.user.id,
          lead_id: lead.id,
          type: newInteraction.type,
          notes: newInteraction.notes,
          sentiment: newInteraction.sentiment || 'Neutral'
        }]);

      if (error) throw error;

      toast.success('Interaction added successfully');
      fetchInteractions();
      setIsAddingInteraction(false);
      setNewInteraction({
        type: 'Call',
        sentiment: 'Neutral'
      });
    } catch (error) {
      console.error('Error adding interaction:', error);
      toast.error('Failed to add interaction');
    }
  }, [newInteraction, session?.user?.id, lead?.id, fetchInteractions]);

  const handleEditInteraction = useCallback(async (id: string) => {
    try {
      const interaction = interactions.find(i => i.id === id);
      if (!interaction) return;

      const { error } = await supabase
        .from('lead_interactions')
        .update({
          type: newInteraction.type,
          notes: newInteraction.notes,
          sentiment: newInteraction.sentiment
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Interaction updated');
      fetchInteractions();
      setEditingInteraction(null);
      setNewInteraction({
        type: 'Call',
        sentiment: 'Neutral'
      });
    } catch (error) {
      console.error('Error updating interaction:', error);
      toast.error('Failed to update interaction');
    }
  }, [newInteraction, fetchInteractions]);

  return (
    <Dialog open={!!lead} onOpenChange={onClose}>
      <DialogContent className={cn(
        "!fixed !right-0 !left-auto !translate-x-0",
        "!h-screen !max-h-screen !rounded-none",
        "w-full sm:w-[1100px] overflow-hidden"
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Lead Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full max-h-screen">
          <div className="flex-1 overflow-y-auto pb-[96px]">
            {/* Basic Info Section */}
            <div className="p-4 bg-muted/50 rounded-lg mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-foreground">{lead.name}</h3>
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-medium rounded-full",
                    lead.priority === 'high' ? 'bg-destructive text-white' :
                    lead.priority === 'medium' ? 'bg-yellow-500 text-white' :
                    'bg-emerald-500 text-white'
                  )}>
                    {lead.priority === 'medium' ? 'Med' : lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} Priority
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="space-y-2">
                    {lead.email && (
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="w-3 h-3 mr-1.5" />
                        {lead.email}
                      </div>
                    )}
                    {lead.service_type && (
                      <div className="flex items-center text-muted-foreground">
                        <Tag className="w-3 h-3 mr-1.5" />
                        {lead.service_type.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    {lead.phone && (
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="w-3 h-3 mr-1.5" />
                        {lead.phone}
                      </div>
                    )}
                    {lead.address && (
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        {lead.address}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Stage</p>
                    <p className="text-sm font-medium mt-0.5">{lead.status}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Source</p>
                    <p className="text-sm font-medium mt-0.5">{lead.lead_source}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Value</p>
                    <p className="text-sm font-medium mt-0.5">${lead.projected_value}</p>
                  </div>
                </div>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(value: 'score' | 'activity') => setActiveTab(value)} className="px-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="score">Lead Score</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="score" className="mt-4 space-y-4">
                <LeadScore scores={scores} />

                {lead.follow_up_date && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Follow-up on {new Date(lead.follow_up_date).toLocaleDateString()}</span>
                  </div>
                )}

                {lead.notes && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{lead.notes}</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="space-y-6">
                  {isAddingInteraction ? (
                    <InteractionForm
                      interaction={newInteraction}
                      onChange={updates => setNewInteraction(prev => ({ ...prev, ...updates }))}
                      onSubmit={editingInteraction ? () => handleEditInteraction(editingInteraction) : handleAddInteraction}
                      onCancel={() => {
                        setIsAddingInteraction(false);
                        setEditingInteraction(null);
                        setNewInteraction({
                          type: 'Call',
                          sentiment: 'Neutral'
                        });
                      }}
                      isEditing={!!editingInteraction}
                    />
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setIsAddingInteraction(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Interaction
                    </Button>
                  )}

                  {timelineEvents.map((event, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        {event.type === 'created' ? (
                          <Clock className="w-4 h-4 text-primary" />
                        ) : (
                          <div className="w-4 h-4 text-primary">
                            {event.type === 'meeting' && <Video className="w-4 h-4" />}
                            {event.type === 'call' && <PhoneIcon className="w-4 h-4" />}
                            {event.type === 'text' && <MessageSquare className="w-4 h-4" />}
                            {event.type === 'email' && <Mail className="w-4 h-4" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">{event.description}</p>
                          {event.sentiment && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              event.sentiment === 'Positive' && "bg-emerald-100 text-emerald-700",
                              event.sentiment === 'Neutral' && "bg-blue-100 text-blue-700",
                              event.sentiment === 'Negative' && "bg-red-100 text-red-700"
                            )}>
                              {event.sentiment}
                            </span>
                          )}
                          {event.type !== 'created' && (
                            <div className="ml-auto flex items-center space-x-2">
                              <Button
                                title="Edit"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const interaction = interactions.find(i => i.id === event.id);
                                  if (!interaction) return;
                                  
                                  setNewInteraction({
                                    type: interaction.type,
                                    notes: interaction.notes || '',
                                    sentiment: interaction.sentiment
                                  });
                                  setEditingInteraction(event.id);
                                  setIsAddingInteraction(true);
                                }}
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                title="Delete"
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  if (!confirm('Are you sure you want to delete this interaction?')) return;
                                  try {
                                    const { error } = await supabase
                                      .from('lead_interactions')
                                      .delete()
                                      .eq('id', event.id);
                                    
                                    if (error) throw error;
                                    toast.success('Interaction deleted');
                                    fetchInteractions();
                                  } catch (error) {
                                    console.error('Error deleting interaction:', error);
                                    toast.error('Failed to delete interaction');
                                  }
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        {event.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{event.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Convert to Customer Button */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-background py-6 px-4 flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsContactDialogOpen(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEditLead(lead)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Lead
            </Button>
            <Button
              className="flex-1"
              onClick={() => onConvertToCustomer(lead)}
            >
              Convert to Customer
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        recipient={{
          id: lead.id,
          type: 'lead',
          name: lead.name,
          email: lead.email,
          phone: lead.phone
        }}
      />
    </Dialog>
  );
});