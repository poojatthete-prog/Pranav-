import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { Event } from '../types';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarProps {
  events: Event[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const [currentMonth] = useState('October 2026');
  
  // Generating a simple calendar grid for Oct 2026
  // Oct 1st 2026 is a Thursday
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">{currentMonth}</h1>
          <p className="text-slate-400 font-medium text-sm">{events.length} events scheduled</p>
        </div>
        <button className="bg-brand text-white p-3 rounded-2xl shadow-lg shadow-brand/20 active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </header>

      <section className="bento-card p-6 space-y-6">
        <div className="flex justify-between items-center font-bold text-sm text-slate-400 uppercase tracking-widest px-2">
          <button className="p-1 hover:text-brand transition-colors"><ChevronLeft size={18} /></button>
          <span>Selection</span>
          <button className="p-1 hover:text-brand transition-colors"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-2">
              {day}
            </div>
          ))}
          {calendarDays.map(day => {
            const isToday = day === 7; // Updated to match current system date (May 7, but Oct for theme)
            // Simplified logic for showing event dot
            const dayStr = day.toString().padStart(2, '0');
            const hasEvent = events.some(e => e.date.includes(dayStr) || e.date.includes(day.toString()));
            
            return (
              <button
                key={day}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all active:scale-90 ${
                  isToday 
                    ? 'bg-brand text-white shadow-lg shadow-brand/20 ring-4 ring-brand/10' 
                    : 'hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-sm font-bold">{day}</span>
                {hasEvent && !isToday && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-brand rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 pb-24">
        <h2 className="text-lg font-bold text-slate-800 px-2">Upcoming Events</h2>
        <div className="space-y-3">
          {events.map(event => (
            <div 
              key={event.id}
              className="bg-white p-5 rounded-[2rem] border border-border-main shadow-sm flex items-center gap-5 hover:border-brand/30 transition-all cursor-pointer"
            >
              <div className={`p-3 rounded-2xl ${
                event.category === 'Work' ? 'bg-indigo-50 text-brand' : 'bg-rose-50 text-rose-500'
              }`}>
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-700">{event.title}</h4>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">{event.time} • {event.category} • {event.date}</p>
              </div>
              <ChevronRight className="text-slate-200" size={18} />
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
};

export default Calendar;

