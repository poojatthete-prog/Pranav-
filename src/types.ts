export type AppSection = 'dashboard' | 'calendar' | 'timer' | 'notes' | 'settings';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  category: string;
  tags?: string[];
  dueDate?: string;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly';
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
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  reminderTime?: 'none' | 'at_time' | '5_min' | '15_min' | '30_min' | '1_hour';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  tags?: string[];
  color?: string;
}

export interface LogNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'success' | 'alert';
  read: boolean;
}
