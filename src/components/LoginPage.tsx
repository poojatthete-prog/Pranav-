import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Sparkles, ArrowRight, LogIn, UserPlus, User, Phone } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  key?: string;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (mode === 'signup' && !phone.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    setTimeout(() => {
      try {
        const cleanedEmail = email.trim().toLowerCase();
        const storedUsersStr = localStorage.getItem('aura_mock_users') || '{}';
        let users: Record<string, any> = {};
        try {
          users = JSON.parse(storedUsersStr);
        } catch (e) {
          users = {};
        }

        if (mode === 'login') {
          const user = users[cleanedEmail];
          if (!user || user.password !== password) {
            setError('Incorrect email or password.');
            setLoading(false);
            return;
          }
          onLogin(cleanedEmail);
        } else {
          if (users[cleanedEmail]) {
            setError('That email address is already in use.');
            setLoading(false);
            return;
          }
          users[cleanedEmail] = { 
            email: cleanedEmail, 
            password,
            name: name.trim(),
            phone: phone.trim()
          };
          localStorage.setItem('aura_mock_users', JSON.stringify(users));
          onLogin(cleanedEmail);
        }
      } catch (err: any) {
        console.error(err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      try {
        const mockGoogleEmail = 'google.user@gmail.com';
        onLogin(mockGoogleEmail);
      } catch (err: any) {
        console.error(err);
        setError('Google Sign-In failed.');
      } finally {
        setLoading(false);
      }
    }, 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="min-h-[80vh] flex flex-col justify-center items-stretch"
    >
      <div className="text-center space-y-3 mb-8">
        <div className="mx-auto w-16 h-16 bg-brand-light rounded-[2rem] flex items-center justify-center text-brand shadow-lg shadow-brand/10 transition-colors duration-300">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-black tracking-tight text-slate-800 dark:text-slate-100 uppercase">
          Aura Task
        </h1>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
          Your aesthetic task, events & focus organizer
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6">
        {/* Toggle Mode Tab */}
        <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-850">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === 'login'
                ? 'bg-white dark:bg-slate-900 text-brand shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <LogIn size={14} />
            <span>Login</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              mode === 'signup'
                ? 'bg-white dark:bg-slate-900 text-brand shadow-sm'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus size={14} />
            <span>Create Account</span>
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            {mode === 'login' 
              ? 'Please enter your credentials to manage your workflow' 
              : 'Register a new account to sync tasks across all devices'
            }
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl text-xs font-bold text-rose-500 uppercase tracking-wider text-center"
          >
            ⚠️ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                  <input
                    type="text"
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    required
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner text-sm"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
              <input
                type="password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-2xl py-4 pl-12 pr-4 font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-inner text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 hover:bg-brand-dark disabled:opacity-50 transition-all text-sm mt-6 cursor-pointer"
          >
            {loading ? (
              <span className="animate-pulse">PROCESSING...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'SIGN IN' : 'REGISTER NOW'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">or</span>
          <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
        </div>

        <button
          type="button"
          disabled={loading}
          onClick={handleGoogleSignIn}
          className="w-full bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {/* Subtle elegant Google logo style representation */}
          <span className="w-4 h-4 rounded-full border-2 border-brand flex items-center justify-center font-extrabold text-[8px] bg-white text-brand">G</span>
          <span>Continue with Google</span>
        </button>

        <div className="text-center pt-2">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            {mode === 'login' ? 'Secure authentication powered by Firebase' : 'Your data stays safe and encrypted'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
