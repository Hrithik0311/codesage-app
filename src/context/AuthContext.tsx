
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User, type Auth } from 'firebase/auth';
import { getDatabase, ref as dbRef, onValue, set, onDisconnect, serverTimestamp, remove, update, get, type Database, query, orderByChild, limitToLast } from 'firebase/database';
import { ftcJavaLessons } from '@/data/ftc-java-lessons';
import { ftcJavaLessonsIntermediate } from '@/data/ftc-java-lessons-intermediate';
import { ftcJavaLessonsAdvanced } from '@/data/ftc-java-lessons-advanced';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';


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

interface PopupMessage {
    id: string;
    title: string;
    message: string;
    timestamp?: number;
    type: 'announcement' | 'login_welcome';
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
    notificationSettings: { email: true, inApp: true }, 
    updateNotificationSettings: () => {},
    auth: null,
    database: null,
    firebaseReady: false
});

const allLessons = [...ftcJavaLessons, ...ftcJavaLessonsIntermediate, ...ftcJavaLessonsAdvanced];
const lessonsById = new Map(allLessons.map(l => [l.id, l]));

function createNotification(activityId: string, activityData: any): Notification | null {
  const { type, userName, details, timestamp, userId } = activityData;
  
  let title = "New Activity";
  let description = `${userName} performed an action.`;
  let link = "/collaboration";
  
  switch(type) {
    case 'file':
    case 'snippet':
    case 'group':
      title = "New Code Share";
      description = `${userName} shared ${details?.groupName || details?.fileName || 'a code snippet'}.`;
      link = `/collaboration/ide?shareId=${activityId}`;
      break;
    case 'lesson_completion':
      title = "Lesson Complete!";
      description = `${userName} completed the lesson: ${details.lessonTitle}`;
      link = "/learning";
      break;
    case 'analysis':
        title = "Code Analysis Run";
        description = `${userName} ran an analysis on ${details.fileName}.`;
        link = '/code-intelligence';
        break;
    default:
        return null;
  }

  return { id: activityId, title, description, link, timestamp, read: false };
}

const PopupDisplay = ({ popup, onDismiss }: { popup: PopupMessage, onDismiss: () => void }) => {
    return (
        <Dialog open={!!popup} onOpenChange={onDismiss}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{popup.title}</DialogTitle>
                </DialogHeader>
                <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: popup.message }} />
                <DialogFooter>
                    <DialogClose asChild>
                        <Button onClick={onDismiss}>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonProgress, setLessonProgress] = useState(new Map<string, number>());
  const [passedLessonIds, setPassedLessonIds] = useState(new Set<string>());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({ email: true, inApp: true });
  const [popupToShow, setPopupToShow] = useState<PopupMessage | null>(null);
  const [seenAnnouncements, setSeenAnnouncements] = useLocalStorage<string[]>('seenAnnouncements', []);

  const firebaseReady = !!app;

  useEffect(() => {
    if (!firebaseReady) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            const isNewUser = currentUser.metadata.creationTime === currentUser.metadata.lastSignInTime;
            if (isNewUser) {
                const loginPopupRef = dbRef(database, 'popups/login');
                const snapshot = await get(loginPopupRef);
                if (snapshot.exists()) {
                    setPopupToShow({ id: 'login-welcome', type: 'login_welcome', ...snapshot.val() });
                }
            }
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [firebaseReady]);

  useEffect(() => {
    let connectedSub = () => {};
    let lessonsSub = () => {};
    let settingsSub = () => {};
    let notificationsSub = () => {};
    let announcementSub = () => {};

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
                set(settingsRef, { email: true, inApp: true });
            }
        });

         const teamCodeRef = dbRef(database, `users/${user.uid}/teamCode`);
         get(teamCodeRef).then((snapshot) => {
            if (snapshot.exists()) {
                const teamCode = snapshot.val();
                const activitiesRef = dbRef(database, `teams/${teamCode}/activities`);
                const recentActivitiesQuery = query(activitiesRef, orderByChild('timestamp'), limitToLast(20));
                
                notificationsSub = onValue(recentActivitiesQuery, (activitySnapshot) => {
                    const newNotifications: Notification[] = [];
                    const seenIds = new Set();
                    
                    activitySnapshot.forEach(child => {
                        const activity = { id: child.key, ...child.val() };
                        if (activity.userId !== user.uid) { // Don't notify for own actions
                            const notif = createNotification(activity.id, activity);
                            if(notif) {
                                newNotifications.push(notif);
                                seenIds.add(notif.id);
                            }
                        }
                    });
                    
                    // Merge with existing non-read notifications to avoid losing them
                    setNotifications(prev => {
                        const existingUnread = prev.filter(p => p.read && !seenIds.has(p.id));
                        const final = [...existingUnread, ...newNotifications.reverse()];
                        final.sort((a,b) => b.timestamp - a.timestamp);
                        return final;
                    });
                });
            }
         });
         
        const announcementsRef = query(dbRef(database, 'announcements'), limitToLast(1));
        announcementSub = onValue(announcementsRef, (snapshot) => {
            if (snapshot.exists()) {
                const announcementsData = snapshot.val();
                const [id, data] = Object.entries(announcementsData)[0] as [string, Omit<PopupMessage, 'id' | 'type'>];
                if (!seenAnnouncements.includes(id)) {
                    setPopupToShow({ id, type: 'announcement', ...data });
                }
            }
        });


        return () => {
            connectedSub();
            lessonsSub();
            settingsSub();
            notificationsSub();
            announcementSub();
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
  }, [user, firebaseReady, seenAnnouncements]);

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

  const dismissPopup = () => {
    if (popupToShow?.type === 'announcement') {
        setSeenAnnouncements([...seenAnnouncements, popupToShow.id]);
    }
    setPopupToShow(null);
  }

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

  return (
    <AuthContext.Provider value={value}>
        {children}
        {popupToShow && <PopupDisplay popup={popupToShow} onDismiss={dismissPopup} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
