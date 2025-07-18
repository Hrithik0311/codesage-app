
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User, type Auth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue, set, onDisconnect, serverTimestamp, remove, update, type Database } from 'firebase/database';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';

// --- Firebase Initialization ---
const firebaseConfig = {
  apiKey: "AIzaSyANXI_daofPZ9TOwAEBKsV0xAc3RzPi0KU",
  authDomain: "work-ftc.firebaseapp.com",
  databaseURL: "https://work-ftc-default-rtdb.firebaseio.com",
  projectId: "work-ftc",
  storageBucket: "work-ftc.appspot.com",
  messagingSenderId: "899528797860",
  appId: "1:899528797860:web:68a1a471d44192738d4031",
  measurementId: "G-9L13PTJ89L"
};

let app: FirebaseApp;
let auth: Auth;
let database: Database;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  database = getDatabase(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}
// --- End Firebase Initialization ---


interface Notification {
    id: string;
    title: string;
    description: string;
    link: string;
    timestamp: number;
    read: boolean;
}

interface NotificationSettings {
    email: boolean;
    inApp: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  lessonProgress: Map<string, number>; // lessonId -> score (0 to 1 for quizzes, raw for tests)
  passedLessonIds: Set<string>;
  updateLessonProgress: (lessonId: string, score: number) => void;
  resetAllProgress: () => void;
  resetCourseProgress: (lessonIds: string[]) => void;
  deleteAccountData: () => Promise<void>;
  notifications: Notification[];
  markNotificationsAsRead: () => void;
  notificationSettings: NotificationSettings;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  auth: Auth | null;
  database: Database | null;
  firebaseReady: boolean;
}

const AuthContext = createContext<AuthContextType>({ 
    user: null, 
    loading: true, 
    lessonProgress: new Map(), 
    passedLessonIds: new Set(), 
    updateLessonProgress: () => {}, 
    resetAllProgress: () => {}, 
    resetCourseProgress: () => {}, 
    deleteAccountData: async () => {}, 
    notifications: [], 
    markNotificationsAsRead: () => {}, 
    notificationSettings: { email: false, inApp: true }, 
    updateNotificationSettings: () => {},
    auth: null,
    database: null,
    firebaseReady: false
});

