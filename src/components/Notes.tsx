import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, MoreHorizontal, X, Save, Tag, ChevronLeft } from 'lucide-react';
import { Note } from '../types';

interface NotesProps {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
}

const NOTE_COLORS = [
  { id: 'amber', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-900', light: 'bg-amber-100/50' },
  { id: 'sky', bg: 'bg-sky-50', border: 'border-sky-100', text: 'text-sky-900', light: 'bg-sky-100/50' },
  { id: 'emerald', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-900', light: 'bg-emerald-100/50' },
  { id: 'rose', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-900', light: 'bg-rose-100/50' },
  { id: 'indigo', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-900', light: 'bg-indigo-100/50' },
  { id: 'slate', bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-900', light: 'bg-slate-100/50' },
];

const Notes: React.FC<NotesProps> = ({ notes, setNotes }) => {
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    tags: [],
    color: 'amber'
  });

  const filteredNotes = useMemo(() => {
    if (!search) return notes;
    const term = search.toLowerCase();
    return notes.filter(n => 
      n.title.toLowerCase().includes(term) || 
      n.content.toLowerCase().includes(term) ||
      n.tags?.some(t => t.toLowerCase().includes(term))
    );
  }, [notes, search]);

  const addNote = () => {
    if (!newNote.title) return;
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title!,
      content: newNote.content || '',
      tags: newNote.tags || [],
      color: newNote.color || 'amber',
      updatedAt: 'Just now'
    };
    setNotes(prev => [note, ...prev]);
    setIsCreating(false);
    setNewNote({ title: '', content: '', tags: [], color: 'amber' });
  };

  const updateNote = () => {
    if (!editingNote) return;
    setNotes(prev => prev.map(n => n.id === editingNote.id ? { ...editingNote, updatedAt: 'Just now' } : n));
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    setEditingNote(null);
  };

  const addTag = (tag: string, isEdit: boolean) => {
    const cleanTag = tag.trim().replace(/^#/, '');
    if (!cleanTag) return;
    
    if (isEdit && editingNote) {
      if (!editingNote.tags?.includes(cleanTag)) {
        setEditingNote({ ...editingNote, tags: [...(editingNote.tags || []), cleanTag] });
      }
    } else {
      if (!newNote.tags?.includes(cleanTag)) {
        setNewNote({ ...newNote, tags: [...(newNote.tags || []), cleanTag] });
      }
    }
  };

  const removeTag = (tag: string, isEdit: boolean) => {
    if (isEdit && editingNote) {
      setEditingNote({ ...editingNote, tags: editingNote.tags?.filter(t => t !== tag) });
    } else {
      setNewNote({ ...newNote, tags: newNote.tags?.filter(t => t !== tag) });
    }
  };

  const getNoteStyle = (colorId: string) => {
    return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Quick Notes</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-brand text-white p-3 rounded-2xl shadow-lg shadow-brand/20 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes or tags..."
          className="w-full bg-white border border-border-main rounded-[1.25rem] py-3.5 pl-12 pr-4 text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand/10 transition-all font-medium text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 pb-20">
        <AnimatePresence>
          {filteredNotes.map((note) => {
            const style = getNoteStyle(note.color || 'amber');
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={note.id}
                id={`note-${note.id}`}
                onClick={() => setEditingNote(note)}
                className={`${style.bg} ${style.border} border p-5 rounded-[1.75rem] shadow-sm space-y-3 relative group cursor-pointer active:scale-95 transition-all`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {note.tags?.map(tag => (
                      <span key={tag} className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${style.light} ${style.text}`}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className={`font-bold leading-tight ${style.text}`}>{note.title}</h3>
                  <p className={`text-xs line-clamp-4 leading-relaxed opacity-80 ${style.text}`}>
                    {note.content}
                  </p>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className={`text-[9px] font-bold uppercase tracking-wider opacity-40 ${style.text}`}>
                    {note.updatedAt}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {(isCreating || editingNote) && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsCreating(false); setEditingNote(null); }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl relative z-10 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setIsCreating(false); setEditingNote(null); }}
                    className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800">
                    {isCreating ? 'New Note' : 'Edit Note'}
                  </h2>
                </div>
                {!isCreating && (
                  <button 
                    onClick={() => deleteNote(editingNote!.id)}
                    className="text-[10px] font-bold text-rose-500 uppercase tracking-widest px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Note Title"
                    value={isCreating ? newNote.title : editingNote?.title}
                    onChange={(e) => isCreating 
                      ? setNewNote({ ...newNote, title: e.target.value })
                      : setEditingNote({ ...editingNote!, title: e.target.value })
                    }
                    className="w-full text-2xl font-bold text-slate-800 border-none p-0 focus:ring-0 placeholder:text-slate-200"
                  />
                  <textarea
                    placeholder="Start writing..."
                    rows={8}
                    value={isCreating ? newNote.content : editingNote?.content}
                    onChange={(e) => isCreating 
                      ? setNewNote({ ...newNote, content: e.target.value })
                      : setEditingNote({ ...editingNote!, content: e.target.value })
                    }
                    className="w-full text-slate-600 border-none p-0 focus:ring-0 placeholder:text-slate-200 resize-none font-medium leading-relaxed"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Customize Color</label>
                  <div className="flex flex-wrap gap-2">
                    {NOTE_COLORS.map(color => (
                      <button
                        key={color.id}
                        onClick={() => isCreating
                          ? setNewNote({ ...newNote, color: color.id })
                          : setEditingNote({ ...editingNote!, color: color.id })
                        }
                        className={`w-10 h-10 rounded-xl transition-all border-2 ${color.bg} ${
                          (isCreating ? newNote.color === color.id : editingNote?.color === color.id)
                            ? 'border-brand scale-110 shadow-lg'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {(isCreating ? newNote.tags : editingNote?.tags)?.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5">
                        #{tag}
                        <button onClick={() => removeTag(tag, !!editingNote)}><X size={10} /></button>
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
                          addTag((e.target as HTMLInputElement).value, !!editingNote);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <button
                  onClick={isCreating ? addNote : updateNote}
                  className="w-full bg-brand text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all"
                >
                  <Save size={20} />
                  <span>{isCreating ? 'Create Note' : 'Update Note'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Notes;
