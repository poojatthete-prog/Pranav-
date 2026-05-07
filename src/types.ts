export type AppSection = 'dashboard' | 'calendar' | 'timer' | 'notes' | 'settings';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  tags?: string[];
  dueDate?: string;
}

export interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  category: string;
  tags?: string[];
  description?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags?: string[];
  color?: string;
}
