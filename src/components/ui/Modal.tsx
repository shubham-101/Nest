import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export const Modal = ({ open, onOpenChange, title, children, className }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <Dialog.Root open={open} onOpenChange={onOpenChange}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
      <Dialog.Content className={cn('fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-lg max-h-[90vh] overflow-auto bg-surface border border-border rounded-2xl shadow-xl p-6', className)}>
        {title && <Dialog.Title className="text-lg font-semibold mb-4">{title}</Dialog.Title>}
        {children}
        <Dialog.Close className="absolute top-4 right-4 text-text-muted hover:text-text">
          <X size={18} />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
);