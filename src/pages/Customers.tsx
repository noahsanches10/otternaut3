import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Archive, Search, X, Mail, Phone, Building2, Undo, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import { QuickView } from '../components/customers/QuickView';
import { CustomerForm } from '../components/customers/CustomerForm';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { cn, formatValue } from '../lib/utils';
import type { Customer } from '../types/supabase';
import type { UserProfile } from '../types/supabase';
import toast from 'react-hot-toast';

export function Customers() {
  const { session } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedCustomerForView, setSelectedCustomerForView] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    frequency: 'all',
    source: 'all'
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (customer.company_name && customer.company_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filters.type === 'all' || customer.service_type === filters.type;
    const matchesFrequency = filters.frequency === 'all' || customer.service_frequency === filters.frequency;
    const matchesSource = filters.source === 'all' || customer.source === filters.source;

    return matchesSearch && matchesType && matchesFrequency && matchesSource;
  });

  const resetFilters = () => {
    setFilters({
      type: 'all',
      frequency: 'all',
      source: 'all'
    });
    setSearchTerm('');
  };

  useEffect(() => {
    Promise.all([fetchCustomers(), fetchProfile()]);
  }, [activeTab]);

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
    }
  }

  async function fetchCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('archived', activeTab === 'archived')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }

  const handleArchiveCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to archive this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .update({ archived: true, archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Customer archived successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to archive customer');
    }
  };

  const handleRestoreCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ archived: false, archived_at: null })
        .eq('id', id);

      if (error) throw error;
      toast.success('Customer restored successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to restore customer');
    }
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Customer permanently deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  async function handleSubmit(customerData: Partial<Customer>) {
    try {
      if (selectedCustomer) {
        const { data, error } = await supabase
          .from('customers')
          .update(customerData)
          .eq('id', selectedCustomer.id);

        if (error) throw error;
        toast.success('Customer updated successfully');
      } else {
        const { data, error } = await supabase
          .from('customers')
          .insert([{ ...customerData, user_id: session?.user.id }]);

        if (error) throw error;
        toast.success('Customer created successfully');
      }

      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      console.error('Supabase error:', error);
      toast.error(error.message || 'Failed to save customer');
      throw error; // Re-throw to handle in the form
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {[...(profile?.service_types || []), ...(profile?.custom_service_types || [])].map(type => (
                    <SelectItem key={type} value={type}>
                      {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Select value={filters.frequency} onValueChange={(value) => setFilters(prev => ({ ...prev, frequency: value }))}>
                <SelectTrigger className="h-8 text-xs w-40">
                  <SelectValue placeholder="All Frequencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Frequencies</SelectItem>
                  {[...(profile?.service_frequencies || []), ...(profile?.custom_service_frequencies || [])].map(frequency => (
                    <SelectItem key={frequency} value={frequency}>
                      {frequency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Select value={filters.source} onValueChange={(value) => setFilters(prev => ({ ...prev, source: value }))}>
                <SelectTrigger className="h-8 text-xs w-32">
                  <SelectValue placeholder="All Sources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {[...(profile?.lead_sources || []), ...(profile?.custom_lead_sources || [])].map(source => (
                    <SelectItem key={source} value={source}>
                      {source.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 px-2">
            <X className="w-4 h-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="border border-border rounded-lg p-0.5">
            <Button
              variant={activeTab === 'archived' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(activeTab === 'active' ? 'archived' : 'active')}
              className="h-7 px-2"
            >
              <Archive className="w-4 h-4" />
              <span className="sr-only">{activeTab === 'active' ? 'Archived' : 'Active'}</span>
            </Button>
          </div>
          <Button size="sm" className="h-8" onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-1" />
            Add Customer
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr className="text-[11px]">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                  Name
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                  Email
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
                  Phone
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
                  Address
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[80px]">
                  City
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
                  Type
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[80px]">
                  Frequency
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[60px]">
                  SV
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[70px]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomerForView(customer)}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <td className="px-3 py-2 truncate">
                    <div className="text-xs text-card-foreground">
                      {customer.first_name} {customer.last_name}
                    </div>
                    {customer.company_name && (
                      <div className="text-[11px] text-muted-foreground">{customer.company_name}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 truncate">
                    <span className="text-[11px] text-muted-foreground">{customer.email || '-'}</span>
                  </td>
                  <td className="px-3 py-2 truncate">
                    <span className="text-[11px] text-muted-foreground">{customer.phone || '-'}</span>
                  </td>
                  <td className="px-3 py-2 truncate">
                    <span className="text-[11px] text-muted-foreground">{customer.property_street1 || '-'}</span>
                  </td>
                  <td className="px-3 py-2 truncate">
                    <span className="text-[11px] text-muted-foreground">{customer.property_city || '-'}</span>
                  </td>
                  <td className="px-3 py-2 truncate">
                    <span className="text-[11px] text-muted-foreground">{customer.service_type}</span>
                  </td>
                  <td className="px-3 py-2 truncate">
                    <span className="text-[11px] text-muted-foreground">{customer.service_frequency}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-[11px] text-card-foreground flex items-center">
                      <DollarSign className="w-4 h-4 text-muted-foreground mr-1" />
                      {formatValue(customer.sale_value)}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {activeTab === 'archived' ? (
                      <div className="flex space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreCustomer(customer.id);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <Undo className="w-4 h-4" />
                          <span className="sr-only">Restore</span>
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePermanentDelete(customer.id);
                          }}
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="sr-only">Delete Permanently</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                            setIsModalOpen(true);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveCustomer(customer.id);
                          }}
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <Archive className="w-4 h-4" />
                          <span className="sr-only">Archive</span>
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <QuickView
        customer={selectedCustomerForView}
        onClose={() => setSelectedCustomerForView(null)}
        onEdit={(customer) => {
          setSelectedCustomer(customer);
          setIsModalOpen(true);
          setSelectedCustomerForView(null);
        }}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
      >
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          customer={selectedCustomer}
          sources={[...(profile?.lead_sources || []), ...(profile?.custom_lead_sources || [])]}
          serviceTypes={[...(profile?.service_types || []), ...(profile?.custom_service_types || [])]}
          profile={profile}
        />
      </Modal>
    </div>
  );
}