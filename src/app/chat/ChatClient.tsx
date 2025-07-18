
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ref as dbRef, onValue, get, set, push, update, serverTimestamp, query, orderByChild, remove } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, SendHorizontal, MoreHorizontal, ChevronLeft, Moon, Sun, Plus, Video, Phone, Users, Paperclip, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { formatDistanceToNowStrict } from 'date-fns';
import { useTheme } from 'next-themes';
import { Smile } from 'lucide-react';

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
    status?: 'online' | 'away' | 'busy' | 'offline';
}

type LoadingState = 'initializing' | 'ready';


// --- Helper Functions ---
const formatTimestamp = (timestamp: number | undefined): string => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// --- Main Component ---
export default function ChatClient() {
  const { user, loading: authLoading, database } = useAuth();
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
  const [activeFilter, setActiveFilter] = useState('all');

  // --- UI State ---
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);
  const activeChatUser = useMemo(() => {
    if (activeChat?.type === 'dm') {
        const otherUserId = Object.keys(activeChat.members || {}).find(id => id !== user?.uid);
        return allUsers.find(u => u.id === otherUserId);
    }
    return null;
  }, [activeChat, user, allUsers]);

  useEffect(() => {
    if (authLoading || !user || !database) return;

    setLoadingState('initializing');
    let chatsUnsubscribe = () => {};

    const usersRef = dbRef(database, 'users');
    get(usersRef).then(usersSnapshot => {
        const usersData = usersSnapshot.val() || {};
        const loadedUsers: PlatformUser[] = Object.entries(usersData).map(([id, data]: [string, any]) => ({
            id,
            name: data.name || `User...${id.substring(0,4)}`,
            role: '',
            status: 'offline', // default status
        }));
        
        // Listen for status changes
        const statusRef = dbRef(database, 'status');
        onValue(statusRef, (statusSnapshot) => {
            const statuses = statusSnapshot.val() || {};
            setAllUsers(prevUsers => prevUsers.map(u => ({
                ...u,
                status: statuses[u.id]?.state || 'offline'
            })));
        });

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
  }, [user, authLoading, toast, activeChatId, database]);

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

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async () => {
    const textToSend = newMessage;
    if (!textToSend.trim() || !user || !activeChat || isSending || !database) return;
    
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
  }, [user, database, chats, toast]);

    const filteredUsers = searchTerm ? allUsers.filter(m => m.id !== user?.uid && m.name.toLowerCase().includes(searchTerm.toLowerCase())) : [];

    const filteredChats = useMemo(() => {
        if (activeFilter === 'all') return chats;
        if (activeFilter === 'unread') return chats.filter(c => false); // Unread logic needed
        if (activeFilter === 'groups') return chats.filter(c => c.type === 'channel');
        if (activeFilter === 'dm') return chats.filter(c => c.type === 'dm');
        return chats;
    }, [activeFilter, chats]);

  if (loadingState === 'initializing') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-color">
        <div className="loading-spinner"></div>
      </div>
    );
  }
  
  const messageInputPlaceholder = `Message ${activeChat?.name || '...'}`;

  const ChatSidebar = (
    <div className={cn("cs-sidebar", isSidebarCollapsed && "collapsed")}>
        <div className="cs-sidebar-header">
            <div className="cs-logo" style={{ display: isSidebarCollapsed ? 'none' : 'flex' }}>
                <MessageSquare className="cs-logo-icon" />
                <span>Chat</span>
            </div>
            <div className="cs-sidebar-controls">
                <button className="cs-control-btn" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                 <button className="cs-control-btn" title="Collapse sidebar" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                     <ChevronLeft size={16} className={cn('transition-transform', isSidebarCollapsed && 'rotate-180')} />
                 </button>
            </div>
        </div>
        <div className={cn("p-4", isSidebarCollapsed && "hidden")}>
             <button className="cs-compose-btn w-full justify-center" onClick={() => toast({title: "Coming Soon!", description: "Creating new spaces will be available in a future update."})}>
                <Plus size={16} className="mr-2"/>
                New Chat
            </button>
        </div>
        <div className={cn("cs-search-container", isSidebarCollapsed && "hidden")}>
            <input 
                type="text" 
                className="cs-search-input" 
                placeholder="Search" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <Search size={16} className="cs-search-icon" />
        </div>
        <div className={cn("cs-filters", isSidebarCollapsed && "hidden")}>
          <div className={cn("cs-filter-chip", activeFilter === 'all' && 'active')} onClick={() => setActiveFilter('all')}>All</div>
          <div className={cn("cs-filter-chip", activeFilter === 'unread' && 'active')} onClick={() => setActiveFilter('unread')}>Unread</div>
          <div className={cn("cs-filter-chip", activeFilter === 'groups' && 'active')} onClick={() => setActiveFilter('groups')}>Groups</div>
          <div className={cn("cs-filter-chip", activeFilter === 'dm' && 'active')} onClick={() => setActiveFilter('dm')}>Direct</div>
        </div>
        <div className="cs-chat-list">
            {searchTerm ? (
                filteredUsers.length > 0 ? (
                    filteredUsers.map(u => (
                         <div key={u.id} className="cs-chat-item" onClick={() => handleStartChat(u)}>
                            <div className="cs-avatar"><span>{u.name.substring(0,2).toUpperCase()}</span></div>
                            <div className={cn("cs-chat-preview", isSidebarCollapsed && "hidden")}>
                                <div className="cs-chat-name">{u.name}</div>
                            </div>
                        </div>
                    ))
                ) : <p className={cn("text-center text-sm cs-text-secondary p-4", isSidebarCollapsed && 'hidden')}>No users found.</p>
            ) : (
                 filteredChats.map(chat => {
                    const otherUserId = chat.type === 'dm' ? Object.keys(chat.members || {}).find(id => id !== user?.uid) : null;
                    const otherUser = otherUserId ? allUsers.find(u => u.id === otherUserId) : null;
                    const status = otherUser?.status || 'offline';
                    
                    return (
                    <div key={chat.id} className={cn("cs-chat-item", activeChatId === chat.id && 'active')} onClick={() => setActiveChatId(chat.id)}>
                        <div className="cs-avatar">
                            <span>{chat.name.substring(0,2).toUpperCase()}</span>
                            {chat.type === 'dm' && <div className={cn("cs-status-indicator", `status-${status}`)}></div>}
                        </div>
                        <div className={cn("cs-chat-preview", isSidebarCollapsed && "hidden")}>
                            <div className="cs-chat-header-info">
                                <div className="cs-chat-name">{chat.name}</div>
                                <div className="cs-chat-time">{formatTimestamp(chat.lastMessage?.timestamp)}</div>
                            </div>
                            <div className="cs-chat-last-message">
                                {chat.type === 'channel' && <Users size={12} className="mr-1" />}
                                {chat.lastMessage?.text || "No messages yet"}
                            </div>
                        </div>
                    </div>
                 )})
            )}
        </div>
    </div>
  )

  const MessageItem = ({ msg }: { msg: Message }) => {
    const isSender = msg.senderId === user?.uid;
    return (
        <div className={cn("cs-message", isSender ? "sent" : "received")}>
            <div className="cs-message-content">
                <div className="cs-message-bubble">
                    {!isSender && <p className="font-bold text-sm mb-1 cs-text-primary-color">{msg.senderName}</p>}
                    <p>{msg.text}</p>
                </div>
                 <div className="cs-message-meta">
                    <span className="cs-message-time">{formatTimestamp(msg.timestamp)}</span>
                 </div>
            </div>
        </div>
    )
  }

  return (
    <div className="cs-chat-container">
        {ChatSidebar}
        <div className="cs-main-chat">
            <div className="cs-chat-header">
                <div className="cs-chat-title">
                    {activeChat && (
                      <>
                        <div className="cs-avatar">
                            <span>{activeChat.name.substring(0,2).toUpperCase()}</span>
                            {activeChat.type === 'dm' && <div className={cn("cs-status-indicator", `status-${activeChatUser?.status || 'offline'}`)}></div>}
                        </div>
                        <div className="cs-chat-info">
                            <h3>{activeChat.name}</h3>
                            <div className="cs-chat-status">
                                {activeChat.type === 'dm' && <>
                                 <div className={cn("w-2 h-2 rounded-full", activeChatUser?.status === 'online' ? 'bg-green-500' : 'bg-gray-400')}></div>
                                 {activeChatUser?.status === 'online' ? 'Active now' : 'Offline'}
                                </>}
                                {activeChat.type === 'channel' && <><Users size={12} /> {Object.keys(activeChat.members || {}).length} members</>}
                            </div>
                        </div>
                      </>
                    )}
                </div>
                <div className="cs-chat-actions">
                    <button className="cs-action-btn"><Video size={20}/></button>
                    <button className="cs-action-btn"><Phone size={20}/></button>
                    <button className="cs-action-btn"><Search size={20}/></button>
                    <button className="cs-action-btn"><MoreHorizontal size={20}/></button>
                </div>
            </div>
            <div className="cs-messages-container" ref={messagesEndRef}>
              <div className="cs-date-separator"><span>Today</span></div>
              {messages.map(msg => <MessageItem key={msg.key} msg={msg} />)}
            </div>
            <div className="cs-input-container">
                <div className="cs-input-wrapper">
                     <div className="cs-input-tools">
                        <button className="cs-input-tool" title="Attach file"><Paperclip size={20} /></button>
                        <button className="cs-input-tool" title="Add emoji"><Smile size={20} /></button>
                        <button className="cs-input-tool" title="Record voice note"><Mic size={20} /></button>
                    </div>
                    <Textarea
                        className="cs-message-input"
                        placeholder={messageInputPlaceholder}
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        disabled={!activeChatId}
                    />
                    <button className={cn("cs-send-btn", newMessage.trim() && "active")} onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                        <SendHorizontal size={16}/>
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}
