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
    <nav className="fixed bottom-0 left-0 right-0 glass-morphism py-5 px-8 flex justify-around items-center z-50">
      {navItems.map(({ id, label, icon: Icon }) => {
        const isActive = activeSection === id;
        return (
          <button
            key={id}
            id={`nav-item-${id}`}
            onClick={() => onSectionChange(id)}
            className={`flex flex-col items-center gap-1.5 transition-all relative ${
              isActive ? 'text-brand' : 'text-slate-400 hover:text-slate-500'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-brand-light' : 'bg-transparent'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-60'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
