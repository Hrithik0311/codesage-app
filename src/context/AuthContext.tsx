
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref as dbRef, onValue, set, onDisconnect, serverTimestamp, remove, get } from 'firebase/database';


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
  completedLessons: Set<string>;
  completeLesson: (lessonId: string) => void;
  resetCompletedLessons: () => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, notifications: [], markNotificationsAsRead: () => {}, completedLessons: new Set(), completeLesson: () => {}, resetCompletedLessons: () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [completedLessons, setCompletedLessons] = useState(new Set<string>());

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

  // Effect to handle user presence, name sync, and data fetching
  useEffect(() => {
    if (user && database) {
        // Sync user's display name to the database
        if (user.displayName) {
          const userNameRef = dbRef(database, `users/${user.uid}/name`);
          set(userNameRef, user.displayName);
        }

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

        const lessonsRef = dbRef(database, `users/${user.uid}/completedLessons`);
        const lessonsSub = onValue(lessonsRef, (snapshot) => {
            const data = snapshot.val() || {};
            setCompletedLessons(new Set(Object.keys(data)));
        });

        // This is the cleanup function for THIS effect.
        return () => {
            connectedSub();
            notificationsSub();
            lessonsSub();
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
        setCompletedLessons(new Set());
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

  const completeLesson = (lessonId: string) => {
    if (user && database && !completedLessons.has(lessonId)) {
        const newCompletedLessons = new Set(completedLessons);
        newCompletedLessons.add(lessonId);
        setCompletedLessons(newCompletedLessons);

        const lessonRef = dbRef(database, `users/${user.uid}/completedLessons/${lessonId}`);
        set(lessonRef, true);
    }
  };

  const resetCompletedLessons = () => {
    if (user && database) {
      const lessonsRef = dbRef(database, `users/${user.uid}/completedLessons`);
      remove(lessonsRef).then(() => {
        setCompletedLessons(new Set());
      });
    }
  };

  const value = { user, loading, notifications, markNotificationsAsRead, completedLessons, completeLesson, resetCompletedLessons };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
