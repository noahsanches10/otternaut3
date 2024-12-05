import React from 'react';
import { Video, Phone as PhoneIcon, MessageSquare, Mail, X, Plus, Pencil } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type InteractionType = 'Meeting' | 'Call' | 'Text' | 'Email';
type SentimentType = 'Positive' | 'Neutral' | 'Negative';

const INTERACTION_TYPES: InteractionType[] = ['Meeting', 'Call', 'Text', 'Email'];
const SENTIMENT_TYPES: SentimentType[] = ['Positive', 'Neutral', 'Negative'];

interface InteractionFormProps {
  interaction: {
    type: InteractionType;
    notes?: string;
    sentiment: SentimentType;
  };
  onChange: (updates: Partial<{
    type: InteractionType;
    notes?: string;
    sentiment: SentimentType;
  }>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export function InteractionForm({ 
  interaction,
  onChange,
  onSubmit,
  onCancel,
  isEditing
}: InteractionFormProps) {
  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          {isEditing ? 'Edit Interaction' : 'New Interaction'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={interaction.type}
            onValueChange={(value: InteractionType) => onChange({ type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERACTION_TYPES.map(type => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center">
                    {type === 'Meeting' && <Video className="w-4 h-4 mr-2" />}
                    {type === 'Call' && <PhoneIcon className="w-4 h-4 mr-2" />}
                    {type === 'Text' && <MessageSquare className="w-4 h-4 mr-2" />}
                    {type === 'Email' && <Mail className="w-4 h-4 mr-2" />}
                    {type}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Sentiment</Label>
          <Select
            value={interaction.sentiment}
            onValueChange={(value: SentimentType) => onChange({ sentiment: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SENTIMENT_TYPES.map(sentiment => (
                <SelectItem key={sentiment} value={sentiment}>
                  {sentiment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Textarea
          value={interaction.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Add any notes about the interaction..."
          rows={3}
        />
      </div>

      <Button onClick={onSubmit} className="w-full">
        {isEditing ? (
          <>
            <Pencil className="w-4 h-4 mr-2" />
            Update Interaction
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-2" />
            Add Interaction
          </>
        )}
      </Button>
    </div>
  );
}