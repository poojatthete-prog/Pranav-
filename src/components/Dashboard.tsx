import React, { useState, useEffect, useMemo, MouseEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Circle, ListPlus, Calendar as CalendarIcon, 
  X, Save, Tag, Plus, MapPin, Clock, CalendarIcon as DateIcon,
  Sparkles, ChevronRight, Target, TrendingUp,
  Bell, Search, History, AlertCircle
} from 'lucide-react';
import { Task, Event, Note, LogNotification } from '../types';
import AIChatModal from './AIChatModal';

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Life'];

interface DashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  onAddTask: (task: Partial<Task>) => void;
  onAddEvent: (event: Partial<Event>) => void;
  onAddNote: (note: Partial<Note>) => void;
  showToast?: (message: string) => void;
  notifications: LogNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<LogNotification[]>>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'alert') => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  tasks, 
  setTasks, 
  events, 
  setEvents, 
  onAddTask, 
  onAddEvent, 
  onAddNote, 
  showToast,
  notifications,
  setNotifications,
  addNotification
}) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState<'all' | 'daily' | 'weekly' | 'monthly' | 'yearly'>('all');
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTaskTab, setActiveTaskTab] = useState<'active' | 'history'>('active');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Long press and gesture states
  const [longPressedTask, setLongPressedTask] = useState<Task | null>(null);
  const longPressTimer = useRef<any>(null);
  const isDragging = useRef(false);
  const hasLongPressed = useRef(false);
  const justDragged = useRef(false);

  const startLongPress = (task: Task) => {
    isDragging.current = false;
    hasLongPressed.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current && !justDragged.current) {
        setLongPressedTask(task);
        hasLongPressed.current = true;
        if (navigator.vibrate) navigator.vibrate(50);
      }
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const TIMEFRAME_DETAILS = useMemo(() => {
    const getStats = (tf: 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly', fallbackCompleted: number, fallbackTotal: number) => {
      const filtered = tf === 'all' ? tasks : tasks.filter(t => t.timeframe === tf);
      const total = filtered.length;
      const completed = filtered.filter(t => t.completed).length;
      
      const actualTotal = total > 0 ? total : fallbackTotal;
      const actualCompleted = total > 0 ? completed : fallbackCompleted;
      const percentage = actualTotal > 0 ? Math.round((actualCompleted / actualTotal) * 100) : 0;
      
      return { total: actualTotal, completed: actualCompleted, percentage };
    };

    const daily = getStats('daily', 1, 2);
    const weekly = getStats('weekly', 1, 5);
    const monthly = getStats('monthly', 5, 10);
    const yearly = getStats('yearly', 2, 12);
    const all = getStats('all', 9, 29);

    return {
      all: {
        badgeText: "ALL TASKS SUMMARY",
        badgeIcon: ListPlus,
        percentage: all.percentage,
        subtext: `${all.completed} of ${all.total} overall tasks completed`,
        progressBarValue: all.percentage,
        bottomTip: "🌟 Get a high-level view of your productivity across all periods.",
      },
      daily: {
        badgeText: "TODAY'S FOCUS",
        badgeIcon: CheckCircle2,
        percentage: daily.percentage,
        subtext: `${daily.completed} of ${daily.total} daily tasks completed`,
        progressBarValue: daily.percentage,
        bottomTip: "🎯 Focus on completing your designated daily highlights.",
      },
      weekly: {
        badgeText: "WEEKLY MILESTONES",
        badgeIcon: TrendingUp,
        percentage: weekly.percentage,
        subtext: `${weekly.completed} of ${weekly.total} active tasks finished`,
        progressBarValue: weekly.percentage,
        bottomTip: "⚡ Progress is a sequence of small daily actions.",
      },
      monthly: {
        badgeText: "MONTHLY OUTLOOK",
        badgeIcon: Target,
        percentage: monthly.percentage,
        subtext: `${monthly.completed} of ${monthly.total} target milestones completed`,
        progressBarValue: monthly.percentage,
        bottomTip: "🏔️ Building lasting habits. Aligned with your long-term goals.",
      },
      yearly: {
        badgeText: "YEARLY VISION",
        badgeIcon: Sparkles,
        percentage: yearly.percentage,
        subtext: `${yearly.completed} of ${yearly.total} major year goals achieved`,
        progressBarValue: yearly.percentage,
        bottomTip: "🚀 Consistency over time creates massive transformations.",
      },
    };
  }, [tasks]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [currentTime]);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'Work',
    completed: false,
    tags: [],
    timeframe: 'daily',
  });

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    time: '12:00 PM',
    date: 'Oct 25',
    location: '',
    category: 'Work',
    tags: [],
  });

  const resetNewTask = () => {
    setNewTask({ title: '', description: '', category: 'Work', completed: false, tags: [], timeframe: 'daily' });
  };

  const resetNewEvent = () => {
    setNewEvent({ title: '', description: '', time: '12:00 PM', date: 'Oct 25', location: '', category: 'Work', tags: [] });
  };

  const addTask = () => {
    if (!newTask.title) return;
    onAddTask(newTask);
    addNotification("New Task Created 📝", `"${newTask.title}" is added to your ${newTask.timeframe} goals.`, "info");
    setIsCreating(false);
    resetNewTask();
  };

  const addEvent = () => {
    if (!newEvent.title) return;
    onAddEvent(newEvent);
    addNotification("Event Scheduled 📅", `"${newEvent.title}" is scheduled at ${newEvent.time}.`, "info");
    setIsCreatingEvent(false);
    resetNewEvent();
  };

  const filteredTasks = useMemo(() => {
    let list = activeTimeframe === 'all'
      ? tasks
      : tasks.filter(t => t.timeframe === activeTimeframe);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description || '').toLowerCase().includes(q) || 
        t.category.toLowerCase().includes(q) ||
        (t.tags || []).some(tag => tag.toLowerCase().includes(q))
      );
    }

    const active = list.filter(t => !t.completed);
    const history = list.filter(t => t.completed);

    return { active, history };
  }, [tasks, activeTimeframe, searchQuery]);

  const groupedTasks = useMemo(() => {
    const list = activeTaskTab === 'active' ? filteredTasks.active : filteredTasks.history;

    return list.reduce((acc: Record<string, Task[]>, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {});
  }, [filteredTasks, activeTaskTab]);

  const totalFilteredTasksCount = useMemo(() => {
    return (Object.values(groupedTasks) as Task[][]).reduce((sum, list) => sum + list.length, 0);
  }, [groupedTasks]);

  const dailyTasks = useMemo(() => tasks.filter(t => t.dueDate === 'Today'), [tasks]);
  const dailyCompleted = useMemo(() => dailyTasks.filter(t => t.completed).length, [dailyTasks]);
  const dailyTotal = useMemo(() => dailyTasks.length, [dailyTasks]);
  const dailyProgress = useMemo(() => dailyTotal > 0 ? Math.round((dailyCompleted / dailyTotal) * 100) : 100, [dailyCompleted, dailyTotal]);

  const weeklyTasks = useMemo(() => tasks, [tasks]);
  const weeklyCompleted = useMemo(() => weeklyTasks.filter(t => t.completed).length, [weeklyTasks]);
  const weeklyTotal = useMemo(() => weeklyTasks.length, [weeklyTasks]);
  const weeklyProgress = useMemo(() => weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 72, [weeklyCompleted, weeklyTotal]);

  const monthlyTasksCount = useMemo(() => tasks.length + 5, [tasks]);
  const monthlyCompletedCount = useMemo(() => tasks.filter(t => t.completed).length + 4, [tasks]);
  const monthlyProgress = useMemo(() => monthlyTasksCount > 0 ? Math.round((monthlyCompletedCount / monthlyTasksCount) * 100) : 85, [monthlyCompletedCount, monthlyTasksCount]);

  const activeTasksCount = useMemo(() => {
    const filtered = activeTimeframe === 'all'
      ? tasks
      : tasks.filter(t => t.timeframe === activeTimeframe);
    return filtered.filter(t => !t.completed).length;
  }, [tasks, activeTimeframe]);

  const toggleTask = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          addNotification("Task Completed 🎉", `"${t.title}" was marked as completed. Awesome work!`, "success");
        } else {
          addNotification("Task Restored 🔄", `"${t.title}" was restored back to active tasks.`, "info");
        }
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask({ ...task });
  };

  const saveTask = () => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    addNotification("Task Updated 💾", `"${editingTask.title}" has been updated successfully.`, "info");
    setEditingTask(null);
  };

  const removeTag = (tag: string, isEditing: boolean, isEvent: boolean = false) => {
    if (isEditing && editingTask) {
      setEditingTask({
        ...editingTask,
        tags: (editingTask.tags || []).filter(t => t !== tag)
      });
    } else if (isEvent) {
      setNewEvent({
        ...newEvent,
        tags: (newEvent.tags || []).filter(t => t !== tag)
      });
    } else {
      setNewTask({
        ...newTask,
        tags: (newTask.tags || []).filter(t => t !== tag)
      });
    }
  };

  const addTag = (tag: string, isEditing: boolean, isEvent: boolean = false) => {
    if (!tag.trim()) return;
    if (isEditing && editingTask) {
      if (!(editingTask.tags || []).includes(tag)) {
        setEditingTask({
          ...editingTask,
          tags: [...(editingTask.tags || []), tag]
        });
      }
    } else if (isEvent) {
      if (!(newEvent.tags || []).includes(tag)) {
        setNewEvent({
          ...newEvent,
          tags: [...(newEvent.tags || []), tag]
        });
      }
    } else {
      if (!(newTask.tags || []).includes(tag)) {
        setNewTask({
          ...newTask,
          tags: [...(newTask.tags || []), tag]
        });
      }
    }
  };

  const nextEvent = events[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-5"
    >
      <header className="flex justify-between items-start relative">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Aura Board</h1>
          <p className="text-slate-400 font-medium text-sm">{formattedDate}</p>
        </div>
        <div className="flex gap-2 items-center relative">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(prev => !prev)}
              className="bg-white text-slate-400 p-2.5 rounded-2xl border border-border-main shadow-sm active:scale-95 transition-all relative cursor-pointer"
              title="Notifications"
            >
              <Bell size={20} className={unreadCount > 0 ? "text-brand animate-bounce" : ""} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-brand text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white select-none">
                  {unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowNotifications(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="fixed sm:absolute top-[4.75rem] sm:top-auto left-4 right-4 sm:left-auto sm:right-0 sm:w-80 bg-white border border-border-main rounded-[2rem] shadow-2xl p-5 z-50 space-y-4 max-h-[75vh] sm:max-h-96 overflow-hidden flex flex-col"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100 select-none">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-brand animate-pulse" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aura Notifications</span>
                      </div>
                      {notifications.length > 0 && (
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            clearAllNotifications();
                          }}
                          className="text-[9px] font-bold text-slate-400 hover:text-brand uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin min-h-0 max-h-64 sm:max-h-80">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markAsRead(notif.id);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex gap-3 ${
                              notif.read 
                                ? 'bg-slate-50/50 border-slate-100' 
                                : 'bg-brand/5 border-brand/10 hover:border-brand/20'
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {notif.type === 'success' ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                              ) : notif.type === 'alert' ? (
                                <span className="w-2 h-2 rounded-full bg-rose-500 block animate-ping" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-brand block" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className={`text-xs font-bold truncate ${notif.read ? 'text-slate-600' : 'text-slate-800'}`}>
                                {notif.title}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-medium mt-0.5 leading-relaxed">
                                {notif.message}
                              </p>
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider block mt-1">
                                {notif.time}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center space-y-2">
                          <p className="text-slate-300 text-xs font-bold">No active notifications</p>
                          <p className="text-[9px] text-slate-400 font-medium px-4">Reminders about goals, events, or focus completions appear here.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          <button 
            onClick={() => setIsCreatingEvent(true)}
            className="bg-white text-slate-400 p-2.5 rounded-2xl border border-border-main shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Create Event"
          >
            <CalendarIcon size={20} />
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-brand text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand/20 active:scale-95 transition-all text-sm cursor-pointer"
          >
            + New Task
          </button>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-3.5">
        {/* Multi-timeframe Goal Progress */}
        <div 
          className="col-span-12 p-5 rounded-[1.75rem] text-white flex flex-col justify-between min-h-[11rem] shadow-xl shadow-brand/10 relative overflow-hidden transition-all duration-300"
          style={{ backgroundImage: 'linear-gradient(135deg, var(--brand-color) 0%, var(--brand-color-dark) 100%)' }}
        >
          {/* Ambient background blur accent */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 z-10">
            {/* Timeframe Switcher Switch/Pills */}
            <div className="flex bg-white/10 rounded-2xl p-1 gap-0.5 sm:gap-1 w-full sm:w-auto overflow-x-auto scrollbar-none">
              {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as const).map((timeframe) => (
                <button
                  key={timeframe}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTimeframe(timeframe);
                  }}
                  className={`flex-1 sm:flex-none py-1.5 px-2.5 sm:px-4 rounded-xl text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all relative ${
                    activeTimeframe === timeframe
                      ? 'bg-white text-brand-dark shadow-md'
                      : 'text-indigo-100 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {timeframe}
                </button>
              ))}
            </div>
            
            {/* Context Goal Indicator Icon & Badge */}
            <div className="flex items-center gap-2 self-start sm:self-auto bg-white/15 px-3 py-1.5 rounded-full shadow-inner">
              {(() => {
                const info = TIMEFRAME_DETAILS[activeTimeframe];
                const BadgeIcon = info.badgeIcon;
                return (
                  <>
                    <BadgeIcon size={13} className="text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-50">
                      {info.badgeText}
                    </span>
                  </>
                );
              })()}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTimeframe}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-2 mt-2.5 z-10 flex-1 flex flex-col justify-end"
            >
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="flex items-end gap-2">
                    <h3 className="text-5xl font-bold font-display tracking-tight">
                      {TIMEFRAME_DETAILS[activeTimeframe].percentage}%
                    </h3>
                    <p className="text-indigo-200 text-xs font-semibold uppercase tracking-wider mb-1">
                      Completed
                    </p>
                  </div>
                  <p className="text-xs text-indigo-150 font-medium mt-1">
                    {TIMEFRAME_DETAILS[activeTimeframe].subtext}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${TIMEFRAME_DETAILS[activeTimeframe].progressBarValue}%` 
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" 
                  />
                </div>
                <p className="text-[10px] text-indigo-200/90 italic font-medium tracking-wide flex justify-between">
                  {TIMEFRAME_DETAILS[activeTimeframe].bottomTip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* AI Assistant Quick Callout */}
        <div 
          onClick={() => setIsAIChatOpen(true)}
          className="col-span-12 bg-white border-2 border-brand/10 p-3.5 rounded-[1.5rem] flex items-center gap-3.5 cursor-pointer active:scale-[0.99] transition-all hover:border-brand/30 group shadow-sm"
        >
          <div className="bg-brand/10 p-2.5 rounded-xl group-hover:bg-brand transition-colors">
            <Sparkles size={18} className="text-brand group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-1.5">
              <h4 className="text-xs font-bold text-slate-800">Aura Assistant</h4>
              <span className="text-[7px] font-black bg-brand/10 text-brand px-1.5 py-0.5 rounded uppercase tracking-tighter">Beta</span>
            </div>
            <p className="text-[9px] text-slate-400 font-medium">Try: "Note down the project vision ideas"</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-brand transition-colors" />
        </div>

        {/* Small Stats Widget */}
        <div className="col-span-4 bento-card p-3.5 rounded-[1.5rem] flex flex-col justify-between h-28">
          <DateIcon size={20} className="text-brand" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">{activeTasksCount}</h3>
            <p className="text-slate-400 text-[8px] font-bold uppercase tracking-wider">Active Tasks</p>
          </div>
        </div>

        {/* Upcoming Event Widget */}
        <div 
          onClick={() => setIsCreatingEvent(true)}
          className="col-span-8 bento-card p-3.5 bg-white rounded-[1.5rem] flex flex-col justify-between h-28 cursor-pointer group active:scale-[0.98] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="bg-brand-light p-1.5 rounded-lg text-brand group-hover:bg-brand group-hover:text-white transition-colors">
              <Clock size={16} />
            </div>
            <span className="text-[7px] font-extrabold bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full uppercase tracking-widest">Next Event</span>
          </div>
          {nextEvent ? (
            <div>
              <h3 className="text-xs font-bold text-slate-800 truncate">{nextEvent.title}</h3>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">{nextEvent.time} • {nextEvent.location || 'Remote'}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-xs font-bold text-slate-300">No events today</h3>
              <p className="text-brand text-[9px] font-bold uppercase tracking-wider">+ Schedule one</p>
            </div>
          )}
        </div>
      </section>

      {/* Search & Tabs control bar */}
      <div className="flex flex-row items-center justify-between bg-white border border-border-main p-2 rounded-[1.5rem] shadow-sm">
        {/* Toggle between Active & History view, and Compact Search aligned next to it */}
        <div className="flex items-center gap-3 w-full">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl shadow-inner max-w-full overflow-x-auto scrollbar-none">
            <button
              onClick={() => {
                setActiveTaskTab('active');
              }}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTaskTab === 'active'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <span>Active Tasks</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                activeTaskTab === 'active' ? 'bg-brand/10 text-brand' : 'bg-slate-200 text-slate-600'
              }`}>
                {tasks.filter(t => !t.completed).length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTaskTab('history');
              }}
              className={`py-1.5 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTaskTab === 'history'
                  ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <History size={13} />
              <span>Completed History</span>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                activeTaskTab === 'history' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-200 text-slate-600'
              }`}>
                {tasks.filter(t => t.completed).length}
              </span>
            </button>
          </div>

          {/* Compact Search Trigger / Input */}
          <div className="relative flex items-center shrink-0">
            <AnimatePresence initial={false} mode="wait">
              {!showSearchInput ? (
                <motion.button
                  key="search-toggle-btn"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setShowSearchInput(true)}
                  className="bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500 hover:text-slate-700 p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-sm relative shrink-0"
                  title="Search Tasks"
                >
                  <Search size={14} />
                  {searchQuery.trim() && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-white animate-pulse" />
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="search-bar-inline"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: window.innerWidth < 640 ? 150 : 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="relative flex items-center overflow-hidden"
                >
                  <div className="absolute left-3 text-slate-400 pointer-events-none">
                    <Search size={12} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-1.5 pl-8 pr-12 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand/30 transition-all shadow-inner"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-7 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowSearchInput(false);
                    }}
                    className="absolute right-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 cursor-pointer p-0.5 rounded transition-all"
                    title="Close Search"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <section className="space-y-5 pb-24">
        {totalFilteredTasksCount === 0 ? (
          <div className="bg-white rounded-[1.5rem] border border-border-main p-6 text-center space-y-2">
            <p className="text-slate-400 text-sm font-medium">
              {searchQuery.trim() 
                ? "No tasks match your search query."
                : activeTaskTab === 'active' 
                  ? "No active tasks in this timeframe." 
                  : "No completed tasks yet in history."}
            </p>
            {activeTaskTab === 'active' && !searchQuery.trim() && (
              <button
                onClick={() => setIsCreating(true)}
                className="text-brand text-xs font-bold hover:underline cursor-pointer"
              >
                + Create a new task
              </button>
            )}
          </div>
        ) : (
          (Object.entries(groupedTasks) as [string, Task[]][]).map(([category, categoryTasks]) => (
          <div key={category} className="space-y-2.5">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-base font-bold text-slate-800">{category}</h2>
              <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wider">
                {categoryTasks.length} {categoryTasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
            </div>

            <div className="space-y-2">
              {categoryTasks.map((task) => (
                <div key={task.id} className="w-[calc(100%-8px)] mx-auto relative overflow-hidden rounded-[1.25rem] shadow-sm">
                  {/* Underlay Swipe Info Banner */}
                  {!task.completed && (
                    <div className="absolute inset-0 flex items-center pl-4.5 text-white bg-emerald-500 transition-all duration-300">
                      <CheckCircle2 size={18} className="animate-pulse" />
                      <span className="text-[9px] font-bold uppercase tracking-widest ml-2">Release to Complete Task</span>
                    </div>
                  )}

                  <motion.div
                    layout
                    id={`task-${task.id}`}
                    drag={task.completed ? false : "x"}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ left: 0, right: 0.45 }}
                    onDragStart={() => {
                      isDragging.current = true;
                      justDragged.current = true;
                      cancelLongPress();
                    }}
                    onDrag={(event, info) => {
                      isDragging.current = true;
                      justDragged.current = true;
                      cancelLongPress();
                    }}
                    onDragEnd={(event, info) => {
                      const isCompleteSwipe = info.offset.x > 80 && !task.completed;
                      if (isCompleteSwipe) {
                        cancelLongPress();
                        toggleTask(task.id, event as any);
                        if (showToast) {
                          showToast("Task completed!");
                        }
                      }

                      setTimeout(() => {
                        isDragging.current = false;
                        setTimeout(() => {
                          justDragged.current = false;
                        }, 100);
                      }, 50);
                    }}
                    onTouchStart={() => startLongPress(task)}
                    onTouchMove={cancelLongPress}
                    onTouchEnd={cancelLongPress}
                    onMouseDown={() => startLongPress(task)}
                    onMouseMove={cancelLongPress}
                    onMouseUp={cancelLongPress}
                    onMouseLeave={cancelLongPress}
                    onClick={(e) => {
                      if (isDragging.current || justDragged.current) {
                        e.stopPropagation();
                        e.preventDefault();
                        return;
                      }
                      if (hasLongPressed.current) {
                        hasLongPressed.current = false;
                        return;
                      }
                      handleEditTask(task);
                    }}
                    className="bg-white py-3 px-3.5 rounded-[1.25rem] border border-border-main flex items-center gap-3 group hover:border-brand/30 transition-all cursor-pointer active:scale-[0.98] relative z-10 select-none w-full"
                  >
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id, e);
                      }}
                      className="text-slate-300 group-hover:text-brand transition-colors shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-50 cursor-pointer"
                      title="Mark Complete"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="text-brand" size={22} />
                      ) : (
                        <div className="w-5.5 h-5.5 border-2 border-slate-200 rounded-full" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold truncate text-xs sm:text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <p className={`text-[8px] sm:text-[9px] font-bold uppercase tracking-wider ${task.dueDate === 'Today' ? 'text-brand' : 'text-slate-400'}`}>
                          {task.category} • {task.dueDate}
                        </p>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex gap-1 overflow-hidden">
                            {task.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[8px] bg-brand/5 text-brand px-1.5 py-0.5 rounded-md font-bold truncate">#{tag}</span>
                            ))}
                            {task.tags.length > 2 && <span className="text-[8px] text-slate-300 font-bold">+{task.tags.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`w-2 h-2 rounded-full shadow-sm shrink-0 ${
                      category === 'Work' ? 'bg-indigo-500' : 
                      category === 'Personal' ? 'bg-amber-400' : 
                      category === 'Shopping' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`} />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        ))
        )}
      </section>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreating(false); resetNewTask(); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">New Task</h2>
                <button 
                  onClick={() => { setIsCreating(false); resetNewTask(); }}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">What needs to be done?</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Details</label>
                  <textarea
                    rows={3}
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all resize-none placeholder:text-slate-300 shadow-inner"
                    placeholder="Add additional details..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTask.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag, false)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value, false);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Timeframe</label>
                  <div className="flex flex-wrap gap-2">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setNewTask({ ...newTask, timeframe: tf })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border capitalize ${
                          newTask.timeframe === tf 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewTask({ ...newTask, category: cat })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          newTask.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!newTask.title}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                <Plus size={20} />
                <span>Create Task</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Event Modal */}
      <AnimatePresence>
        {isCreatingEvent && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreatingEvent(false); resetNewEvent(); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">New Event</h2>
                <button 
                  onClick={() => { setIsCreatingEvent(false); resetNewEvent(); }}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="Product Sync"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <Clock size={10} /> Time
                    </label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <DateIcon size={10} /> Date
                    </label>
                    <input
                      type="text"
                      placeholder="Oct 25"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                    <MapPin size={10} /> Location
                  </label>
                  <input
                    type="text"
                    placeholder="Zoom, Coffee Shop, etc."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewEvent({ ...newEvent, category: cat })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          newEvent.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newEvent.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag, false, true)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value, false, true);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addEvent}
                disabled={!newEvent.title}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                <DateIcon size={20} />
                <span>Schedule Event</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Edit Task</h2>
                <button 
                  onClick={() => setEditingTask(null)}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all resize-none shadow-inner"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingTask.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag, true)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value, true);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Timeframe</label>
                  <div className="flex flex-wrap gap-2">
                    {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setEditingTask({ ...editingTask, timeframe: tf })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border capitalize ${
                          editingTask.timeframe === tf 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEditingTask({ ...editingTask, category: cat })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          editingTask.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={saveTask}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChatModal 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)}
        onAddTask={onAddTask}
        onAddEvent={onAddEvent}
        onAddNote={onAddNote}
      />

      {/* Long Press Actions Popover Overlay */}
      <AnimatePresence>
        {longPressedTask && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLongPressedTask(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-[280px] rounded-[2rem] p-6 shadow-2xl relative z-20 text-center space-y-4 border border-border-main"
            >
              <div>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1 px-2">{longPressedTask.title}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Task Options</p>
              </div>

              <div className="flex flex-col gap-2 pt-1 font-sans">
                {longPressedTask.completed ? (
                  <button
                    onClick={() => {
                      setTasks(prev => prev.map(t => t.id === longPressedTask.id ? { ...t, completed: false } : t));
                      addNotification("Task Restored 🔄", `"${longPressedTask.title}" was restored back to active tasks.`, "info");
                      setLongPressedTask(null);
                      if (showToast) showToast('Task marked active');
                    }}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-emerald-100"
                  >
                    <span>Restore to Active</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setTasks(prev => prev.map(t => t.id === longPressedTask.id ? { ...t, completed: true } : t));
                      addNotification("Task Completed 🎉", `"${longPressedTask.title}" was marked as completed. Awesome work!`, "success");
                      setLongPressedTask(null);
                      if (showToast) showToast('Task completed!');
                    }}
                    className="w-full bg-brand-light hover:bg-brand/10 text-brand py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Mark Completed</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    handleEditTask(longPressedTask);
                    setLongPressedTask(null);
                  }}
                  className="w-full bg-slate-50 hover:bg-brand/10 hover:text-brand text-slate-700 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <span>Edit Task Details</span>
                </button>

                <button
                  onClick={() => {
                    setTasks(prev => prev.filter(t => t.id !== longPressedTask.id));
                    setLongPressedTask(null);
                    if (showToast) {
                      showToast('Task removed successfully');
                    }
                  }}
                  className="w-full bg-rose-50 hover:bg-rose-100/80 text-rose-600 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-rose-100"
                >
                  <span>Remove Task</span>
                </button>

                <button
                  onClick={() => setLongPressedTask(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-28 right-6 z-50 bg-brand text-white p-4 rounded-3xl shadow-2xl shadow-brand/40 flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
      >
        <Sparkles size={24} />
      </motion.button>
    </motion.div>
  );
};

export default Dashboard;

