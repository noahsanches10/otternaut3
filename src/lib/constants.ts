export const DEFAULT_LEAD_SOURCES = [
  'Referral',
  'Website',
  'Cold-Call',
  'Trade-Show',
  'Social-Media',
  'Other'
] as const;

export const DEFAULT_LEAD_STATUSES = [
  'New',
  'Contacted',
  'Qualified',
  'Negotiation',
  'Won',
  'Lost'
] as const;

export const DEFAULT_SERVICE_TYPES = [
  'Lawn-Maintenance',
  'Tree-Service',
  'Pest-Control',
  'Landscaping',
  'Snow-Removal',
  'Irrigation',
  'Hardscaping'
] as const;

export const DEFAULT_FREQUENCIES = [
  { name: 'One-Time', multiplier: 1 },
  { name: 'Semi-Annual', multiplier: 2 },
  { name: 'Tri-Annual', multiplier: 3 },
  { name: 'Quarterly', multiplier: 4 },
  { name: 'Bi-Monthly', multiplier: 6 },
  { name: 'Monthly', multiplier: 12 },
  { name: 'Custom', multiplier: null }
] as const;

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
] as const;