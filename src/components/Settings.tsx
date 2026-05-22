import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, Moon, ChevronRight, LogOut, Plus, Phone, Mail, Lock } from 'lucide-react';

interface SettingsProps {
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: (value: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  accentColor: string;
  setAccentColor: (value: string) => void;
  showToast: (message: string) => void;
  customColors: string[];
  onAddCustomColor: (hex: string) => void;
  onSignOut: () => void;
  currentUser?: any;
  onUpdateUser?: (updated: { name: string; email: string; mobile: string }) => void;
}

const ACCENT_COLORS = {
  purple: { name: 'Purple', hex: '#4f46e5' },
  violet: { name: 'Light Purple', hex: '#8b5cf6' },
  pink: { name: 'Pink', hex: '#ec4899' },
  teal: { name: 'Teal', hex: '#0d9488' },
  blue: { name: 'Blue', hex: '#3b82f6' },
  orange: { name: 'Orange', hex: '#f97316' },
  yellow: { name: 'Yellow', hex: '#ca8a04' },
};

const Settings: React.FC<SettingsProps> = ({
  pushNotificationsEnabled,
  setPushNotificationsEnabled,
  isDarkMode,
  setIsDarkMode,
  accentColor,
  setAccentColor,
  showToast,
  customColors,
  onAddCustomColor,
  onSignOut,
  currentUser,
  onUpdateUser,
}) => {
  const colorInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = React.useState(() => {
    return {
      name: currentUser?.name || localStorage.getItem('profile_name') || 'Tanaji Shete',
      email: currentUser?.email || localStorage.getItem('profile_email') || 'tanajithete@gmail.com',
      mobile: currentUser?.phone || localStorage.getItem('profile_mobile') || '+91 98765 43210',
    };
  });

  const [editName, setEditName] = React.useState(profile.name);
  const [editEmail, setEditEmail] = React.useState(profile.email);
  const [editMobile, setEditMobile] = React.useState(profile.mobile);
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  React.useEffect(() => {
    if (currentUser) {
      const updated = {
        name: currentUser.name || currentUser.email?.split('@')[0] || 'Tanaji Shete',
        email: currentUser.email || 'tanajithete@gmail.com',
        mobile: currentUser.phone || '',
      };
      setProfile(updated);
      setEditName(updated.name);
      setEditEmail(updated.email);
      setEditMobile(updated.mobile);
    }
  }, [currentUser]);

  // Security and privacy states
  const [isEditingSecurity, setIsEditingSecurity] = React.useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(() => localStorage.getItem('security_two_factor') === 'true');
  const [biometricEnabled, setBiometricEnabled] = React.useState(() => localStorage.getItem('security_biometric') === 'true');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showToast('Please fill out all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password should be at least 6 characters');
      return;
    }
    showToast('Password updated and security rules applied');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditingSecurity(false);
  };

  const handleClearAppData = () => {
    if (window.confirm('Are you absolutely sure you want to clear all tasks, events, notes, security setup and reset? This cannot be undone.')) {
      localStorage.clear();
      showToast('All app data and caches successfully cleared!');
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Name cannot be empty');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      showToast('Please enter a valid email address');
      return;
    }
    
    const updated = {
      name: editName.trim(),
      email: editEmail.trim(),
      mobile: editMobile.trim(),
    };
    
    setProfile(updated);
    localStorage.setItem('profile_name', updated.name);
    localStorage.setItem('profile_email', updated.email);
    localStorage.setItem('profile_mobile', updated.mobile);
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setIsEditingProfile(false);
    showToast('Profile updated successfully');
  };

  const handlePlusClick = () => {
    colorInputRef.current?.click();
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    if (newHex && /^#[0-9a-f]{6}$/i.test(newHex)) {
      onAddCustomColor(newHex);
      setAccentColor(newHex);
      showToast('Accent theme set to Custom Color');
    }
  };
  
  const settingsGroups = [
    {
      title: 'Preferences',
      items: [
        { 
          icon: Bell, 
          label: 'Push Notifications', 
          color: 'text-brand', 
          isToggle: true,
          value: pushNotificationsEnabled,
          onToggle: () => {
            const nextVal = !pushNotificationsEnabled;
            setPushNotificationsEnabled(nextVal);
            showToast(`Push notifications ${nextVal ? 'enabled' : 'disabled'}`);
            if (nextVal && typeof window !== 'undefined' && 'Notification' in window) {
              if (Notification.permission !== 'granted') {
                Notification.requestPermission();
              }
            }
          }
        },
        { 
          icon: Moon, 
          label: 'Dark Mode', 
          color: 'text-brand', 
          isToggle: true,
          value: isDarkMode,
          onToggle: () => {
            const nextVal = !isDarkMode;
            setIsDarkMode(nextVal);
            showToast(`Appearance set to ${nextVal ? 'Dark Theme' : 'Light Theme'}`);
          }
        },
      ]
    },
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', color: 'text-brand' },
        { icon: Shield, label: 'Security & Privacy', color: 'text-brand' },
      ]
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="space-y-8"
    >
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Settings</h1>
      </header>

      {/* User Card */}
      <div 
        onClick={() => {
          setIsEditingProfile(!isEditingProfile);
          setEditName(profile.name);
          setEditEmail(profile.email);
          setEditMobile(profile.mobile);
        }}
        className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-border-main shadow-sm cursor-pointer hover:border-brand/30 transition-all group"
      >
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand font-bold text-xl transition-colors duration-300">
          {profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'UT'}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-brand transition-colors">{profile.name}</h3>
          <p className="text-slate-400 text-sm font-medium">{profile.email}</p>
          {profile.mobile && (
            <p className="text-slate-400 text-xs mt-0.5 font-medium">{profile.mobile}</p>
          )}
        </div>
        <ChevronRight className="text-slate-300 group-hover:translate-x-0.5 transition-transform" size={20} />
      </div>

      <div className="space-y-8 pb-20">
        {/* Dynamic Settings Groups (Preferences, Account) */}
        {settingsGroups.map((group) => (
          <section key={group.title} className="space-y-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">{group.title}</h2>
            <div className="bg-white rounded-[2rem] border border-border-main shadow-sm overflow-hidden">
              {group.items.map((item, index) => {
                const isProfileItem = item.label === 'Profile Information';
                const isSecurityItem = item.label === 'Security & Privacy';
                return (
                  <div key={item.label}>
                    <div
                      onClick={(e) => {
                        if (isProfileItem) {
                          setIsEditingProfile(!isEditingProfile);
                          setIsEditingSecurity(false);
                          setEditName(profile.name);
                          setEditEmail(profile.email);
                          setEditMobile(profile.mobile);
                        } else if (isSecurityItem) {
                          setIsEditingSecurity(!isEditingSecurity);
                          setIsEditingProfile(false);
                        } else if (item.onToggle) {
                          item.onToggle();
                        }
                      }}
                      className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer ${
                        index !== group.items.length - 1 ? 'border-b border-border-subtle' : ''
                      }`}
                    >
                      <div className={`${item.color} bg-current/10 p-2.5 rounded-xl transition-colors`}>
                        <item.icon size={20} className={item.color} />
                      </div>
                      <span className="flex-1 font-bold text-slate-600 text-sm">{item.label}</span>
                      {item.isToggle ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onToggle?.();
                          }}
                          className={`w-12 h-7 rounded-full relative transition-all duration-300 focus:outline-none cursor-pointer flex items-center ${
                            item.value ? 'bg-brand shadow-md shadow-brand/10' : 'bg-slate-200'
                          }`}
                        >
                          <div 
                            className={`w-5 h-5 bg-white rounded-full shadow absolute transition-all duration-300 top-1 ${
                              item.value ? 'left-6' : 'left-1'
                            }`}
                          />
                        </button>
                      ) : (
                        <ChevronRight className={`text-slate-200 transition-transform ${(isProfileItem && isEditingProfile) || (isSecurityItem && isEditingSecurity) ? 'rotate-90 text-brand' : ''}`} size={20} />
                      )}
                    </div>

                    {isProfileItem && isEditingProfile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-border-subtle bg-slate-50/50 p-6 space-y-4"
                      >
                        <form onSubmit={handleSaveProfile} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Full Name</label>
                            <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full bg-white border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="Your Name"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                className="w-full bg-white border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Mobile Number</label>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type="tel"
                                value={editMobile}
                                onChange={(e) => setEditMobile(e.target.value)}
                                className="w-full bg-white border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="+1 (555) 000-0000"
                              />
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="flex-1 bg-brand text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-brand/10 hover:bg-brand-dark transition-all focus:ring-2 focus:ring-brand/20"
                            >
                              SAVE PROFILE
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="flex-1 bg-slate-200 text-slate-500 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all focus:ring-2 focus:ring-slate-100"
                            >
                              CANCEL
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {isSecurityItem && isEditingSecurity && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-border-subtle bg-slate-50/50 p-6 space-y-6"
                      >
                        {/* Security Toggles */}
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Security Settings</h4>
                          
                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-border-main shadow-sm">
                            <div>
                              <p className="text-xs font-bold text-slate-700">Two-Factor Authentication</p>
                              <p className="text-[10px] text-slate-400 font-medium pt-0.5">Add an extra layer of protection to your session.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = !twoFactorEnabled;
                                setTwoFactorEnabled(nextVal);
                                localStorage.setItem('security_two_factor', String(nextVal));
                                showToast(`Two-Factor Authentication ${nextVal ? 'enabled' : 'disabled'}`);
                              }}
                              className={`w-11 h-6 rounded-full relative transition-all duration-300 focus:outline-none cursor-pointer flex items-center ${
                                twoFactorEnabled ? 'bg-brand shadow-md shadow-brand/10' : 'bg-slate-200'
                              }`}
                            >
                              <div 
                                className={`w-4 h-4 bg-white rounded-full shadow absolute transition-all duration-300 top-1 ${
                                  twoFactorEnabled ? 'left-6' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-border-main shadow-sm">
                            <div>
                              <p className="text-xs font-bold text-slate-700">Biometric or Passcode Lock</p>
                              <p className="text-[10px] text-slate-400 font-medium pt-0.5">Prompt on app launch to keep your tasks private.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const nextVal = !biometricEnabled;
                                setBiometricEnabled(nextVal);
                                localStorage.setItem('security_biometric', String(nextVal));
                                showToast(`Biometric/Passcode Lock ${nextVal ? 'enabled' : 'disabled'}`);
                              }}
                              className={`w-11 h-6 rounded-full relative transition-all duration-300 focus:outline-none cursor-pointer flex items-center ${
                                biometricEnabled ? 'bg-brand shadow-md shadow-brand/10' : 'bg-slate-200'
                              }`}
                            >
                              <div 
                                className={`w-4 h-4 bg-white rounded-full shadow absolute transition-all duration-300 top-1 ${
                                  biometricEnabled ? 'left-6' : 'left-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Change Password Form */}
                        <form onSubmit={handleSaveSecurity} className="space-y-4 pt-2">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-1">Change Password</h4>
                          
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">Current Password</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-white border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-sm"
                                placeholder="••••••••"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1">New Password</label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-white border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-sm"
                                  placeholder="••••••••"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1 font-semibold">Confirm Password</label>
                              <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full bg-white border border-border-main rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-sm"
                                  placeholder="••••••••"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="submit"
                              className="flex-1 bg-brand text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-brand/10 hover:bg-brand-dark transition-all focus:ring-2 focus:ring-brand/20"
                            >
                              UPDATE PASSWORD
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPassword('');
                                setNewPassword('');
                                setConfirmPassword('');
                                setIsEditingSecurity(false);
                              }}
                              className="flex-1 bg-slate-200 text-slate-500 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-300 transition-all focus:ring-2 focus:ring-slate-100"
                            >
                              CANCEL
                            </button>
                          </div>
                        </form>

                        {/* Danger Zone */}
                        <div className="pt-4 border-t border-dashed border-border-main space-y-3">
                          <h4 className="text-[10px] font-bold text-rose-500 uppercase tracking-wider pl-1">Danger Zone</h4>
                          <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-4 space-y-3">
                            <p className="text-[10px] text-rose-500 leading-relaxed font-semibold">
                              Performing a factory reset will erase all local tasks, notes, active calendars, customized themes, and app logs instantly. This process is immediate and irreversible.
                            </p>
                            <button
                              type="button"
                              onClick={handleClearAppData}
                              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 transition-all"
                            >
                              ERASE ALL APP DATA & RESET
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Accent Color Section */}
        <section className="space-y-4">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">Accent Palette</h2>
          <div className="bg-white rounded-[2rem] border border-border-main shadow-sm p-6">
            <p className="text-xs text-slate-400 font-medium mb-4 px-1">Select your primary dynamic interface theme color:</p>
            <div className="flex flex-wrap gap-2.5 items-center justify-start text-[15px]">
              {/* Presets */}
              {Object.entries(ACCENT_COLORS).map(([key, config]) => {
                const isActive = accentColor === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setAccentColor(key);
                      showToast(`Accent theme set to ${config.name}`);
                    }}
                    title={config.name}
                    className={`w-11 h-11 rounded-2xl relative transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-90 ${
                      isActive 
                        ? 'scale-110 shadow-lg ring-4 ring-brand/20' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: config.hex }}
                  >
                    {isActive && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md animate-[pulse_1.5s_infinite]" />
                    )}
                  </button>
                );
              })}

              {/* Custom saved colors */}
              {customColors.map((hex) => {
                const isActive = accentColor === hex;
                return (
                  <button
                    key={hex}
                    onClick={() => {
                      setAccentColor(hex);
                      showToast('Accent theme set to Custom Color');
                    }}
                    title={hex}
                    className={`w-11 h-11 rounded-2xl relative transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-90 ${
                      isActive 
                        ? 'scale-110 shadow-lg ring-4 ring-brand/20' 
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isActive && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md animate-[pulse_1.5s_infinite]" />
                    )}
                  </button>
                );
              })}

              {/* Add Custom Color button */}
              <button
                onClick={handlePlusClick}
                title="Add Custom Color"
                className="w-11 h-11 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand/50 text-slate-400 dark:text-slate-500 hover:text-brand flex items-center justify-center transition-all cursor-pointer active:scale-90 hover:scale-105 bg-transparent"
              >
                <Plus size={18} />
              </button>
              <input
                type="color"
                ref={colorInputRef}
                onChange={handleColorChange}
                className="sr-only"
              />
            </div>
          </div>
        </section>

        <button 
          onClick={onSignOut}
          className="w-full bg-slate-100 text-slate-400 p-5 rounded-[2rem] font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
        >
          <LogOut size={18} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Settings;
