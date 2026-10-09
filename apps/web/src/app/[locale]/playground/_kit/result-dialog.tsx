'use client';

import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ResultDialogProps {
  open: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}

/**
 * What the victim would have seen. Dialogs portal into <body>, outside the playground's
 * data-theme wrapper, so the content re-applies the terminal theme itself.
 */
export function ResultDialog({ open, onClose, icon: Icon, title, description, children }: ResultDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent data-theme="terminal" className="bg-card text-card-foreground">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-success" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">{children}</div>
        <DialogFooter>
          <Button onClick={onClose}>Got it</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