const allLessons = [...ftcJavaLessons, ...ftcJavaLessonsIntermediate, ...ftcJavaLessonsAdvanced];
const lessonsById = new Map(allLessons.map(l => [l.id, l]));

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(new Map<string, number>());
  const [passedLessonIds, setPassedLessonIds] = useState(new Set<string>());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ email: false, inApp: true });

  const firebaseReady = !!app;

  useEffect(() => {
    if (!firebaseReady) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [firebaseReady]);

  useEffect(() => {
    let connectedSub = () => {};
    let lessonsSub = () => {};
    let settingsSub = () => {};

    if (user && firebaseReady) {
        if (user.displayName) {
          const userNameRef = dbRef(database, `users/${user.uid}/name`);
          set(userNameRef, user.displayName);
        }

        const userStatusDatabaseRef = dbRef(database, `/status/${user.uid}`);
        const connectedRef = dbRef(database, '.info/connected');

        let idleTimer: NodeJS.Timeout;

        const resetIdleTimer = () => {
            clearTimeout(idleTimer);
            set(userStatusDatabaseRef, {
                state: 'online',
                last_changed: serverTimestamp(),
            });
            idleTimer = setTimeout(() => {
                set(userStatusDatabaseRef, {
                    state: 'idle',
                    last_changed: serverTimestamp(),
                });
            }, 300000); // 5 minutes
        };

        connectedSub = onValue(connectedRef, (snap) => {
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
        
        const lessonsRef = dbRef(database, `users/${user.uid}/lessonProgress`);
        lessonsSub = onValue(lessonsRef, (snapshot) => {
            const data: Record<string, number> = snapshot.val() || {};
            const newLessonProgress = new Map(Object.entries(data));
            setLessonProgress(newLessonProgress);

            const newPassedLessonIds = new Set<string>();
            const PASS_THRESHOLD = 2 / 3;

            newLessonProgress.forEach((score, lessonId) => {
                const lesson = lessonsById.get(lessonId);
                if (!lesson) return;

                let isPassed = false;
                if (lesson.type === 'test' && lesson.passingScore) {
                    if (score >= lesson.passingScore) {
                        isPassed = true;
                    }
                } else if (lesson.type !== 'test') {
                    if (score >= PASS_THRESHOLD) {
                        isPassed = true;
                    }
                }

                if (isPassed) {
                    newPassedLessonIds.add(lessonId);
                }
            });
            setPassedLessonIds(newPassedLessonIds);
        });

        const settingsRef = dbRef(database, `users/${user.uid}/notificationSettings`);
        settingsSub = onValue(settingsRef, (snapshot) => {
            const data: NotificationSettings = snapshot.val();
            if (data) {
                setNotificationSettings(data);
            } else {
                set(settingsRef, { email: false, inApp: true });
            }
        });

        setNotifications([
          { id: '1', title: 'New Team Share', description: 'Alice shared "Autonomous.java"', link: '/collaboration', timestamp: Date.now() - 1000 * 60 * 5, read: false },
          { id: '2', title: 'Lesson Complete!', description: 'You passed the "Mecanum Drive" lesson.', link: '/learning', timestamp: Date.now() - 1000 * 60 * 60 * 2, read: true },
        ]);

        return () => {
            connectedSub();
            lessonsSub();
            settingsSub();
            window.removeEventListener('mousemove', resetIdleTimer);
            window.removeEventListener('keydown', resetIdleTimer);
            window.removeEventListener('scroll', resetIdleTimer);
            clearTimeout(idleTimer);
            if (userStatusDatabaseRef) {
                remove(userStatusDatabaseRef);
            }
        };
      } else {
        setLessonProgress(new Map());
        setPassedLessonIds(new Set());
        setNotifications([]);
      }
  }, [user, firebaseReady]);

  const updateLessonProgress = useCallback((lessonId: string, score: number) => {
    if (user && firebaseReady) {
        const lessonRef = dbRef(database, `users/${user.uid}/lessonProgress/${lessonId}`);
        set(lessonRef, score);
    }
  }, [user, firebaseReady]);
  
  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
      if (user && firebaseReady) {
        const settingsRef = dbRef(database, `users/${user.uid}/notificationSettings`);
        update(settingsRef, settings);
      }
  }, [user, firebaseReady]);

  const resetAllProgress = useCallback(() => {
    if (user && firebaseReady) {
      const lessonsRef = dbRef(database, `users/${user.uid}/lessonProgress`);
      remove(lessonsRef).then(() => {
        setLessonProgress(new Map());
        setPassedLessonIds(new Set());
      });
    }
  }, [user, firebaseReady]);

  const resetCourseProgress = useCallback((lessonIdsToRemove: string[]) => {
    if (user && firebaseReady) {
        const updates: { [key: string]: null } = {};
        lessonIdsToRemove.forEach(id => {
            updates[`/users/${user.uid}/lessonProgress/${id}`] = null;
        });
        update(dbRef(database), updates);
    }
  }, [user, firebaseReady]);

  const deleteAccountData = useCallback(async () => {
      if (user && firebaseReady) {
        const userRootRef = dbRef(database, `users/${user.uid}`);
        await remove(userRootRef);
        
        const userStatusRef = dbRef(database, `status/${user.uid}`);
        await remove(userStatusRef);
      }
  }, [user, firebaseReady]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = { 
      user, 
      loading, 
      lessonProgress, 
      passedLessonIds, 
      updateLessonProgress, 
      resetAllProgress, 
      resetCourseProgress, 
      deleteAccountData, 
      notifications, 
      markNotificationsAsRead, 
      notificationSettings, 
      updateNotificationSettings,
      auth: firebaseReady ? auth : null,
      database: firebaseReady ? database : null,
      firebaseReady: firebaseReady
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
