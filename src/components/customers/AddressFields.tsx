import React from 'react';
import { US_STATES } from '../../lib/constants';
import { cn } from '../../lib/utils';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface AddressFieldsProps {
  prefix: string;
  disabled?: boolean;
  values: {
    [key: string]: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function AddressFields({ prefix, disabled = false, values, onChange }: AddressFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-foreground">
          Street Address
        </Label>
        <Input
          type="text"
          name={`${prefix}_street1`}
          value={values[`${prefix}_street1`]}
          onChange={onChange}
          disabled={disabled}
          className="mt-1.5"
          required
        />
      </div>
      <div>
        <Label className="text-foreground">
          <span>Street Address 2</span>
          <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          type="text"
          name={`${prefix}_street2`}
          value={values[`${prefix}_street2`]}
          onChange={onChange}
          disabled={disabled}
          className="mt-1.5"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground">
            City
          </Label>
          <Input
            type="text"
            name={`${prefix}_city`}
            value={values[`${prefix}_city`]}
            onChange={onChange}
            disabled={disabled}
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label className="text-foreground">
            State
          </Label>
          <Select
            name={`${prefix}_state`}
            value={values[`${prefix}_state`] || ''}
            onValueChange={(value) => onChange({ target: { name: `${prefix}_state`, value } } as any)}
            disabled={disabled}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              {US_STATES.map(state => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground">
            ZIP Code
          </Label>
          <Input
            type="text"
            name={`${prefix}_zip`}
            value={values[`${prefix}_zip`]}
            onChange={onChange}
            disabled={disabled}
            pattern="[0-9]{5}"
            className="mt-1.5"
            required
          />
        </div>
        <div>
          <Label className="text-foreground">
            Country
          </Label>
          <Input
            type="text"
            name={`${prefix}_country`}
            value={values[`${prefix}_country`]}
            onChange={onChange}
            disabled={disabled}
            className="mt-1.5"
            required
          />
        </div>
      </div>
    </div>
  );
}