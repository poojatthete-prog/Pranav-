/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import Calendar from './components/Calendar';
import FocusTimer from './components/FocusTimer';
import Notes from './components/Notes';
import Settings from './components/Settings';
import { AppSection, Task, Event, Note } from './types';

const INITIAL_TASKS: Task[] = [
  { id: '1', title: 'Complete Aura design system', description: 'Finish the Bento grid layout and color palette.', completed: false, category: 'Work', dueDate: 'Today', tags: ['design', 'ui'] },
  { id: '2', title: 'Grocery shopping', description: 'Milk, eggs, bread, and fruits.', completed: true, category: 'Personal', dueDate: 'Today', tags: ['home'] },
  { id: '3', title: 'Review team feedback', description: 'Go through the latest comments on Figma.', completed: false, category: 'Work', dueDate: 'Tomorrow' },
  { id: '4', title: 'Clean the workspace', description: 'Organize cables and dust the desk.', completed: false, category: 'Life', dueDate: 'Next Week' },
  { id: '5', title: 'Buy new running shoes', description: 'Look for trail running shoes.', completed: false, category: 'Shopping', dueDate: 'Soon' },
];

const INITIAL_EVENTS: Event[] = [
  { id: '1', title: 'Design Review', time: '10:00 AM', date: 'Oct 25', location: 'Figma Zoom', category: 'Work', tags: ['review'] },
];

const INITIAL_NOTES: Note[] = [
  { id: '1', title: 'Product Vision', content: 'Create a seamless experience for power users who want minimalist tools.', updatedAt: '2h ago', tags: ['vision', 'product'], color: 'indigo' },
  { id: '2', title: 'Design Inspiration', content: 'Swiss typography, brutalist design.', updatedAt: '4h ago', tags: ['design', 'ui'], color: 'sky' },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<AppSection>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title || 'Untitled Task',
      description: task.description,
      completed: false,
      category: task.category || 'Work',
      tags: task.tags || [],
      dueDate: task.dueDate || 'Today',
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addEvent = (event: Partial<Event>) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      title: event.title || 'Untitled Event',
      time: event.time || '12:00 PM',
      date: event.date || 'Oct 25',
      location: event.location,
      category: event.category || 'Work',
      tags: event.tags || [],
      description: event.description,
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const addNote = (note: Partial<Note>) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: note.title || 'Untitled Note',
      content: note.content || '',
      updatedAt: 'Just now',
      tags: note.tags || [],
      color: note.color || 'amber',
    };
    setNotes(prev => [newNote, ...prev]);
  };

  return (
    <div className="min-h-screen bg-bg-main font-sans selection:bg-brand/10 selection:text-brand max-w-md mx-auto relative px-6 pt-10 pb-24">
      <main className="h-full">
        <AnimatePresence mode="wait">
          {activeSection === 'dashboard' && (
            <Dashboard 
              key="dashboard"
              tasks={tasks}
              setTasks={setTasks}
              events={events}
              setEvents={setEvents}
              onAddTask={addTask}
              onAddEvent={addEvent}
              onAddNote={addNote}
            />
          )}
          {activeSection === 'calendar' && <Calendar key="calendar" events={events} />}
          {activeSection === 'timer' && <FocusTimer key="timer" />}
          {activeSection === 'notes' && <Notes key="notes" notes={notes} setNotes={setNotes} />}
          {activeSection === 'settings' && <Settings key="settings" />}
        </AnimatePresence>
      </main>

      <Navigation 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
      />
    </div>
  );
}

