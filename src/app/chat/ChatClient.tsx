
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref as dbRef, onValue, get, set, push, update, serverTimestamp, query, orderByChild, remove } from 'firebase/database';
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
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, SendHorizontal, MoreHorizontal, Trash2, Pencil, Reply, X } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { ThemeToggleButton } from '@/components/ThemeToggleButton';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AnimatePresence, motion } from 'framer-motion';


// --- Interfaces ---
interface Message {
    key: string;
    text: string;
    senderId: string;
    senderName: string;
    timestamp: number;
    isEdited?: boolean;
    parentMessageId?: string; // For threads
    replyCount?: number; // Denormalized for UI
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
    role: string;
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
  const threadMessagesEndRef = useRef<HTMLDivElement>(null);

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
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState('');
  
  // --- Threading State ---
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [threadReplyMessage, setThreadReplyMessage] = useState('');

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);
  const mainMessages = useMemo(() => messages.filter(m => !m.parentMessageId), [messages]);
  const threadMessages = useMemo(() => messages.filter(m => m.parentMessageId === activeThreadId), [messages, activeThreadId]);
  const originalThreadMessage = useMemo(() => messages.find(m => m.key === activeThreadId), [messages, activeThreadId]);

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
                      if (meta.memberNames && meta.memberNames[otherUserId]) {
                          name = meta.memberNames[otherUserId];
                      } else {
                          const otherUserName = usersById.get(otherUserId) || 'Unknown User';
                          if (otherUserName !== 'Unknown User') {
                              name = otherUserName;
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
        setLoadingState('ready');
    });

    return () => {
      if (chatsUnsubscribe) chatsUnsubscribe();
    };
  }, [user, authLoading, database, toast]);

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

        // Denormalize reply counts
        const replyCounts = new Map<string, number>();
        messagesData.forEach(msg => {
            if (msg.parentMessageId) {
                replyCounts.set(msg.parentMessageId, (replyCounts.get(msg.parentMessageId) || 0) + 1);
            }
        });

        const finalMessages = messagesData.map(msg => ({
            ...msg,
            replyCount: replyCounts.get(msg.key) || 0
        }));

        setMessages(finalMessages);
    });

    return () => unsubscribe();
  }, [activeChatId, database]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mainMessages]);
  useEffect(() => { threadMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [threadMessages]);

  const handleSetActiveChat = (chatId: string | null) => {
    setActiveChatId(chatId);
    setActiveThreadId(null);
    if (chatId) {
        router.replace(`#${chatId}`);
    }
  };

  const handleSendMessage = async (isThreadReply: boolean = false) => {
    const textToSend = isThreadReply ? threadReplyMessage : newMessage;
    if (!textToSend.trim() || !user || !activeChat || isSending) return;
    
    setIsSending(true);
    if (isThreadReply) setThreadReplyMessage("");
    else setNewMessage("");

    try {
        const myName = allUsers.find(u => u.id === user.uid)?.name || user.displayName || user.email?.split('@')[0];
        if (!myName) throw new Error("Could not verify your identity to send message.");

        const messageData: Omit<Message, 'key' | 'replyCount'> = { 
          text: textToSend, senderId: user.uid, senderName: myName, timestamp: serverTimestamp() 
        };
        
        const updates: { [key: string]: any } = {};
        const newMessageKey = push(dbRef(database, `chats/${activeChat.id}/messages`)).key;

        if (isThreadReply && activeThreadId) {
            messageData.parentMessageId = activeThreadId;
            updates[`/chats/${activeChat.id}/messages/${newMessageKey}`] = messageData;
            // No last message update for thread replies to keep main channel clean
        } else {
            updates[`/chats/${activeChat.id}/messages/${newMessageKey}`] = messageData;
            updates[`/chats/${activeChat.id}/metadata/lastMessage`] = {
                text: textToSend,
                timestamp: serverTimestamp()
            };
        }
        
        await update(dbRef(database), updates);
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
        if (isThreadReply) setThreadReplyMessage(textToSend);
        else setNewMessage(textToSend);
    } finally {
        setIsSending(false);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent, isThreadReply: boolean = false) => { e.preventDefault(); handleSendMessage(isThreadReply); };

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
      if (!newChatId) { toast({variant: 'destructive', title: 'Error', description: 'Could not create chat.'}); return; }
      const myName = allUsers.find(m => m.id === user.uid)?.name || user.displayName || 'Me';
      const chatData = { metadata: { type: 'dm', members: { [user.uid]: true, [userToChat.id]: true }, memberNames: { [user.uid]: myName, [userToChat.id]: userToChat.name } } };
      await set(newChatRef, chatData);
      const updates: { [key:string]: any } = {};
      updates[`/users/${user.uid}/chats/${newChatId}`] = true;
      updates[`/users/${userToChat.id}/chats/${newChatId}`] = true;
      await update(dbRef(database), updates);
      setSearchTerm("");
      const newChat: Chat = { id: newChatId, name: userToChat.name, avatar: 'https://placehold.co/40x40.png', hint: 'person', type: 'dm', members: { [user.uid]: true, [userToChat.id]: true }, };
      setChats(prev => [newChat, ...prev]);
      setActiveChatId(newChatId);
      router.replace(`#${newChatId}`);
  }, [user, database, chats, toast, router, allUsers]);

    const handleStartEdit = (message: Message) => { setEditingMessage(message); setEditText(message.text); };
    const handleCancelEdit = () => { setEditingMessage(null); setEditText(''); };
    const handleSaveEdit = async () => {
        if (!editingMessage || !editText.trim() || !activeChatId || !database) { handleCancelEdit(); return; }
        const messageRef = dbRef(database, `chats/${activeChatId}/messages/${editingMessage.key}`);
        try {
            await update(messageRef, { text: editText, isEdited: true });
            const lastMessageInChat = messages.filter(m => !m.parentMessageId).pop();
            if (lastMessageInChat && lastMessageInChat.key === editingMessage.key) {
                await update(dbRef(database, `/chats/${activeChatId}/metadata/lastMessage`), { text: editText });
            }
            toast({ title: "Message Edited" });
        } catch (error) {
            console.error("Error saving edit:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save message edit.' });
        } finally { handleCancelEdit(); }
    };

  const handleDeleteMessage = async () => {
    if (!messageToDelete || !activeChatId || !database) return;
    const messageRef = dbRef(database, `chats/${activeChatId}/messages/${messageToDelete.key}`);
    try {
        await remove(messageRef);
        const mainMsgs = messages.filter(m => !m.parentMessageId);
        const lastMessageInChat = mainMsgs[mainMsgs.length - 1];
        if(lastMessageInChat && lastMessageInChat.key === messageToDelete.key && mainMsgs.length > 1) {
            const newLastMessage = mainMsgs[mainMsgs.length - 2];
            await update(dbRef(database, `/chats/${activeChatId}/metadata/lastMessage`), { text: newLastMessage.text, timestamp: newLastMessage.timestamp });
        } else if (mainMsgs.length === 1 && lastMessageInChat.key === messageToDelete.key) {
            await remove(dbRef(database, `/chats/${activeChatId}/metadata/lastMessage`));
        }
        toast({ title: 'Message Deleted' });
    } catch (error) {
        console.error("Error deleting message:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not delete message.' });
    } finally {
        setMessageToDelete(null);
    }
  };


  const filteredUsers = searchTerm ? allUsers.filter(m => m.id !== user?.uid && m.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

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
                <header className="h-[73px] p-4 border-b border-border/50 flex items-center"><Skeleton className="h-10 w-48" /></header>
                <main className="flex-1 p-6"><Skeleton className="h-full w-full rounded-lg" /></main>
            </div>
        </div>
      </SidebarProvider>
    );
  }
  
  const isMessageInputDisabled = !activeChat || isSending || (activeChat.type === 'channel' && activeChat.id === team?.announcementsChatId && team.creatorUid !== user?.uid);
  const messageInputPlaceholder = !activeChat ? "Select a chat to begin"
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
                                    <Avatar className="h-10 w-10 flex-shrink-0"><AvatarImage src={chat.avatar} data-ai-hint={chat.hint} /><AvatarFallback>{chat.name.substring(0, 1)}</AvatarFallback></Avatar>
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center"><p className="font-semibold truncate">{chat.name}</p><p className="text-xs text-muted-foreground flex-shrink-0">{formatTimestamp(chat.lastMessage?.timestamp)}</p></div>
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
  
  const MessageItem = ({ msg }: { msg: Message }) => {
    const isSender = msg.senderId === user?.uid;
    return (
        <div key={msg.key} className={cn("group relative flex items-start gap-2", isSender && "flex-row-reverse")}>
            {!isSender && <Avatar className="h-8 w-8"><AvatarImage data-ai-hint={msg.senderId === 'ai' ? 'robot' : 'person'} src={'https://placehold.co/40x40.png'} /><AvatarFallback>{(msg.senderName || "U").substring(0, 1)}</AvatarFallback></Avatar>}
            <div className={cn("flex flex-col gap-1 w-full", isSender ? "items-end" : "items-start")}>
                {!isSender && <p className="text-xs font-bold text-accent ml-2">{msg.senderName}</p>}
                <div className={cn("flex items-center gap-2", isSender && "flex-row-reverse")}>
                     <div className={cn("rounded-2xl py-2 px-4 max-w-sm md:max-w-md", isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none")}>
                        {editingMessage?.key === msg.key ? (
                            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-2">
                                <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="bg-background/80 text-foreground h-auto text-sm" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === 'Escape') { handleCancelEdit(); }}} autoFocus />
                                <div className="flex justify-end gap-2 text-xs">
                                    <Button type="button" size="sm" variant="link" onClick={handleCancelEdit} className="p-0 h-auto">Cancel</Button>
                                    <Button type="submit" size="sm" className="h-auto py-1">Save</Button>
                                </div>
                            </form>
                        ) : ( <p className="text-sm whitespace-pre-wrap">{msg.text}</p> )}
                    </div>
                    <div className={cn("flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1", isSender ? 'flex-row-reverse' : '')}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={() => setActiveThreadId(msg.key)}><Reply className="h-4 w-4" /></Button>
                         {isSender && <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align={isSender ? "end" : "start"}>
                                <DropdownMenuItem onClick={() => handleStartEdit(msg)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setMessageToDelete(msg)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>}
                    </div>
                </div>
                <div className={cn("flex items-center gap-2 mt-1", isSender ? "pr-2" : "pl-2")}>
                    {msg.replyCount > 0 && <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setActiveThreadId(msg.key)}>{msg.replyCount} {msg.replyCount > 1 ? 'replies' : 'reply'}</Button>}
                    {msg.replyCount > 0 && <span className="text-muted-foreground text-xs">&middot;</span>}
                    <p className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</p>
                    {msg.isEdited && <p className="text-xs text-muted-foreground italic">(edited)</p>}
                </div>
            </div>
        </div>
    )
  }

  return (
    <>
        <SidebarProvider defaultOpen>
            <div className="flex w-full bg-background text-foreground overflow-hidden h-screen">
                <Sidebar collapsible="icon" className="border-r border-border/50 hidden md:flex md:flex-col h-screen">
                    {ChatSidebar}
                </Sidebar>
                <div className="md:hidden">
                    <Sheet><SheetContent side="left" className="p-0 w-[80vw] max-w-xs" onOpenAutoFocus={(e) => e.preventDefault()}>{ChatSidebar}</SheetContent></Sheet>
                </div>
                
                <div className="flex flex-1 h-screen">
                    <div className="flex flex-col flex-1 h-screen">
                        <header className="flex items-center justify-between p-4 border-b border-border/50 h-[73px] flex-shrink-0">
                            {activeChat ? (<div className="flex items-center gap-4"><SidebarTrigger className="md:hidden" /><Avatar className="h-10 w-10"><AvatarImage src={activeChat.avatar} data-ai-hint={activeChat.hint} /><AvatarFallback>{activeChat.name.substring(0, 1)}</AvatarFallback></Avatar><h2 className="text-xl font-bold font-headline">{activeChat.name}</h2></div>) : <div className="flex items-center gap-4"><SidebarTrigger className="md:hidden" /></div>}
                        </header>

                        <main className="flex-1 p-6 overflow-y-auto bg-background/50">
                            {activeChat ? (
                                <div className="space-y-6">
                                    {mainMessages.map((msg) => <MessageItem key={msg.key} msg={msg} />)}
                                <div ref={messagesEndRef} />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground"><MessageSquare size={64} className="mb-4 text-primary/50" /><h3 className="text-2xl font-bold font-headline text-foreground">Welcome to CodeSage Chat</h3><p>Select a conversation from the sidebar to get started.</p></div>
                            )}
                        </main>

                        <footer className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
                            <form onSubmit={(e) => handleFormSubmit(e, false)}>
                                <div className="relative"><Input placeholder={messageInputPlaceholder} className="h-12 pr-14" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={isMessageInputDisabled} /><Button type="submit" size="icon" className="absolute right-2.5 top-1/2 -translate-y-1/2 h-9 w-9" disabled={!newMessage.trim() || isMessageInputDisabled}><SendHorizontal className="h-5 w-5"/><span className="sr-only">Send</span></Button></div>
                            </form>
                        </footer>
                    </div>

                    <AnimatePresence>
                        {activeThreadId && originalThreadMessage && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: '400px', opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="flex-shrink-0 h-screen flex flex-col border-l border-border/50 bg-muted/30"
                            >
                                <div className="flex items-center justify-between p-4 border-b border-border/50 flex-shrink-0">
                                    <div>
                                        <h3 className="font-bold font-headline">Thread</h3>
                                        <p className="text-sm text-muted-foreground">{activeChat?.name}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => setActiveThreadId(null)}><X className="h-4 w-4" /></Button>
                                </div>

                                <ScrollArea className="flex-1 p-4">
                                     <div className="space-y-4">
                                        <div className="p-3 rounded-lg border border-border bg-background">
                                            <div className="flex items-center gap-2 mb-2"><Avatar className="h-6 w-6"><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="person"/><AvatarFallback>{originalThreadMessage.senderName.substring(0,1)}</AvatarFallback></Avatar><p className="font-bold text-sm">{originalThreadMessage.senderName}</p><p className="text-xs text-muted-foreground">{formatTimestamp(originalThreadMessage.timestamp)}</p></div>
                                            <p className="text-sm">{originalThreadMessage.text}</p>
                                        </div>
                                        <div className="my-2 border-b border-border/50 text-center"><span className="bg-muted/30 px-2 text-xs text-muted-foreground">{threadMessages.length} {threadMessages.length === 1 ? 'reply' : 'replies'}</span></div>
                                        <div className="space-y-6">
                                            {threadMessages.map(msg => <MessageItem key={msg.key} msg={msg} />)}
                                            <div ref={threadMessagesEndRef} />
                                        </div>
                                    </div>
                                </ScrollArea>
                                
                                <div className="p-4 border-t border-border/50 flex-shrink-0">
                                    <form onSubmit={(e) => handleFormSubmit(e, true)}>
                                        <div className="relative"><Input placeholder={`Reply to ${originalThreadMessage.senderName}`} className="h-10 pr-12 text-sm" value={threadReplyMessage} onChange={(e) => setThreadReplyMessage(e.target.value)} disabled={isSending} /><Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8" disabled={!threadReplyMessage.trim() || isSending}><SendHorizontal className="h-4 w-4"/><span className="sr-only">Reply</span></Button></div>
                                    </form>
                                </div>

                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </SidebarProvider>
        <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete the message.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDeleteMessage} className={cn(buttonVariants({ variant: "destructive" }))}>Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    