import React from 'react';
import { Mail, Phone, Calendar, DollarSign, Tag, Pencil, Archive, Trash2, Undo, Calculator } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { formatValue } from '../../lib/utils';
import type { Lead } from '../../types/supabase';

interface ListViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onViewLead?: (lead: Lead) => void;
  onArchiveLead?: (id: string) => void;
  onRestoreLead?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  isArchiveView?: boolean;
}

export function ListView({
  leads,
  onEditLead,
  onViewLead,
  onArchiveLead,
  onRestoreLead,
  onPermanentDelete,
  isArchiveView
}: ListViewProps) {
  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr className="text-[11px]">
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
              Name
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[140px]">
              Email
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[100px]">
              Phone
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[60px]">
              Score
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[80px]">
              Priority
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[80px]">
              Stage
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[60px]">
              PV
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[70px]">
              Follow Up
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider w-[70px]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {leads.map((lead) => (
            <tr
              key={lead.id}
              onClick={() => !isArchiveView && onViewLead?.(lead)}
              className={cn(
                "cursor-pointer transition-colors",
                !isArchiveView && "hover:bg-muted/50"
              )}
            >
              <td className="px-3 py-2 cursor-pointer" onClick={() => !isArchiveView && onViewLead?.(lead)}>
                <div className="text-xs font-medium text-card-foreground">
                  {lead.name}
                </div>
              </td>
              <td className="px-3 py-2 cursor-pointer" onClick={() => !isArchiveView && onViewLead?.(lead)}>
                <span className="text-[11px] text-muted-foreground">{lead.email || '-'}</span>
              </td>
              <td className="px-3 py-2 cursor-pointer" onClick={() => !isArchiveView && onViewLead?.(lead)}>
                <span className="text-[11px] text-muted-foreground">{lead.phone || '-'}</span>
              </td>
              <td className="px-3 py-2 cursor-pointer" onClick={() => !isArchiveView && onViewLead?.(lead)}>
                <span className={cn(
                  "text-[11px] font-bold",
                  lead.total_score >= 8 ? "text-emerald-500" :
                  lead.total_score >= 5 ? "text-yellow-500" :
                  "text-red-500"
                )}>
                  {lead.total_score || '-'}
                </span>
              </td>
              <td className="px-3 py-2 cursor-pointer" onClick={() => !isArchiveView && onViewLead?.(lead)}>
                <span className={cn(
                  "px-2 inline-flex text-[11px] leading-4 font-semibold rounded-full",
                  lead.priority === 'high' ? 'bg-destructive text-white' :
                  lead.priority === 'medium' ? 'bg-yellow-500 text-white' :
                  'bg-emerald-500 text-white'
                )}>
                  {lead.priority === 'medium' ? 'Med' : lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className="px-2 inline-flex text-[11px] leading-4 font-semibold rounded-full bg-primary/10 text-primary">
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="text-[11px] text-card-foreground flex items-center">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  {formatValue(lead.projected_value)}
                </div>
              </td>
              <td className="px-3 py-2">
                <span className="text-[11px] text-muted-foreground">
                  {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                    month: '2-digit',
                    day: '2-digit',
                    year: '2-digit'
                  }) : '-'}
                </span>
              </td>
              <td className="px-3 py-2">
                {isArchiveView ? (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestoreLead?.(lead.id);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Undo className="w-4 h-4" />
                      <span className="sr-only">Restore</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPermanentDelete?.(lead.id);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="sr-only">Delete Permanently</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLead(lead);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveLead?.(lead.id);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Archive className="w-4 h-4" />
                      <span className="sr-only">Archive</span>
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}