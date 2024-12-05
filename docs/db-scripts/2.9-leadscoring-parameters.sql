-- Add scoring columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS value_score INTEGER,
ADD COLUMN IF NOT EXISTS engagement_score INTEGER,
ADD COLUMN IF NOT EXISTS timeline_score INTEGER,
ADD COLUMN IF NOT EXISTS qualification_score INTEGER,
ADD COLUMN IF NOT EXISTS total_score INTEGER;

-- Add scoring parameters to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS scoring_params JSONB DEFAULT '{
  "value": {
    "threshold_low": 1000,
    "threshold_medium": 5000,
    "threshold_high": 10000
  },
  "engagement": {
    "min_interactions": 1,
    "optimal_interactions": 3,
    "recency_weight": 7
  },
  "timeline": {
    "overdue_penalty": 3,
    "upcoming_bonus": 2,
    "optimal_days_ahead": 7
  },
  "qualification": {
    "stage_weights": {
      "new": 2,
      "contacted": 4,
      "qualified": 6,
      "negotiation": 8,
      "won": 10,
      "lost": 0
    }
  }
}'::jsonb;