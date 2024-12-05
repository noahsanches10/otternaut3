import { supabase } from './supabase';
import type { Lead, LeadInteraction, UserProfile } from '../types/supabase';

interface ScoringParams {
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
}

export async function calculateLeadScore(
  lead: Lead,
  interactions: LeadInteraction[],
  profile: UserProfile
): Promise<{
  valueScore: number;
  engagementScore: number;
  timelineScore: number;
  qualificationScore: number;
  totalScore: number;
}> {
  const params = profile.scoring_params as ScoringParams;

  // Calculate Value Score (0-10)
  const valueScore = calculateValueScore(lead.projected_value, params.value);

  // Calculate Engagement Score (0-10)
  const engagementScore = calculateEngagementScore(interactions, params.engagement);

  // Calculate Timeline Score (0-10)
  const timelineScore = calculateTimelineScore(lead.follow_up_date, params.timeline);

  // Calculate Qualification Score (0-10)
  const qualificationScore = calculateQualificationScore(lead.status, params.qualification);

  // Calculate Total Score (average of all scores)
  const totalScore = Math.round(
    (valueScore + engagementScore + timelineScore + qualificationScore) / 4
  );

  // Update scores in database
  await updateLeadScores(lead.id, {
    valueScore,
    engagementScore,
    timelineScore,
    qualificationScore,
    totalScore
  });

  return {
    valueScore,
    engagementScore,
    timelineScore,
    qualificationScore,
    totalScore
  };
}

function calculateValueScore(value: number, params: ScoringParams['value']): number {
  if (value >= params.threshold_high) return 10;
  if (value >= params.threshold_medium) return 7;
  if (value >= params.threshold_low) return 4;
  return 2;
}

function calculateEngagementScore(
  interactions: LeadInteraction[],
  params: ScoringParams['engagement']
): number {
  if (interactions.length === 0) return 0;

  // Sort interactions by date
  const sortedInteractions = [...interactions].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Calculate recency score
  const mostRecent = new Date(sortedInteractions[0].created_at);
  const daysSinceLastInteraction = Math.floor(
    (Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24)
  );
  const recencyScore = Math.max(
    0,
    10 - Math.floor(daysSinceLastInteraction / params.recency_weight)
  );

  // Calculate frequency score
  const frequencyScore = Math.min(
    10,
    Math.round(
      (interactions.length / params.optimal_interactions) * 10
    )
  );

  // Return weighted average
  return Math.round((recencyScore + frequencyScore) / 2);
}

function calculateTimelineScore(
  followUpDate: string | null,
  params: ScoringParams['timeline']
): number {
  if (!followUpDate) return 5; // Neutral score if no follow-up date

  const today = new Date();
  const followUp = new Date(followUpDate);
  const daysUntilFollowUp = Math.floor(
    (followUp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilFollowUp < 0) {
    // Overdue follow-ups
    return Math.max(0, 10 - Math.abs(daysUntilFollowUp / params.overdue_penalty));
  }

  if (daysUntilFollowUp <= params.optimal_days_ahead) {
    // Upcoming follow-ups within optimal range
    return 10;
  }

  // Future follow-ups
  return Math.max(
    5,
    10 - Math.floor((daysUntilFollowUp - params.optimal_days_ahead) / params.upcoming_bonus)
  );
}

function calculateQualificationScore(
  status: string,
  params: ScoringParams['qualification']
): number {
  // Convert both the status and weight keys to lowercase for comparison
  const normalizedStatus = status.toLowerCase().trim();
  const weights = Object.entries(params.stage_weights).reduce((acc, [key, value]) => {
    acc[key.toLowerCase().trim()] = value;
    return acc;
  }, {} as Record<string, number>);
  
  return weights[normalizedStatus] || 0;
}

async function updateLeadScores(
  leadId: string,
  scores: {
    valueScore: number;
    engagementScore: number;
    timelineScore: number;
    qualificationScore: number;
    totalScore: number;
  }
): Promise<void> {
  const timestamp = new Date().toISOString();

  try {
    const { error } = await supabase
      .from('leads')
      .update({ 
        value_score: scores.valueScore,
        engagement_score: scores.engagementScore,
        timeline_score: scores.timelineScore,
        qualification_score: scores.qualificationScore,
        total_score: scores.totalScore
      })
      .eq('id', leadId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating lead scores:', error);
    throw error;
  }
}