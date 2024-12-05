import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Tabs } from './Tabs';
import { AddressFields } from './AddressFields';
import { LineItems } from './LineItems';
import { cn } from '../../lib/utils';
import type { Customer, LineItem } from '../../types/supabase';
import type { UserProfile } from '../../types/supabase';

interface CustomerFormProps {
  onSubmit: (data: Partial<Customer>) => void;
  onCancel: () => void;
  customer?: Customer;
  sources: string[];
  serviceTypes: string[];
  profile?: UserProfile;
}

const TABS = [
  { id: 'info', label: 'Customer Info' },
  { id: 'sale', label: 'Sale Details' },
];

export function CustomerForm({ onSubmit, onCancel, customer, sources, serviceTypes, profile }: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [billingSameAsProperty, setBillingSameAsProperty] = useState(customer?.billing_same_as_property ?? true);
  const [lineItems, setLineItems] = useState<LineItem[]>(customer?.line_items || [{ description: '', price: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    company_name: customer?.company_name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    source: customer?.source || '',
    property_street1: customer?.property_street1 || '',
    property_street2: customer?.property_street2 || '',
    property_city: customer?.property_city || '',
    property_state: customer?.property_state || '',
    property_zip: customer?.property_zip || '',
    property_country: customer?.property_country || 'United States',
    billing_street1: customer?.billing_street1 || '',
    billing_street2: customer?.billing_street2 || '',
    billing_city: customer?.billing_city || '',
    billing_state: customer?.billing_state || '',
    billing_zip: customer?.billing_zip || '',
    billing_country: customer?.billing_country || 'United States',
    service_type: customer?.service_type || '',
    service_frequency: customer?.service_frequency || (profile?.service_frequencies?.[0] || 'One-Time'),
    notes: customer?.notes || '',
  });

  const calculateSaleValue = () => {
    if (!formData.service_frequency) return 0;
    if (formData.service_frequency === 'Custom') return 0;
    
    const total = lineItems.reduce((sum, item) => sum + (item.price || 0), 0);
    const frequencyMap: Record<string, number> = {
      'One-Time': 1,
      'Semi-Annual': 2,
      'Tri-Annual': 3,
      'Quarterly': 4,
      'Bi-Monthly': 6,
      'Monthly': 12,
    };
    
    return total * (frequencyMap[formData.service_frequency] || 1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    const customerData: Partial<Customer> = {
      ...formData,
      billing_same_as_property: billingSameAsProperty,
      line_items: lineItems,
      sale_value: calculateSaleValue(),
      user_id: undefined, // This will be set by the backend
    };

    if (billingSameAsProperty) {
      delete customerData.billing_street1;
      delete customerData.billing_street2;
      delete customerData.billing_city;
      delete customerData.billing_state;
      delete customerData.billing_zip;
      delete customerData.billing_country;
    }

    try {
      await onSubmit(customerData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="max-h-[60vh] overflow-y-auto px-1">
        {activeTab === 'info' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full rounded-md border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full rounded-md border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className={cn(
                  "mt-1 block w-full rounded-md border-input bg-background",
                  "text-foreground shadow-sm",
                  "focus:ring-2 focus:ring-ring"
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Source
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className={cn(
                  "mt-1 block w-full rounded-md border-input bg-background",
                  "text-foreground shadow-sm",
                  "focus:ring-2 focus:ring-ring"
                )}
                required
              >
                <option value="">Select Source</option>
                {sources.map(source => (
                  <option key={source} value={source}>
                    {source.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full rounded-md border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={cn(
                    "mt-1 block w-full rounded-md border-input bg-background",
                    "text-foreground shadow-sm",
                    "focus:ring-2 focus:ring-ring"
                  )}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-card-foreground">Property Address</h3>
              <AddressFields
                prefix="property"
                values={formData}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <h3 className="text-lg font-medium text-card-foreground">Billing Address</h3>
                <label className="ml-4 inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={billingSameAsProperty}
                    onChange={(e) => setBillingSameAsProperty(e.target.checked)}
                    className={cn(
                      "rounded border-input bg-background text-primary",
                      "focus:ring-2 focus:ring-ring"
                    )}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Same as property address
                  </span>
                </label>
              </div>
              {!billingSameAsProperty && (
                <AddressFields
                  prefix="billing"
                  values={formData}
                  onChange={handleInputChange}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Service Type
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleInputChange}
                className={cn(
                  "mt-1 block w-full rounded-md border-input bg-background",
                  "text-foreground shadow-sm",
                  "focus:ring-2 focus:ring-ring"
                )}
                required
              >
                <option value="">Select Type</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type}>
                    {type.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Frequency
              </label>
              <select
                name="service_frequency"
                value={formData.service_frequency}
                onChange={handleInputChange}
                className={cn(
                  "mt-1 block w-full rounded-md border-input bg-background",
                  "text-foreground shadow-sm",
                  "focus:ring-2 focus:ring-ring"
                )}
                required
              >
                {[...(profile?.service_frequencies || []), ...(profile?.custom_service_frequencies || [])].map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Line Items
              </label>
              <LineItems items={lineItems} onChange={setLineItems} />
              {lineItems.length > 0 && (
                <div className="mt-4 text-right text-muted-foreground">
                  <p className="text-sm">
                    Sale Value: ${calculateSaleValue().toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className={cn(
                  "mt-1 block w-full rounded-md border-input bg-background",
                  "text-foreground shadow-sm",
                  "focus:ring-2 focus:ring-ring"
                )}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {customer?.id ? 'Update' : 'Create'} Customer
        </Button>
      </div>
    </form>
  );
}