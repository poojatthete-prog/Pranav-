import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { chatWithAI } from '../services/geminiService';
import { Task, Event, Note } from '../types';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
  onAddEvent: (event: Partial<Event>) => void;
  onAddNote: (note: Partial<Note>) => void;
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function AIChatModal({ isOpen, onClose, onAddTask, onAddEvent, onAddNote }: AIChatModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Hello! I'm your Aura AI assistant. How can I help you organize your day?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Map messages to Gemini history format
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const response = await chatWithAI(userMessage, history);
      
      const functionCalls = response.functionCalls;
      let aiResponseText = response.text || "I've processed your request.";

      if (functionCalls) {
        for (const call of functionCalls) {
          if (call.name === 'createTask') {
            onAddTask(call.args as any);
          } else if (call.name === 'createEvent') {
            onAddEvent(call.args as any);
          } else if (call.name === 'createNote') {
            onAddNote(call.args as any);
          }
        }
      }

      setMessages(prev => [...prev, { role: 'model', content: aiResponseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white w-full max-w-2xl h-[80vh] rounded-[2.5rem] shadow-2xl relative z-10 flex flex-col overflow-hidden border border-white/20"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-brand/5 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-brand text-white p-2 rounded-2xl shadow-lg shadow-brand/20">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Aura AI</h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Always Active</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar"
            >
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user' ? 'bg-slate-100 text-slate-500' : 'bg-brand/10 text-brand'
                    }`}>
                      {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-brand text-white shadow-md shadow-brand/10' 
                        : 'bg-slate-50 text-slate-700'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                      <Bot size={16} />
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-brand" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aura is thinking...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input Footer */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-50">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tell Aura what to do..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="w-full bg-white border-none rounded-2xl py-4 pl-6 pr-14 font-medium text-slate-700 shadow-sm focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-slate-300"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-brand text-white rounded-xl shadow-lg shadow-brand/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-center mt-3 text-slate-400 font-bold uppercase tracking-widest">
                Aura can create tasks, notes, and events instantly
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
