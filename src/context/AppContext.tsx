import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Task, TaskFormData, Theme, Language, AppSettings } from '@/types';

interface AppState {
  tasks: Task[];
  settings: AppSettings;
  activeTab: 'active' | 'completed';
}

type AppAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_COMPLETE'; payload: string }
  | { type: 'TOGGLE_TASK_PIN'; payload: string }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_LANGUAGE'; payload: Language }
  | { type: 'SET_ACTIVE_TAB'; payload: 'active' | 'completed' };

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTask: (data: TaskFormData) => void;
  updateTask: (id: string, data: TaskFormData) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  toggleTaskPin: (id: string) => void;
  toggleTheme: () => void;
  toggleLanguage: () => void;
  setActiveTab: (tab: 'active' | 'completed') => void;
  getActiveTasks: () => Task[];
  getCompletedTasks: () => Task[];
}

const initialState: AppState = {
  tasks: [],
  settings: {
    theme: 'light',
    language: 'ru',
  },
  activeTab: 'active',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };
    
    case 'TOGGLE_TASK_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, completed: !task.completed, updatedAt: Date.now() }
            : task
        ),
      };
    
    case 'TOGGLE_TASK_PIN':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, pinned: !task.pinned, updatedAt: Date.now() }
            : task
        ),
      };
    
    case 'SET_THEME':
      return {
        ...state,
        settings: { ...state.settings, theme: action.payload },
      };
    
    case 'SET_LANGUAGE':
      return {
        ...state,
        settings: { ...state.settings, language: action.payload },
      };
    
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { i18n } = useTranslation();

  // Применение темы к документу
  useEffect(() => {
    if (state.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.settings.theme]);

  // Синхронизация языка с i18next
  useEffect(() => {
    if (i18n.language !== state.settings.language) {
      i18n.changeLanguage(state.settings.language);
    }
  }, [state.settings.language, i18n]);

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const addTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      title: data.title,
      description: data.description || undefined,
      pinned: data.pinned,
      completed: false,
      color: data.color,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
  };

  const updateTask = (id: string, data: TaskFormData) => {
    const existingTask = state.tasks.find(task => task.id === id);
    if (existingTask) {
      const updatedTask: Task = {
        ...existingTask,
        title: data.title,
        description: data.description || undefined,
        pinned: data.pinned,
        color: data.color,
        updatedAt: Date.now(),
      };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
    }
  };

  const deleteTask = (id: string) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  };

  const toggleTaskComplete = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_COMPLETE', payload: id });
  };

  const toggleTaskPin = (id: string) => {
    dispatch({ type: 'TOGGLE_TASK_PIN', payload: id });
  };

  const toggleTheme = () => {
    const newTheme = state.settings.theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const toggleLanguage = () => {
    const newLanguage = state.settings.language === 'ru' ? 'en' : 'ru';
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
    i18n.changeLanguage(newLanguage);
  };

  const setActiveTab = (tab: 'active' | 'completed') => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const getActiveTasks = () => {
    return state.tasks.filter(task => !task.completed);
  };

  const getCompletedTasks = () => {
    return state.tasks.filter(task => task.completed);
  };

  const value: AppContextType = {
    state,
    dispatch,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    toggleTaskPin,
    toggleTheme,
    toggleLanguage,
    setActiveTab,
    getActiveTasks,
    getCompletedTasks,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;

