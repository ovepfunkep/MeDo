import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import Header from '@/components/layout/Header';
import TabNavigation from '@/components/layout/TabNavigation';
import TaskList from '@/components/task/TaskList';
import TaskForm from '@/components/task/TaskForm';
import FloatingActionButton from '@/components/common/FloatingActionButton';
import Snackbar from '@/components/common/Snackbar';
import { Task, TaskFormData } from '@/types';
import { storage, indexedDBService } from '@/utils';
import './App.css';

const AppContent: React.FC = () => {
  const {
    state,
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
    dispatch,
  } = useApp();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [snackbar, setSnackbar] = useState<{
    isVisible: boolean;
    message: string;
    action?: () => void;
  }>({
    isVisible: false,
    message: '',
  });

  // Загрузка данных из storage при запуске
  useEffect(() => {
    const loadData = async () => {
      try {
        // Инициализируем IndexedDB
        await indexedDBService.init();
        
        const savedTasks = await storage.getTasks();
        const savedSettings = await storage.getSettings();
        
        if (savedTasks.length > 0) {
          dispatch({ type: 'SET_TASKS', payload: savedTasks });
        }
        
        if (savedSettings.theme) {
          dispatch({ type: 'SET_THEME', payload: savedSettings.theme });
        }
        
        if (savedSettings.language) {
          dispatch({ type: 'SET_LANGUAGE', payload: savedSettings.language });
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // Сохранение задач в storage при изменении
  useEffect(() => {
    const saveData = async () => {
      try {
        await storage.saveTasks(state.tasks);
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };

    saveData();
  }, [state.tasks]);

  // Сохранение настроек в storage при изменении
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await storage.saveSettings(state.settings);
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    };

    saveSettings();
  }, [state.settings]);

  const activeTasks = getActiveTasks();
  const completedTasks = getCompletedTasks();
  const currentTasks = state.activeTab === 'active' ? activeTasks : completedTasks;

  const handleAddTask = () => {
    setEditingTask(null);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskFormOpen(true);
  };

  const handleSaveTask = (data: TaskFormData) => {
    if (editingTask) {
      updateTask(editingTask.id, data);
    } else {
      addTask(data);
    }
    setIsTaskFormOpen(false);
    setEditingTask(null);
  };

  const handleSwipeLeft = (task: Task) => {
    if (state.activeTab === 'active') {
      // Переместить в завершённые
      toggleTaskComplete(task.id);
      showSnackbar('Задача завершена', () => toggleTaskComplete(task.id));
    } else {
      // Восстановить в активные
      toggleTaskComplete(task.id);
      showSnackbar('Задача восстановлена', () => toggleTaskComplete(task.id));
    }
  };

  const handleSwipeRight = (task: Task) => {
    if (state.activeTab === 'completed') {
      // Удалить навсегда
      const taskToDelete = { ...task };
      deleteTask(task.id);
      showSnackbar('Задача удалена', () => {
        dispatch({ type: 'ADD_TASK', payload: taskToDelete });
      });
    }
  };

  const showSnackbar = (message: string, action?: () => void) => {
    setSnackbar({
      isVisible: true,
      message,
      action,
    });
  };

  const hideSnackbar = () => {
    setSnackbar({
      isVisible: false,
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Header
        theme={state.settings.theme}
        language={state.settings.language}
        onThemeToggle={toggleTheme}
        onLanguageToggle={toggleLanguage}
      />

      <main className="flex-1 flex flex-col">
        <TaskList
          tasks={currentTasks}
          onTogglePin={toggleTaskPin}
          onToggleComplete={toggleTaskComplete}
          onEditTask={handleEditTask}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          isCompletedTab={state.activeTab === 'completed'}
        />
      </main>

      <TabNavigation
        activeTab={state.activeTab}
        onTabChange={setActiveTab}
        activeCount={activeTasks.length}
        completedCount={completedTasks.length}
      />

      {state.activeTab === 'active' && (
        <FloatingActionButton onClick={handleAddTask} />
      )}

      <TaskForm
        isOpen={isTaskFormOpen}
        task={editingTask}
        onClose={() => {
          setIsTaskFormOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
      />

      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        onAction={snackbar.action}
        onClose={hideSnackbar}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;

