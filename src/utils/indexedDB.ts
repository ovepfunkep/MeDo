import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Task, AppSettings } from '@/types';

interface MeDoDBSchema extends DBSchema {
  tasks: {
    key: string;
    value: Task;
    indexes: {
      'by-completed': boolean;
      'by-pinned': boolean;
      'by-created': number;
    };
  };
  settings: {
    key: string;
    value: any;
  };
}

class IndexedDBService {
  private db: IDBPDatabase<MeDoDBSchema> | null = null;
  private readonly dbName = 'MeDoApp';
  private readonly dbVersion = 1;

  async init(): Promise<void> {
    try {
      this.db = await openDB<MeDoDBSchema>(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Создание хранилища для задач
          if (!db.objectStoreNames.contains('tasks')) {
            const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
            taskStore.createIndex('by-completed', 'completed');
            taskStore.createIndex('by-pinned', 'pinned');
            taskStore.createIndex('by-created', 'createdAt');
          }

          // Создание хранилища для настроек
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings', { keyPath: 'key' });
          }
        },
      });
    } catch (error) {
      console.error('Failed to initialize IndexedDB:', error);
      throw error;
    }
  }

  private ensureDB(): IDBPDatabase<MeDoDBSchema> {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  // Методы для работы с задачами
  async getAllTasks(): Promise<Task[]> {
    try {
      const db = this.ensureDB();
      return await db.getAll('tasks');
    } catch (error) {
      console.error('Failed to get tasks from IndexedDB:', error);
      return [];
    }
  }

  async getTask(id: string): Promise<Task | undefined> {
    try {
      const db = this.ensureDB();
      return await db.get('tasks', id);
    } catch (error) {
      console.error('Failed to get task from IndexedDB:', error);
      return undefined;
    }
  }

  async saveTask(task: Task): Promise<void> {
    try {
      const db = this.ensureDB();
      await db.put('tasks', task);
    } catch (error) {
      console.error('Failed to save task to IndexedDB:', error);
      throw error;
    }
  }

  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      const db = this.ensureDB();
      const tx = db.transaction('tasks', 'readwrite');
      
      // Очищаем существующие задачи
      await tx.store.clear();
      
      // Добавляем новые задачи
      for (const task of tasks) {
        await tx.store.put(task);
      }
      
      await tx.done;
    } catch (error) {
      console.error('Failed to save tasks to IndexedDB:', error);
      throw error;
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const db = this.ensureDB();
      await db.delete('tasks', id);
    } catch (error) {
      console.error('Failed to delete task from IndexedDB:', error);
      throw error;
    }
  }

  async getActiveTasks(): Promise<Task[]> {
    try {
      const db = this.ensureDB();
      return await db.getAllFromIndex('tasks', 'by-completed', false);
    } catch (error) {
      console.error('Failed to get active tasks from IndexedDB:', error);
      return [];
    }
  }

  async getCompletedTasks(): Promise<Task[]> {
    try {
      const db = this.ensureDB();
      return await db.getAllFromIndex('tasks', 'by-completed', true);
    } catch (error) {
      console.error('Failed to get completed tasks from IndexedDB:', error);
      return [];
    }
  }

  async getPinnedTasks(): Promise<Task[]> {
    try {
      const db = this.ensureDB();
      return await db.getAllFromIndex('tasks', 'by-pinned', true);
    } catch (error) {
      console.error('Failed to get pinned tasks from IndexedDB:', error);
      return [];
    }
  }

  // Методы для работы с настройками
  async getSetting(key: string): Promise<any> {
    try {
      const db = this.ensureDB();
      const result = await db.get('settings', key);
      return result?.value;
    } catch (error) {
      console.error('Failed to get setting from IndexedDB:', error);
      return undefined;
    }
  }

  async saveSetting(key: string, value: any): Promise<void> {
    try {
      const db = this.ensureDB();
      await db.put('settings', { key, value });
    } catch (error) {
      console.error('Failed to save setting to IndexedDB:', error);
      throw error;
    }
  }

  async getSettings(): Promise<Partial<AppSettings>> {
    try {
      const db = this.ensureDB();
      const allSettings = await db.getAll('settings');
      
      const settings: Partial<AppSettings> = {};
      for (const setting of allSettings) {
        if (setting.key === 'theme' || setting.key === 'language') {
          (settings as any)[setting.key] = setting.value;
        }
      }
      
      return settings;
    } catch (error) {
      console.error('Failed to get settings from IndexedDB:', error);
      return {};
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      const db = this.ensureDB();
      const tx = db.transaction('settings', 'readwrite');
      
      await tx.store.put({ key: 'theme', value: settings.theme });
      await tx.store.put({ key: 'language', value: settings.language });
      
      await tx.done;
    } catch (error) {
      console.error('Failed to save settings to IndexedDB:', error);
      throw error;
    }
  }

  // Очистка всех данных
  async clearAll(): Promise<void> {
    try {
      const db = this.ensureDB();
      const tx = db.transaction(['tasks', 'settings'], 'readwrite');
      
      await tx.objectStore('tasks').clear();
      await tx.objectStore('settings').clear();
      
      await tx.done;
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
      throw error;
    }
  }

  // Экспорт данных
  async exportData(): Promise<{ tasks: Task[]; settings: AppSettings }> {
    try {
      const tasks = await this.getAllTasks();
      const settings = await this.getSettings();
      
      return {
        tasks,
        settings: {
          theme: settings.theme || 'light',
          language: settings.language || 'ru',
        },
      };
    } catch (error) {
      console.error('Failed to export data from IndexedDB:', error);
      throw error;
    }
  }

  // Импорт данных
  async importData(data: { tasks: Task[]; settings: AppSettings }): Promise<void> {
    try {
      await this.saveTasks(data.tasks);
      await this.saveSettings(data.settings);
    } catch (error) {
      console.error('Failed to import data to IndexedDB:', error);
      throw error;
    }
  }
}

// Создаём единственный экземпляр сервиса
export const indexedDBService = new IndexedDBService();

// Инициализируем базу данных при загрузке модуля
indexedDBService.init().catch(console.error);

