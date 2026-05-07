import React, { useState, useMemo, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, Circle, ListPlus, Calendar as CalendarIcon, 
  X, Save, Tag, Plus, MapPin, Clock, CalendarIcon as DateIcon,
  Sparkles, ChevronRight
} from 'lucide-react';
import { Task, Event, Note } from '../types';
import AIChatModal from './AIChatModal';

const CATEGORIES = ['Work', 'Personal', 'Shopping', 'Life'];

interface DashboardProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  events: Event[];
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  onAddTask: (task: Partial<Task>) => void;
  onAddEvent: (event: Partial<Event>) => void;
  onAddNote: (note: Partial<Note>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, setTasks, events, setEvents, onAddTask, onAddEvent, onAddNote }) => {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    category: 'Work',
    completed: false,
    tags: [],
  });

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    description: '',
    time: '12:00 PM',
    date: 'Oct 25',
    location: '',
    category: 'Work',
    tags: [],
  });

  const resetNewTask = () => {
    setNewTask({ title: '', description: '', category: 'Work', completed: false, tags: [] });
  };

  const resetNewEvent = () => {
    setNewEvent({ title: '', description: '', time: '12:00 PM', date: 'Oct 25', location: '', category: 'Work', tags: [] });
  };

  const addTask = () => {
    if (!newTask.title) return;
    onAddTask(newTask);
    setIsCreating(false);
    resetNewTask();
  };

  const addEvent = () => {
    if (!newEvent.title) return;
    onAddEvent(newEvent);
    setIsCreatingEvent(false);
    resetNewEvent();
  };

  const groupedTasks = useMemo(() => {
    return tasks.reduce((acc: Record<string, Task[]>, task) => {
      if (!acc[task.category]) acc[task.category] = [];
      acc[task.category].push(task);
      return acc;
    }, {});
  }, [tasks]);

  const toggleTask = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleEditTask = (task: Task) => {
    setEditingTask({ ...task });
  };

  const saveTask = () => {
    if (!editingTask) return;
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setEditingTask(null);
  };

  const removeTag = (tag: string, isEditing: boolean, isEvent: boolean = false) => {
    if (isEditing && editingTask) {
      setEditingTask({
        ...editingTask,
        tags: (editingTask.tags || []).filter(t => t !== tag)
      });
    } else if (isEvent) {
      setNewEvent({
        ...newEvent,
        tags: (newEvent.tags || []).filter(t => t !== tag)
      });
    } else {
      setNewTask({
        ...newTask,
        tags: (newTask.tags || []).filter(t => t !== tag)
      });
    }
  };

  const addTag = (tag: string, isEditing: boolean, isEvent: boolean = false) => {
    if (!tag.trim()) return;
    if (isEditing && editingTask) {
      if (!(editingTask.tags || []).includes(tag)) {
        setEditingTask({
          ...editingTask,
          tags: [...(editingTask.tags || []), tag]
        });
      }
    } else if (isEvent) {
      if (!(newEvent.tags || []).includes(tag)) {
        setNewEvent({
          ...newEvent,
          tags: [...(newEvent.tags || []), tag]
        });
      }
    } else {
      if (!(newTask.tags || []).includes(tag)) {
        setNewTask({
          ...newTask,
          tags: [...(newTask.tags || []), tag]
        });
      }
    }
  };

  const nextEvent = events[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <header className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-800">Aura Board</h1>
          <p className="text-slate-400 font-medium text-sm">Wednesday, Oct 25th</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCreatingEvent(true)}
            className="bg-white text-slate-400 p-2.5 rounded-2xl border border-border-main shadow-sm active:scale-95 transition-all"
            title="Create Event"
          >
            <CalendarIcon size={20} />
          </button>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-brand text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-brand/20 active:scale-95 transition-all text-sm"
          >
            + New Task
          </button>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-4">
        {/* Weekly Goal Progress */}
        <div className="col-span-12 bg-brand-dark p-6 rounded-[2.5rem] text-white flex flex-col justify-between h-48 shadow-xl shadow-brand/10">
          <div className="flex justify-between items-start">
            <div className="bg-white/10 p-2.5 rounded-2xl">
              <CheckCircle2 size={24} className="text-white" />
            </div>
            <span className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full text-indigo-100">Weekly Goal</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-end gap-2">
              <h3 className="text-5xl font-bold">72%</h3>
              <p className="text-indigo-200 text-sm font-medium mb-1">Completed</p>
            </div>
            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div className="w-[72%] h-full bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* AI Assistant Quick Callout */}
        <div 
          onClick={() => setIsAIChatOpen(true)}
          className="col-span-12 bg-white border-2 border-brand/10 p-5 rounded-[2.5rem] flex items-center gap-4 cursor-pointer active:scale-[0.99] transition-all hover:border-brand/30 group shadow-sm"
        >
          <div className="bg-brand/10 p-3 rounded-2xl group-hover:bg-brand transition-colors">
            <Sparkles size={20} className="text-brand group-hover:text-white transition-colors" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <h4 className="text-sm font-bold text-slate-800">Aura Assistant</h4>
              <span className="text-[8px] font-black bg-brand/10 text-brand px-1.5 py-0.5 rounded uppercase tracking-tighter">Beta</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Try: "Note down the project vision ideas"</p>
          </div>
          <ChevronRight size={16} className="text-slate-300 group-hover:text-brand transition-colors" />
        </div>

        {/* Small Stats Widget */}
        <div className="col-span-4 bento-card p-5 flex flex-col justify-between h-36">
          <DateIcon size={24} className="text-brand" />
          <div>
            <h3 className="text-xl font-bold text-slate-800">{tasks.filter(t => !t.completed).length}</h3>
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Active Tasks</p>
          </div>
        </div>

        {/* Upcoming Event Widget */}
        <div 
          onClick={() => setIsCreatingEvent(true)}
          className="col-span-8 bento-card p-5 bg-white flex flex-col justify-between h-36 cursor-pointer group active:scale-[0.98] transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="bg-brand-light p-2 rounded-xl text-brand group-hover:bg-brand group-hover:text-white transition-colors">
              <Clock size={20} />
            </div>
            <span className="text-[8px] font-extrabold bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest">Next Event</span>
          </div>
          {nextEvent ? (
            <div>
              <h3 className="text-sm font-bold text-slate-800 truncate">{nextEvent.title}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{nextEvent.time} • {nextEvent.location || 'Remote'}</p>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-bold text-slate-300">No events today</h3>
              <p className="text-brand text-[10px] font-bold uppercase tracking-wider">+ Schedule one</p>
            </div>
          )}
        </div>
      </section>

      <section className="space-y-8 pb-32">
        {(Object.entries(groupedTasks) as [string, Task[]][]).map(([category, categoryTasks]) => (
          <div key={category} className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-lg font-bold text-slate-800">{category}</h2>
              <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg uppercase tracking-wider">
                {categoryTasks.length} {categoryTasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
            </div>

            <div className="space-y-3">
              {categoryTasks.map((task) => (
                <motion.div
                  layout
                  key={task.id}
                  id={`task-${task.id}`}
                  onClick={() => handleEditTask(task)}
                  className="bg-white p-4 rounded-[1.5rem] border border-border-main shadow-sm flex items-center gap-4 group hover:border-brand/30 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <button 
                    onClick={(e) => toggleTask(task.id, e)}
                    className="text-slate-300 group-hover:text-brand transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="text-brand" size={24} />
                    ) : (
                      <div className="w-6 h-6 border-2 border-slate-200 rounded-full" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-bold truncate text-sm ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className={`text-[9px] font-bold uppercase tracking-wider ${task.dueDate === 'Today' ? 'text-brand' : 'text-slate-400'}`}>
                        {task.category} • {task.dueDate}
                      </p>
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 overflow-hidden">
                          {task.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[8px] bg-brand/5 text-brand px-1.5 py-0.5 rounded-md font-bold truncate">#{tag}</span>
                          ))}
                          {task.tags.length > 2 && <span className="text-[8px] text-slate-300 font-bold">+{task.tags.length - 2}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full shadow-sm ${
                    category === 'Work' ? 'bg-indigo-500' : 
                    category === 'Personal' ? 'bg-amber-400' : 
                    category === 'Shopping' ? 'bg-emerald-400' : 'bg-rose-400'
                  }`} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Create Task Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreating(false); resetNewTask(); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">New Task</h2>
                <button 
                  onClick={() => { setIsCreating(false); resetNewTask(); }}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">What needs to be done?</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="Task Title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Details</label>
                  <textarea
                    rows={3}
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all resize-none placeholder:text-slate-300 shadow-inner"
                    placeholder="Add additional details..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newTask.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag, false)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value, false);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewTask({ ...newTask, category: cat })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          newTask.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={addTask}
                disabled={!newTask.title}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                <Plus size={20} />
                <span>Create Task</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Event Modal */}
      <AnimatePresence>
        {isCreatingEvent && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreatingEvent(false); resetNewEvent(); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">New Event</h2>
                <button 
                  onClick={() => { setIsCreatingEvent(false); resetNewEvent(); }}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Event Title</label>
                  <input
                    type="text"
                    placeholder="Product Sync"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <Clock size={10} /> Time
                    </label>
                    <input
                      type="text"
                      placeholder="10:00 AM"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                      <DateIcon size={10} /> Date
                    </label>
                    <input
                      type="text"
                      placeholder="Oct 25"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-1">
                    <MapPin size={10} /> Location
                  </label>
                  <input
                    type="text"
                    placeholder="Zoom, Coffee Shop, etc."
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewEvent({ ...newEvent, category: cat })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          newEvent.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {newEvent.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag, false, true)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value, false, true);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={addEvent}
                disabled={!newEvent.title}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none"
              >
                <DateIcon size={20} />
                <span>Schedule Event</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingTask(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">Edit Task</h2>
                <button 
                  onClick={() => setEditingTask(null)}
                  className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Title</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-slate-700 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Description</label>
                  <textarea
                    rows={3}
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-2xl p-4 font-medium text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all resize-none shadow-inner"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {editingTask.tags?.map(tag => (
                      <span key={tag} className="bg-brand/10 text-brand text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                        #{tag}
                        <button onClick={() => removeTag(tag, true)}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="Add tag and press Enter"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-10 pr-4 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-brand/20 transition-all shadow-inner"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value, true);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEditingTask({ ...editingTask, category: cat })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          editingTask.category === cat 
                            ? 'bg-brand text-white border-brand shadow-md shadow-brand/20' 
                            : 'bg-white text-slate-400 border-border-main hover:border-brand/30'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={saveTask}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all"
              >
                <Save size={20} />
                <span>Save Changes</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AIChatModal 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)}
        onAddTask={onAddTask}
        onAddEvent={onAddEvent}
        onAddNote={onAddNote}
      />

      {/* Floating AI Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-28 right-6 z-50 bg-brand text-white p-4 rounded-3xl shadow-2xl shadow-brand/40 flex items-center justify-center border-2 border-white/20 backdrop-blur-sm"
      >
        <Sparkles size={24} />
      </motion.button>
    </motion.div>
  );
};

export default Dashboard;

