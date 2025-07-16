
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
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

const { auth, database } = getFirebaseServices();

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
    let connectedSub = () => {};
    let lessonsSub = () => {};
    let settingsSub = () => {};

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
                if (!lesson) return; // Skip if the lesson isn't in our known list

                let isPassed = false;
                if (lesson.type === 'test' && lesson.passingScore) {
                    // For tests, the score is a raw value. Compare against the test's passingScore.
                    if (score >= lesson.passingScore) {
                        isPassed = true;
                    }
                } else if (lesson.type !== 'test') {
                    // For lessons/quizzes, the score is a percentage (0-1).
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
                // If no settings exist in DB, set default ones.
                set(settingsRef, { email: false, inApp: true });
            }
        });

        // Mock notifications for demonstration
        setNotifications([
          { id: '1', title: 'New Team Share', description: 'Alice shared "Autonomous.java"', link: '/collaboration', timestamp: Date.now() - 1000 * 60 * 5, read: false },
          { id: '2', title: 'Lesson Complete!', description: 'You passed the "Mecanum Drive" lesson.', link: '/learning', timestamp: Date.now() - 1000 * 60 * 60 * 2, read: true },
        ]);


        // This is the cleanup function for THIS effect.
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

  const updateLessonProgress = (lessonId: string, score: number) => {
    if (user && database) {
        const lessonRef = dbRef(database, `users/${user.uid}/lessonProgress/${lessonId}`);
        set(lessonRef, score);
    }
  };
  
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
      if (user && database) {
        const settingsRef = dbRef(database, `users/${user.uid}/notificationSettings`);
        update(settingsRef, settings); // Use update to change specific fields
      }
  };

  const resetAllProgress = () => {
    if (user && database) {
      const lessonsRef = dbRef(database, `users/${user.uid}/lessonProgress`);
      remove(lessonsRef).then(() => {
        setLessonProgress(new Map());
        setPassedLessonIds(new Set());
      });
    }
  };

  const resetCourseProgress = (lessonIdsToRemove: string[]) => {
    if (user && database) {
        const updates: { [key: string]: null } = {};
        lessonIdsToRemove.forEach(id => {
            updates[`/users/${user.uid}/lessonProgress/${id}`] = null;
        });
        update(dbRef(database), updates);
    }
  };

  const deleteAccountData = async () => {
      if (user && database) {
        const userRootRef = dbRef(database, `users/${user.uid}`);
        await remove(userRootRef);
        
        const userStatusRef = dbRef(database, `status/${user.uid}`);
        await remove(userStatusRef);
        
        // TODO: Also remove user from any teams they are in
      }
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // In a real app, you would also update the database here.
  }

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
