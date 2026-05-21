import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, Timer, BookOpen, ArrowRight, CheckCircle2, ChevronRight, Bell, Heart } from 'lucide-react';

interface SplashAndIntroProps {
  onComplete: () => void;
  key?: string;
}

interface WalkthroughSlide {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
}

export default function SplashAndIntro({ onComplete }: SplashAndIntroProps) {
  const [step, setStep] = useState<'splash' | 'intro'>('splash');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-transition from splash screen to intro after 2.5s
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        setStep('intro');
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const slides: WalkthroughSlide[] = [
    {
      title: 'Daily Focus Board',
      subtitle: 'Harmonize your workflow',
      description: 'Streamline your day with clean status tracking. Separate major targets from recurring duties to clear mental fatigue.',
      icon: Sparkles,
      color: 'text-purple-500',
      bgGlow: 'from-purple-500/20 to-indigo-500/0',
    },
    {
      title: 'Mindful Scheduling',
      subtitle: 'Form intentional milestones',
      description: 'View upcoming events, timelines, and alert alarms in a high-contrast chronological calendar suited to your natural rhythm.',
      icon: Calendar,
      color: 'text-indigo-500',
      bgGlow: 'from-indigo-500/20 to-cyan-500/0',
    },
    {
      title: 'Zen Focus Timer',
      subtitle: 'Unlock structured deep flow',
      description: 'Block out digital noise. Ground yourself with elegant focused circular visualizers, customized sound ticks, and notifications.',
      icon: Timer,
      color: 'text-rose-500',
      bgGlow: 'from-rose-500/20 to-orange-500/0',
    },
    {
      title: 'Reflective Notes',
      subtitle: 'A catalog for spontaneous light',
      description: 'Scribble quick inspirations, design mockups, and structured logs. Tag with visual color palettes for easy reference.',
      icon: BookOpen,
      color: 'text-amber-500',
      bgGlow: 'from-amber-500/20 to-yellow-500/0',
    },
  ];

  const handleNext = () => {
    if (currentSlide === slides.length - 1) {
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Render mock UI previews for each feature on the intro cards
  const renderPreviewBlock = (index: number) => {
    switch (index) {
      case 0: // Daily Focus Board Preview
        return (
          <div className="w-full relative h-36 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/50">
              <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">My Daily Focus</span>
              <span className="text-[10px] bg-purple-50 dark:bg-purple-950/40 text-purple-600 px-2.5 py-0.5 rounded-full font-bold">2/3 Done</span>
            </div>
            <div className="space-y-2 py-2 flex-grow overflow-hidden">
              <div className="flex items-center gap-2.5 opacity-60 line-through text-xs text-slate-400">
                <CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" />
                <span>Prepare coffee & morning meditation stretch</span>
              </div>
              <div className="flex items-center gap-2.5 opacity-60 line-through text-xs text-slate-400">
                <CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" />
                <span>Refactor user profile authentication</span>
              </div>
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="flex items-center gap-2.5 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 dark:border-slate-700 flex-shrink-0" />
                <span>Unveil stunning splash intro animation</span>
              </motion.div>
            </div>
          </div>
        );
      case 1: // Calendar Preview
        return (
          <div className="w-full relative h-36 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between">
            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {['Mo', 'Tu', 'We', 'Th', 'Fr'].map((day, idx) => (
                <div key={day} className={`flex-grow min-w-[32px] text-center p-1.5 rounded-xl transition ${idx === 3 ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400'}`}>
                  <p className="text-[9px] uppercase tracking-wider">{day}</p>
                  <p className="text-xs font-black mt-0.5">{21 + idx}</p>
                </div>
              ))}
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2 truncate">
                <div className="w-1.5 h-7 bg-indigo-500 rounded-full flex-shrink-0" />
                <div className="truncate">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Milestone Review Meeting</p>
                  <p className="text-[9px] text-slate-400">03:30 PM - Virtual Boardroom</p>
                </div>
              </div>
              <Bell size={13} className="text-indigo-400 animate-swing flex-shrink-0" />
            </div>
          </div>
        );
      case 2: // Zen Focus Timer Preview
        return (
          <div className="w-full relative h-36 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 overflow-hidden flex items-center justify-center gap-6">
            <div className="relative flex items-center justify-center">
              {/* Spinning / glowing rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                className="w-20 h-20 border-3 border-rose-500/10 border-t-rose-500 rounded-full absolute" 
              />
              <motion.div 
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="w-16 h-16 bg-rose-500/5 dark:bg-rose-500/10 rounded-full flex items-center justify-center"
              >
                <Timer size={20} className="text-rose-500 animate-pulse" />
              </motion.div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Focus In Progress</p>
              <h4 className="text-xl font-mono font-black text-slate-800 dark:text-slate-200">24:59</h4>
              <p className="text-[9px] text-rose-500 font-bold tracking-wider">Deep Harmony Mode</p>
            </div>
          </div>
        );
      case 3: // Reflective Notes Preview
        return (
          <div className="w-full relative h-36 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-800/80 overflow-hidden flex flex-col justify-between">
            <div className="flex gap-2">
              <span className="text-[9px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Ideas</span>
              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">Mental Health</span>
            </div>
            <div className="flex-grow pt-2 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200 line-clamp-1">🌸 Aesthetic Meditation App Rules</p>
              <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">Focus is not the absence of thought, but the flow of intentional consciousness. Let’s keep this layout empty and sleek!</p>
            </div>
            <div className="text-[9px] text-slate-400 font-mono text-right">Updated: Just now</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-[70vh] justify-center items-center relative overflow-hidden w-full">
      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          /* Splash Screen View */
          <motion.div
            key="splash-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-10 text-center w-full relative z-10"
          >
            {/* Ambient Animated Aura Shape */}
            <div className="relative flex items-center justify-center mb-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.15, 0.95, 1.1, 1],
                  rotate: [0, 90, 180, 270, 360]
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-24 h-24 rounded-[40%] bg-gradient-to-tr from-brand/20 via-indigo-500/10 to-brand-light/30 blur-md opacity-80"
              />
              <motion.div
                animate={{ 
                  scale: [1.1, 0.9, 1.15, 1, 1.1],
                  rotate: [360, 270, 180, 90, 0]
                }}
                transition={{ 
                  duration: 9, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="absolute w-20 h-20 rounded-[35%] bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-purple-500/20 blur-md opacity-60"
              />
              
              {/* Inner Solid Logo Symbol */}
              <div className="relative w-16 h-16 rounded-[1.8rem] bg-white sm:bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl flex items-center justify-center">
                <Sparkles size={28} className="text-brand animate-pulse" />
              </div>
            </div>

            <motion.h1 
              initial={{ letterSpacing: '0.1em', opacity: 0 }}
              animate={{ letterSpacing: '0.25em', opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl font-extrabold text-slate-800 dark:text-white uppercase font-display select-none tracking-[0.25em]"
            >
              AURA
            </motion.h1>

            <motion.p
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 0.6 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xs font-bold font-mono tracking-widest text-slate-510 dark:text-slate-400 mt-2 uppercase"
            >
              Harmonize your daily focus
            </motion.p>

            {/* Micro loader line */}
            <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-8">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2.1, ease: 'easeIn' }}
                className="h-full bg-brand"
              />
            </div>
          </motion.div>
        ) : (
          /* Introduction Walkthrough View */
          <motion.div
            key="walkthrough-screen"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full flex flex-col justify-between py-2 relative z-10 min-h-[64vh]"
          >
            {/* Top skipped link */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-[0.15em] uppercase">
                Welcome to Aura ({currentSlide + 1}/{slides.length})
              </span>
              <button
                onClick={handleSkip}
                className="text-[10px] font-black tracking-[0.15em] uppercase text-slate-400 hover:text-brand transition cursor-pointer"
              >
                Skip Walkthrough
              </button>
            </div>

            {/* Slider Content Frame */}
            <div className="relative flex-grow flex flex-col justify-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Glowing Preview Card */}
                  <div className="relative p-1 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                    {/* Diffuse BG Glow reflecting current slide */}
                    <div className={`absolute inset-0 bg-gradient-to-tr ${slides[currentSlide].bgGlow} filter blur-xl rounded-3xl opacity-60 -z-10`} />
                    
                    {/* Visual mockup showcase */}
                    <div className="p-4 flex flex-col items-center">
                      {renderPreviewBlock(currentSlide)}
                    </div>
                  </div>

                  {/* Icon & Details */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 ${slides[currentSlide].color} border border-slate-200/40 dark:border-slate-700/30`}>
                        {React.createElement(slides[currentSlide].icon, { size: 22 })}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${slides[currentSlide].color}`}>
                          {slides[currentSlide].subtitle}
                        </p>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">
                          {slides[currentSlide].title}
                        </h2>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium px-1">
                      {slides[currentSlide].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Controls and Indicators */}
            <div className="mt-8 pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60">
              {/* Pagination Dots */}
              <div className="flex gap-2.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2.5 rounded-full transition-all duration-350 cursor-pointer ${
                      idx === currentSlide ? 'w-7 bg-brand' : 'w-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Action Button */}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-brand text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-95 transition cursor-pointer active:scale-95 shadow-lg shadow-brand/10 select-none"
              >
                <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
                <ChevronRight size={14} className="mt-[-1px]" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
