export interface Task {
  id: string;
  title: string;
  description?: string;
  pinned: boolean;
  completed: boolean;
  color: string; // HEX или tailwind-токен
  createdAt: number;
  updatedAt: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  pinned: boolean;
  color: string;
}

export type Theme = 'light' | 'dark';
export type Language = 'ru' | 'en';

export interface AppSettings {
  theme: Theme;
  language: Language;
}

