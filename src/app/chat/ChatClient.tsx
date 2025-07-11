
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref as dbRef, onValue, get, set, push, update, serverTimestamp, query, orderByChild, remove } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, SendHorizontal, MoreHorizontal, ChevronLeft, Moon, Sun, Plus, Video, Phone, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTheme } from 'next-themes';

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
    role: string;
}

type LoadingState = 'initializing' | 'ready';


// --- Helper Functions ---
const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- Main Component ---
export default function ChatClient() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- State ---
  const [loadingState, setLoadingState] = useState<LoadingState>('initializing');
  const [allUsers, setAllUsers] = useState<PlatformUser[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- UI State ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);

  useEffect(() => {
    if (authLoading || !user || !database) return;

    setLoadingState('initializing');
    let chatsUnsubscribe = () => {};

    const usersRef = dbRef(database, 'users');
    get(usersRef).then(usersSnapshot => {
        const usersData = usersSnapshot.val() || {};
        const loadedUsers = Object.entries(usersData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || `User...${id.substring(0,4)}`,
            role: '',
        }));
        setAllUsers(loadedUsers);
        const usersById = new Map(loadedUsers.map(u => [u.id, u.name]));

        const userChatsRef = dbRef(database, `users/${user.uid}/chats`);
        chatsUnsubscribe = onValue(userChatsRef, async (chatListSnapshot) => {
            const chatIds = chatListSnapshot.val() || {};
            
            const chatPromises = Object.keys(chatIds).map(async (chatId) => {
              const metaSnap = await get(dbRef(database, `chats/${chatId}/metadata`));
              if (!metaSnap.exists()) return null;

              const meta = metaSnap.val();
              let name = meta.name;
              
              if (meta.type === 'dm') {
                  const otherUserId = Object.keys(meta.members || {}).find(id => id !== user.uid);
                  if (otherUserId) {
                      name = usersById.get(otherUserId) || 'Unknown User';
                  } else {
                      name = 'Direct Message';
                  }
              }
              return {
                id: chatId, name, type: meta.type, members: meta.members,
                lastMessage: meta.lastMessage,
              };
            });

            const resolvedChats = (await Promise.all(chatPromises)).filter(Boolean) as Chat[];
            const sortedChats = [...resolvedChats].sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
            setChats(sortedChats);
            
            if (!activeChatId && sortedChats.length > 0) {
              setActiveChatId(sortedChats[0].id);
            }
            
            setLoadingState('ready');
        });

    }).catch(error => {
        console.error("Error loading initial data:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load chat data.' });
        setLoadingState('ready');
    });

    return () => {
      if (chatsUnsubscribe) chatsUnsubscribe();
    };
  }, [user, authLoading, toast]);

  useEffect(() => {
    if (!activeChatId || !database) {
      setMessages([]);
      return;
    }
    const messagesRef = dbRef(database, `chats/${activeChatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));
    const unsubscribe = onValue(messagesQuery, (snapshot) => {
        const messagesData: Message[] = [];
        snapshot.forEach((child) => { messagesData.push({ key: child.key!, ...child.val() }); });
        setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [activeChatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    const textToSend = newMessage;
    if (!textToSend.trim() || !user || !activeChat || isSending) return;
    
    setIsSending(true);
    setNewMessage("");

    try {
        const myName = allUsers.find(u => u.id === user.uid)?.name || user.displayName || user.email?.split('@')[0];
        if (!myName) throw new Error("Could not verify your identity to send message.");

        const messageData: Omit<Message, 'key'|'timestamp'> & {timestamp: object} = { 
          text: textToSend, senderId: user.uid, senderName: myName, timestamp: serverTimestamp() 
        };
        
        const updates: { [key: string]: any } = {};
        const newMessageKey = push(dbRef(database, `chats/${activeChat.id}/messages`)).key;
        updates[`/chats/${activeChat.id}/messages/${newMessageKey}`] = messageData;
        updates[`/chats/${activeChat.id}/metadata/lastMessage`] = {
            text: textToSend,
            timestamp: serverTimestamp()
        };
        
        await update(dbRef(database), updates);
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
        setNewMessage(textToSend);
    } finally {
        setIsSending(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSendMessage(); };

  const handleStartChat = useCallback(async (userToChat: PlatformUser) => {
      if (!user || !database) return;
      const existingDm = chats.find(c => c.type === 'dm' && c.members && c.members[userToChat.id]);
      if (existingDm) {
          setActiveChatId(existingDm.id);
          setSearchTerm("");
          return;
      }
      const newChatRef = push(dbRef(database, 'chats'));
      const newChatId = newChatRef.key;
      if (!newChatId) { toast({variant: 'destructive', title: 'Error', description: 'Could not create chat.'}); return; }
      
      const chatData = { metadata: { type: 'dm', members: { [user.uid]: true, [userToChat.id]: true } } };
      await set(newChatRef, chatData);
      
      const updates: { [key:string]: any } = {};
      updates[`/users/${user.uid}/chats/${newChatId}`] = true;
      updates[`/users/${userToChat.id}/chats/${newChatId}`] = true;
      await update(dbRef(database), updates);
      setActiveChatId(newChatId);
      setSearchTerm("");
  }, [user, database, chats, toast, allUsers]);

    const filteredUsers = searchTerm ? allUsers.filter(m => m.id !== user?.uid && m.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];


  if (loadingState === 'initializing') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  const messageInputPlaceholder = `Message ${activeChat?.name || '...'}`;

  const ChatSidebar = (
    <div className={cn("flex flex-col border-r border-border bg-muted/20 transition-all duration-300", isSidebarCollapsed ? "w-[70px]" : "w-[300px]")}>
        <div className="p-4 border-b border-border flex items-center justify-between bg-background">
            <div className={cn("flex items-center text-xl font-medium text-foreground", isSidebarCollapsed && "hidden")}>
                <MessageSquare className="mr-2 text-primary" />
                <span>Chat</span>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                    <ChevronLeft size={16} className={cn('transition-transform', isSidebarCollapsed && 'rotate-180')} />
                </Button>
            </div>
        </div>
        <div className={cn("p-4 relative", isSidebarCollapsed && "hidden")}>
            <Input 
                type="text" 
                className="w-full py-3 pr-4 pl-11 border rounded-full text-sm" 
                placeholder="Search" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className={cn("flex gap-2 px-4 pb-4 overflow-x-auto", isSidebarCollapsed && "hidden")}>
          <div className="py-1.5 px-3 border rounded-2xl text-xs cursor-pointer whitespace-nowrap bg-primary text-primary-foreground">All</div>
          <div className="py-1.5 px-3 border rounded-2xl text-xs cursor-pointer whitespace-nowrap">Unread</div>
          <div className="py-1.5 px-3 border rounded-2xl text-xs cursor-pointer whitespace-nowrap">Groups</div>
          <div className="py-1.5 px-3 border rounded-2xl text-xs cursor-pointer whitespace-nowrap">Direct</div>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
            {searchTerm ? (
                filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                         <div key={u.id} className="py-3 px-4 cursor-pointer transition-all border-l-4 border-transparent flex items-center hover:bg-muted" onClick={() => handleStartChat(u)}>
                            <div className="w-10 h-10 rounded-full flex-shrink-0 bg-muted flex items-center justify-center font-medium mr-3">{u.name.substring(0,1)}</div>
                            <div className={cn("flex-1 min-w-0", isSidebarCollapsed && "hidden")}>
                                <div className="font-medium text-foreground">{u.name}</div>
                            </div>
                        </div>
                    ))
                ) : <p className={cn("text-center text-sm text-muted-foreground p-4", isSidebarCollapsed && 'hidden')}>No users found.</p>
            ) : (
                 chats.map(chat => (
                    <div key={chat.id} className={cn("py-3 px-4 cursor-pointer transition-all border-l-4 border-transparent flex items-center hover:bg-muted", activeChatId === chat.id && 'bg-primary/10 border-primary')} onClick={() => setActiveChatId(chat.id)}>
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-muted flex items-center justify-center font-medium mr-3">{chat.name.substring(0,2).toUpperCase()}</div>
                        <div className={cn("flex-1 min-w-0", isSidebarCollapsed && "hidden")}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="font-medium text-foreground">{chat.name}</div>
                                <div className="text-xs text-muted-foreground">{formatTimestamp(chat.lastMessage?.timestamp)}</div>
                            </div>
                            <div className="text-muted-foreground text-sm whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1">
                                {chat.type === 'channel' && <Users size={12} className="mr-1" />}
                                {chat.lastMessage?.text || "No messages yet"}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className={cn("p-4", isSidebarCollapsed && "hidden")}>
            <Button className="w-full" onClick={() => toast({title: "Coming Soon!", description: "Creating new spaces will be available in a future update."})}>
                <Plus size={16} className="mr-2"/>
                New Chat
            </Button>
        </div>
    </div>
  )

  const MessageItem = ({ msg }: { msg: Message }) => {
    const isSender = msg.senderId === user?.uid;
    return (
        <div className={cn("flex mb-4", isSender ? "justify-end" : "justify-start")}>
          <div className="max-w-[70%]">
            <div className={cn("py-3 px-4 rounded-2xl", isSender ? "bg-primary text-primary-foreground rounded-br-md" : "bg-background border rounded-bl-md")}>
                {msg.text}
            </div>
            <div className="flex justify-between items-center mt-1 text-xs opacity-70 text-muted-foreground">
              <span>{formatTimestamp(msg.timestamp)}</span>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
        {ChatSidebar}
        <div className="flex-1 flex flex-col bg-background relative">
            <div className="py-4 px-6 border-b border-border flex items-center justify-between bg-background z-10">
                <div className="flex items-center">
                    {activeChat && (
                      <>
                        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-muted flex items-center justify-center font-medium mr-3 relative">
                            <span>{activeChat.name.substring(0,2).toUpperCase()}</span>
                            <div className="absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-base font-medium text-foreground mb-0">{activeChat.name}</h3>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                                Active now
                            </div>
                        </div>
                      </>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Video size={20}/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Phone size={20}/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Search size={20}/></Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><MoreHorizontal size={20}/></Button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-muted/30" ref={messagesEndRef}>
              <div className="text-center my-5 relative">
                <div className="absolute top-1/2 left-0 right-0 h-px bg-border"></div>
                <span className="bg-muted/30 px-4 text-muted-foreground text-xs relative z-10">Today</span>
              </div>
              {messages.map(msg => <MessageItem key={msg.key} msg={msg} />)}
            </div>
            <div className="p-4 px-6 bg-background border-t border-border">
                <div className="flex items-end gap-3 bg-muted/30 rounded-3xl p-2 px-4 border border-border transition-all focus-within:border-primary">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Plus size={20}/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Users size={20}/></Button>
                    </div>
                    <Textarea
                        className="flex-1 border-none bg-transparent p-2 text-sm resize-none h-auto min-h-[24px] outline-none shadow-none focus-visible:ring-0" 
                        placeholder={messageInputPlaceholder}
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        disabled={!activeChatId}
                    />
                    <Button size="icon" className={cn("h-9 w-9 rounded-full transition-all", newMessage.trim() ? "opacity-100 scale-100" : "opacity-50 scale-90")} onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                        <SendHorizontal size={16}/>
                    </Button>
                </div>
            </div>
        </div>
    </div>
  );
}
