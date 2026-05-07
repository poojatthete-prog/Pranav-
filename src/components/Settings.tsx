import { motion } from 'motion/react';
import { User, Bell, Shield, Moon, ChevronRight, LogOut } from 'lucide-react';

export default function Settings() {
  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Profile Information', color: 'text-indigo-500' },
        { icon: Bell, label: 'Notifications', color: 'text-indigo-500' },
        { icon: Shield, label: 'Security & Privacy', color: 'text-indigo-500' },
      ]
    },
    {
      title: 'Appearance',
      items: [
        { icon: Moon, label: 'Dark Mode', color: 'text-indigo-500', isToggle: true },
      ]
    }
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

      <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-border-main shadow-sm">
        <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center text-brand font-bold text-xl">
          JD
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg">John Doe</h3>
          <p className="text-slate-400 text-sm font-medium">Pro Member</p>
        </div>
        <ChevronRight className="text-slate-300" size={20} />
      </div>

      <div className="space-y-8 pb-20">
        {settingsGroups.map((group) => (
          <section key={group.title} className="space-y-4">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-4">{group.title}</h2>
            <div className="bg-white rounded-[2rem] border border-border-main shadow-sm overflow-hidden">
              {group.items.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-4 p-5 hover:bg-slate-50 transition-colors cursor-pointer ${
                    index !== group.items.length - 1 ? 'border-b border-border-subtle' : ''
                  }`}
                >
                  <div className={`${item.color} bg-current/10 p-2.5 rounded-xl`}>
                    <item.icon size={20} className={item.color} />
                  </div>
                  <span className="flex-1 font-bold text-slate-600 text-sm">{item.label}</span>
                  {item.isToggle ? (
                    <div className="w-10 h-5 bg-brand rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full transition-all" />
                    </div>
                  ) : (
                    <ChevronRight className="text-slate-200" size={20} />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <button className="w-full bg-slate-100 text-slate-400 p-5 rounded-[2rem] font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100">
          <LogOut size={18} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </motion.div>
  );
}
