import React from 'react';
import { CircleSlash, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LeadScoreProps {
  scores: {
    valueScore: number;
    engagementScore: number;
    timelineScore: number;
    qualificationScore: number;
    totalScore: number;
  } | null;
}

export function LeadScore({ scores }: LeadScoreProps) {
  if (!scores) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <CircleSlash className="w-4 h-4 mr-2" />
        <span>No scoring data available</span>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-500';
    if (score >= 5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const scoreItems = [
    {
      label: 'Value',
      score: scores.valueScore,
      icon: TrendingUp,
      description: 'Based on projected contract value'
    },
    {
      label: 'Engagement',
      score: scores.engagementScore,
      icon: Users,
      description: 'Based on interaction frequency and recency'
    },
    {
      label: 'Timeline',
      score: scores.timelineScore,
      icon: Calendar,
      description: 'Based on follow-up schedule adherence'
    },
    {
      label: 'Qualification',
      score: scores.qualificationScore,
      icon: Target,
      description: 'Based on current lead stage'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Total Score */}
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">
            {scores.totalScore}
            <span className="text-base font-normal text-muted-foreground">/10</span>
          </div>
          <div className="text-sm text-muted-foreground">Overall Score</div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 gap-4">
        {scoreItems.map(({ label, score, icon: Icon, description }) => (
          <div
            key={label}
            className="bg-muted/50 rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{label}</span>
              </div>
              <div className={cn("text-lg font-semibold", getScoreColor(score))}>
                {score}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}