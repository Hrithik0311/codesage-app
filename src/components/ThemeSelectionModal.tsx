
"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import Modal from '@/components/Modal';
import { themes } from '@/data/themes';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

const ThemeSelectionModal = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select a Theme"
      className="max-w-4xl"
    >
      <ScrollArea className="max-h-[60vh] h-[60vh] pr-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {themes.map((item) => (
            <div key={item.value} className="flex flex-col items-center gap-2">
              <Button
                variant="outline"
                className={cn(
                  'w-full h-20 border-2 flex items-center justify-center relative',
                  theme === item.value && 'border-primary ring-2 ring-primary'
                )}
                onClick={() => setTheme(item.value)}
                style={{
                  backgroundColor: `hsl(var(--${item.value}-background, var(--background)))`,
                  color: `hsl(var(--${item.value}-foreground, var(--foreground)))`,
                  borderColor: `hsl(var(--${item.value}-border, var(--border)))`,
                } as React.CSSProperties}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: `hsl(var(--${item.value}-primary, var(--primary)))`,
                    color: `hsl(var(--${item.value}-primary-foreground, var(--primary-foreground)))`,
                  }}
                >
                   {theme === item.value && <Check className="h-6 w-6" />}
                </div>
              </Button>
              <p className="text-sm font-medium text-center">{item.name}</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Modal>
  );
};

export default ThemeSelectionModal;
