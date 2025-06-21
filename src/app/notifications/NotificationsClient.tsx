
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref as dbRef, onValue, get, set, push, update, serverTimestamp, query, orderByChild, equalTo } from 'firebase/database';
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Bell, Users, Search, Bot, SendHorizonal, SendHorizontal } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Chat {
    id: string;
    name: string;
    avatar: string;
    hint: string;
    type: 'dm' | 'channel';
    members?: Record<string, boolean>;
    notifications?: number;
}

interface Message {
    key: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
}

const aiChat: Chat = {
    id: 'codesage-ai',
    name: 'CodeSage AI',
    avatar: 'https://placehold.co/40x40.png',
    hint: 'robot',
    type: 'channel'
};

const aiMessages: Message[] = [
    { key: '1', senderId: 'ai', senderName: 'CodeSage AI', text: "Welcome! I'm here to help you with code analysis, suggestions, and more. What can I help you with today?", timestamp: Date.now() - 10000 },
];


export default function NotificationsClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  // Effect 1: Fetch team and member data.
  useEffect(() => {
    if (!user || !database) return;

    let teamUnsubscribe: any;
    const userTeamRef = dbRef(database, `users/${user.uid}/teamCode`);
    
    get(userTeamRef).then((teamCodeSnap) => {
        if (!teamCodeSnap.exists()) {
            setTeam(null);
            // No need to setLoading(false) here, let the chat fetching logic handle it
            return;
        }
        const teamCode = teamCodeSnap.val();
        const teamDataRef = dbRef(database, `teams/${teamCode}`);
        
        teamUnsubscribe = onValue(teamDataRef, (snapshot) => {
            if (!snapshot.exists()) {
                setTeam(null);
                setTeamMembers([]);
                return;
            }
            const teamData = snapshot.val();
            setTeam({ id: teamCode, ...teamData });
            
            const members: TeamMember[] = [];
            if (teamData.roles) {
                for (const role in teamData.roles) {
                    for (const id in teamData.roles[role]) {
                        members.push({ id, name: teamData.roles[role][id], role });
                    }
                }
            }
            setTeamMembers(members);
        });
    }).catch(error => {
        console.error("Error fetching team code:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load team information.' });
        setLoading(false);
    });

    return () => {
        if (teamUnsubscribe) teamUnsubscribe();
    };
  }, [user, toast]);

  // Effect 2: Fetch chats, which depends on teamMembers being populated.
  useEffect(() => {
    if (!user || !database || authLoading) return;
    
    // If not in a team, just show the AI chat and stop loading.
    if (!team && !loading) {
        setChats([aiChat]);
        setActiveChat(aiChat);
        return;
    }

    // Wait for team members to be loaded before fetching chats
    if (team && teamMembers.length === 0) return;

    let userChatsUnsubscribe: any;
    const userChatsRef = dbRef(database, `users/${user.uid}/chats`);

    userChatsUnsubscribe = onValue(userChatsRef, async (snapshot) => {
        const chatIds = snapshot.val() || {};
        const chatPromises = Object.keys(chatIds).map(async (chatId) => {
            const chatSnap = await get(dbRef(database, `chats/${chatId}/metadata`));
            if (!chatSnap.exists()) return null;

            const chatData = chatSnap.val();
            let chatName = chatData.name;
            let chatHint = 'megaphone';

            if (chatData.type === 'dm') {
                const otherUserId = Object.keys(chatData.members).find(id => id !== user.uid);
                if (otherUserId) {
                    // Find member from the already loaded list
                    const member = teamMembers.find(m => m.id === otherUserId);
                    chatName = member?.name || "Unknown User";
                } else {
                    chatName = "Direct Message"; // Fallback for DMs
                }
                 chatHint = 'person';
            }

            return {
                id: chatId,
                name: chatName,
                avatar: 'https://placehold.co/40x40.png',
                hint: chatHint,
                type: chatData.type,
                members: chatData.members,
            };
        });
        
        const resolvedChats = (await Promise.all(chatPromises)).filter(Boolean) as Chat[];
        const finalChats = [aiChat, ...resolvedChats];
        setChats(finalChats);

        if (!activeChat || !finalChats.some(c => c.id === activeChat.id)) {
            setActiveChat(finalChats[0] || null);
        }
        setLoading(false);

    }, (error) => {
        console.error("Error fetching user chats:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load your chats.' });
        setLoading(false);
    });

    return () => {
        if (userChatsUnsubscribe) userChatsUnsubscribe();
    };
  }, [user, authLoading, team, teamMembers, toast, activeChat, loading]);


  useEffect(() => {
    if (!activeChat || !database) {
        setMessages(activeChat?.id === 'codesage-ai' ? aiMessages : []);
        return;
    };
    if (activeChat.id === 'codesage-ai') {
        setMessages(aiMessages);
        return;
    }

    const messagesRef = dbRef(database, `chats/${activeChat.id}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((childSnapshot) => {
            messagesData.push({ key: childSnapshot.key!, ...childSnapshot.val() });
        });
        setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [activeChat, database]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat || activeChat.id === 'codesage-ai' || activeChat.type === 'channel') return;

    const currentUserMember = teamMembers.find(m => m.id === user.uid);
    const senderName = currentUserMember?.name || user.displayName || user.email?.split('@')[0];

    if (!senderName) {
        toast({ variant: 'destructive', title: 'Error', description: 'Could not identify sender name.' });
        return;
    }

    const messageData = {
        text: newMessage,
        senderId: user.uid,
        senderName: senderName,
        timestamp: serverTimestamp(),
    };

    try {
        await push(dbRef(database, `chats/${activeChat.id}/messages`), messageData);
        setNewMessage("");
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
    }
  };

  const handleStartChat = async (member: TeamMember) => {
      if (!user || !database) return;

      const existingDm = chats.find(c => c.type === 'dm' && c.members && c.members[member.id]);
      if (existingDm) {
          setActiveChat(existingDm);
          setSearchTerm("");
          return;
      }

      const newChatRef = push(dbRef(database, 'chats'));
      const newChatId = newChatRef.key;
      if(!newChatId) return;

      const chatData = {
          metadata: {
              type: 'dm',
              members: {
                  [user.uid]: true,
                  [member.id]: true,
              }
          }
      };
      await set(newChatRef, chatData);
      
      const updates: { [key: string]: any } = {};
      updates[`/users/${user.uid}/chats/${newChatId}`] = true;
      updates[`/users/${member.id}/chats/${newChatId}`] = true;
      await update(dbRef(database), updates);

      const newChat: Chat = {
          id: newChatId,
          name: member.name,
          avatar: 'https://placehold.co/40x40.png',
          hint: 'person',
          type: 'dm',
          members: chatData.metadata.members
      }
      setChats(prev => [...prev, newChat]);
      setActiveChat(newChat);
      setSearchTerm("");
  };


  const filteredUsers = searchTerm ? teamMembers.filter(m => 
      m.id !== user?.uid && (m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.id.toLowerCase().includes(searchTerm.toLowerCase()))
  ) : [];

  if (authLoading || loading) {
    return (
        <SidebarProvider defaultOpen>
            <div className="flex h-screen w-full bg-background text-foreground">
                <Sidebar collapsible="icon" className="border-r border-border/50">
                    <SidebarHeader><Skeleton className="h-10 w-full" /></SidebarHeader>
                    <SidebarContent><SidebarMenu><SidebarMenuSkeleton showIcon /><SidebarMenuSkeleton showIcon /></SidebarMenu></SidebarContent>
                </Sidebar>
                <div className="flex flex-col flex-1"><header className="h-[73px] p-4"><Skeleton className="h-full w-48" /></header><main className="flex-1 p-6"><Skeleton className="h-full w-full" /></main></div>
            </div>
        </SidebarProvider>
    );
  }
  
  if (!team) {
    return <div className="flex items-center justify-center h-screen w-full p-4 text-center">You are not part of a team. Please join or create one in the Collaboration Hub.</div>
  }

  const renderMessages = () => {
    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                <MessageSquare size={48} className="mb-4" />
                <h3 className="text-xl font-semibold text-foreground">No messages yet</h3>
                <p>Start the conversation!</p>
            </div>
        )
    }

    return messages.map((msg) => (
         <div key={msg.key} className={`flex items-start gap-4 ${msg.senderId === user?.uid ? 'flex-row-reverse' : ''}`}>
            {msg.senderId !== user?.uid && (
                <Avatar className="h-10 w-10">
                    <AvatarImage src={activeChat?.avatar} data-ai-hint={activeChat?.hint} />
                    <AvatarFallback>{(msg.senderName || "U").substring(0, 1)}</AvatarFallback>
                </Avatar>
            )}
            <div className={`flex flex-col gap-1 ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                {msg.senderId !== user?.uid && (
                    <p className="text-sm font-semibold text-foreground">{msg.senderName || 'Unknown User'}</p>
                )}
                <div className={`rounded-2xl p-3 max-w-md ${msg.senderId === user?.uid ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
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
                        <Input placeholder="Search people..." className="pl-9 bg-muted/50 border-border/60" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                     </div>
                </SidebarHeader>
                <SidebarContent className="p-0">
                    {searchTerm ? (
                        <div className="p-2">
                             <SidebarGroupLabel>Search Results</SidebarGroupLabel>
                             {filteredUsers.length > 0 ? (
                                <SidebarMenu>
                                    {filteredUsers.map(member => (
                                        <SidebarMenuItem key={member.id}>
                                            <SidebarMenuButton onClick={() => handleStartChat(member)} className="h-14 justify-start">
                                                <Avatar className="h-9 w-9"><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person" /><AvatarFallback>{member.name.substring(0,1)}</AvatarFallback></Avatar>
                                                <span>{member.name}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                             ) : (
                                <p className="text-sm text-muted-foreground p-2">No users found.</p>
                             )}
                        </div>
                    ) : (
                        <SidebarMenu>
                            <SidebarGroup>
                                <SidebarGroupLabel className="flex items-center gap-2"><Bell size={16}/> Updates</SidebarGroupLabel>
                                {chats.filter(c => c.type === 'channel').map((chat) => (
                                    <SidebarMenuItem key={chat.id}>
                                        <SidebarMenuButton onClick={() => setActiveChat(chat)} isActive={activeChat?.id === chat.id} className="h-14 justify-start">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={chat.avatar} data-ai-hint={chat.hint} />
                                                 <AvatarFallback>{chat.name.substring(0, 1)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col items-start w-full">
                                                <span className="font-semibold">{chat.name}</span>
                                            </div>
                                            {chat.notifications > 0 && <Badge className="bg-primary text-primary-foreground">{chat.notifications}</Badge>}
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarGroup>
                            <SidebarGroup>
                                <SidebarGroupLabel className="flex items-center gap-2"><Users size={16}/> Direct Messages</SidebarGroupLabel>
                                {chats.filter(c => c.type === 'dm').map((dm) => (
                                    <SidebarMenuItem key={dm.id}>
                                        <SidebarMenuButton 
                                            onClick={() => setActiveChat(dm)} 
                                            isActive={activeChat?.id === dm.id}
                                            className="h-14 justify-start"
                                        >
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={dm.avatar} data-ai-hint={dm.hint} />
                                                <AvatarFallback>{dm.name.substring(0, 1)}</AvatarFallback>
                                                {/* Presence indicator can be added here */}
                                            </Avatar>
                                            <span className="font-semibold">{dm.name}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarGroup>
                        </SidebarMenu>
                    )}
                </SidebarContent>
                <SidebarFooter className="p-2">
                    <UserProfile />
                </SidebarFooter>
            </Sidebar>

            <div className="flex flex-col flex-1">
                <header className="flex items-center justify-between p-4 border-b border-border/50 h-[73px]">
                    {activeChat ? (
                         <div className="flex items-center gap-4">
                            <SidebarTrigger className="md:hidden" />
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={activeChat.avatar} data-ai-hint={activeChat.hint} />
                                <AvatarFallback>{activeChat.name.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <h2 className="text-xl font-bold font-headline">{activeChat.name}</h2>
                        </div>
                    ) : ( <Skeleton className="h-10 w-48" />)}
                </header>

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-6">
                       {activeChat ? renderMessages() : null}
                       <div ref={messagesEndRef} />
                    </div>
                </main>

                <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                        <div className="relative">
                            <Input 
                                placeholder={activeChat?.type === 'dm' ? `Message ${activeChat.name}` : `You cannot send messages here.`} 
                                className="h-12 pr-12" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={!activeChat || activeChat.type !== 'dm'}
                            />
                            <Button type="submit" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9" disabled={!newMessage.trim() || !activeChat || activeChat.type !== 'dm'}>
                                <SendHorizontal className="h-5 w-5"/>
                            </Button>
                        </div>
                    </form>
                </footer>
            </div>
        </div>
    </SidebarProvider>
  );
}
