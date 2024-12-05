import React from 'react';
import { Calendar } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';

interface ScheduleBuilderProps {
  value: {
    start_date?: string;
    end_date?: string;
    frequency?: string;
  };
  onChange: (schedule: ScheduleBuilderProps['value']) => void;
}

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Start Date</Label>
        <div className="relative mt-1.5">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="datetime-local"
            value={value.start_date}
            onChange={(e) => onChange({ ...value, start_date: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label>End Date (Optional)</Label>
        <div className="relative mt-1.5">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="datetime-local"
            value={value.end_date}
            onChange={(e) => onChange({ ...value, end_date: e.target.value })}
            className="pl-9"
          />
        </div>
      </div>

      <div>
        <Label>Frequency</Label>
        <Select
          value={value.frequency}
          onValueChange={(frequency) => onChange({ ...value, frequency })}
        >
          <SelectTrigger className="mt-1.5">
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="once">Send Once</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}