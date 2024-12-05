import React from 'react';
import { X, Check } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { AudienceBuilder } from './AudienceBuilder';
import { ScheduleBuilder } from './ScheduleBuilder';
import { cn } from '../../lib/utils';
import type { Campaign, AudienceFilter } from '../../types/supabase';

interface CampaignBuilderProps {
  type: 'email' | 'sms' | 'bulk';
  onSave: (campaign: Partial<Campaign>) => void;
  onCancel: () => void;
}

export function CampaignBuilder({ type, onSave, onCancel }: CampaignBuilderProps) {
  const [activeTab, setActiveTab] = React.useState('content');
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Array<{
    type: 'email' | 'sms';
    content: string;
    subject?: string;
  }>>([]);

  const templates = {
    blank: { name: 'Blank Template', content: '' },
    followUp: { 
      name: 'Follow-up Template',
      content: 'Hi {first_name},\n\nI wanted to follow up on our previous conversation about {service_type}...'
    },
    reminder: {
      name: 'Service Reminder',
      content: 'Hi {first_name}, this is a reminder about your upcoming {service_type} service.'
    },
    promotion: {
      name: 'Promotion Template',
      content: 'Hi {first_name},\n\nWe\'re excited to offer you a special discount on our {service_type} service!'
    }
  };
  const [audienceFilter, setAudienceFilter] = React.useState<AudienceFilter>({
    type: 'leads',
    conditions: [],
    matchType: 'all'
  });
  const [schedule, setSchedule] = React.useState({
    start_date: '',
    end_date: '',
    frequency: 'once'
  });

  const addMessage = (messageType: 'email' | 'sms') => {
    setMessages([...messages, { type: messageType, content: '', subject: messageType === 'email' ? '' : undefined }]);
  };

  const updateMessage = (index: number, updates: Partial<typeof messages[0]>) => {
    setMessages(messages.map((msg, i) => i === index ? { ...msg, ...updates } : msg));
  };

  const removeMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const variables = [
    { name: 'first_name', description: 'Recipient\'s first name' },
    { name: 'last_name', description: 'Recipient\'s last name' },
    { name: 'company_name', description: 'Company name' },
    { name: 'service_type', description: 'Type of service' },
    { name: 'service_frequency', description: 'Service frequency' }
  ];

  const insertVariable = (name: string) => {
    if (editor) {
      editor.commands.insertContent(`{${name}}`);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start typing your message...',
      }),
    ],
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'min-h-[200px] w-full rounded-md border border-input p-4',
          'bg-background focus:outline-none'
        ),
      },
    },
  });

  React.useEffect(() => {
    if (editor && type !== 'bulk') {
      editor.commands.setContent('');
    }
  }, [editor]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const content = type === 'bulk' ? {
      messages: messages.map(msg => ({
        type: msg.type,
        subject: msg.subject,
        body: msg.content
      }))
    } : {
      subject: type === 'email' ? formData.get('subject') as string : undefined,
      body: editor?.getHTML() || '',
    };

    const campaignData: Partial<Campaign> = {
      name: formData.get('name') as string,
      type,
      status: 'draft',
      audience_filter: audienceFilter,
      schedule: {
        start_date: schedule.start_date || undefined,
        end_date: schedule.end_date || undefined,
        frequency: schedule.frequency
      },
      content,
      stats: {
        sent: 0,
        opened: 0,
        clicked: 0,
        responses: 0,
      },
    };

    onSave(campaignData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <div className="space-y-4">
          <Label>Campaign Name</Label>
          <Input
            name="name"
            className="mt-1.5"
            placeholder="Enter campaign name"
            required
          />
        </div>

        <div className="border-t border-border my-6" />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <div className="space-y-4">
              {type !== 'bulk' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {Object.entries(templates).map(([id, template]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedTemplate(id);
                        if (editor && id !== 'blank') {
                          editor.commands.setContent(template.content);
                        }
                      }}
                      className={cn(
                        "relative p-4 text-left rounded-lg border-2",
                        "transition-colors duration-200",
                        selectedTemplate === id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{template.name}</span>
                        {selectedTemplate === id && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div>
                {type === 'bulk' ? (
                  <div className="space-y-4">
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addMessage('email')}
                      >
                        Add Email
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addMessage('sms')}
                      >
                        Add SMS
                      </Button>
                    </div>
                    {messages.map((message, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium">
                            {message.type === 'email' ? 'Email Message' : 'SMS Message'}
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMessage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        {message.type === 'email' && (
                          <div className="mb-4">
                            <Label>Subject Line</Label>
                            <Input
                              value={message.subject}
                              onChange={(e) => updateMessage(index, { subject: e.target.value })}
                              className="mt-1.5"
                              placeholder="Enter subject line"
                            />
                          </div>
                        )}
                        <Label>Message Content</Label>
                        <textarea
                          value={message.content}
                          onChange={(e) => updateMessage(index, { content: e.target.value })}
                          className={cn(
                            "mt-1.5 w-full rounded-md border border-input p-3",
                            "bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                          )}
                          rows={4}
                          placeholder="Enter message content..."
                        />
                        <div className="mt-4">
                          <Label>Available Variables</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {variables.map(variable => (
                              <Button
                                key={variable.name}
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const content = message.content;
                                  const cursorPosition = content.length;
                                  const newContent = 
                                    content.slice(0, cursorPosition) +
                                    `{${variable.name}}` +
                                    content.slice(cursorPosition);
                                  updateMessage(index, { content: newContent });
                                }}
                              >
                                {`{${variable.name}}`}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {type === 'email' && (
                      <div className="mb-4">
                        <Label>Subject Line</Label>
                        <Input
                          name="subject"
                          className="mt-1.5"
                          placeholder="Enter subject line"
                          required
                        />
                      </div>
                    )}
                    <Label>Message Content</Label>
                    <div className="mt-1.5">
                      <EditorContent editor={editor} />
                      <div className="mt-4">
                        <Label>Available Variables</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {variables.map(variable => (
                            <Button
                              key={variable.name}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => insertVariable(variable.name)}
                            >
                              {`{${variable.name}}`}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="audience" className="mt-4">
            <AudienceBuilder
              value={audienceFilter}
              onChange={setAudienceFilter}
            />
          </TabsContent>

          <TabsContent value="schedule" className="mt-4">
            <ScheduleBuilder
              value={schedule}
              onChange={setSchedule}
            />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save as Draft
        </Button>
      </div>
    </form>
  );
}