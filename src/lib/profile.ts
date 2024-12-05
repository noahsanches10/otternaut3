import { supabase } from './supabase';
import type { UserProfile } from '../types/supabase';

export async function updateProfileDefaults(
  profileId: string,
  updates: Partial<Pick<UserProfile, 
    'lead_sources' | 
    'lead_stages' | 
    'service_types' | 
    'service_frequencies'
  >>
) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', profileId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating profile defaults:', error);
    return { success: false, error };
  }
}

export async function updateCustomFields(
  profileId: string,
  field: 'custom_lead_sources' | 'custom_lead_stages' | 'custom_service_types' | 'custom_service_frequencies',
  values: string[]
) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ [field]: values })
      .eq('id', profileId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error updating custom fields:', error);
    return { success: false, error };
  }
}

export async function restoreDefaults(profileId: string, type: 'sources' | 'stages' | 'services' | 'frequencies') {
  const defaultValues = {
    sources: ['Referral', 'Website', 'Cold-Call', 'Trade-Show', 'Social-Media', 'Other'],
    stages: ['New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost'],
    services: ['Lawn-Maintenance', 'Tree-Service', 'Pest-Control', 'Landscaping', 'Snow-Removal', 'Irrigation', 'Hardscaping'],
    frequencies: ['One-Time', 'Semi-Annual', 'Tri-Annual', 'Quarterly', 'Bi-Monthly', 'Monthly', 'Custom']
  };

  const fieldMap = {
    sources: 'lead_sources',
    stages: 'lead_stages',
    services: 'service_types',
    frequencies: 'service_frequencies'
  } as const;

  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ [fieldMap[type]]: defaultValues[type] })
      .eq('id', profileId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error restoring defaults:', error);
    return { success: false, error };
  }
}