
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref as dbRef, onValue, set, onDisconnect, serverTimestamp, remove } from 'firebase/database';


export interface Notification {
  id: string;
  title: string;
  description: string;
  link: string;
  timestamp: number;
  read: boolean;
  senderId: string;
  chatId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  notifications: Notification[];
  markNotificationsAsRead: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, notifications: [], markNotificationsAsRead: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Effect to handle basic auth state changes
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      setUser(null);
      return;
    }
    // Listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup the auth listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Effect to handle user presence and notifications
  useEffect(() => {
    if (user && database) {
        const userStatusDatabaseRef = dbRef(database, `/status/${user.uid}`);
        const connectedRef = dbRef(database, '.info/connected');

        let idleTimer: NodeJS.Timeout;

        const resetIdleTimer = () => {
            set(userStatusDatabaseRef, {
                state: 'online',
                last_changed: serverTimestamp(),
            });
            clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                set(userStatusDatabaseRef, {
                    state: 'idle',
                    last_changed: serverTimestamp(),
                });
            }, 300000); // 5 minutes
        };

        const connectedSub = onValue(connectedRef, (snap) => {
            if (snap.val() === true) {
                onDisconnect(userStatusDatabaseRef).set({
                    state: 'offline',
                    last_changed: serverTimestamp(),
                }).then(() => {
                    resetIdleTimer();
                    window.addEventListener('mousemove', resetIdleTimer);
                    window.addEventListener('keydown', resetIdleTimer);
                    window.addEventListener('scroll', resetIdleTimer);
                });
            }
        });

        const notificationsRef = dbRef(database, `notifications/${user.uid}`);
        const notificationsSub = onValue(notificationsRef, (snapshot) => {
            const data = snapshot.val() || {};
            const newNotifications = Object.entries(data).map(([id, value]) => ({
              id,
              ...(value as Omit<Notification, 'id'>),
            })).sort((a, b) => b.timestamp - a.timestamp);
            setNotifications(newNotifications);
        });

        // This is the cleanup function for THIS effect.
        return () => {
            connectedSub();
            notificationsSub();
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('scroll', resetIdleTimer);
            clearTimeout(idleTimer);
            if (userStatusDatabaseRef) {
                set(userStatusDatabaseRef, {
                    state: 'offline',
                    last_changed: serverTimestamp(),
                });
            }
        };
      } else {
        setNotifications([]);
      }
  }, [user]);

  const markNotificationsAsRead = () => {
    if (user && database && notifications.length > 0) {
      const userNotificationsRef = dbRef(database, `notifications/${user.uid}`);
      // This simply removes all notifications for the user.
      // A more advanced system might mark them as read instead.
      remove(userNotificationsRef);
    }
  };

  const value = { user, loading, notifications, markNotificationsAsRead };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
