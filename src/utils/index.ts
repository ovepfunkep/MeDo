import { Task, AppSettings } from '@/types';
import { indexedDBService } from './indexedDB';

export { indexedDBService };

const STORAGE_KEYS = {
  TASKS: 'medo_tasks',
  SETTINGS: 'medo_settings',
} as const;

// Проверка поддержки IndexedDB
const isIndexedDBSupported = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

export const storage = {
  // Задачи
  getTasks: async (): Promise<Task[]> => {
    try {
      if (isIndexedDBSupported()) {
        return await indexedDBService.getAllTasks();
      } else {
        // Fallback на localStorage
        const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        return tasks ? JSON.parse(tasks) : [];
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      // Fallback на localStorage при ошибке IndexedDB
      try {
        const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
        return tasks ? JSON.parse(tasks) : [];
      } catch (localStorageError) {
        console.error('Error loading tasks from localStorage:', localStorageError);
        return [];
      }
    }
  },

  saveTasks: async (tasks: Task[]): Promise<void> => {
    try {
      if (isIndexedDBSupported()) {
        await indexedDBService.saveTasks(tasks);
      }
      // Всегда сохраняем в localStorage как backup
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
      // Fallback на localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      } catch (localStorageError) {
        console.error('Error saving tasks to localStorage:', localStorageError);
      }
    }
  },

  saveTask: async (task: Task): Promise<void> => {
    try {
      if (isIndexedDBSupported()) {
        await indexedDBService.saveTask(task);
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  },

  deleteTask: async (id: string): Promise<void> => {
    try {
      if (isIndexedDBSupported()) {
        await indexedDBService.deleteTask(id);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  },

  // Настройки
  getSettings: async (): Promise<Partial<AppSettings>> => {
    try {
      if (isIndexedDBSupported()) {
        return await indexedDBService.getSettings();
      } else {
        // Fallback на localStorage
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {};
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback на localStorage при ошибке IndexedDB
      try {
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {};
      } catch (localStorageError) {
        console.error('Error loading settings from localStorage:', localStorageError);
        return {};
      }
    }
  },

  saveSettings: async (settings: AppSettings): Promise<void> => {
    try {
      if (isIndexedDBSupported()) {
        await indexedDBService.saveSettings(settings);
      }
      // Всегда сохраняем в localStorage как backup
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      // Fallback на localStorage
      try {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      } catch (localStorageError) {
        console.error('Error saving settings to localStorage:', localStorageError);
      }
    }
  },

  // Очистка всех данных
  clear: async (): Promise<void> => {
    try {
      if (isIndexedDBSupported()) {
        await indexedDBService.clearAll();
      }
      localStorage.removeItem(STORAGE_KEYS.TASKS);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },

  // Экспорт/импорт данных
  exportData: async (): Promise<{ tasks: Task[]; settings: AppSettings }> => {
    try {
      if (isIndexedDBSupported()) {
        return await indexedDBService.exportData();
      } else {
        const tasks = await storage.getTasks();
        const settings = await storage.getSettings();
        return {
          tasks,
          settings: {
            theme: settings.theme || 'light',
            language: settings.language || 'ru',
          },
        };
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  },

  importData: async (data: { tasks: Task[]; settings: AppSettings }): Promise<void> => {
    try {
      if (isIndexedDBSupported()) {
        await indexedDBService.importData(data);
      } else {
        await storage.saveTasks(data.tasks);
        await storage.saveSettings(data.settings);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  },
};

// Утилиты для работы с задачами
export const taskUtils = {
  // Сортировка задач: закреплённые сверху, затем по дате создания
  sortTasks: (tasks: Task[]): Task[] => {
    return [...tasks].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.createdAt - a.createdAt;
    });
  },

  // Фильтрация активных задач
  getActiveTasks: (tasks: Task[]): Task[] => {
    return tasks.filter(task => !task.completed);
  },

  // Фильтрация завершённых задач
  getCompletedTasks: (tasks: Task[]): Task[] => {
    return tasks.filter(task => task.completed);
  },

  // Поиск задач по тексту
  searchTasks: (tasks: Task[], query: string): Task[] => {
    if (!query.trim()) return tasks;
    
    const lowercaseQuery = query.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(lowercaseQuery) ||
      (task.description && task.description.toLowerCase().includes(lowercaseQuery))
    );
  },
};

// Утилиты для работы с темой
export const themeUtils = {
  // Определение системной темы
  getSystemTheme: (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  },

  // Применение темы к документу
  applyTheme: (theme: 'light' | 'dark'): void => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  },
};

// Утилиты для работы с языком
export const languageUtils = {
  // Определение языка браузера
  getBrowserLanguage: (): 'ru' | 'en' => {
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language.toLowerCase();
      return lang.startsWith('ru') ? 'ru' : 'en';
    }
    return 'en';
  },
};

// Утилиты для генерации ID
export const idUtils = {
  generate: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
};

// Утилиты для работы с датами
export const dateUtils = {
  formatDate: (timestamp: number, locale: string = 'ru-RU'): string => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  formatDateTime: (timestamp: number, locale: string = 'ru-RU'): string => {
    return new Date(timestamp).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  isToday: (timestamp: number): boolean => {
    const today = new Date();
    const date = new Date(timestamp);
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },
};

