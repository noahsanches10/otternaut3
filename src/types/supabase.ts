export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at'>;
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>;
      };
      customers: {
        Row: Customer;
        Insert: Omit<Customer, 'id' | 'created_at'>;
        Update: Partial<Omit<Customer, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Lead {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  priority: LeadPriority;
  address: string;
  projected_value: number;
  follow_up_date: string;
  lead_source: string;
  service_type?: string;
  status: LeadStatus;
  notes: string;
  archived: boolean;
  archived_at?: string;
}

export interface LeadInteraction {
  id: string;
  created_at: string;
  user_id: string;
  lead_id: string;
  type: 'Meeting' | 'Call' | 'Text' | 'Email';
  notes?: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  metadata: Record<string, any>;
}

export interface CustomerInteraction {
  id: string;
  created_at: string;
  user_id: string;
  customer_id: string;
  type: 'Meeting' | 'Call' | 'Text' | 'Email';
  notes?: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  metadata: Record<string, any>;
}

export type LeadPriority = 'low' | 'medium' | 'high';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface Customer {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  company_name: string;
  email: string;
  phone: string;
  source: string;
  property_street1: string;
  property_street2?: string;
  property_city: string;
  property_state: string;
  property_zip: string;
  property_country: string;
  billing_same_as_property: boolean;
  billing_street1?: string;
  billing_street2?: string;
  billing_city?: string;
  billing_state?: string;
  billing_zip?: string;
  billing_country?: string;
  service_type: string;
  service_frequency: string;
  line_items: LineItem[];
  notes?: string;
  sale_value: number;
}

export interface LineItem {
  description: string;
  price: number;
}

export interface Campaign {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: 'email' | 'sms' | 'bulk';
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'paused';
  audience_filter: {
    type: 'leads' | 'customers';
    filters: Record<string, any>;
  };
  content: {
    subject?: string;
    body?: string;
    messages?: Array<{
      type: 'email' | 'sms';
      subject?: string;
      body: string;
    }>;
    template_id?: string;
  };
  schedule: {
    start_date?: string;
    end_date?: string;
    frequency?: string;
  };
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    responses: number;
  };
}

export interface CampaignTemplate {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: 'email' | 'sms';
  content: {
    subject?: string;
    body: string;
  };
  variables: string[];
  category: 'follow_up' | 'promotion' | 'announcement' | 'reminder' | 'custom';
}

export interface Message {
  id: string;
  created_at: string;
  user_id: string;
  contact_id: string;
  contact_type: 'lead' | 'customer';
  direction: 'inbound' | 'outbound';
  channel: 'email' | 'sms';
  content: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  metadata: Record<string, any>;
  thread_id?: string;
  read: boolean;
}

export interface AudienceFilter {
  type: 'leads' | 'customers';
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
  matchType: 'all' | 'any';
}

export interface UserProfile {
  id: string;
  created_at: string;
  company_name: string;
  lead_sources: string[];
  lead_statuses: string[];
  custom_lead_sources: string[];
  custom_lead_statuses: string[];
  service_types: string[];
  custom_service_types: string[];
  service_frequencies: string[];
  custom_service_frequencies: string[];
  scoring_params: {
    value: {
      threshold_low: number;
      threshold_medium: number;
      threshold_high: number;
    };
    engagement: {
      min_interactions: number;
      optimal_interactions: number;
      recency_weight: number;
    };
    timeline: {
      overdue_penalty: number;
      upcoming_bonus: number;
      optimal_days_ahead: number;
    };
    qualification: {
      stage_weights: Record<string, number>;
    };
  };
}