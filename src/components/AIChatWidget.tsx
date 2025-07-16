'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, MessageSquare, Loader, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { answerFirstRoboticsQuestion } from '@/ai/flows/first-robotics-q-and-a';
import { answerSiteQuestion } from '@/ai/flows/site-q-and-a';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  key: string;
  text: string;
  sender: 'user' | 'ai';
  senderName: string;
}

type Subject = 'FTC' | 'FRC' | 'FLL' | 'CodeSage Website';

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [subject, setSubject] = useState<Subject>('FTC');
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      key: 'initial-message',
      text: "Hello! I'm CodeSage AI. Select a subject and ask me a question!",
      sender: 'ai',
      senderName: 'CodeSage AI'
    }
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }, 100);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isReplying) return;

    const userMessage: Message = {
      key: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      senderName: user?.displayName || 'You',
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsReplying(true);

    try {
      let result;
      if (subject === 'CodeSage Website') {
        result = await answerSiteQuestion({ question: currentInput });
      } else {
        result = await answerFirstRoboticsQuestion({
          question: currentInput,
          subject: subject
        });
      }

      const aiResponse: Message = {
        key: `ai-${Date.now()}`,
        text: result.answer,
        sender: 'ai',
        senderName: 'CodeSage AI'
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("AI chat error:", error);
      toast({
        title: "AI Error",
        description: "Sorry, I couldn't process that request. Please try again.",
        variant: "destructive"
      });
      const errorResponse: Message = {
        key: `ai-error-${Date.now()}`,
        text: "I'm sorry, I seem to be having some trouble right now. Please try again in a moment.",
        sender: 'ai',
        senderName: 'CodeSage AI'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsReplying(false);
    }
  };

  const getPlaceholder = () => {
    if (subject === 'CodeSage Website') {
        return 'Ask about lessons, features, etc...';
    }
    return 'Ask about your selected program...';
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-[calc(100vw-3rem)] max-w-sm"
            >
              <Card className="h-[60vh] max-h-[700px] flex flex-col bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-border/40">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-primary">
                      <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="robot" />
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold font-headline">CodeSage AI</p>
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <p className="text-xs text-muted-foreground">Online</p>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
                    <div className="space-y-6">
                      {messages.map(msg => {
                        const isUser = msg.sender === 'user';
                        return (
                          <div key={msg.key} className={cn("flex items-end gap-3", isUser && "flex-row-reverse")}>
                            {!isUser && <Avatar className="h-8 w-8"><AvatarImage data-ai-hint="robot" src="https://placehold.co/40x40.png" /><AvatarFallback>AI</AvatarFallback></Avatar>}
                            <div className={cn("rounded-2xl py-2 px-4 max-w-[80%] whitespace-pre-wrap", isUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        );
                      })}
                      {isReplying && (
                        <div key="thinking" className={cn("flex items-end gap-3")}>
                          <Avatar className="h-8 w-8"><AvatarImage data-ai-hint="robot" src="https://placehold.co/40x40.png" /><AvatarFallback>AI</AvatarFallback></Avatar>
                          <div className={cn("rounded-2xl py-2 px-4 max-w-[80%] whitespace-pre-wrap bg-muted rounded-bl-none")}>
                            <div className="flex items-center gap-2 text-sm">
                                <Loader className="h-4 w-4 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="p-2 border-t border-border/40 flex flex-col items-start gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-2">
                          {subject}
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setSubject('FTC')}>FTC</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSubject('FRC')}>FRC</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSubject('FLL')}>FLL</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSubject('CodeSage Website')}>CodeSage Website</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <form onSubmit={handleSendMessage} className="w-full relative">
                      <Input
                        placeholder={getPlaceholder()}
                        className="h-10 pr-12"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isReplying}
                      />
                      <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8" disabled={!input.trim() || isReplying}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground text-lg font-bold hover:scale-110 active:scale-100 transition-transform duration-200 ease-in-out"
        >
          {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
        </Button>
      </div>
    </>
  );
}
