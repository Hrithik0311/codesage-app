
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { database } from '@/lib/firebase';
import { ref as dbRef, onValue, get, set, push, update, serverTimestamp, query, orderByChild, remove, runTransaction } from 'firebase/database';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, SendHorizontal, MoreHorizontal, Trash2, Pencil, Reply, X, SmilePlus, ChevronLeft, Moon, Sun, Plus, Video, Phone, Users } from 'lucide-react';
import { UserProfile } from '@/components/UserProfile';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { smartCompose } from '@/ai/flows/smart-compose';
import { useTheme } from 'next-themes';

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
    reactions?: { [emoji: string]: string[] }; // emoji -> array of user IDs
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
    // Format to time like "2:30 PM"
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  // --- Smart Compose State ---
  const [suggestion, setSuggestion] = useState('');

  // --- UI State ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

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
              let hint: Chat['hint'] = meta.type === 'dm' ? 'person' : 'megaphone';
              
              if (meta.type === 'dm') {
                  const otherUserId = Object.keys(meta.members || {}).find(id => id !== user.uid);
                  if (otherUserId) {
                      name = usersById.get(otherUserId) || 'Unknown User';
                  } else {
                      name = 'Direct Message';
                  }
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
        setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [activeChatId, database]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [mainMessages]);

  const handleSendMessage = async () => {
    const textToSend = newMessage;
    if (!textToSend.trim() || !user || !activeChat || isSending) return;
    
    setIsSending(true);
    setNewMessage("");

    try {
        const myName = allUsers.find(u => u.id === user.uid)?.name || user.displayName || user.email?.split('@')[0];
        if (!myName) throw new Error("Could not verify your identity to send message.");

        const messageData: Omit<Message, 'key'> = { 
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
      const myName = allUsers.find(m => m.id === user.uid)?.name || user.displayName || 'Me';
      const chatData = { metadata: { type: 'dm', members: { [user.uid]: true, [userToChat.id]: true } } };
      await set(newChatRef, chatData);
      const updates: { [key:string]: any } = {};
      updates[`/users/${user.uid}/chats/${newChatId}`] = true;
      updates[`/users/${userToChat.id}/chats/${newChatId}`] = true;
      await update(dbRef(database), updates);
      setSearchTerm("");
  }, [user, database, chats, toast, allUsers]);

    const filteredUsers = searchTerm ? allUsers.filter(m => m.id !== user?.uid && m.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];


  if (loadingState === 'initializing') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  const messageInputPlaceholder = `Message ${activeChat?.name || '...'}`;

  const ChatSidebar = (
    <div className={cn("sidebar", isSidebarCollapsed && "collapsed")}>
        <div className="sidebar-header">
            <div className="logo">
                <MessageSquare className="text-primary-color" />
                <span id="logoText" className={cn(isSidebarCollapsed && "hidden")}>Chat</span>
            </div>
            <div className="sidebar-controls">
                <button className="control-btn" title="Toggle Theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button className="control-btn" title="Collapse Sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                    <ChevronLeft size={16} className={cn('transition-transform', isSidebarCollapsed && 'rotate-180')} />
                </button>
            </div>
        </div>
        <div className={cn("search-container", isSidebarCollapsed && "hidden")}>
            <input type="text" className="search-input" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <Search size={16} className="search-icon" />
        </div>
        <div className={cn("filters", isSidebarCollapsed && "hidden")}>
          <div className="filter-chip active">All</div>
          <div className="filter-chip">Unread</div>
          <div className="filter-chip">Groups</div>
          <div className="filter-chip">Direct</div>
        </div>
        <div className="chat-list">
            {searchTerm ? (
                filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                         <div key={u.id} className="chat-item" onClick={() => handleStartChat(u)}>
                            <div className="avatar"><span>{u.name.substring(0,1)}</span></div>
                            <div className={cn("chat-preview", isSidebarCollapsed && "hidden")}>
                                <div className="chat-name">{u.name}</div>
                            </div>
                        </div>
                    ))
                ) : <p className={cn("text-center text-sm text-text-secondary p-4", isSidebarCollapsed && 'hidden')}>No users found.</p>
            ) : (
                 chats.map(chat => (
                    <div key={chat.id} className={cn("chat-item", activeChatId === chat.id && 'active')} onClick={() => setActiveChatId(chat.id)}>
                        <div className="avatar"><span>{chat.name.substring(0,2).toUpperCase()}</span></div>
                        <div className={cn("chat-preview", isSidebarCollapsed && "hidden")}>
                            <div className="chat-header-info">
                                <div className="chat-name">{chat.name}</div>
                                <div className="chat-time">{formatTimestamp(chat.lastMessage?.timestamp)}</div>
                            </div>
                            <div className="chat-last-message">
                                {chat.type === 'channel' && <Users size={12} className="mr-1" />}
                                {chat.lastMessage?.text || "No messages yet"}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className={cn("p-4", isSidebarCollapsed && "hidden")}>
            <button className="compose-btn" onClick={() => toast({title: "Coming Soon!", description: "Creating new spaces will be available in a future update."})}>
                <Plus size={16}/>
                <span>New Chat</span>
            </button>
        </div>
    </div>
  )

  const MessageItem = ({ msg }: { msg: Message }) => {
    const isSender = msg.senderId === user?.uid;
    return (
        <div className={cn("message", isSender ? "sent" : "received")}>
          <div className="message-content">
            <div className="message-bubble">{msg.text}</div>
            <div className="message-meta">
              <span className="message-time">{formatTimestamp(msg.timestamp)}</span>
            </div>
          </div>
        </div>
    )
  }

  return (
    <div className="chat-container">
        {ChatSidebar}
        <div className="main-chat">
            <div className="chat-header">
                <div className="chat-title">
                    {activeChat && (
                      <>
                        <div className="avatar" id="currentChatAvatar">
                            <span>{activeChat.name.substring(0,2).toUpperCase()}</span>
                        </div>
                        <div className="chat-info">
                            <h3 id="currentChatName">{activeChat.name}</h3>
                            <div className="chat-status" id="currentChatStatusText">
                                <div className="w-2 h-2 rounded-full bg-success-color mr-1"></div>
                                Active now
                            </div>
                        </div>
                      </>
                    )}
                </div>
                <div className="chat-actions">
                    <button className="action-btn" title="Start video call"><Video size={20}/></button>
                    <button className="action-btn" title="Start voice call"><Phone size={20}/></button>
                    <button className="action-btn" title="Search in chat"><Search size={20}/></button>
                    <button className="action-btn" title="More options"><MoreHorizontal size={20}/></button>
                </div>
            </div>
            <div className="messages-container" ref={messagesEndRef}>
              <div className="date-separator"><span>Today</span></div>
              {messages.map(msg => <MessageItem key={msg.key} msg={msg} />)}
            </div>
            <div className="input-container">
                <div className="input-wrapper">
                    <div className="input-tools">
                        <button className="input-tool" title="Attach file"><Plus size={20}/></button>
                        <button className="input-tool" title="Add emoji"><SmilePlus size={20}/></button>
                    </div>
                    <textarea 
                        className="message-input" 
                        id="messageInput" 
                        placeholder={messageInputPlaceholder}
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        disabled={!activeChatId}
                    ></textarea>
                    <button className={cn("send-btn", newMessage.trim() && 'active')} onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                        <SendHorizontal size={16}/>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
