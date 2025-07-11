
"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModalButton {
  text: string;
  action: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  isPrimary?: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  buttons?: ModalButton[];
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, buttons = [], className }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("bg-background/80 backdrop-blur-xl border-border/50 text-foreground rounded-2xl shadow-2xl w-[90%] md:max-w-2xl max-h-[90vh] flex flex-col", className)}>
        <DialogHeader className="p-6 border-b border-border/30">
          <DialogTitle className="font-headline text-2xl text-foreground">{title}</DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 rounded-full w-8 h-8 text-foreground/60 hover:text-foreground hover:bg-foreground/10" onClick={onClose}>
              <X size={20} />
              <span className="sr-only">Close</span>
            </Button>
          </DialogClose>
        </DialogHeader>
        <div className="p-6 overflow-y-auto flex-grow">
          {children}
        </div>
        {buttons.length > 0 && (
          <DialogFooter className="p-6 border-t border-border/30 gap-3">
            {buttons.map((btn, index) => (
              <Button
                key={index}
                variant={btn.isPrimary ? 'default' : (btn.variant || 'outline')}
                onClick={btn.action}
                className={`${btn.className || ''} ${btn.isPrimary ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90' : 'bg-foreground/10 hover:bg-foreground/20 border-border text-foreground'}`}
              >
                {btn.text}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
