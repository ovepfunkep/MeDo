import React from 'react';
import { Task } from '@/types';
import SwipeableTaskCard from './SwipeableTaskCard';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskListProps {
  tasks: Task[];
  onTogglePin: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEditTask: (task: Task) => void;
  onSwipeLeft?: (task: Task) => void;
  onSwipeRight?: (task: Task) => void;
  isCompletedTab?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTogglePin,
  onToggleComplete,
  onEditTask,
  onSwipeLeft,
  onSwipeRight,
  isCompletedTab = false,
}) => {
  // Сортируем задачи: закреплённые сверху, затем по дате создания
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.createdAt - a.createdAt;
  });

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center"
          >
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-medium text-gray-900 dark:text-white mb-2"
          >
            {isCompletedTab ? 'Нет завершённых задач' : 'Нет задач'}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 dark:text-gray-400"
          >
            {isCompletedTab 
              ? 'Завершённые задачи будут отображаться здесь'
              : 'Нажмите кнопку "+" чтобы добавить первую задачу'
            }
          </motion.p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task, index) => (
          <motion.div
            key={task.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 50,
              delay: index * 0.05,
            }}
          >
            <SwipeableTaskCard
              task={task}
              onTogglePin={onTogglePin}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onSwipeLeft={() => onSwipeLeft?.(task)}
              onSwipeRight={() => onSwipeRight?.(task)}
              isCompleted={isCompletedTab}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default TaskList;

