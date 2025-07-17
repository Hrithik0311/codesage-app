
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getFirebaseServices } from '@/lib/firebase';
import { ref as dbRef, onValue, set, onDisconnect, serverTimestamp, remove, update } from 'firebase/database';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';

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
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, lessonProgress: new Map(), passedLessonIds: new Set(), updateLessonProgress: () => {}, resetAllProgress: () => {}, resetCourseProgress: () => {}, deleteAccountData: async () => {}, notifications: [], markNotificationsAsRead: () => {}, notificationSettings: { email: false, inApp: true }, updateNotificationSettings: () => {} });

// Create a single source of truth for all lesson data
const allLessons = [...ftcJavaLessons, ...ftcJavaLessonsIntermediate, ...ftcJavaLessonsAdvanced];
const lessonsById = new Map(allLessons.map(l => [l.id, l]));

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(new Map<string, number>());
  const [passedLessonIds, setPassedLessonIds] = useState(new Set<string>());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ email: false, inApp: true });

  useEffect(() => {
    const { auth } = getFirebaseServices();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let connectedSub = () => {};
    let lessonsSub = () => {};
    let settingsSub = () => {};

    if (user) {
        const { database } = getFirebaseServices();
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
  }, [user]);

  const updateLessonProgress = useCallback((lessonId: string, score: number) => {
    if (user) {
        const { database } = getFirebaseServices();
        const lessonRef = dbRef(database, `users/${user.uid}/lessonProgress/${lessonId}`);
        set(lessonRef, score);
    }
  }, [user]);
  
  const updateNotificationSettings = useCallback((settings: Partial<NotificationSettings>) => {
      if (user) {
        const { database } = getFirebaseServices();
        const settingsRef = dbRef(database, `users/${user.uid}/notificationSettings`);
        update(settingsRef, settings);
      }
  }, [user]);

  const resetAllProgress = useCallback(() => {
    if (user) {
      const { database } = getFirebaseServices();
      const lessonsRef = dbRef(database, `users/${user.uid}/lessonProgress`);
      remove(lessonsRef).then(() => {
        setLessonProgress(new Map());
        setPassedLessonIds(new Set());
      });
    }
  }, [user]);

  const resetCourseProgress = useCallback((lessonIdsToRemove: string[]) => {
    if (user) {
        const { database } = getFirebaseServices();
        const updates: { [key: string]: null } = {};
        lessonIdsToRemove.forEach(id => {
            updates[`/users/${user.uid}/lessonProgress/${id}`] = null;
        });
        update(dbRef(database), updates);
    }
  }, [user]);

  const deleteAccountData = useCallback(async () => {
      if (user) {
        const { database } = getFirebaseServices();
        const userRootRef = dbRef(database, `users/${user.uid}`);
        await remove(userRootRef);
        
        const userStatusRef = dbRef(database, `status/${user.uid}`);
        await remove(userStatusRef);
      }
  }, [user]);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const value = { user, loading, lessonProgress, passedLessonIds, updateLessonProgress, resetAllProgress, resetCourseProgress, deleteAccountData, notifications, markNotificationsAsRead, notificationSettings, updateNotificationSettings };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
