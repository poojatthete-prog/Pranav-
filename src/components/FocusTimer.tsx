import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Pause, RotateCcw, Bell, Settings2, CheckCircle2, 
  Clock, Coffee, Volume2, VolumeX, Trash2, Sparkles, X, ChevronRight, Sliders, BellRing
} from 'lucide-react';

interface FocusTimerProps {
  addNotification?: (title: string, message: string, type?: 'info' | 'success' | 'alert') => void;
  showToast?: (message: string) => void;
}

interface FocusAlert {
  id: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'alert' | 'tips';
}

const FocusTimer: React.FC<FocusTimerProps> = ({ addNotification, showToast }) => {
  // Load initial customization and stats from localStorage (with intelligent fallbacks)
  const [flowDuration, setFlowDuration] = useState<number>(() => {
    return Number(localStorage.getItem('focus_flow_duration')) || 25;
  });
  const [breakDuration, setBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('focus_break_duration')) || 5;
  });
  const [sessionsToday, setSessionsToday] = useState<number>(() => {
    const saved = localStorage.getItem('focus_sessions_today');
    return saved !== null ? Number(saved) : 4;
  });
  const [totalFlowTime, setTotalFlowTime] = useState<number>(() => {
    const saved = localStorage.getItem('focus_total_flow_time');
    return saved !== null ? Number(saved) : 100;
  });
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem('focus_reminders_enabled') !== 'false';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('focus_sound_enabled') !== 'false';
  });
  const [postureAlerts, setPostureAlerts] = useState<boolean>(() => {
    return localStorage.getItem('focus_posture_alerts') === 'true';
  });

  // Timer State
  const [isBreakMode, setIsBreakMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => flowDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [initialTime, setInitialTime] = useState(() => flowDuration * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [customizationTab, setCustomizationTab] = useState<'flow' | 'break' | 'reminders'>('flow');

  // Multipliers for timer tracking
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const halfwayTriggered = useRef(false);

  // Focus Alert system - rendering on-screen alerts
  const [focusAlerts, setFocusAlerts] = useState<FocusAlert[]>(() => {
    const saved = localStorage.getItem('focus_alerts_feed');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: 'f-1',
        message: 'Welcome back to Focus Hub. Click metric cards or settings to customize duration!',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'info'
      },
      {
        id: 'f-2',
        message: 'Tip: Work for 25 minutes, then recharge with a 5-minute break to elevate creativity.',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        type: 'tips'
      }
    ];
  });

  // Synchronizers to sync values in localStorage
  useEffect(() => {
    localStorage.setItem('focus_flow_duration', flowDuration.toString());
  }, [flowDuration]);

  useEffect(() => {
    localStorage.setItem('focus_break_duration', breakDuration.toString());
  }, [breakDuration]);

  useEffect(() => {
    localStorage.setItem('focus_sessions_today', sessionsToday.toString());
  }, [sessionsToday]);

  useEffect(() => {
    localStorage.setItem('focus_total_flow_time', totalFlowTime.toString());
  }, [totalFlowTime]);

  useEffect(() => {
    localStorage.setItem('focus_reminders_enabled', remindersEnabled.toString());
    localStorage.setItem('focus_sound_enabled', soundEnabled.toString());
    localStorage.setItem('focus_posture_alerts', postureAlerts.toString());
  }, [remindersEnabled, soundEnabled, postureAlerts]);

  useEffect(() => {
    localStorage.setItem('focus_alerts_feed', JSON.stringify(focusAlerts));
  }, [focusAlerts]);

  // Utility to append logs both directly on-screen and to the global notification system
  const pushFocusAlert = (message: string, type: 'info' | 'success' | 'alert' | 'tips' = 'info') => {
    const newAlert: FocusAlert = {
      id: `fa-${Date.now()}`,
      message,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      type
    };

    setFocusAlerts(prev => [newAlert, ...prev].slice(0, 15)); // Cap list to latest 15 alerts

    if (remindersEnabled && addNotification) {
      // Forward critical alerts to global system
      if (type === 'success') {
        addNotification('Focus Milestone 🎉', message, 'success');
      } else if (type === 'alert') {
        addNotification('Focus Reminder 🔔', message, 'alert');
      }
    }
  };

  const clearAlerts = () => {
    setFocusAlerts([]);
  };

  // Timer Core Hook
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const nextVal = prev - 1;
          
          // Check halfway point
          const ratio = (initialTime - nextVal) / initialTime;
          if (ratio >= 0.5 && !halfwayTriggered.current) {
            halfwayTriggered.current = true;
            if (remindersEnabled) {
              const currentModeName = isBreakMode ? 'Break' : 'Focus';
              const alertMsg = `Aura Chime: You are halfway through your ${currentModeName} session! Stay steady.`;
              pushFocusAlert(alertMsg, 'info');
              if (showToast) showToast('50% milestone passed!');
              playBeep(2, 600, 0.1);
            }
          }

          // Hydration / Posture alert during active focus (mocked at the 5-minute remains or periodic index)
          if (postureAlerts && nextVal === Math.floor(initialTime * 0.75) && !isBreakMode) {
            pushFocusAlert('🧘 Hydration & Posture reminder: Shake out your shoulders and take a sip of water.', 'tips');
          }

          return nextVal;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      playSessionComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, isBreakMode, initialTime, remindersEnabled, postureAlerts]);

  // Play audio chimes utilizing standard Web Audio APIs
  const playBeep = (octaves = 1, frequency = 440, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      let startTime = audioCtx.currentTime;
      for (let i = 0; i < octaves; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency * (1 + i * 0.5), startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
        startTime += duration + 0.05;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const playSessionComplete = () => {
    if (isBreakMode) {
      // Break mode completed, return to work
      setIsBreakMode(false);
      const nextTime = flowDuration * 60;
      setInitialTime(nextTime);
      setTimeLeft(nextTime);
      halfwayTriggered.current = false;
      pushFocusAlert('🌅 Break Completed! Back to flow time. Select Start to begin.', 'success');
      playBeep(2, 520, 0.2);
    } else {
      // Work mode completed
      setSessionsToday(prev => prev + 1);
      setTotalFlowTime(prev => prev + flowDuration);
      setIsBreakMode(true);
      const nextTime = breakDuration * 60;
      setInitialTime(nextTime);
      setTimeLeft(nextTime);
      halfwayTriggered.current = false;
      pushFocusAlert(`🏆 Focus Block Finished! Enjoy your ${breakDuration}-minute break.`, 'success');
      playBeep(3, 440, 0.25);
    }
  };

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      const modeName = isBreakMode ? 'Break' : 'Focus session';
      pushFocusAlert(`🚀 ${modeName} commenced! Block out all noise.`, 'info');
      playBeep(1, 330, 0.1);
    } else {
      setIsActive(false);
      pushFocusAlert('⏸ Session suspended temporarily.', 'alert');
      playBeep(1, 220, 0.1);
    }
  };
  
  const resetTimer = () => {
    setIsActive(false);
    halfwayTriggered.current = false;
    const timeSecs = (isBreakMode ? breakDuration : flowDuration) * 60;
    setTimeLeft(timeSecs);
    setInitialTime(timeSecs);
    pushFocusAlert('🔄 Timer reverted to initial setup.', 'alert');
    playBeep(1, 150, 0.15);
  };

  const setManualFlow = (mins: number) => {
    setIsActive(false);
    setIsBreakMode(false);
    setFlowDuration(mins);
    const secs = mins * 60;
    setInitialTime(secs);
    setTimeLeft(secs);
    halfwayTriggered.current = false;
    pushFocusAlert(`⏱ Flow time configured to ${mins} minutes.`, 'info');
    if (showToast) showToast(`Flow set to ${mins}m`);
    playBeep(1, 440, 0.1);
  };

  const setManualBreak = (mins: number) => {
    setIsActive(false);
    setIsBreakMode(true);
    setBreakDuration(mins);
    const secs = mins * 60;
    setInitialTime(secs);
    setTimeLeft(secs);
    halfwayTriggered.current = false;
    pushFocusAlert(`☕ Break time configured to ${mins} minutes.`, 'info');
    if (showToast) showToast(`Break set to ${mins}m`);
    playBeep(1, 380, 0.1);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center bg-white border border-border-main p-4 rounded-[1.5rem] shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-brand to-slate-800 bg-clip-text text-transparent">Focus Hub</h1>
            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
              isBreakMode ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-brand/10 text-brand'
            }`}>
              {isBreakMode ? 'Break Active' : 'Flow Active'}
            </span>
          </div>
          <p className="text-slate-400 font-medium text-xs">Supercharge your productivity state</p>
        </div>
        <button 
          onClick={() => {
            setCustomizationTab('flow');
            setShowSettings(!showSettings);
          }}
          className={`p-2.5 rounded-2xl transition-all cursor-pointer ${showSettings ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'bg-slate-50 border border-slate-100 text-slate-500'}`}
          title="Customization Options"
        >
          <Settings2 size={20} />
        </button>
      </header>

      {/* Main Timer Display Section */}
      <section className="bg-white border border-border-main p-6 rounded-[2rem] shadow-sm flex flex-col items-center justify-center space-y-6">
        {/* Circular Progress Container */}
        <div className="relative w-56 h-56 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform">
            <circle
              cx="112"
              cy="112"
              r="104"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              className="text-slate-50"
            />
            <motion.circle
              cx="112"
              cy="112"
              r="104"
              stroke="currentColor"
              strokeWidth="6"
              strokeDasharray="653"
              initial={{ strokeDashoffset: 653 }}
              animate={{ strokeDashoffset: 653 - (653 * progress) / 100 }}
              fill="transparent"
              strokeLinecap="round"
              className={`transition-all duration-300 ${isBreakMode ? 'text-emerald-500' : 'text-brand'}`}
            />
          </svg>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-display font-bold text-slate-800 tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
              {isBreakMode ? 'Break recharge' : 'Deep Work'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6">
          <button 
            onClick={resetTimer}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 active:scale-95 transition-all shadow-sm cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw size={18} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-[1.75rem] flex items-center justify-center text-white shadow-lg active:scale-95 transition-all cursor-pointer ${
              isActive 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' 
                : isBreakMode 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                  : 'bg-brand hover:bg-brand-dark shadow-brand/20'
            }`}
          >
            {isActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} className="ml-0.5" fill="currentColor" />}
          </button>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (showToast) showToast(soundEnabled ? 'Alert chimes silenced' : 'Chimes activated');
            }}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-slate-500 shadow-sm cursor-pointer"
            title={soundEnabled ? "Mute audio focus alert" : "Unmute audio focus alert"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} className="text-rose-400" />}
          </button>
        </div>
      </section>

      {/* CUSTOMIZABLE OPTIONS & METRIC CARDS TOGGLE */}
      <AnimatePresence mode="wait">
        {showSettings ? (
          <motion.section
            key="customization-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white border border-border-main p-5 rounded-[2rem] shadow-sm space-y-4"
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Sliders size={16} className="text-brand" />
                <span className="text-xs font-bold uppercase tracking-wider">Configure Focus Suite</span>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600 p-1 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Sub-tabs with buttons */}
            <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl">
              {(['flow', 'break', 'reminders'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCustomizationTab(tab)}
                  className={`py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    customizationTab === tab
                      ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab} settings
                </button>
              ))}
            </div>

            <div className="py-2">
              {customizationTab === 'flow' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Flow Duration</label>
                      <span className="text-xs font-black text-brand">{flowDuration} Mins</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="120"
                      step="5"
                      value={flowDuration}
                      onChange={(e) => setManualFlow(Number(e.target.value))}
                      className="w-full accent-brand h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[15, 25, 45, 60, 90].map((v) => (
                      <button
                        key={v}
                        onClick={() => setManualFlow(v)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          flowDuration === v 
                            ? 'bg-brand/10 text-brand border-brand/20 font-black' 
                            : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {v}m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {customizationTab === 'break' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Break Duration</label>
                      <span className="text-xs font-black text-emerald-500">{breakDuration} Mins</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="45"
                      step="1"
                      value={breakDuration}
                      onChange={(e) => setManualBreak(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[3, 5, 10, 15, 30].map((v) => (
                      <button
                        key={v}
                        onClick={() => setManualBreak(v)}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          breakDuration === v 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                            : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}
                      >
                        {v}m
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {customizationTab === 'reminders' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Notifications & Alerts</label>
                    
                    {/* Switch line 1 */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Audit Reminders</p>
                        <p className="text-[9px] text-slate-400">Post dynamic prompts to global Aura noticeboard</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={remindersEnabled}
                        onChange={(e) => {
                          setRemindersEnabled(e.target.checked);
                          pushFocusAlert(`Focus notifications ${e.target.checked ? 'enabled' : 'disabled'}`, 'info');
                        }}
                        className="w-4 h-4 text-brand bg-slate-100 border-slate-300 rounded focus:ring-brand accent-brand cursor-pointer"
                      />
                    </div>

                    {/* Switch line 2 */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="text-xs font-bold text-slate-700">Hydration & Posture Chimes</p>
                        <p className="text-[9px] text-slate-400">Alerts for stretch break reminders mid-session</p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={postureAlerts}
                        onChange={(e) => {
                          setPostureAlerts(e.target.checked);
                          pushFocusAlert(`Posture alerts ${e.target.checked ? 'turned on' : 'muted'}`, 'info');
                        }}
                        className="w-4 h-4 text-brand bg-slate-100 border-slate-300 rounded focus:ring-brand accent-brand cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="status-cards-area"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Clickable Card 1: Sessions Today */}
            <div 
              onClick={() => {
                setCustomizationTab('flow');
                setShowSettings(true);
                if (showToast) showToast('Configure session count objectives');
              }}
              className="bento-card p-4 flex flex-col justify-between h-32 bg-indigo-50/70 border-indigo-100 hover:border-brand cursor-pointer transition-all active:scale-95 group relative overflow-hidden"
              title="Sessions Completed Today - Click to customize Flow Duration"
            >
              <div className="absolute top-2 right-2 text-indigo-400/50 group-hover:text-brand transition-colors">
                <Sliders size={14} />
              </div>
              <div className="p-2 bg-indigo-500 text-white rounded-xl w-fit">
                <CheckCircle2 size={16} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold text-slate-800">{sessionsToday}</h3>
                <div className="flex items-center gap-1 text-slate-400">
                  <p className="text-[9px] font-bold uppercase tracking-wider">Sessions Today</p>
                  <ChevronRight size={10} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>

            {/* Clickable Card 2: Total Flow Time */}
            <div 
              onClick={() => {
                setCustomizationTab('break');
                setShowSettings(true);
                if (showToast) showToast('Configure Break setup & Interval timers');
              }}
              className="bento-card p-4 flex flex-col justify-between h-32 bg-slate-50 hover:bg-white border hover:border-brand cursor-pointer transition-all active:scale-95 group relative overflow-hidden"
              title="Total Flow Minutes Accumulated - Click to customize Break hours"
            >
              <div className="absolute top-2 right-2 text-slate-400/50 group-hover:text-brand transition-colors">
                <Sliders size={14} />
              </div>
              <div className="p-2 bg-brand-light text-brand rounded-xl w-fit">
                <Clock size={16} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold text-slate-800">{totalFlowTime}m</h3>
                <div className="flex items-center gap-1 text-slate-400">
                  <p className="text-[9px] font-bold uppercase tracking-wider">Total Flow Time</p>
                  <ChevronRight size={10} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ON-SCREEN NOTIFICATION & FOCUS ALERTS TRAY */}
      <section className="bg-white border border-border-main p-4.5 rounded-[2rem] shadow-sm space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <BellRing size={14} className="text-brand animate-pulse" />
            <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">Focus Alerts Feed</span>
          </div>
          {focusAlerts.length > 0 && (
            <button 
              onClick={clearAlerts}
              className="text-[9px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              <Trash2 size={10} />
              Clear Feed
            </button>
          )}
        </div>

        {/* Focus alert rows inside a pristine scroll container */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {focusAlerts.length > 0 ? (
            focusAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`p-2.5 rounded-xl border flex gap-2.5 items-start text-left transition-all text-xs ${
                  alert.type === 'success' 
                    ? 'bg-emerald-50/50 border-emerald-100 text-slate-700' 
                    : alert.type === 'alert' 
                      ? 'bg-rose-50/40 border-rose-100 text-slate-700' 
                      : alert.type === 'tips'
                        ? 'bg-brand/5 border-brand/10 text-slate-700'
                        : 'bg-slate-50/50 border-slate-100/80 text-slate-600'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {alert.type === 'success' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex items-center justify-center text-white" />
                  ) : alert.type === 'alert' ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex items-center justify-center animate-ping" />
                  ) : alert.type === 'tips' ? (
                    <Sparkles size={11} className="text-brand shrink-0" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[11px] leading-relaxed text-slate-700">{alert.message}</p>
                  <span className="text-[8px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wider">{alert.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-300 space-y-1">
              <Coffee size={24} className="mx-auto text-slate-200" />
              <p className="text-[10px] font-bold">Your feed is clean</p>
              <p className="text-[9px] text-slate-400 px-4">Start focus sessions to log dynamic posture checks, milestones, and breaks here.</p>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default FocusTimer;
