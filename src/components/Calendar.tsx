import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, 
  Trash2, Tag, X, Calendar as DateIcon, Bell, BellRing, Repeat,
  TrendingUp, PieChart, Award, Activity, Sparkles, CheckCircle2, Percent, Check
} from 'lucide-react';
import { Event, Task } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Life'];

interface CalendarProps {
  events: Event[];
  onAddEvent?: (event: Partial<Event>) => void;
  setEvents?: React.Dispatch<React.SetStateAction<Event[]>>;
  tasks: Task[];
}

const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, setEvents, tasks = [] }) => {
  // Current date for real-time reference
  const today = new Date();
  
  // Dynamic navigation date reference state
  const [currentDate, setCurrentDate] = useState(() => {
    // If system clock is May 2026, it will automatically open in May 2026!
    return new Date();
  });
  
  // Sub-tab view: schedule of events vs progress metrics tracking
  const [subTab, setSubTab] = useState<'schedule' | 'progress'>('schedule');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [hoveredNodeIdx, setHoveredNodeIdx] = useState<number | null>(null);

  const [selectedProgressDate, setSelectedProgressDate] = useState<string>(() => {
    // Current date formatted as YYYY-MM-DD
    return new Date().toISOString().split('T')[0];
  });

  const formatFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr + 'T00:00:00');
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCellDateString = (day: number, monthOffset: number) => {
    const y = currentDate.getFullYear();
    const m = currentDate.getMonth();
    const dObj = new Date(y, m + monthOffset, day);
    const cy = dObj.getFullYear();
    const cm = dObj.getMonth();
    const cd = dObj.getDate();
    return `${cy}-${String(cm + 1).padStart(2, '0')}-${String(cd).padStart(2, '0')}`;
  };

  // --- Start of Analytics Calculations ---
  const selectedDateObj = useMemo(() => {
    return new Date(selectedProgressDate + 'T00:00:00');
  }, [selectedProgressDate]);

  const selectedYear = selectedDateObj.getFullYear();
  const selectedMonth = selectedDateObj.getMonth();

  const isSelectedToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return selectedProgressDate === todayStr;
  }, [selectedProgressDate]);

  const isSelectedWeekThisWeek = useMemo(() => {
    const d1 = new Date(selectedDateObj);
    d1.setHours(0,0,0,0);
    const d2 = new Date(today);
    d2.setHours(0,0,0,0);
    const s1 = new Date(d1);
    s1.setDate(d1.getDate() - d1.getDay());
    const s2 = new Date(d2);
    s2.setDate(d2.getDate() - d2.getDay());
    return s1.getTime() === s2.getTime();
  }, [selectedDateObj, today]);

  const weekStart = useMemo(() => {
    const start = new Date(selectedDateObj);
    start.setDate(selectedDateObj.getDate() - selectedDateObj.getDay());
    start.setHours(0,0,0,0);
    return start;
  }, [selectedDateObj]);

  const weekEnd = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(weekStart.getDate() + 6);
    end.setHours(23,59,59,999);
    return end;
  }, [weekStart]);

  const isSelectedMonthThisMonth = useMemo(() => {
    return selectedDateObj.getMonth() === today.getMonth() && selectedDateObj.getFullYear() === today.getFullYear();
  }, [selectedDateObj, today]);

  const isSelectedYearThisYear = useMemo(() => {
    return selectedDateObj.getFullYear() === today.getFullYear();
  }, [selectedDateObj, today]);

  // Tasks completed on specific selected ranges
  const completedWeekTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.completed || !t.completedDate) return false;
      const d = new Date(t.completedDate + 'T00:00:00');
      return d >= weekStart && d <= weekEnd;
    });
  }, [tasks, weekStart, weekEnd]);

  const completedMonthTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.completed || !t.completedDate) return false;
      const d = new Date(t.completedDate + 'T00:00:00');
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [tasks, selectedMonth, selectedYear]);

  const completedYearTasks = useMemo(() => {
    return tasks.filter(t => {
      if (!t.completed || !t.completedDate) return false;
      const d = new Date(t.completedDate + 'T00:00:00');
      return d.getFullYear() === selectedYear;
    });
  }, [tasks, selectedYear]);

  // Combined timeframeTasks reflecting current selection, including active tasks if currently matching the active time frame
  const timeframeTasks = useMemo(() => {
    if (selectedTimeframe === 'daily') {
      const completedOnDate = tasks.filter(t => t.completed && t.completedDate === selectedProgressDate);
      if (isSelectedToday) {
        const activeDaily = tasks.filter(t => !t.completed && t.timeframe === 'daily');
        return [...completedOnDate, ...activeDaily];
      }
      return completedOnDate;
    }

    if (selectedTimeframe === 'weekly') {
      if (isSelectedWeekThisWeek) {
        const activeWeekly = tasks.filter(t => !t.completed && t.timeframe === 'weekly');
        return [...completedWeekTasks, ...activeWeekly];
      }
      return completedWeekTasks;
    }

    if (selectedTimeframe === 'monthly') {
      if (isSelectedMonthThisMonth) {
        const activeMonthly = tasks.filter(t => !t.completed && t.timeframe === 'monthly');
        return [...completedMonthTasks, ...activeMonthly];
      }
      return completedMonthTasks;
    }

    if (selectedTimeframe === 'yearly') {
      if (isSelectedYearThisYear) {
        const activeYearly = tasks.filter(t => !t.completed && t.timeframe === 'yearly');
        return [...completedYearTasks, ...activeYearly];
      }
      return completedYearTasks;
    }

    return [];
  }, [
    selectedTimeframe,
    tasks,
    selectedProgressDate,
    isSelectedToday,
    isSelectedWeekThisWeek,
    completedWeekTasks,
    isSelectedMonthThisMonth,
    completedMonthTasks,
    isSelectedYearThisYear,
    completedYearTasks,
  ]);

  const completedTimeframeTasks = useMemo(() => {
    return timeframeTasks.filter(t => t.completed).length;
  }, [timeframeTasks]);

  const totalTimeframeTasks = useMemo(() => {
    const len = timeframeTasks.length;
    if (len > 0) return len;
    // Elegant baseline totals for aesthetics
    switch (selectedTimeframe) {
      case 'daily': return 3;
      case 'weekly': return 5;
      case 'monthly': return 10;
      case 'yearly': return 12;
    }
  }, [timeframeTasks, selectedTimeframe]);

  const completionRate = totalTimeframeTasks > 0 ? Math.round((completedTimeframeTasks / totalTimeframeTasks) * 100) : 0;

  const getStatusAssessment = (rate: number) => {
    if (rate === 0) return { title: "Getting Started", desc: "Unlock focus by completing your first milestone today.", color: "text-slate-500 bg-slate-50/50 border-slate-100" };
    if (rate < 30) return { title: "Steady Spark", desc: "Small steps lead to big wins. Pick an easy task to gain momentum!", color: "text-amber-500 bg-amber-50/50 border-amber-100" };
    if (rate < 60) return { title: "Active Momentum", desc: "You are halfway there! Momentum is building, keep pushing.", color: "text-indigo-500 bg-indigo-50/50 border-indigo-100/80" };
    if (rate < 90) return { title: "High Velocity", desc: "Outstanding focus! You are crushing your objectives this timeframe.", color: "text-emerald-505 bg-emerald-50/50 border-emerald-100" };
    return { title: "Ascent Achieved!", desc: "100% completion! You have fully optimized this timeframe.", color: "text-brand bg-brand-light border-brand/20" };
  };

  const assessment = getStatusAssessment(completionRate);

  const trendData = useMemo(() => {
    switch (selectedTimeframe) {
      case 'daily': {
        const completedDailyList = tasks.filter(t => t.completed && t.completedDate === selectedProgressDate);
        const completedCount = completedDailyList.length;
        if (completedCount === 0) {
          return [
            { label: 'Morning', val: 10 },
            { label: 'Noon', val: 15 },
            { label: 'Evening', val: 12 },
            { label: 'Night', val: 5 },
          ];
        }
        if (completedCount === 1) {
          const hash = completedDailyList[0]?.title.length || 0;
          return [
            { label: 'Morning', val: hash % 2 === 0 ? 20 : 10 },
            { label: 'Noon', val: hash % 2 === 1 ? 80 : 30 },
            { label: 'Evening', val: hash % 3 === 0 ? 100 : 50 },
            { label: 'Night', val: hash % 3 === 1 ? 40 : 15 },
          ];
        }
        if (completedCount === 2) {
          return [
            { label: 'Morning', val: 30 },
            { label: 'Noon', val: 75 },
            { label: 'Evening', val: 95 },
            { label: 'Night', val: 35 },
          ];
        }
        return [
          { label: 'Morning', val: 40 },
          { label: 'Noon', val: 85 },
          { label: 'Evening', val: 100 },
          { label: 'Night', val: 75 },
        ];
      }
      case 'weekly': {
        const weekCompletions = completedWeekTasks.map(t => new Date(t.completedDate + 'T00:00:00').getDay());
        const monCount = weekCompletions.filter(day => day === 1 || day === 2).length;
        const wedCount = weekCompletions.filter(day => day === 3 || day === 4).length;
        const friCount = weekCompletions.filter(day => day === 5 || day === 6).length;
        const sunCount = weekCompletions.filter(day => day === 0).length;

        const maxCountInWeek = Math.max(1, monCount, wedCount, friCount, sunCount);
        const hasAny = completedWeekTasks.length > 0;
        return [
          { label: 'Mon', val: hasAny ? 10 + Math.round((monCount / maxCountInWeek) * 80) : 20 },
          { label: 'Wed', val: hasAny ? 15 + Math.round((wedCount / maxCountInWeek) * 80) : 35 },
          { label: 'Fri', val: hasAny ? 12 + Math.round((friCount / maxCountInWeek) * 80) : 40 },
          { label: 'Sun', val: hasAny ? 8 + Math.round((sunCount / maxCountInWeek) * 80) : 25 },
        ];
      }
      case 'monthly': {
        const monthCompletions = completedMonthTasks.map(t => new Date(t.completedDate + 'T00:00:00').getDate());
        const w1Count = monthCompletions.filter(d => d >= 1 && d <= 7).length;
        const w2Count = monthCompletions.filter(d => d >= 8 && d <= 14).length;
        const w3Count = monthCompletions.filter(d => d >= 15 && d <= 21).length;
        const w4Count = monthCompletions.filter(d => d >= 22).length;

        const maxCountInMonth = Math.max(1, w1Count, w2Count, w3Count, w4Count);
        const hasAny = completedMonthTasks.length > 0;
        return [
          { label: 'Week 1', val: hasAny ? 10 + Math.round((w1Count / maxCountInMonth) * 80) : 30 },
          { label: 'Week 2', val: hasAny ? 15 + Math.round((w2Count / maxCountInMonth) * 80) : 45 },
          { label: 'Week 3', val: hasAny ? 12 + Math.round((w3Count / maxCountInMonth) * 80) : 55 },
          { label: 'Week 4', val: hasAny ? 8 + Math.round((w4Count / maxCountInMonth) * 80) : 40 },
        ];
      }
      case 'yearly': {
        const yearCompletions = completedYearTasks.map(t => new Date(t.completedDate + 'T00:00:00').getMonth());
        const q1Count = yearCompletions.filter(m => m >= 0 && m <= 2).length;
        const q2Count = yearCompletions.filter(m => m >= 3 && m <= 5).length;
        const q3Count = yearCompletions.filter(m => m >= 6 && m <= 8).length;
        const q4Count = yearCompletions.filter(m => m >= 9 && m <= 11).length;

        const maxCountInYear = Math.max(1, q1Count, q2Count, q3Count, q4Count);
        const hasAny = completedYearTasks.length > 0;
        return [
          { label: 'Q1', val: hasAny ? 10 + Math.round((q1Count / maxCountInYear) * 80) : 15 },
          { label: 'Q2', val: hasAny ? 15 + Math.round((q2Count / maxCountInYear) * 80) : 30 },
          { label: 'Q3', val: hasAny ? 12 + Math.round((q3Count / maxCountInYear) * 80) : 50 },
          { label: 'Q4', val: hasAny ? 8 + Math.round((q4Count / maxCountInYear) * 80) : 35 },
        ];
      }
    }
  }, [selectedTimeframe, tasks, selectedProgressDate, completedWeekTasks, completedMonthTasks, completedYearTasks]);

  const chartPoints = useMemo(() => {
    const width = 320;
    const height = 110;
    const px = 25;
    const py = 15;
    const n = trendData.length;
    
    return trendData.map((d, i) => {
      const x = px + (i / (n - 1)) * (width - 2 * px);
      const y = (height - py) - (d.val / 100) * (height - 2 * py);
      return { ...d, x, y };
    });
  }, [trendData]);

  const linePath = useMemo(() => {
    return chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [chartPoints]);

  const areaPath = useMemo(() => {
    if (chartPoints.length === 0) return '';
    const first = chartPoints[0];
    const last = chartPoints[chartPoints.length - 1];
    const baselineY = 110 - 15;
    return `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [chartPoints, linePath]);

  const categoryStats = useMemo(() => {
    const cats = ['Work', 'Personal', 'Shopping', 'Life'];
    return cats.map(cat => {
      const catTasks = timeframeTasks.filter(t => t.category === cat);
      const total = catTasks.length;
      const completed = catTasks.filter(t => t.completed).length;
      const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { category: cat, total, completed, rate };
    });
  }, [timeframeTasks]);

  const heatmapGrid = useMemo(() => {
    const seed = tasks.filter(t => t.completed).length; 
    return Array.from({ length: 28 }, (_, i) => {
      const baseVal = (i * 3 + seed * 2) % 4; 
      let level: 0 | 1 | 2 | 3 = 0;
      if (baseVal === 1) level = 1;
      else if (baseVal === 2) level = 2;
      else if (baseVal === 3) level = 3;
      
      const isHeatmapToday = i === 24;
      return { level, isHeatmapToday, index: i };
    });
  }, [tasks]);
  // --- End of Analytics Calculations ---

  // Selected day of the viewed month (for filtering events)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  // Add Event modal trigger state
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  
  // Add Event Form State
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    time: '10:00 AM',
    date: '', // filled dynamically when opening modal or user inputs
    location: '',
    category: 'Work',
    tags: [],
    description: '',
    recurrence: 'none',
    reminderTime: 'none',
  });

  const [tagInput, setTagInput] = useState('');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Helper to convert 24hr format "HH:MM" to "HH:MM AM/PM"
  const convert24To12 = (val24: string): string => {
    if (!val24) return "12:00 PM";
    const parts = val24.split(":");
    let h = parseInt(parts[0], 10);
    const m = parts[1] || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    const hFormatted = h < 10 ? `0${h}` : `${h}`;
    return `${hFormatted}:${m} ${ampm}`;
  };

  // Helper to convert "HH:MM AM/PM" to "HH:MM" 24hr format
  const convert12To24 = (val12: string): string => {
    if (!val12) return "12:00";
    const match = val12.toUpperCase().match(/^(\d+):(\d+)\s*(AM|PM)?$/);
    if (!match) return "12:00";
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ampm = match[3] || 'AM';
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return `${h.toString().padStart(2, '0')}:${m}`;
  };

  // Long press and gesture states for events
  const [longPressedEvent, setLongPressedEvent] = useState<Event | null>(null);
  const longPressTimer = React.useRef<any>(null);
  const isDragging = React.useRef(false);
  const hasLongPressed = React.useRef(false);

  const startLongPress = (event: Event) => {
    isDragging.current = false;
    hasLongPressed.current = false;
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      if (!isDragging.current) {
        setLongPressedEvent(event);
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

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Programmatic calendar grid math
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  // Helper to map month indexes to short text
  const getMonthNameShort = (m: number) => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m];
  };

  // Trailing days of previous month
  const prevMonthDays = Array.from({ length: firstDayIndex }, (_, i) => {
    return {
      day: prevMonthTotalDays - firstDayIndex + i + 1,
      isCurrentMonth: false,
      monthOffset: -1,
    };
  });

  // Current month days
  const currentMonthDays = Array.from({ length: totalDays }, (_, i) => {
    return {
      day: i + 1,
      isCurrentMonth: true,
      monthOffset: 0,
    };
  });

  const totalCellsMapped = prevMonthDays.length + currentMonthDays.length;
  const remainingCells = Math.ceil(totalCellsMapped / 7) * 7 - totalCellsMapped;

  // Leading days of next month
  const nextMonthDays = Array.from({ length: remainingCells }, (_, i) => {
    return {
      day: i + 1,
      isCurrentMonth: false,
      monthOffset: 1,
    };
  });

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

  // Month traversal
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const parseEventDate = (dateStr: string): Date => {
    let y = 2026;
    let mIdx = 4; // May
    let d = 20;

    const trimmed = dateStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      const parts = trimmed.split('-');
      y = parseInt(parts[0]);
      mIdx = parseInt(parts[1]) - 1;
      d = parseInt(parts[2]);
    } else {
      const parts = trimmed.split(' ');
      if (parts.length >= 2) {
        const mStr = parts[0].toLowerCase().substring(0, 3);
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const foundIdx = months.indexOf(mStr);
        if (foundIdx !== -1) mIdx = foundIdx;
        d = parseInt(parts[1]);
      }
    }
    return new Date(y, mIdx, d, 0, 0, 0, 0);
  };

  // Match events to a particular calendar day cell
  const getEventsForDay = (dayNum: number, monthOffset: number) => {
    let targetMonthIdx = month + monthOffset;
    let targetYear = year;
    
    if (targetMonthIdx < 0) {
      targetMonthIdx = 11;
      targetYear = year - 1;
    } else if (targetMonthIdx > 11) {
      targetMonthIdx = 0;
      targetYear = year + 1;
    }

    const cellDate = new Date(targetYear, targetMonthIdx, dayNum, 0, 0, 0, 0);
    const monthShort = getMonthNameShort(targetMonthIdx).toLowerCase();
    
    return events.filter(e => {
      const startDate = parseEventDate(e.date);
      
      if (e.recurrence && e.recurrence !== 'none') {
        if (cellDate < startDate) return false;
        
        if (e.recurrence === 'daily') {
          return true;
        }
        if (e.recurrence === 'weekly') {
          return cellDate.getDay() === startDate.getDay();
        }
        if (e.recurrence === 'monthly') {
          return cellDate.getDate() === startDate.getDate();
        }
        if (e.recurrence === 'yearly') {
          return cellDate.getMonth() === startDate.getMonth() && cellDate.getDate() === startDate.getDate();
        }
      }

      const eDateStr = e.date.toLowerCase();
      const dayStr = dayNum.toString();

      // Check format like "May 20"
      const isShortMonthMatch = eDateStr.includes(monthShort) && 
        (new RegExp(`\\b${dayStr}\\b`).test(eDateStr) || eDateStr.endsWith(dayStr));

      // Check ISO format like "2026-05-20"
      const isoMonthStr = (targetMonthIdx + 1).toString().padStart(2, '0');
      const isoDayStr = dayNum.toString().padStart(2, '0');
      const isIsoMatch = eDateStr.includes(`-${isoMonthStr}-${isoDayStr}`) || eDateStr === `${targetYear}-${isoMonthStr}-${isoDayStr}`;

      return isShortMonthMatch || isIsoMatch;
    });
  };

  // Get current active selection name
  const formattedViewMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter events: either for a clicked selected day, or show the current viewed month's events
  const filteredEventsForList = useMemo(() => {
    if (selectedDay !== null) {
      return getEventsForDay(selectedDay, 0);
    }
    
    // Accumulate all events that fall on any active day of this viewed month
    const monthMatched = new Set<string>();
    const list: Event[] = [];
    
    for (let d = 1; d <= totalDays; d++) {
      const dayEvents = getEventsForDay(d, 0);
      dayEvents.forEach(e => {
        if (!monthMatched.has(e.id)) {
          monthMatched.add(e.id);
          list.push(e);
        }
      });
    }
    return list;
  }, [events, month, selectedDay, year, totalDays]);

  // Open creation modal pre-populated
  const handleOpenAddModal = () => {
    const defaultDay = selectedDay || today.getDate();
    const defaultMonthName = getMonthNameShort(month);
    setNewEvent({
      title: '',
      time: '12:00 PM',
      date: `${defaultMonthName} ${defaultDay}`,
      location: '',
      category: 'Work',
      tags: [],
      description: '',
      recurrence: 'none',
      reminderTime: 'none',
    });
    setTagInput('');
    setIsAddingEvent(true);
  };

  const handleAddEventSubmit = () => {
    if (!newEvent.title || !newEvent.date) return;
    if (editingEventId && setEvents) {
      setEvents(prev => prev.map(item => item.id === editingEventId ? { ...item, ...newEvent } : item));
    } else if (onAddEvent) {
      onAddEvent(newEvent);
    }
    setIsAddingEvent(false);
    setNewEvent({
      title: '',
      time: '12:00 PM',
      date: '',
      location: '',
      category: 'Work',
      tags: [],
      description: '',
      recurrence: 'none',
      reminderTime: 'none',
    });
    setEditingEventId(null);
    setSelectedDay(null); // Reset to show all matching new month events
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (setEvents) {
      setEvents(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !newEvent.tags?.includes(trimmed)) {
      setNewEvent(prev => ({
        ...prev,
        tags: [...(prev.tags || []), trimmed]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewEvent(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tagToRemove)
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-8"
    >
      {/* Calendar Header */}
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
            {subTab === 'progress' ? 'Focus Progress' : formattedViewMonth}
          </h1>
          <p className="text-slate-400 font-medium text-sm">
            {subTab === 'progress'
              ? selectedTimeframe === 'daily'
                ? `Productivity Analysis for ${formatFriendlyDate(selectedProgressDate)}`
                : selectedTimeframe === 'weekly'
                  ? `Weekly Productivity for ${formatFriendlyDate(weekStart.toISOString().split('T')[0])} - ${formatFriendlyDate(weekEnd.toISOString().split('T')[0])}`
                  : selectedTimeframe === 'monthly'
                    ? `Monthly Productivity during ${getMonthNameShort(selectedMonth)} ${selectedYear}`
                    : `Yearly Productivity Overview for the year ${selectedYear}`
              : selectedDay !== null 
                ? `Events for ${getMonthNameShort(month)} ${selectedDay}`
                : `${filteredEventsForList.length} scheduled event${filteredEventsForList.length === 1 ? '' : 's'} this month`
            }
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-brand text-white p-3.5 rounded-2xl shadow-lg shadow-brand/20 active:scale-95 transition-all text-xs font-bold"
        >
          <Plus size={22} />
        </button>
      </header>

      {/* Sub-tab view selection toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
        <button
          onClick={() => setSubTab('schedule')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
            subTab === 'schedule'
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-350'
          }`}
        >
          Schedule & Events
        </button>
        <button
          onClick={() => setSubTab('progress')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all text-center ${
            subTab === 'progress'
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-450 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-350'
          }`}
        >
          Progress Dashboard
        </button>
      </div>

      {subTab === 'schedule' ? (
        <>
          {/* Calendar Grid Section */}
          <section className="bento-card p-6 space-y-6 bg-white border border-border-main shadow-sm">
        {/* Navigation Toolbar */}
        <div className="flex justify-between items-center font-bold text-xs text-slate-400 uppercase tracking-widest px-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 hover:text-brand transition-colors rounded-xl border border-border-subtle"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-slate-500 font-bold tracking-widest font-display text-[10px]">
            {selectedDay !== null ? `${getMonthNameShort(month)} ${selectedDay}, ${year}` : 'Select Date to Filter'}
          </span>
          
          <button 
            onClick={nextMonth}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 hover:text-brand transition-colors rounded-xl border border-border-subtle"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Days of Week Row */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-350 uppercase tracking-widest mb-1 select-none">
              {day}
            </div>
          ))}

          {/* Days Numbers Cells Grid */}
          {allDays.map((cell, idx) => {
            const cellEvents = getEventsForDay(cell.day, cell.monthOffset);
            
            // Highlight today: Programmatic date identification
            const isToday = today.getDate() === cell.day && 
                            today.getMonth() === month + cell.monthOffset && 
                            today.getFullYear() === year;

            // Highlight selected
            const isSelected = selectedDay === cell.day && cell.monthOffset === 0;

            return (
              <button
                key={`${idx}-${cell.day}`}
                onClick={() => {
                  if (cell.monthOffset === 0) {
                    // Click current month toggles selection
                    setSelectedDay(selectedDay === cell.day ? null : cell.day);
                  } else {
                    // Click leading/trailing month automatically jumps to that month
                    setCurrentDate(new Date(year, month + cell.monthOffset, 1));
                    setSelectedDay(cell.day);
                  }
                }}
                className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-90 border select-none ${
                  isToday 
                    ? 'bg-brand text-white shadow-md shadow-brand/20 border-brand focus:ring-4 focus:ring-brand/15 font-bold z-10' 
                    : isSelected
                      ? 'bg-brand-light text-brand font-bold border-brand border-2 z-10 shadow-sm'
                      : cell.isCurrentMonth
                        ? 'bg-white text-slate-700 border-transparent hover:bg-slate-50 hover:border-border-main'
                        : 'bg-slate-50/50 text-slate-300 border-transparent opacity-40 hover:opacity-60'
                }`}
              >
                <span className="text-xs font-bold leading-none">{cell.day}</span>
                
                {/* Categorized visual indicator dots */}
                {cellEvents.length > 0 && (
                  <div className="absolute bottom-2 flex gap-0.5 justify-center">
                    {cellEvents.slice(0, 3).map((ev, dIdx) => (
                      <span 
                        key={ev.id || dIdx} 
                        className={`w-1 h-1 rounded-full ${
                          isToday 
                            ? 'bg-white' 
                            : ev.category === 'Work' 
                              ? 'bg-indigo-500' 
                              : ev.category === 'Personal'
                                ? 'bg-amber-400'
                                : ev.category === 'Life'
                                  ? 'bg-rose-400'
                                  : 'bg-emerald-400'
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Filter Reset Banner */}
        {selectedDay !== null && (
          <div className="flex justify-between items-center p-3 bg-brand-light/75 border border-brand/10 rounded-2xl text-xs text-brand font-semibold">
            <span>Filtering day {selectedDay}</span>
            <button 
              onClick={() => setSelectedDay(null)}
              className="px-2 py-1 bg-white hover:bg-brand hover:text-white transition-all rounded-lg shadow-sm border border-brand/10 tracking-wider text-[10px]"
            >
              CLEAR FILTER
            </button>
          </div>
        )}
      </section>

      {/* Events List display */}
      <section className="space-y-4 pb-28">
        <h2 className="text-lg font-bold text-slate-800 px-2 flex items-center justify-between">
          <span>
            {selectedDay !== null 
              ? `Events (${filteredEventsForList.length})`
              : 'Upcoming Milestones'
            }
          </span>
          {selectedDay === null && filteredEventsForList.length > 0 && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-full">
              This Month
            </span>
          )}
        </h2>

        <div className="space-y-3">
          {filteredEventsForList.length > 0 ? (
            filteredEventsForList.map(event => (
              <motion.div 
                layout
                key={event.id}
                onTouchStart={() => startLongPress(event)}
                onTouchEnd={cancelLongPress}
                onMouseDown={() => startLongPress(event)}
                onMouseUp={cancelLongPress}
                onMouseLeave={cancelLongPress}
                onClick={() => {
                  if (hasLongPressed.current) {
                    hasLongPressed.current = false;
                    return;
                  }
                }}
                className="bg-white p-5 rounded-[2rem] border border-border-main shadow-sm flex items-center gap-4 hover:border-brand/30 hover:shadow-md transition-all group relative overflow-hidden select-none cursor-pointer active:scale-[0.99]"
              >
                {/* Category color accent slide */}
                <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                  event.category === 'Work' ? 'bg-indigo-500' :
                  event.category === 'Personal' ? 'bg-amber-400' :
                  event.category === 'Life' ? 'bg-rose-450' : 'bg-emerald-400'
                }`} />

                <div className={`p-3.5 rounded-2xl shrink-0 relative ${
                  event.category === 'Work' ? 'bg-indigo-50/80 text-brand' :
                  event.category === 'Personal' ? 'bg-amber-50 text-amber-500' :
                  event.category === 'Life' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                }`}>
                  {event.reminderTime && event.reminderTime !== 'none' ? (
                    <BellRing size={18} className="animate-bounce" />
                  ) : (
                    <Clock size={18} />
                  )}
                  {event.recurrence && event.recurrence !== 'none' && (
                    <span className="absolute -top-1 -right-1 bg-slate-800 text-white rounded-full p-0.5 text-[7px]" title={`Repeats ${event.recurrence}`}>
                      <Repeat size={8} />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 pr-6 pl-1">
                  <h4 className="font-bold text-slate-700 truncate text-sm">{event.title}</h4>
                  <p className="text-xs font-semibold text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{event.time}</span>
                    <span className="text-slate-200 font-normal">•</span>
                    <span>{event.category}</span>
                    <span className="text-slate-200 font-normal">•</span>
                    <span className="text-brand font-bold bg-brand-light px-1.5 py-0.5 rounded-md text-[9px] uppercase tracking-wide">{event.date}</span>
                  </p>
                  
                  {event.location && (
                    <p className="text-[10px] text-slate-400/90 font-medium flex items-center gap-1 mt-1.5">
                      <MapPin size={10} className="text-slate-300" />
                      <span>{event.location}</span>
                    </p>
                  )}

                  {event.tags && event.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {event.tags.map(tag => (
                        <span key={tag} className="text-[8px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event Deletion Button */}
                <button 
                  onClick={(e) => handleDeleteEvent(event.id, e)}
                  title="Remove event"
                  className="p-2 text-slate-300 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </motion.div>
            ))
          ) : (
            <div className="bento-card bg-slate-50/50 p-10 flex flex-col items-center justify-center text-center space-y-3 border-dashed">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-600">No events scheduled</h4>
                <p className="text-xs text-slate-400 mt-0.5">Define your milestones or tap individual dates to add actions.</p>
              </div>
              <button 
                onClick={handleOpenAddModal}
                className="mt-2 text-xs font-bold text-brand bg-brand-light py-2 px-4 rounded-xl hover:bg-brand hover:text-white transition-all shadow-sm"
              >
                + ADD EVENTS
              </button>
            </div>
          )}
        </div>
      </section>
      </>
      ) : (
        <div className="space-y-6">
          {/* Timeline Pill Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden select-none">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setSelectedTimeframe(tf);
                  setHoveredNodeIdx(null);
                }}
                className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-wider relative transition-all duration-300 z-10 cursor-pointer ${
                  selectedTimeframe === tf
                    ? 'bg-white dark:bg-slate-700 text-brand shadow-sm font-extrabold scale-[1.01] border border-slate-200/20'
                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-450 dark:hover:text-slate-300'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Core Analytics Grid: Completion Rate & Motivation Status */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bento-card p-6 bg-white dark:bg-slate-850 border border-slate-150/40 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Award size={12} className="text-brand" /> Completion Rating
                </p>
                <h3 className="text-xl font-extrabold text-slate-850 dark:text-white">
                  {completedTimeframeTasks} <span className="text-xs text-slate-400 font-bold">of {totalTimeframeTasks} completed</span>
                </h3>
                
                {/* Dynamic assessment banner */}
                <div className="pt-1 select-none">
                  <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border leading-none ${assessment.color}`}>
                    {assessment.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed pt-1">
                  {assessment.desc}
                </p>
              </div>

              {/* Circular Ring Progress Chart */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center select-none">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="6.5"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="34"
                    className="stroke-brand"
                    strokeWidth="6.5"
                    fill="transparent"
                    strokeDasharray="213.63"
                    initial={{ strokeDashoffset: 213.63 }}
                    animate={{ strokeDashoffset: 213.63 - (213.63 * completionRate) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-black text-slate-800 dark:text-white">{completionRate}%</span>
                  <span className="text-[8px] font-bold uppercase text-slate-350 tracking-wider">DONE</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Chart & Historical Trend Graph */}
          <div className="bento-card p-6 bg-white dark:bg-slate-855 border border-slate-150/40 shadow-sm space-y-4">
            <div className="flex justify-between items-center px-1">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-brand" /> Productivity Trends
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {selectedTimeframe === 'daily'
                    ? `Focus level variation for ${formatFriendlyDate(selectedProgressDate)}`
                    : selectedTimeframe === 'weekly'
                      ? `Weekly distribution starting ${formatFriendlyDate(weekStart.toISOString().split('T')[0])}`
                      : selectedTimeframe === 'monthly'
                        ? `Monthly trajectory during ${getMonthNameShort(selectedMonth)} ${selectedYear}`
                        : `Yearly quarterly stats for the year ${selectedYear}`
                  }
                </p>
              </div>
              <Sparkles size={14} className="text-brand animate-pulse" />
            </div>

            {/* Glowing SVG Area Spline Chart with Tooltips */}
            <div className="relative h-32 w-full mt-2 select-none">
              <svg viewBox="0 0 325 110" className="w-full h-full overflow-visible animate-fade-in">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-color)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--brand-color)" stopOpacity="0.00" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide Lines */}
                <line x1="20" y1="15" x2="305" y2="15" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800/80" />
                <line x1="20" y1="55" x2="305" y2="55" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" className="dark:stroke-slate-800/80" />
                <line x1="20" y1="95" x2="305" y2="95" stroke="#e2e8f0" strokeWidth="1" className="dark:stroke-slate-800/80" />

                {/* filled Area under the graph */}
                <motion.path
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  d={areaPath}
                  fill="url(#chartGradient)"
                />

                {/* Drawn Graph Line */}
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  d={linePath}
                  fill="none"
                  stroke="var(--brand-color)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Anchor Points */}
                {chartPoints.map((p, idx) => (
                  <g key={idx} className="cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="12"
                      fill="transparent"
                      onMouseEnter={() => setHoveredNodeIdx(idx)}
                      onMouseLeave={() => setHoveredNodeIdx(null)}
                      onTouchStart={() => setHoveredNodeIdx(idx)}
                    />
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r={hoveredNodeIdx === idx ? "5.5" : "4.5"}
                      className="fill-white stroke-brand"
                      strokeWidth={hoveredNodeIdx === idx ? "3.5" : "2.5"}
                    />
                  </g>
                ))}
              </svg>

              {/* Hover Node Tooltip Banner */}
              {hoveredNodeIdx !== null && trendData[hoveredNodeIdx] && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white dark:bg-slate-800 dark:text-slate-100 rounded-lg px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase flex items-center gap-1 shadow-lg pointer-events-none transition-all duration-150 border border-white/10">
                  <Activity size={8} className="text-emerald-405" />
                  <span>{trendData[hoveredNodeIdx].label}: {trendData[hoveredNodeIdx].val}% score</span>
                </div>
              )}
            </div>

            {/* Bottom X-Axis labels */}
            <div className="flex justify-between text-[9px] font-black uppercase text-slate-350 tracking-wider px-4">
              {trendData.map((d, i) => (
                <span key={i} className={hoveredNodeIdx === i ? 'text-brand font-black' : ''}>
                  {d.label}
                </span>
              ))}
            </div>
          </div>

          {/* Activity Category Completion Breakdown */}
          <div className="bento-card p-6 bg-white dark:bg-slate-860 border border-slate-150/40 shadow-sm space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 flex-wrap">
                <PieChart size={14} className="text-brand" /> Category Breakdown
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {selectedTimeframe === 'daily'
                  ? `Focus allocation for ${formatFriendlyDate(selectedProgressDate)}`
                  : selectedTimeframe === 'weekly'
                    ? `Focus distribution for start-of-week ${formatFriendlyDate(weekStart.toISOString().split('T')[0])}`
                    : selectedTimeframe === 'monthly'
                      ? `Focus ratios during ${getMonthNameShort(selectedMonth)} ${selectedYear}`
                      : `Yearly domain balance for ${selectedYear}`
                }
              </p>
            </div>

            <div className="space-y-3 pt-1">
              {categoryStats.map(stat => {
                const isWork = stat.category === 'Work';
                const isPersonal = stat.category === 'Personal';
                const isLife = stat.category === 'Life';
                
                const barColorClass = isWork ? 'bg-brand' :
                                      isPersonal ? 'bg-amber-400' :
                                      isLife ? 'bg-rose-450' : 'bg-emerald-500';

                const bgTrackClass = isWork ? 'bg-indigo-50/70 dark:bg-indigo-950/20' :
                                     isPersonal ? 'bg-amber-50/70 dark:bg-amber-950/20' :
                                     isLife ? 'bg-rose-50/70 dark:bg-rose-950/20' : 'bg-emerald-50/70 dark:bg-emerald-950/20';

                return (
                  <div key={stat.category} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-slate-600 dark:text-slate-350">{stat.category}</span>
                      <span className="text-slate-450 dark:text-slate-400">
                        {stat.total > 0 ? `${stat.completed} of ${stat.total} done` : 'No milestones set'}
                      </span>
                    </div>
                    {stat.total > 0 ? (
                      <div className={`w-full h-1.5 rounded-full ${bgTrackClass} relative overflow-hidden`}>
                        <motion.div
                          className={`h-full rounded-full ${barColorClass}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${stat.rate}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-dashed border-slate-200/30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          {/* Interactive Progress Calendar and Completed Tasks Panel */}
          <div className="bento-card p-6 bg-white dark:bg-slate-865 border border-slate-150/40 shadow-sm space-y-5">
            <div className="flex justify-between items-start flex-wrap gap-2">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5 flex-wrap">
                  <DateIcon size={14} className="text-brand" /> Completion Progress Calendar
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Completed milestones mapped by calendar date
                </p>
              </div>

              {/* Inline Month Switcher for Calendar Widget */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800 select-none">
                <button 
                  onClick={() => setCurrentDate(new Date(year, month - 1, 1))} 
                  className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/55 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="text-[9px] font-extrabold text-slate-650 dark:text-slate-350 uppercase tracking-wider px-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]} {year}
                </span>
                <button 
                  onClick={() => setCurrentDate(new Date(year, month + 1, 1))} 
                  className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700/55 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  title="Next month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="space-y-3 pt-1">
              {/* Day of week headers */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayChar, i) => (
                  <span key={i} className="text-[8px] font-black text-slate-350 dark:text-slate-500 uppercase tracking-widest">
                    {dayChar}
                  </span>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-1.5 animate-fade-in">
                {allDays.map((cell, idx) => {
                  const cellDateStr = getCellDateString(cell.day, cell.monthOffset);
                  const completedTasksOnCell = tasks.filter(t => t.completed && t.completedDate === cellDateStr);
                  const completedCount = completedTasksOnCell.length;
                  const isSelected = selectedProgressDate === cellDateStr;
                  const isCellToday = today.getFullYear() === (year + (month + cell.monthOffset < 0 ? -1 : month + cell.monthOffset > 11 ? 1 : 0)) &&
                                     today.getMonth() === ((month + cell.monthOffset + 12) % 12) &&
                                     today.getDate() === cell.day;

                  // GitHub-like activity heatmap style cell color
                  let cellBgColor = 'bg-slate-50/70 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/30 text-slate-500 dark:text-slate-400';
                  if (completedCount === 1) {
                    cellBgColor = 'bg-brand/10 border-brand/15 text-brand dark:bg-brand/15 dark:text-brand';
                  } else if (completedCount === 2) {
                    cellBgColor = 'bg-brand/35 border-brand/25 text-brand dark:bg-brand/35 dark:text-brand';
                  } else if (completedCount >= 3) {
                    cellBgColor = 'bg-brand text-white border-transparent';
                  }

                  const opacityClass = cell.isCurrentMonth ? 'opacity-100 font-extrabold' : 'opacity-40 font-medium text-slate-350 dark:text-slate-600';

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedProgressDate(cellDateStr)}
                      className={`h-7.5 rounded-[8px] text-[10px] border relative flex items-center justify-center transition-all cursor-pointer ${cellBgColor} ${opacityClass} ${
                        isSelected 
                          ? 'ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900 scale-105 z-10 font-black' 
                          : 'hover:scale-102 hover:border-brand/40'
                      } ${
                        isCellToday && !isSelected ? 'ring-1 ring-slate-350 ring-offset-1 dark:ring-offset-slate-900' : ''
                      }`}
                      title={`${completedCount} task${completedCount === 1 ? '' : 's'} completed on ${cellDateStr}`}
                    >
                      <span>{cell.day}</span>
                      {completedCount > 0 && (
                        <span className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                          completedCount >= 3 ? 'bg-white' : 'bg-brand'
                        }`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Intensity Legend */}
              <div className="flex justify-between items-center w-full text-[8px] font-bold uppercase text-slate-350 dark:text-slate-450 tracking-wider pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Completed Goal Level</span>
                <div className="flex items-center gap-1.5 leading-none">
                  <span>0</span>
                  <div className="w-2.5 h-2.5 rounded bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800" />
                  <div className="w-2.5 h-2.5 rounded bg-brand/10 dark:bg-brand/15 border border-brand/15" />
                  <div className="w-2.5 h-2.5 rounded bg-brand/35 dark:bg-brand/35 border border-brand/25" />
                  <div className="w-2.5 h-2.5 rounded bg-brand border-transparent" />
                  <span>3+</span>
                </div>
              </div>
            </div>

            {/* Selected Date Completed Tasks Panel */}
            <div className="bg-slate-50/70 dark:bg-slate-800/25 border border-slate-100 dark:border-slate-800/50 rounded-2xl p-4.5 space-y-3.5">
              <div className="flex justify-between items-center border-b border-dashed border-slate-150 dark:border-slate-800/80 pb-2">
                <span className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Activity size={12} className="text-brand animate-pulse" />
                  Completed on {formatFriendlyDate(selectedProgressDate)}
                </span>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-slate-705 text-slate-550 dark:text-slate-350 shrink-0">
                  {tasks.filter(t => t.completed && t.completedDate === selectedProgressDate).length} completed
                </span>
              </div>

              {/* Task list displaying items completed on that date */}
              <div className="space-y-2">
                {(() => {
                  const completedList = tasks.filter(t => t.completed && t.completedDate === selectedProgressDate);
                  if (completedList.length === 0) {
                    return (
                      <div className="py-5 text-center space-y-2 select-none">
                        <CheckCircle2 size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
                        <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold max-w-[200px] mx-auto leading-normal">
                          No tasks completed on this date. Keep up the high focus momentum to populate your workspace!
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 gap-2">
                      {completedList.map(task => {
                        const isWork = task.category === 'Work';
                        const isPersonal = task.category === 'Personal';
                        const isLife = task.category === 'Life';

                        const badgeColor = isWork ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 border-indigo-150/10' :
                                           isPersonal ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-500 border-amber-150/10' :
                                           isLife ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 border-rose-150/10' :
                                           'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-150/10';

                        return (
                          <div 
                            key={task.id} 
                            className="bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-700/40 flex gap-2.5 items-center shadow-xs hover:border-brand/20 transition-all select-none"
                          >
                            <div className="w-5 h-5 rounded-full bg-brand-light dark:bg-brand/15 flex items-center justify-center shrink-0 border border-brand/20">
                              <Check size={11} className="text-brand stroke-[4px]" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-tight">
                                {task.title}
                              </p>
                              {task.description && (
                                <p className="text-[10px] text-slate-400 dark:text-slate-450 font-medium truncate mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border shrink-0 ${badgeColor}`}>
                              {task.category}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Addition Form Modal */}
      <AnimatePresence>
        {isAddingEvent && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddingEvent(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                  {editingEventId ? 'Edit Event Details' : 'Schedule Event'}
                </h2>
                <button 
                  onClick={() => setIsAddingEvent(false)}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Event Title</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="E.g., Design Presentation, Dental appt"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <Clock size={10} /> Time Pick
                    </label>
                    <input
                      type="time"
                      value={convert12To24(newEvent.time || '12:00 PM')}
                      onChange={(e) => {
                        const val12 = convert24To12(e.target.value);
                        setNewEvent({ ...newEvent, time: val12 });
                      }}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-750 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <DateIcon size={10} /> Date
                    </label>
                    <input
                      type="text"
                      placeholder="E.g., May 20"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <Repeat size={10} /> Repeat Mode
                    </label>
                    <select
                      value={newEvent.recurrence || 'none'}
                      onChange={(e) => setNewEvent({ ...newEvent, recurrence: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 shadow-inner text-xs appearance-none cursor-pointer outline-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20className%3D%22lucide%20lucide-chevron-down%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10"
                    >
                      <option value="none">Does not repeat</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <Bell size={10} /> Alert Alarm
                    </label>
                    <select
                      value={newEvent.reminderTime || 'none'}
                      onChange={(e) => setNewEvent({ ...newEvent, reminderTime: e.target.value as any })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 shadow-inner text-xs appearance-none cursor-pointer outline-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20className%3D%22lucide%20lucide-chevron-down%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_16px_center] bg-no-repeat pr-10"
                    >
                      <option value="none">No reminder</option>
                      <option value="at_time">At event time</option>
                      <option value="5_min">5 minutes before</option>
                      <option value="15_min">15 minutes before</option>
                      <option value="30_min">30 minutes before</option>
                      <option value="1_hour">1 hour before</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                    <MapPin size={10} /> Location (Optional)
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
                  <div className="grid grid-cols-4 gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setNewEvent({ ...newEvent, category: cat })}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border-2 transition-all ${
                          newEvent.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white border-border-main text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 align-middle">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {newEvent.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[9px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 leading-none uppercase tracking-wide">
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="text-brand/80 hover:text-brand"><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddEventSubmit}
                  disabled={!newEvent.title || !newEvent.date}
                  className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
                >
                  <Plus size={18} />
                  <span>{editingEventId ? 'SAVE CHANGES' : 'PUBLISH SCHEDULING'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Long Press Actions Popover Overlay */}
      <AnimatePresence>
        {longPressedEvent && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLongPressedEvent(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-[280px] rounded-[2rem] p-6 shadow-2xl relative z-20 text-center space-y-4 border border-border-main"
            >
              <div>
                <h3 className="text-xs font-bold text-slate-800 line-clamp-1 mb-1 px-2">{longPressedEvent.title}</h3>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Event Options</p>
              </div>

              <div className="flex flex-col gap-2 pt-1 font-sans">
                <button
                  onClick={() => {
                    setEditingEventId(longPressedEvent.id);
                    setNewEvent({ ...longPressedEvent });
                    setIsAddingEvent(true);
                    setLongPressedEvent(null);
                  }}
                  className="w-full bg-slate-50 hover:bg-brand/10 hover:text-brand text-slate-700 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                >
                  <span>Edit Event Details</span>
                </button>

                <button
                  onClick={() => {
                    if (setEvents) {
                      setEvents(prev => prev.filter(item => item.id !== longPressedEvent.id));
                    }
                    setLongPressedEvent(null);
                  }}
                  className="w-full bg-rose-50 hover:bg-rose-100/80 text-rose-600 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 border border-rose-100"
                >
                  <span>Remove Event</span>
                </button>

                <button
                  onClick={() => setLongPressedEvent(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer active:scale-95"
                >
                  <span>Cancel</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Calendar;
