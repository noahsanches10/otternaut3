import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { cn } from '../../lib/utils';
import { Archive } from 'lucide-react';

interface PostConversionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onArchive: () => void;
  onUpdateStage: (stage: string) => void;
  stages: string[];
}

export function PostConversionDialog({
  isOpen,
  onClose,
  onArchive,
  onUpdateStage,
  stages,
}: PostConversionDialogProps) {
  const defaultStage = stages.find(stage => stage.toLowerCase() === 'won') || stages[0];
  const [selectedStage, setSelectedStage] = React.useState(defaultStage);

  const handleArchive = () => {
    onArchive();
    onClose();
  };

  const handleUpdateStage = () => {
    onUpdateStage(selectedStage);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "!fixed !right-0 !left-auto !translate-x-0",
        "!h-screen !max-h-screen !rounded-none",
        "w-full sm:w-[440px] overflow-hidden"
      )}>
        <DialogHeader>
          <DialogTitle>Lead Successfully Converted</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col h-full max-h-screen">
          <div className="flex-1 overflow-y-auto py-4">
          <p className="text-sm text-muted-foreground mb-6">
            Would you like to archive this lead or update its stage?
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Update Lead Stage
              </label>
              <Select
                value={selectedStage}
                onValueChange={setSelectedStage}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handleArchive}
                className="w-[48%]"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive Lead
              </Button>
              <Button
                onClick={handleUpdateStage}
                className="w-[48%]"
              >
                Update Stage
              </Button>
            </div>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}