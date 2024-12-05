import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';
import type { AudienceFilter } from '../../types/supabase';

interface AudienceBuilderProps {
  value: AudienceFilter;
  onChange: (filter: AudienceFilter) => void;
}

const LEAD_FIELDS = [
  { id: 'status', label: 'Status' },
  { id: 'priority', label: 'Priority' },
  { id: 'lead_source', label: 'Source' },
  { id: 'projected_value', label: 'Projected Value' },
];

const CUSTOMER_FIELDS = [
  { id: 'service_type', label: 'Service Type' },
  { id: 'service_frequency', label: 'Service Frequency' },
  { id: 'sale_value', label: 'Sale Value' },
  { id: 'source', label: 'Source' },
];

export function AudienceBuilder({ value, onChange }: AudienceBuilderProps) {
  const fields = value.type === 'leads' ? LEAD_FIELDS : CUSTOMER_FIELDS;

  const addCondition = () => {
    onChange({
      ...value,
      conditions: [
        ...value.conditions,
        { field: fields[0].id, operator: 'equals', value: '' }
      ]
    });
  };

  const removeCondition = (index: number) => {
    onChange({
      ...value,
      conditions: value.conditions.filter((_, i) => i !== index)
    });
  };

  const updateCondition = (index: number, updates: Partial<AudienceFilter['conditions'][0]>) => {
    onChange({
      ...value,
      conditions: value.conditions.map((condition, i) => 
        i === index ? { ...condition, ...updates } : condition
      )
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Select
          value={value.type}
          onValueChange={(type: 'leads' | 'customers') => onChange({ ...value, type })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="leads">All Leads</SelectItem>
            <SelectItem value="customers">All Customers</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={value.matchType}
          onValueChange={(matchType: 'all' | 'any') => onChange({ ...value, matchType })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Match All Conditions</SelectItem>
            <SelectItem value="any">Match Any Condition</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {value.conditions.map((condition, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={condition.field}
              onValueChange={(field) => updateCondition(index, { field })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fields.map(field => (
                  <SelectItem key={field.id} value={field.id}>
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={condition.operator}
              onValueChange={(operator: AudienceFilter['conditions'][0]['operator']) => 
                updateCondition(index, { operator })
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Does not equal</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={condition.value}
              onChange={(e) => updateCondition(index, { value: e.target.value })}
              className="flex-1"
              placeholder="Value"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeCondition(index)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addCondition}
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Condition
      </Button>
    </div>
  );
}