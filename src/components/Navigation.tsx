import { LayoutDashboard, Calendar as CalendarIcon, Timer, StickyNote, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { AppSection } from '../types';

interface NavigationProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
}

export default function Navigation({ activeSection, onSectionChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Board', icon: LayoutDashboard },
    { id: 'calendar' as const, label: 'Events', icon: CalendarIcon },
    { id: 'timer' as const, label: 'Focus', icon: Timer },
    { id: 'notes' as const, label: 'Notes', icon: StickyNote },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm sm:max-w-md glass-morphism py-3 px-5 rounded-[2rem] flex justify-around items-center z-50 border border-white/20 dark:border-white/10 shadow-xl overflow-hidden">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            id={`nav-item-${id}`}
            onClick={() => onSectionChange(id)}
            className="flex flex-col items-center gap-1 transition-all relative group cursor-pointer"
          >
            <div className="relative p-2 rounded-xl flex items-center justify-center">
              {isActive && (
                <motion.div
                  layoutId="activeNavBackground"
                  className="absolute inset-0 bg-brand/12 dark:bg-brand/20 border border-brand/25 dark:border-brand/30 rounded-xl shadow-sm"
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                />
              )}
              <Icon 
                size={22} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${
                  isActive 
                    ? 'text-brand' 
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-650 dark:group-hover:text-slate-350'
                }`}
              />
            </div>
            <span 
              className={`text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${
                isActive 
                  ? 'text-brand opacity-100 font-extrabold translate-y-0' 
                  : 'text-slate-400 dark:text-slate-500 opacity-60 group-hover:opacity-90 group-hover:text-slate-600 dark:group-hover:text-slate-400 scale-95'
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

