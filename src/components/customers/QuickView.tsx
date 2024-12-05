import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, DollarSign, Mail, Phone, MapPin, Building2, Pencil, MessageSquare, Clock, Plus, Phone as PhoneIcon, Video, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { ContactDialog } from '../messages/ContactDialog';
import { InteractionForm } from '../leads/InteractionForm';
import { cn } from '../../lib/utils';
import { formatValue } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import type { Customer, CustomerInteraction } from '../../types/supabase';

interface QuickViewProps {
  customer: Customer | null;
  onClose: () => void;
  onEdit: (customer: Customer) => void;
}

export function QuickView({ customer, onClose, onEdit }: QuickViewProps) {
  if (!customer) return null;

  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'activity'>('history');
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
  const [interactions, setInteractions] = useState<CustomerInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (customer) {
      fetchInteractions();
    }
  }, [customer]);

  const fetchInteractions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('customer_interactions')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInteractions(data);
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to fetch interactions');
    } finally {
      setIsLoading(false);
    }
  }, [customer?.id]);

  const timelineEvents = useMemo(() => [
    {
      type: 'created',
      date: new Date(customer.created_at),
      description: 'Customer created',
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
  ], [customer.created_at, interactions]);

  const handleAddInteraction = useCallback(async () => {
    if (!newInteraction.type) return;
    if (!session?.user?.id) {
      toast.error('You must be logged in to add interactions');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('customer_interactions')
        .insert([{
          user_id: session.user.id,
          customer_id: customer.id,
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
  }, [newInteraction, session?.user?.id, customer?.id, fetchInteractions]);

  const handleEditInteraction = useCallback(async (id: string) => {
    try {
      const interaction = interactions.find(i => i.id === id);
      if (!interaction) return;

      const { error } = await supabase
        .from('customer_interactions')
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
    <Dialog open={!!customer} onOpenChange={onClose}>
      <DialogContent className={cn(
        "!fixed !right-0 !left-auto !translate-x-0",
        "!h-screen !max-h-screen !rounded-none",
        "w-full sm:w-[1100px] overflow-hidden"
      )}>
        <DialogHeader className="sr-only">
          <DialogTitle>Customer Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full max-h-screen">
          <div className="flex-1 overflow-y-auto pb-[96px]">
            {/* Basic Info Section */}
            <div className="p-4 bg-muted/50 rounded-lg mb-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  {customer.first_name} {customer.last_name}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {customer.company_name && (
                    <div className="flex items-center text-muted-foreground col-span-2">
                      <Building2 className="w-3 h-3 mr-1.5" />
                      {customer.company_name}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center text-muted-foreground">
                      <Mail className="w-3 h-3 mr-1.5" />
                      {customer.email}
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-3 h-3 mr-1.5" />
                      {customer.phone}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  {/* Property Address */}
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Property Address</p>
                    <div className="text-xs">
                      <p>{customer.property_street1}</p>
                      {customer.property_street2 && <p>{customer.property_street2}</p>}
                      <p>
                        {customer.property_city}, {customer.property_state} {customer.property_zip}
                      </p>
                    </div>
                  </div>

                  {/* Billing Address (if different) */}
                  {!customer.billing_same_as_property && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Billing Address</p>
                      <div className="text-xs">
                        <p>{customer.billing_street1}</p>
                        {customer.billing_street2 && <p>{customer.billing_street2}</p>}
                        <p>
                          {customer.billing_city}, {customer.billing_state} {customer.billing_zip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Service Type</p>
                    <p className="text-sm font-medium mt-0.5">{customer.service_type}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Frequency</p>
                    <p className="text-sm font-medium mt-0.5">{customer.service_frequency}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sale Value</p>
                    <p className="text-sm font-medium mt-0.5">${formatValue(customer.sale_value)}</p>
                  </div>
                </div>

                <Tabs value={activeTab} onValueChange={(value: 'history' | 'activity') => setActiveTab(value)} className="px-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="history" className="mt-4 space-y-4">
                    {/* Line Items */}
                    {customer.line_items?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-medium">Line Items</p>
                        <div className="space-y-2">
                          {customer.line_items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded-md">
                              <span>{item.description}</span>
                              <span>${item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {customer.notes && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
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
                                          .from('customer_interactions')
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
            </div>
          </div>

          {/* Action Buttons */}
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
              className="flex-1"
              onClick={() => onEdit(customer)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Customer
            </Button>
          </div>
        </div>
      </DialogContent>
      <ContactDialog
        isOpen={isContactDialogOpen}
        onClose={() => setIsContactDialogOpen(false)}
        recipient={{
          id: customer.id,
          type: 'customer',
          name: `${customer.first_name} ${customer.last_name}`,
          email: customer.email,
          phone: customer.phone
        }}
      />
    </Dialog>
  );
}