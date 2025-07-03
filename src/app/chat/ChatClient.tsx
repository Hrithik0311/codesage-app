
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref as dbRef, onValue, get, set, push, update, serverTimestamp, query, orderByChild } from 'firebase/database';
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
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, SendHorizontal } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

// --- Interfaces ---
interface Message {
    key: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
}

interface Chat {
    id: string;
    name: string;
    avatar: string;
    hint: 'person' | 'megaphone' | 'robot';
    type: 'dm' | 'channel' | 'ai';
    members?: Record<string, boolean>;
    lastMessage?: {
        text: string;
        timestamp: number;
    }
}

interface PlatformUser {
    id: string;
    name: string;
    role: string; // Kept for interface consistency, but may be empty
}

type LoadingState = 'initializing' | 'ready';


// --- Helper Functions ---
const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return '';
    return formatDistanceToNowStrict(new Date(timestamp), { addSuffix: true });
};

// --- Main Component ---
export default function ChatClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [loadingState, setLoadingState] = useState<LoadingState>('initializing');
  const [team, setTeam] = useState<any | null>(null);
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  useEffect(() => {
    if (authLoading || !user || !database) return;

    setLoadingState('initializing');
    let chatsUnsubscribe = () => {};

    // Step 1: Fetch ALL user data first to ensure names are always available.
    const usersRef = dbRef(database, 'users');
    get(usersRef).then(usersSnapshot => {
        const usersData = usersSnapshot.val() || {};
        const loadedUsers = Object.entries(usersData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || `User...${id.substring(0,4)}`,
            role: '', // Role isn't needed for global user search
        }));
        setAllUsers(loadedUsers);
        const usersById = new Map(loadedUsers.map(u => [u.id, u.name]));

        // Step 2: Fetch user's team data (this is optional and for team-specific channels).
        const userTeamRef = dbRef(database, `users/${user.uid}/teamCode`);
        get(userTeamRef).then(teamCodeSnapshot => {
            if (teamCodeSnapshot.exists()) {
                const teamCode = teamCodeSnapshot.val();
                get(dbRef(database, `teams/${teamCode}`)).then(teamSnapshot => {
                    if (teamSnapshot.exists()) {
                        setTeam({ id: teamCode, ...teamSnapshot.val() });
                    }
                });
            }
        });

        // Step 3: Now that we have all names, fetch and subscribe to the user's chats.
        const userChatsRef = dbRef(database, `users/${user.uid}/chats`);
        chatsUnsubscribe = onValue(userChatsRef, async (chatListSnapshot) => {
            const chatIds = chatListSnapshot.val() || {};
            
            const chatPromises = Object.keys(chatIds).map(async (chatId) => {
              const metaSnap = await get(dbRef(database, `chats/${chatId}/metadata`));
              if (!metaSnap.exists()) return null;

              const meta = metaSnap.val();
              let name = meta.name;
              let hint: Chat['hint'] = 'megaphone';
              
              if (meta.type === 'dm') {
                  const otherUserId = Object.keys(meta.members || {}).find(id => id !== user.uid);
                  if (otherUserId) {
                      // Priority 1: Use stored name if available (for new and self-healed chats)
                      if (meta.memberNames && meta.memberNames[otherUserId]) {
                          name = meta.memberNames[otherUserId];
                      } else {
                          // Priority 2: Look up name from the global user list.
                          const otherUserName = usersById.get(otherUserId) || 'Unknown User';
                          if (otherUserName !== 'Unknown User') {
                              name = otherUserName;
                              // SELF-HEALING: Found a name, so write it back to the DB for future loads.
                              const myName = usersById.get(user.uid) || user.displayName || 'Me';
                              update(dbRef(database), {
                                  [`/chats/${chatId}/metadata/memberNames`]: {
                                      [user.uid]: myName,
                                      [otherUserId]: otherUserName
                                  }
                              });
                          } else {
                              name = 'Unknown User';
                          }
                      }
                  } else {
                      name = 'Unknown User';
                  }
                  hint = 'person';
              }
              return {
                id: chatId, name, hint, type: meta.type, members: meta.members,
                avatar: 'https://placehold.co/40x40.png',
                lastMessage: meta.lastMessage,
              };
            });

            const resolvedChats = (await Promise.all(chatPromises)).filter(Boolean) as Chat[];

            const sortedChats = [...resolvedChats].sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));

            setChats(sortedChats);
            
            setActiveChatId(prevId => {
              if (prevId && sortedChats.some(c => c.id === prevId)) return prevId;
              const hashId = window.location.hash.substring(1);
              if (hashId && sortedChats.some(c => c.id === hashId)) return hashId;
              return sortedChats.length > 0 ? sortedChats[0].id : null;
            });
            
            setLoadingState('ready');
        });

    }).catch(error => {
        console.error("Error loading initial data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load chat data.' });
        setLoadingState('ready'); // Unblock UI even if there's an error
    });

    return () => {
      if (chatsUnsubscribe) chatsUnsubscribe();
    };
  }, [user, authLoading, database, toast]);


  // --- Message Fetching Effect ---
  useEffect(() => {
    if (!activeChatId || !database) {
      setMessages([]);
      return;
    }
    const currentActiveChat = chats.find(c => c.id === activeChatId);
    if (!currentActiveChat) return;

    const messagesRef = dbRef(database, `chats/${activeChatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((child) => { messagesData.push({ key: child.key!, ...child.val() }); });
        setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [activeChatId, chats, database]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Actions ---
  const handleSetActiveChat = (chatId: string | null) => {
    setActiveChatId(chatId);
    if (chatId) {
        router.replace(`#${chatId}`);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChat || isSending) return;
    
    setIsSending(true);
    const currentInput = newMessage;
    setNewMessage("");

    try {
        const myName = allUsers.find(u => u.id === user.uid)?.name || user.displayName || user.email?.split('@')[0];

        if (!myName) {
          toast({ variant: 'destructive', title: 'Error', description: "Couldn't verify your identity to send message." });
          setIsSending(false);
          setNewMessage(currentInput);
          return;
        }

        const messageData = { text: currentInput, senderId: user.uid, senderName: myName, timestamp: serverTimestamp() };
        
        const updates: { [key: string]: any } = {};
        const newMessageKey = push(dbRef(database, `chats/${activeChat.id}/messages`)).key;
        
        updates[`/chats/${activeChat.id}/messages/${newMessageKey}`] = messageData;
        updates[`/chats/${activeChat.id}/metadata/lastMessage`] = {
            text: currentInput,
            timestamp: serverTimestamp()
        };
        
        await update(dbRef(database), updates);
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
        setNewMessage(currentInput);
    } finally {
        setIsSending(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleStartChat = useCallback(async (userToChat: PlatformUser) => {
      if (!user || !database) return;

      const existingDm = chats.find(c => c.type === 'dm' && c.members && c.members[userToChat.id]);
      if (existingDm) {
          handleSetActiveChat(existingDm.id);
          setSearchTerm("");
          return;
      }
      
      const newChatRef = push(dbRef(database, 'chats'));
      const newChatId = newChatRef.key;
      if (!newChatId) {
        toast({variant: 'destructive', title: 'Error', description: 'Could not create chat.'});
        return;
      }
      
      const myName = allUsers.find(m => m.id === user.uid)?.name || user.displayName || 'Me';

      const chatData = { 
        metadata: { 
          type: 'dm', 
          members: { [user.uid]: true, [userToChat.id]: true },
          memberNames: {
              [user.uid]: myName,
              [userToChat.id]: userToChat.name
          }
        } 
      };
      await set(newChatRef, chatData);
      
      const updates: { [key:string]: any } = {};
      updates[`/users/${user.uid}/chats/${newChatId}`] = true;
      updates[`/users/${userToChat.id}/chats/${newChatId}`] = true;
      await update(dbRef(database), updates);
      
      setSearchTerm("");
      
      // Update state without waiting for full refresh for faster UI response
      const newChat: Chat = {
          id: newChatId,
          name: userToChat.name,
          avatar: 'https://placehold.co/40x40.png',
          hint: 'person',
          type: 'dm',
          members: { [user.uid]: true, [userToChat.id]: true },
      };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      router.replace(`#${newChatId}`);

  }, [user, database, chats, toast, router, allUsers]);


  // --- Render Logic ---
  const filteredUsers = searchTerm ? allUsers.filter(m => 
      m.id !== user?.uid && m.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loadingState === 'initializing') {
    return (
      <SidebarProvider defaultOpen>
        <div className="flex h-screen w-full bg-background text-foreground">
            <Sidebar collapsible="icon" className="border-r border-border/50 hidden md:flex md:flex-col h-screen">
                <SidebarHeader><Skeleton className="h-10 w-full" /><Skeleton className="h-9 w-full mt-2" /></SidebarHeader>
                <SidebarContent><SidebarMenu><SidebarMenuSkeleton showIcon /><SidebarMenuSkeleton showIcon /><SidebarMenuSkeleton showIcon /></SidebarMenu></SidebarContent>
                <SidebarFooter><Skeleton className="h-10 w-full" /></SidebarFooter>
            </Sidebar>
            <div className="flex flex-col flex-1">
                <header className="h-[73px] p-4 border-b border-border/50 flex items-center">
                    <Skeleton className="h-10 w-48" />
                </header>
                <main className="flex-1 p-6">
                    <Skeleton className="h-full w-full rounded-lg" />
                </main>
            </div>
        </div>
      </SidebarProvider>
    );
  }
  
  const isMessageInputDisabled = !activeChat || isSending || (activeChat.type === 'channel' && activeChat.id === team?.announcementsChatId && team.creatorUid !== user?.uid);
  const messageInputPlaceholder =
      !activeChat ? "Select a chat to begin"
    : (activeChat.type === 'channel' && activeChat.id === team?.announcementsChatId && team.creatorUid !== user?.uid) ? "Only the team captain can post here."
    : `Message ${activeChat.name}`;
  
  const ChatSidebar = (
    <>
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
            <ScrollArea className="h-full p-2">
                {searchTerm ? (
                     <SidebarMenu>
                         {filteredUsers.length > 0 ? (
                            filteredUsers.map(member => (
                                <SidebarMenuItem key={member.id}>
                                    <SidebarMenuButton onClick={() => handleStartChat(member)} className="h-14 justify-start">
                                        <Avatar className="h-9 w-9"><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person" /><AvatarFallback>{member.name.substring(0,1)}</AvatarFallback></Avatar>
                                        <span>{member.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))
                         ) : ( <p className="text-sm text-muted-foreground p-4 text-center">No users found.</p> )}
                    </SidebarMenu>
                ) : (
                    <SidebarMenu>
                         {chats.map((chat) => (
                            <SidebarMenuItem key={chat.id}>
                                <button onClick={() => handleSetActiveChat(chat.id)} className={cn("flex items-start gap-3 text-left w-full p-3 rounded-lg transition-colors", activeChatId === chat.id ? 'bg-muted' : 'hover:bg-muted/50')}>
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={chat.avatar} data-ai-hint={chat.hint} />
                                        <AvatarFallback>{chat.name.substring(0, 1)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold truncate">{chat.name}</p>
                                            <p className="text-xs text-muted-foreground flex-shrink-0">{formatTimestamp(chat.lastMessage?.timestamp)}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">{chat.lastMessage?.text}</p>
                                    </div>
                                </button>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                )}
            </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-2"><UserProfile /></SidebarFooter>
    </>
  )

  const ChatPane = (
    <div className="flex flex-col flex-1 h-screen">
        <header className="flex items-center justify-between p-4 border-b border-border/50 h-[73px] flex-shrink-0">
            {activeChat ? (
                <div className="flex items-center gap-4">
                    <SidebarTrigger className="md:hidden" />
                    <Avatar className="h-10 w-10"><AvatarImage src={activeChat.avatar} data-ai-hint={activeChat.hint} /><AvatarFallback>{activeChat.name.substring(0, 1)}</AvatarFallback></Avatar>
                    <h2 className="text-xl font-bold font-headline">{activeChat.name}</h2>
                </div>
            ) : <div className="flex items-center gap-4"><SidebarTrigger className="md:hidden" /></div>}
        </header>

        <main className="flex-1 p-6 overflow-y-auto bg-background/50">
            {activeChat ? (
                <div className="space-y-6">
                    {messages.map((msg) => {
                        const isSender = msg.senderId === user?.uid;
                        return (
                             <div key={msg.key} className={cn("flex items-end gap-3", isSender && "flex-row-reverse")}>
                                <Avatar className="h-8 w-8"><AvatarImage data-ai-hint={msg.senderId === 'ai' ? 'robot' : 'person'} src={'https://placehold.co/40x40.png'} /><AvatarFallback>{(msg.senderName || "U").substring(0, 1)}</AvatarFallback></Avatar>
                                <div className={cn("flex flex-col gap-1", isSender ? "items-end" : "items-start")}>
                                    {!isSender && <p className="text-xs font-bold pb-1 text-accent ml-4">{msg.senderName}</p>}
                                    <div className={cn("rounded-2xl py-2 px-4 max-w-sm md:max-w-md", isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{formatTimestamp(msg.timestamp)}</p>
                                </div>
                            </div>
                        )
                    })}
                   <div ref={messagesEndRef} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <MessageSquare size={64} className="mb-4 text-primary/50" />
                    <h3 className="text-2xl font-bold font-headline text-foreground">Welcome to CodeSage Chat</h3>
                    <p>Select a conversation from the sidebar to get started.</p>
                </div>
            )}
        </main>

        <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
            <form onSubmit={handleFormSubmit}>
                <div className="relative">
                    <Input placeholder={messageInputPlaceholder} className="h-12 pr-14" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isMessageInputDisabled} />
                    <Button type="submit" size="icon" className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9" disabled={!newMessage.trim() || isMessageInputDisabled}>
                        <SendHorizontal className="h-5 w-5"/>
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </form>
        </footer>
    </div>
  )

  return (
    <SidebarProvider defaultOpen>
        <div className="flex w-full bg-background text-foreground">
            <Sidebar collapsible="icon" className="border-r border-border/50 hidden md:flex md:flex-col h-screen">
                {ChatSidebar}
            </Sidebar>
            <div className="md:hidden">
                <Sheet>
                    <SheetContent side="left" className="p-0 w-[80vw] max-w-xs" onOpenAutoFocus={(e) => e.preventDefault()}>
                       {ChatSidebar}
                    </SheetContent>
                </Sheet>
            </div>
            {ChatPane}
        </div>
    </SidebarProvider>
  );
}
