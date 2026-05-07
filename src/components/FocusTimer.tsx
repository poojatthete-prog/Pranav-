import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Bell, Settings2, CheckCircle2, Clock } from 'lucide-react';

export default function FocusTimer() {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(25 * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const presets = [
    { label: 'Pomodoro', mins: 25, color: 'bg-indigo-500' },
    { label: 'Short Break', mins: 5, color: 'bg-emerald-500' },
    { label: 'Long Break', mins: 15, color: 'bg-amber-500' },
  ];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      // Play a sound or show notification
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(initialTime);
  };

  const handlePreset = (mins: number) => {
    setIsActive(false);
    const secs = mins * 60;
    setInitialTime(secs);
    setTimeLeft(secs);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((initialTime - timeLeft) / initialTime) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Focus Hub</h1>
          <p className="text-slate-400 font-medium text-sm">Design your flow state</p>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={`p-3 rounded-2xl transition-all ${showSettings ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-white border border-border-main text-slate-400'}`}
        >
          <Settings2 size={24} />
        </button>
      </header>

      <section className="flex flex-col items-center justify-center space-y-12 py-8">
        {/* Circular Progress Container */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-slate-100"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="754"
              initial={{ strokeDashoffset: 754 }}
              animate={{ strokeDashoffset: 754 - (754 * progress) / 100 }}
              fill="transparent"
              strokeLinecap="round"
              className="text-brand transition-all duration-300"
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-6xl font-display font-bold text-slate-800 tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Remaining
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-8">
          <button 
            onClick={resetTimer}
            className="p-4 bg-white border border-border-main rounded-[1.5rem] text-slate-400 active:scale-95 transition-all shadow-sm"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-xl active:scale-95 transition-all ${
              isActive ? 'bg-amber-500 shadow-amber-500/20' : 'bg-brand shadow-brand/20'
            }`}
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
          </button>

          <div className="p-4 bg-white border border-border-main rounded-[1.5rem] text-slate-400 shadow-sm relative group cursor-pointer active:scale-95 transition-all">
            <Bell size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand rounded-full border-2 border-white shadow-sm" />
          </div>
        </div>
      </section>

      <AnimatePresence mode="wait">
        {showSettings ? (
          <motion.section
            key="settings"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bento-card p-6 space-y-6"
          >
            <div className="space-y-1.5 px-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Custom Duration (Minutes)</label>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                />
                <button 
                  onClick={() => handlePreset(parseInt(customMinutes) || 25)}
                  className="bg-brand text-white px-6 rounded-2xl font-bold shadow-lg shadow-brand/20 active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Timer Presets</label>
              <div className="grid grid-cols-3 gap-3">
                {presets.map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePreset(p.mins)}
                    className="p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-brand/30 transition-all text-center space-y-1.5"
                  >
                    <p className="text-xs font-bold text-slate-700">{p.label}</p>
                    <p className="text-lg font-display font-bold text-brand">{p.mins}m</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-4 pb-24"
          >
            <div className="bento-card p-6 flex flex-col justify-between h-40 bg-indigo-50 border-indigo-100">
              <div className="p-2.5 bg-brand text-white rounded-xl w-fit">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold text-slate-800">4</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Sessions Today</p>
              </div>
            </div>
            <div className="bento-card p-6 flex flex-col justify-between h-40">
              <div className="p-2.5 bg-brand-light text-brand rounded-xl w-fit">
                <Clock size={20} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-2xl font-bold text-slate-800">100m</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Flow Time</p>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
