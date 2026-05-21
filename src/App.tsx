/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BellRing, Clock, MapPin, X, Repeat } from 'lucide-react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import FocusTimer from './components/FocusTimer';
import Notes from './components/Notes';
import Settings from './components/Settings';
import LoginPage from './components/LoginPage';
import SplashAndIntro from './components/SplashAndIntro';
import { AppSection, Task, Event, Note, LogNotification } from './types';

const INITIAL_TASKS: Task[] = [];

const INITIAL_EVENTS: Event[] = [];

const INITIAL_NOTES: Note[] = [
  { id: '1', title: 'Product Vision', content: 'Create a seamless experience for power users who want minimalist tools.', updatedAt: '2h ago', tags: ['vision', 'product'], color: 'indigo' },
  { id: '2', title: 'Design Inspiration', content: 'Swiss typography, brutalist design.', updatedAt: '4h ago', tags: ['design', 'ui'], color: 'sky' },
];

const ACCENT_COLORS: Record<string, { brand: string; light: string; dark: string }> = {
  purple: {
    brand: '#4f46e5',
    light: '#eef2ff',
    dark: '#312e81',
  },
  violet: {
    brand: '#8b5cf6',
    light: '#f5f3ff',
    dark: '#4c1d95',
  },
  pink: {
    brand: '#ec4899',
    light: '#fdf2f8',
    dark: '#831843',
  },
  teal: {
    brand: '#0d9488',
    light: '#f0fdfa',
    dark: '#115e59',
  },
  blue: {
    brand: '#3b82f6',
    light: '#eff6ff',
    dark: '#1e3a8a',
  },
  orange: {
    brand: '#f97316',
    light: '#fff7ed',
    dark: '#7c2d12',
  },
  yellow: {
    brand: '#ca8a04',
    light: '#fefce8',
    dark: '#713f12',
  },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function generateColorConfig(brandHex: string): { brand: string; light: string; dark: string } {
  const rgb = hexToRgb(brandHex);
  if (!rgb) {
    return {
      brand: brandHex,
      light: '#f5f3ff',
      dark: '#4c1d95',
    };
  }
  
  // Mixed with White
  const lr = Math.round(rgb.r + (255 - rgb.r) * 0.94);
  const lg = Math.round(rgb.g + (255 - rgb.g) * 0.94);
  const lb = Math.round(rgb.b + (255 - rgb.b) * 0.94);
  const lightHex = rgbToHex(lr, lg, lb);
  
  // Mixed with Black
  const dr = Math.round(rgb.r * 0.4);
  const dg = Math.round(rgb.g * 0.4);
  const db = Math.round(rgb.b * 0.4);
  const darkHex = rgbToHex(dr, dg, db);
  
  return {
    brand: brandHex,
    light: lightHex,
    dark: darkHex,
  };
}

const getAccentConfig = (key: string): { brand: string; light: string; dark: string } => {
  if (ACCENT_COLORS[key]) {
    return ACCENT_COLORS[key];
  }
  if (key.startsWith('#')) {
    return generateColorConfig(key);
  }
  return ACCENT_COLORS.purple;
};

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('is_logged_in') === 'true';
  });
  const [showSplashAndIntro, setShowSplashAndIntro] = useState<boolean>(() => {
    return localStorage.getItem('is_logged_in') !== 'true';
  });

  const [tasks, setTasksState] = useState<Task[]>([]);
  const [events, setEventsState] = useState<Event[]>([]);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);

  // Storage key helpers for user-specific data isolation
  const getTasksStorageKey = (user: any) => user ? `aura_tasks_${user.email}` : 'aura_tasks';
  const getEventsStorageKey = (user: any) => user ? `aura_events_${user.email}` : 'aura_events';

  // State setters that auto-persist under user-specific local storage keys
  const setTasks: React.Dispatch<React.SetStateAction<Task[]>> = (value) => {
    setTasksState((prev) => {
      const nextTasks = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem(getTasksStorageKey(currentUser), JSON.stringify(nextTasks));
      return nextTasks;
    });
  };

  const setEvents: React.Dispatch<React.SetStateAction<Event[]>> = (value) => {
    setEventsState((prev) => {
      const nextEvents = typeof value === 'function' ? value(prev) : value;
      localStorage.setItem(getEventsStorageKey(currentUser), JSON.stringify(nextEvents));
      return nextEvents;
    });
  };

  // Auth session sync
  useEffect(() => {
    setIsAuthLoading(true);
    const loggedIn = localStorage.getItem('is_logged_in') === 'true';
    if (loggedIn) {
      const savedUserStr = localStorage.getItem('current_user');
      if (savedUserStr) {
        try {
          const user = JSON.parse(savedUserStr);
          const cleanedEmail = user.email ? user.email.trim().toLowerCase() : '';
          const storedUsersStr = localStorage.getItem('aura_mock_users') || '{}';
          const users = JSON.parse(storedUsersStr);
          if (users[cleanedEmail]) {
            const enrichedUser = {
              email: cleanedEmail,
              uid: cleanedEmail,
              name: users[cleanedEmail].name || user.name || cleanedEmail.split('@')[0],
              phone: users[cleanedEmail].phone || user.phone || ''
            };
            setCurrentUser(enrichedUser);
          } else {
            setCurrentUser(user);
          }
        } catch (e) {
          const fallbackUser = { email: 'user@example.com', uid: 'user@example.com', name: 'Tanaji Shete', phone: '+91 98765 43210' };
          setCurrentUser(fallbackUser);
          localStorage.setItem('current_user', JSON.stringify(fallbackUser));
        }
      } else {
        const fallbackUser = { email: 'user@example.com', uid: 'user@example.com', name: 'Tanaji Shete', phone: '+91 98765 43210' };
        setCurrentUser(fallbackUser);
        localStorage.setItem('current_user', JSON.stringify(fallbackUser));
      }
    } else {
      setCurrentUser(null);
    }
    // Simple mock transition feel
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // Load correct tasks/events whenever currentUser changes (acts as local database sync/listener)
  useEffect(() => {
    const tasksKey = getTasksStorageKey(currentUser);
    const savedTasks = localStorage.getItem(tasksKey);
    if (savedTasks) {
      try {
        setTasksState(JSON.parse(savedTasks));
      } catch (e) {
        setTasksState([]);
      }
    } else {
      setTasksState([]);
    }

    const eventsKey = getEventsStorageKey(currentUser);
    const savedEvents = localStorage.getItem(eventsKey);
    if (savedEvents) {
      try {
        setEventsState(JSON.parse(savedEvents));
      } catch (e) {
        setEventsState([]);
      }
    } else {
      setEventsState([]);
    }
  }, [currentUser]);

  const [notifications, setNotifications] = useState<LogNotification[]>(() => {
    const saved = localStorage.getItem('aura_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse notifications", err);
      }
    }
    return [
      {
        id: 'notif-1',
        title: 'Aura Board Initialized 🚀',
        message: 'Get started by checking your daily focus and upcoming milestones!',
        time: 'Just now',
        type: 'info',
        read: false,
      },
      {
        id: 'notif-2',
        title: 'Aura Assistant is ready ✨',
        message: 'Click on Aura Assistant anytime to get AI responses on your tasks.',
        time: 'Just now',
        type: 'success',
        read: false,
      }
    ];
  });

  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'alert' = 'info') => {
    const newNotif: LogNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  useEffect(() => {
    localStorage.setItem('aura_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const handleLogin = (email: string) => {
    const cleanedEmail = email.trim().toLowerCase();
    const storedUsersStr = localStorage.getItem('aura_mock_users') || '{}';
    let mockUser = { email: cleanedEmail, uid: cleanedEmail, name: cleanedEmail.split('@')[0], phone: '' };
    try {
       const users = JSON.parse(storedUsersStr);
       if (users[cleanedEmail]) {
         mockUser = {
           email: cleanedEmail,
           uid: cleanedEmail,
           name: users[cleanedEmail].name || cleanedEmail.split('@')[0],
           phone: users[cleanedEmail].phone || ''
         };
       }
    } catch (e) {
       console.error(e);
    }
    localStorage.setItem('current_user', JSON.stringify(mockUser));
    localStorage.setItem('is_logged_in', 'true');
    setCurrentUser(mockUser);
    setIsLoggedIn(true);
    showToast(`Welcome back, ${mockUser.name}!`);
  };

  const handleSignOut = () => {
    localStorage.removeItem('current_user');
    localStorage.setItem('is_logged_in', 'false');
    setCurrentUser(null);
    setIsLoggedIn(false);
    setShowSplashAndIntro(true);
    showToast('Signed out successfully');
  };

  const handleUpdateProfile = (updated: { name: string; email: string; mobile: string }) => {
    const storedUsersStr = localStorage.getItem('aura_mock_users') || '{}';
    try {
      const users = JSON.parse(storedUsersStr);
      const cleanedOldEmail = currentUser?.email ? currentUser.email.trim().toLowerCase() : '';
      const cleanedNewEmail = updated.email.trim().toLowerCase();

      if (cleanedOldEmail && cleanedOldEmail !== cleanedNewEmail) {
        const userPassword = users[cleanedOldEmail]?.password || '123456';
        delete users[cleanedOldEmail];
        users[cleanedNewEmail] = {
          email: cleanedNewEmail,
          password: userPassword,
          name: updated.name,
          phone: updated.mobile
        };
      } else if (cleanedNewEmail) {
        users[cleanedNewEmail] = {
          ...users[cleanedNewEmail],
          name: updated.name,
          phone: updated.mobile,
          email: cleanedNewEmail
        };
      }
      localStorage.setItem('aura_mock_users', JSON.stringify(users));
    } catch (e) {
      console.error("Failed to update user profile in registry", e);
    }

    const nextUser = {
      ...currentUser,
      email: updated.email.trim().toLowerCase(),
      name: updated.name,
      phone: updated.mobile,
    };
    localStorage.setItem('current_user', JSON.stringify(nextUser));
    setCurrentUser(nextUser);
  };

  // Preference states loaded from localStorage
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('push_notifications_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('dark_mode_enabled');
    return saved === 'true';
  });
  const [accentColor, setAccentColor] = useState<string>(() => {
    return localStorage.getItem('accent_theme_selected') || 'purple';
  });
  const [customColors, setCustomColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('custom_accent_colors');
    return saved ? JSON.parse(saved) : [];
  });

  const handleAddCustomColor = (hex: string) => {
    if (!customColors.includes(hex)) {
      const updated = [...customColors, hex];
      setCustomColors(updated);
      localStorage.setItem('custom_accent_colors', JSON.stringify(updated));
    }
  };

  // Simple toast state
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    console.log(`[Preferences Update] ${message}`);
    setToast(message);
  };

  // Event Reminder alert states
  const [acknowledgedReminders, setAcknowledgedReminders] = useState<string[]>([]);
  const [activeAlarmEvent, setActiveAlarmEvent] = useState<Event | null>(null);

  // Auto notification permission request
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default' && pushNotificationsEnabled) {
        Notification.requestPermission();
      }
    }
  }, [pushNotificationsEnabled]);

  // Alert reminder background interval
  useEffect(() => {
    function getEventTriggerTime(e: Event): Date | null {
      try {
        let y = 2026;
        let mIdx = 4; // May
        let d = 20;

        const dateStr = e.date.trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const parts = dateStr.split('-');
          y = parseInt(parts[0], 10);
          mIdx = parseInt(parts[1], 10) - 1;
          d = parseInt(parts[2], 10);
        } else {
          const parts = dateStr.split(' ');
          if (parts.length >= 2) {
            const mStr = parts[0].toLowerCase().substring(0, 3);
            const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
            const foundIdx = months.indexOf(mStr);
            if (foundIdx !== -1) mIdx = foundIdx;
            d = parseInt(parts[1], 10);
          }
        }

        let hours = 12;
        let minutes = 0;
        const timeStr = e.time.trim().toUpperCase();
        const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)?$/);
        if (match) {
          hours = parseInt(match[1], 10);
          minutes = parseInt(match[2], 10);
          const ampm = match[3];
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }

        return new Date(y, mIdx, d, hours, minutes, 0, 0);
      } catch (err) {
        return null;
      }
    }

    const triggerAlarm = (e: Event, lockKey: string) => {
      setAcknowledgedReminders(prev => [...prev, lockKey]);
      setActiveAlarmEvent(e);
      addNotification(`Alarm Reminder: ${e.title} 🔔`, `Scheduled at ${e.time} (${e.category}).`, 'alert');

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playTone = (freq: number, start: number, duration: number) => {
          const osc = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gainNode.gain.setValueAtTime(0.15, start);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration);
          osc.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          osc.start(start);
          osc.stop(start + duration);
        };
        playTone(587.33, audioCtx.currentTime, 0.4);
        playTone(880.00, audioCtx.currentTime + 0.15, 0.6);
      } catch (err) {
        console.log("Audio alert failed", err);
      }

      if (pushNotificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`Reminder: ${e.title}`, {
            body: `Scheduled at ${e.time} (${e.category})`,
            icon: '/favicon.ico'
          });
        }
      }
    };

    const checkReminders = () => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

      events.forEach(e => {
        if (!e.reminderTime || e.reminderTime === 'none') return;

        const baseTrigger = getEventTriggerTime(e);
        if (!baseTrigger) return;

        let matchesToday = false;
        if (e.recurrence && e.recurrence !== 'none') {
          if (todayStart >= new Date(baseTrigger.getFullYear(), baseTrigger.getMonth(), baseTrigger.getDate(), 0, 0, 0, 0)) {
            if (e.recurrence === 'daily') {
              matchesToday = true;
            } else if (e.recurrence === 'weekly') {
              matchesToday = now.getDay() === baseTrigger.getDay();
            } else if (e.recurrence === 'monthly') {
              matchesToday = now.getDate() === baseTrigger.getDate();
            } else if (e.recurrence === 'yearly') {
              matchesToday = now.getMonth() === baseTrigger.getMonth() && now.getDate() === baseTrigger.getDate();
            }
          }
        } else {
          matchesToday = now.getFullYear() === baseTrigger.getFullYear() &&
                         now.getMonth() === baseTrigger.getMonth() &&
                         now.getDate() === baseTrigger.getDate();
        }

        if (!matchesToday) return;

        const targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), baseTrigger.getHours(), baseTrigger.getMinutes(), 0, 0);
        const triggerTime = new Date(targetTime.getTime());
        
        if (e.reminderTime === '5_min') triggerTime.setMinutes(triggerTime.getMinutes() - 5);
        else if (e.reminderTime === '15_min') triggerTime.setMinutes(triggerTime.getMinutes() - 15);
        else if (e.reminderTime === '30_min') triggerTime.setMinutes(triggerTime.getMinutes() - 30);
        else if (e.reminderTime === '1_hour') triggerTime.setMinutes(triggerTime.getMinutes() - 60);

        const isSameMinute = now.getHours() === triggerTime.getHours() && 
                             now.getMinutes() === triggerTime.getMinutes();

        if (isSameMinute) {
          const lockKey = `${e.id}-${e.reminderTime}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${now.getMinutes()}`;
          if (!acknowledgedReminders.includes(lockKey)) {
            triggerAlarm(e, lockKey);
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 5000);
    return () => clearInterval(intervalId);
  }, [events, acknowledgedReminders, pushNotificationsEnabled, addNotification]);

  const handleSnooze = () => {
    if (activeAlarmEvent) {
      const snoozedEventId = activeAlarmEvent.id;
      setActiveAlarmEvent(null);
      showToast(`Snoozed alert for 5 minutes`);
      
      setTimeout(() => {
        const ev = events.find(item => item.id === snoozedEventId);
        if (ev) {
          const snoozeKey = `${ev.id}-snooze-${Date.now()}`;
          // Re-trigger alert popup
          setActiveAlarmEvent(ev);
        }
      }, 5 * 60 * 1000);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync preference updates to global class lists
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('dark_mode_enabled', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('push_notifications_enabled', pushNotificationsEnabled.toString());
  }, [pushNotificationsEnabled]);

  useEffect(() => {
    const activeAccent = getAccentConfig(accentColor);
    document.documentElement.style.setProperty('--brand-color', activeAccent.brand);
    document.documentElement.style.setProperty('--brand-color-light', activeAccent.light);
    document.documentElement.style.setProperty('--brand-color-dark', activeAccent.dark);
    localStorage.setItem('accent_theme_selected', accentColor);
  }, [accentColor]);

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title || 'Untitled Task',
      description: task.description,
      completed: false,
      category: task.category || 'Work',
      tags: task.tags || [],
      dueDate: task.dueDate || 'Today',
      timeframe: task.timeframe || 'daily',
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addEvent = (event: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: event.title || 'Untitled Event',
      time: event.time || '12:00 PM',
      date: event.date || 'Oct 25',
      location: event.location,
      category: event.category || 'Work',
      tags: event.tags || [],
      description: event.description,
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const addNote = (note: Partial<Note>) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title || 'Untitled Note',
      content: note.content || '',
      updatedAt: 'Just now',
      tags: note.tags || [],
      color: note.color || 'amber',
    };
    setNotes(prev => [newNote, ...prev]);
  };

  // Get colors for the active accent
  const activeAccent = getAccentConfig(accentColor);
  const styleVars = {
    '--brand-color': activeAccent.brand,
    '--brand-color-light': activeAccent.light,
    '--brand-color-dark': activeAccent.dark,
  } as React.CSSProperties;

  return (
    <div 
      style={styleVars}
      className="min-h-screen bg-surface text-slate-800 transition-colors duration-300 font-sans selection:bg-brand/10 selection:text-brand max-w-md mx-auto relative px-6 pt-10 pb-24 flex flex-col justify-center"
    >
      <main className="h-full">
        <AnimatePresence mode="wait">
          {isAuthLoading ? (
            <motion.div
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 animate-pulse"
            >
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Harmonizing Aura...
              </p>
            </motion.div>
          ) : !isLoggedIn ? (
            showSplashAndIntro ? (
              <SplashAndIntro key="splash-intro" onComplete={() => setShowSplashAndIntro(false)} />
            ) : (
              <LoginPage key="login" onLogin={handleLogin} />
            )
          ) : (
            <>
              {activeSection === 'dashboard' && (
                <Dashboard 
                  key="dashboard"
                  tasks={tasks}
                  setTasks={setTasks}
                  events={events}
                  setEvents={setEvents}
                  onAddTask={addTask}
                  onAddEvent={addEvent}
                  onAddNote={addNote}
                  showToast={showToast}
                  notifications={notifications}
                  setNotifications={setNotifications}
                  addNotification={addNotification}
                />
              )}
              {activeSection === 'calendar' && (
                <Calendar 
                  key="calendar" 
                  events={events} 
                  onAddEvent={addEvent}
                  setEvents={setEvents}
                  tasks={tasks}
                />
              )}
              {activeSection === 'timer' && (
                <FocusTimer 
                  key="timer" 
                  addNotification={addNotification} 
                  showToast={showToast} 
                />
              )}
              {activeSection === 'notes' && <Notes key="notes" notes={notes} setNotes={setNotes} />}
              {activeSection === 'settings' && (
                <Settings 
                  key="settings" 
                  pushNotificationsEnabled={pushNotificationsEnabled}
                  setPushNotificationsEnabled={setPushNotificationsEnabled}
                  isDarkMode={isDarkMode}
                  setIsDarkMode={setIsDarkMode}
                  accentColor={accentColor}
                  setAccentColor={setAccentColor}
                  showToast={showToast}
                  customColors={customColors}
                  onAddCustomColor={handleAddCustomColor}
                  onSignOut={handleSignOut}
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateProfile}
                />
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {isLoggedIn && (
        <Navigation 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
      )}

      {/* Floating dynamic preference Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs bg-slate-900/90 dark:bg-slate-800 text-white py-3 px-4 rounded-2xl shadow-xl flex items-center justify-center text-center text-xs font-bold font-display uppercase tracking-widest gap-2 backdrop-blur-md border border-white/10"
          >
            <span>✨ {toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual In-App Alarm Alert Popup Overlay */}
      <AnimatePresence>
        {activeAlarmEvent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveAlarmEvent(null)}
              className="absolute inset-0 bg-slate-955/60 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-[2.5rem] p-8 shadow-2xl relative z-20 text-center border border-brand/20 space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-5 bg-brand-light dark:bg-brand/20 rounded-full text-brand relative">
                  <span className="animate-ping absolute inset-0 rounded-full bg-brand/30 opacity-75" />
                  <BellRing size={36} className="animate-bounce" />
                </div>
              </div>

              <div>
                <p className="text-[10px] text-brand font-black uppercase tracking-widest">Event Alarm Reminder</p>
                <h3 className="text-lg font-bold text-slate-805 dark:text-white line-clamp-2 mt-1 px-1 leading-snug">
                  {activeAlarmEvent.title}
                </h3>
                <div className="flex justify-center gap-2 mt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full">
                    {activeAlarmEvent.time}
                  </span>
                  {activeAlarmEvent.recurrence && activeAlarmEvent.recurrence !== 'none' && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wide bg-brand-light text-brand px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Repeat size={10} /> {activeAlarmEvent.recurrence}
                    </span>
                  )}
                </div>
              </div>

              {activeAlarmEvent.location && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500">
                  <MapPin size={12} className="text-slate-400" />
                  <span className="truncate">{activeAlarmEvent.location}</span>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={handleSnooze}
                  className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                >
                  Snooze 5 Mins
                </button>

                <button
                  onClick={() => setActiveAlarmEvent(null)}
                  className="w-full bg-brand hover:opacity-90 text-white py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-md shadow-brand/10"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
