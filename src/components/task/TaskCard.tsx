import React from 'react';
import { Pin, PinOff } from 'lucide-react';
import { Task } from '@/types';
import { motion } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  onTogglePin: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onTogglePin,
  onToggleComplete,
  onEdit,
}) => {
  const cardStyle = {
    backgroundColor: task.color === 'default' 
      ? undefined 
      : task.color,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        p-4 rounded-lg border shadow-sm cursor-pointer transition-all duration-200
        ${task.completed 
          ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60' 
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:shadow-md'
        }
        ${task.pinned ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
      `}
      style={cardStyle}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete(task.id);
              }}
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                ${task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-500'
                }
              `}
            >
              {task.completed && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            
            <h3 className={`
              text-sm font-medium flex-1 truncate
              ${task.completed 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
              }
            `}>
              {task.title}
            </h3>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(task.id);
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {task.pinned ? (
                <Pin className="w-4 h-4 text-blue-500" />
              ) : (
                <PinOff className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
          
          {task.description && (
            <p className={`
              text-xs mt-1 line-clamp-2
              ${task.completed 
                ? 'text-gray-400 dark:text-gray-500' 
                : 'text-gray-600 dark:text-gray-300'
              }
            `}>
              {task.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;

