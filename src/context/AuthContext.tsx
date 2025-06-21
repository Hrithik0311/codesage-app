
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref as dbRef, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database';


interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Effect to handle user presence, runs only when the user object changes
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

        // This is the cleanup function for THIS effect.
        // It runs when the user logs out (user becomes null) or the component unmounts.
        return () => {
            connectedSub(); // Detach the '.info/connected' listener
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('scroll', resetIdleTimer);
            clearTimeout(idleTimer);
            // Set user to offline immediately on cleanup
            if (userStatusDatabaseRef) {
                set(userStatusDatabaseRef, {
                    state: 'offline',
                    last_changed: serverTimestamp(),
                });
            }
        };
      }
  }, [user]); // Re-run this effect whenever the user object changes

  const value = { user, loading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
