import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Calendar, DollarSign, MoreVertical, Pencil, Archive, Gauge } from 'lucide-react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';
import { formatValue } from '../../lib/utils';
import type { Lead } from '../../types/supabase';

interface KanbanViewProps {
  leads: Lead[];
  stages: string[];
  onViewLead: (lead: Lead) => void;
  onDragEnd: (result: any) => void;
  onEditLead: (lead: Lead) => void;
  onArchiveLead: (id: string) => void;
}

export function KanbanView({ leads, stages, onViewLead, onDragEnd, onEditLead, onArchiveLead }: KanbanViewProps) {
  const getLeadsByStage = (stage: string) => {
    return leads.filter(lead => lead.status === stage);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-6 gap-4 h-[calc(100vh-8rem)]">
        {stages.map(stage => (
          <Droppable key={stage} droppableId={stage}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex flex-col h-full rounded-lg border border-border",
                  "bg-muted/50",
                  snapshot.isDraggingOver && "bg-accent"
                )}
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h3 className="font-medium text-sm">
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {getLeadsByStage(stage).length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {getLeadsByStage(stage).map((lead, index) => (
                    <Draggable
                      key={lead.id}
                      draggableId={lead.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "p-2 bg-card rounded-lg border border-border cursor-pointer",
                            "hover:border-ring transition-colors",
                            "relative",
                            snapshot.isDragging && "shadow-lg"
                          )}
                          onClick={() => onViewLead(lead)}
                        >
                          {/* Row 1: Name and Menu */}
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-xs">
                              {lead.name.split(' ').length > 1 
                                ? `${lead.name.split(' ')[0]} ${lead.name.split(' ')[1].charAt(0)}.`
                                : lead.name.length > 20 
                                  ? `${lead.name.substring(0, 20)}...` 
                                  : lead.name}
                            </h4>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEditLead(lead)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onArchiveLead(lead.id)}>
                                  <Archive className="w-4 h-4 mr-2" />
                                  Archive
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Row 2: Priority and Value */}
                          <div className="flex items-center gap-2 mb-2">
                            <span className={cn(
                              "px-1.5 py-0.5 text-[10px] font-medium rounded-full",
                              lead.priority === 'high' ? 'bg-destructive text-white' :
                              lead.priority === 'medium' ? 'bg-yellow-500 text-white' :
                              'bg-emerald-500 text-white'
                            )}>
                              {lead.priority === 'medium' ? 'Med' : lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                            </span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <DollarSign className="w-3 h-3 inline" />
                              <span>{formatValue(lead.projected_value)}</span>
                            </div>
                            <div
                              className="ml-auto"
                              title={`Lead Score: ${lead.total_score || '-'}`}
                            >
                              <Gauge className={cn(
                                "w-4 h-4",
                                lead.total_score >= 8 ? "text-emerald-500" :
                                lead.total_score >= 5 ? "text-yellow-500" :
                                "text-red-500"
                              )} />
                            </div>
                          </div>

                          {/* Row 3: Follow-up Date (if exists) */}
                          {lead.follow_up_date && (
                            <div className="flex items-center text-[10px] text-muted-foreground">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>
                                {new Date(lead.follow_up_date).toLocaleDateString('en-US', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  year: '2-digit'
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}