import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { cn } from '../../lib/utils';
import type { LineItem } from '../../types/supabase';

interface LineItemsProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export function LineItems({ items, onChange }: LineItemsProps) {
  const handleAdd = () => {
    onChange([...items, { description: '', price: 0 }]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof LineItem, value: string) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === 'price' ? parseFloat(value) || 0 : value,
    };
    onChange(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div key={index} className="flex gap-4 items-start bg-muted/50 p-4 rounded-lg">
          <div className="flex-1">
            <Label className="text-foreground">
              Description
            </Label>
            <Input
              type="text"
              value={item.description}
              onChange={(e) => handleChange(index, 'description', e.target.value)}
              className="mt-1.5"
              required
            />
          </div>
          <div className="w-32">
            <Label className="text-foreground">
              Price
            </Label>
            <Input
              type="number"
              value={item.price}
              onChange={(e) => handleChange(index, 'price', e.target.value)}
              min="0"
              step="0.01"
              className="mt-1.5"
              required
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="mt-7"
            onClick={() => handleRemove(index)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="sr-only">Remove item</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={handleAdd}
        className="w-full mt-2"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Line Item
      </Button>
    </div>
  );
}