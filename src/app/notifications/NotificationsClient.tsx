
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageSquare, Bell, Users, Search, Bot } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';

const directMessages = [
    { id: '1', name: 'Alex Johnson', avatar: 'https://placehold.co/40x40.png', hint: 'person', online: true },
    { id: '2', name: 'Maria Garcia', avatar: 'https://placehold.co/40x40.png', hint: 'person', online: false },
];

const updates = [
    { id: '3', name: 'CodeSage AI', avatar: 'https://placehold.co/40x40.png', hint: 'robot', notifications: 2 },
    { id: '4', name: 'Team Announcements', avatar: 'https://placehold.co/40x40.png', hint: 'megaphone', notifications: 1 },
];

const messages = {
    '1': [
        { from: 'Alex Johnson', text: "Hey! Did you see the latest commit? I pushed the changes for the new autonomous path.", time: "10:32 AM" },
        { from: 'You', text: "Just saw it, looks great. I'll pull it now and start testing on the robot.", time: "10:34 AM" },
    ],
    '3': [
        { from: 'CodeSage AI', text: "Your recent analysis on `Drivetrain.java` is complete. 2 performance suggestions and 1 potential bug were found.", time: "Yesterday" },
    ],
     '4': [
        { from: 'Team Announcements', text: "Meeting tomorrow at 4 PM in the lab to discuss strategy for the upcoming scrimmage. Be there!", time: "2 days ago" },
    ]
};

export default function NotificationsClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeChat, setActiveChat] = useState(directMessages[0]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="loading-spinner"></div>
        </div>
    );
  }

  const renderMessages = () => {
    const chatMessages = messages[activeChat.id] || [];
    if (chatMessages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <MessageSquare size={48} className="mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No messages yet</h3>
                <p>Start the conversation!</p>
            </div>
        )
    }

    return chatMessages.map((msg, index) => (
         <div key={index} className={`flex items-start gap-4 ${msg.from === 'You' ? 'flex-row-reverse' : ''}`}>
            {msg.from !== 'You' && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={activeChat.avatar} data-ai-hint={activeChat.hint} />
                    <AvatarFallback>{activeChat.name.substring(0, 1)}</AvatarFallback>
                </Avatar>
            )}
            <div className={`flex flex-col ${msg.from === 'You' ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-2xl p-3 max-w-md ${msg.from === 'You' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">{msg.time}</p>
            </div>
        </div>
    ));
  }

  return (
    <SidebarProvider defaultOpen>
        <div className="flex h-screen w-full bg-background text-foreground">
             <Sidebar collapsible="icon" className="border-r border-border/50">
                <SidebarHeader>
                     <div className="flex items-center justify-between">
                         <h2 className="font-headline text-2xl font-bold">Chats</h2>
                         <ThemeToggleButton />
                     </div>
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search..." className="pl-9 bg-muted/50 border-border/60" />
                     </div>
                </SidebarHeader>
                <SidebarContent className="p-2">
                    <SidebarMenu>
                        <SidebarGroup>
                            <SidebarGroupLabel className="flex items-center gap-2"><Users size={16}/> Direct Messages</SidebarGroupLabel>
                            {directMessages.map((dm) => (
                                <SidebarMenuItem key={dm.id}>
                                    <SidebarMenuButton 
                                        onClick={() => setActiveChat(dm)} 
                                        isActive={activeChat.id === dm.id}
                                        className="h-14 justify-start"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={dm.avatar} data-ai-hint={dm.hint} />
                                            <AvatarFallback>{dm.name.substring(0, 1)}</AvatarFallback>
                                            {dm.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />}
                                        </Avatar>
                                        <span className="font-semibold">{dm.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarGroup>

                        <SidebarGroup>
                            <SidebarGroupLabel className="flex items-center gap-2"><Bell size={16}/> Updates</SidebarGroupLabel>
                            {updates.map((update) => (
                                <SidebarMenuItem key={update.id}>
                                    <SidebarMenuButton onClick={() => setActiveChat(update)} isActive={activeChat.id === update.id} className="h-14 justify-start">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={update.avatar} data-ai-hint={update.hint} />
                                             <AvatarFallback>{update.name.substring(0, 1)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col items-start w-full">
                                            <span className="font-semibold">{update.name}</span>
                                        </div>
                                        {update.notifications > 0 && <Badge className="bg-primary text-primary-foreground">{update.notifications}</Badge>}
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarGroup>
                    </SidebarMenu>
                </SidebarContent>
                <SidebarFooter className="p-2">
                    <UserProfile />
                </SidebarFooter>
            </Sidebar>

            <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b border-border/50 h-[73px]">
                     <div className="flex items-center gap-4">
                        <SidebarTrigger className="md:hidden" />
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={activeChat.avatar} data-ai-hint={activeChat.hint} />
                            <AvatarFallback>{activeChat.name.substring(0, 1)}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold font-headline">{activeChat.name}</h2>
                    </div>
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                       {renderMessages()}
                    </div>
                </main>

                <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
                    <div className="relative">
                        <Input placeholder={`Message ${activeChat.name}`} className="h-12 pr-12" />
                        <Button size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send-horizontal h-5 w-5"><path d="m3 3 3 9-3 9 19-9Z"/><path d="M6 12h16"/></svg>
                        </Button>
                    </div>
                </footer>
            </div>
        </div>
    </SidebarProvider>
  );
}
