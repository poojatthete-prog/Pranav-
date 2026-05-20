import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, 
  Trash2, Tag, X, Calendar as DateIcon, Bell, BellRing, Repeat 
} from 'lucide-react';
import { Event } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Life'];

interface CalendarProps {
  events: Event[];
  onAddEvent?: (event: Partial<Event>) => void;
  setEvents?: React.Dispatch<React.SetStateAction<Event[]>>;
}

const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, setEvents }) => {
  // Current date for real-time reference
  const today = new Date();
  
  // Dynamic navigation date reference state
  const [currentDate, setCurrentDate] = useState(() => {
    // If system clock is May 2026, it will automatically open in May 2026!
    return new Date();
  });
  
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
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{formattedViewMonth}</h1>
          <p className="text-slate-400 font-medium text-sm">
            {selectedDay !== null 
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
