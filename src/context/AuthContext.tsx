
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref as dbRef, onValue, set, onDisconnect, serverTimestamp, remove, update } from 'firebase/database';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';


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
  lessonProgress: Map<string, number>; // lessonId -> score (0 to 1 for quizzes, raw for tests)
  passedLessonIds: Set<string>;
  updateLessonProgress: (lessonId: string, score: number) => void;
  resetAllProgress: () => void;
  resetCourseProgress: (lessonIds: string[]) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, notifications: [], markNotificationsAsRead: () => {}, lessonProgress: new Map(), passedLessonIds: new Set(), updateLessonProgress: () => {}, resetAllProgress: () => {}, resetCourseProgress: () => {} });

// Create a single source of truth for all lesson data
const allLessons = [...ftcJavaLessons, ...ftcJavaLessonsIntermediate, ...ftcJavaLessonsAdvanced];
const lessonsById = new Map(allLessons.map(l => [l.id, l]));

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lessonProgress, setLessonProgress] = useState(new Map<string, number>());
  const [passedLessonIds, setPassedLessonIds] = useState(new Set<string>());


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
        
        const lessonsRef = dbRef(database, `users/${user.uid}/lessonProgress`);
        const lessonsSub = onValue(lessonsRef, (snapshot) => {
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
        setLessonProgress(new Map());
        setPassedLessonIds(new Set());
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

  const updateLessonProgress = (lessonId: string, score: number) => {
    if (user && database) {
        const lessonRef = dbRef(database, `users/${user.uid}/lessonProgress/${lessonId}`);
        set(lessonRef, score);
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

  const value = { user, loading, notifications, markNotificationsAsRead, lessonProgress, passedLessonIds, updateLessonProgress, resetAllProgress, resetCourseProgress };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
