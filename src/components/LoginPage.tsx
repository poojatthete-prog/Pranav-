import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  key?: string;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('tanajithete@gmail.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    setError('');
    onLogin(email);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-[80vh] flex flex-col justify-center items-stretch"
    >
      <div className="text-center space-y-3 mb-10">
        <div className="mx-auto w-16 h-16 bg-brand-light rounded-[2rem] flex items-center justify-center text-brand shadow-lg shadow-brand/10 transition-colors duration-300">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-black tracking-tight text-slate-800 uppercase">
          Aura Task
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
          Your aesthetic task, events & focus organizer
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-border-main p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Sign In</h2>
          <p className="text-xs text-slate-400 font-medium">Please enter your credentials to manage your workflow</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-xs font-bold text-rose-500 uppercase tracking-wider text-center"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 hover:bg-brand-dark transition-all text-sm mt-6"
          >
            <span>SIGN IN</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Licensed to {email}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
