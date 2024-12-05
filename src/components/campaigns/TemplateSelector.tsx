import React from 'react';
import { Layout, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';
import type { CampaignTemplate } from '../../types/supabase';

interface TemplateSelectorProps {
  type: 'email' | 'sms';
  onSelect: (template: CampaignTemplate | null) => void;
}

const MOCK_TEMPLATES: CampaignTemplate[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    user_id: '1',
    name: 'Follow-up Template',
    type: 'email',
    content: {
      subject: 'Following up on our conversation',
      body: 'Hi {first_name},\n\nI wanted to follow up on our previous conversation about {service_type}...'
    },
    variables: ['first_name', 'service_type'],
    category: 'follow_up'
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    user_id: '1',
    name: 'Service Reminder',
    type: 'sms',
    content: {
      body: 'Hi {first_name}, this is a reminder about your upcoming {service_type} service.'
    },
    variables: ['first_name', 'service_type'],
    category: 'reminder'
  }
];

export function TemplateSelector({ type, onSelect }: TemplateSelectorProps) {
  const templates = MOCK_TEMPLATES.filter(t => t.type === type);

  return (
    <div className="space-y-4">
      <Select defaultValue="blank" onValueChange={(value) => {
        if (value === 'blank') {
          onSelect(null);
        } else {
          const template = templates.find(t => t.id === value);
          onSelect(template || null);
        }
      }}>
        <SelectTrigger>
          <SelectValue placeholder="Select a template" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="blank">Blank Template</SelectItem>
          {templates.map(template => (
            <SelectItem key={template.id} value={template.id}>
              {template.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={cn(
              "flex flex-col items-start p-4 rounded-lg border border-border",
              "hover:bg-accent hover:border-accent transition-all duration-200",
              "text-left"
            )}
          >
            <div className="flex items-center space-x-2 mb-2">
              {template.type === 'email' ? (
                <Layout className="w-4 h-4 text-muted-foreground" />
              ) : (
                <FileText className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">{template.name}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.content.body}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}