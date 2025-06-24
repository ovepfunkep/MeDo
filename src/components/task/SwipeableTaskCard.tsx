import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Task } from '@/types';
import TaskCard from './TaskCard';
import { CheckCircle, Trash2, RotateCcw } from 'lucide-react';

interface SwipeableTaskCardProps {
  task: Task;
  onTogglePin: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  isCompleted?: boolean;
}

const SwipeableTaskCard: React.FC<SwipeableTaskCardProps> = ({
  task,
  onTogglePin,
  onToggleComplete,
  onEdit,
  onSwipeLeft,
  onSwipeRight,
  isCompleted = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0, 150], [0.5, 1, 0.5]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;

    if (info.offset.x < -threshold && onSwipeLeft) {
      // Свайп влево
      onSwipeLeft();
    } else if (info.offset.x > threshold && onSwipeRight) {
      // Свайп вправо
      onSwipeRight();
    }

    // Возвращаем карточку в исходное положение
    x.set(0);
  };

  const leftActionIcon = isCompleted ? (
    <RotateCcw className="w-6 h-6 text-white" />
  ) : (
    <CheckCircle className="w-6 h-6 text-white" />
  );

  const leftActionBg = isCompleted ? 'bg-blue-500' : 'bg-green-500';
  const leftActionText = isCompleted ? 'Восстановить' : 'Завершить';

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Фоновые действия */}
      <div className="absolute inset-0 flex">
        {/* Левое действие (завершить/восстановить) */}
        <div className={`flex-1 ${leftActionBg} flex items-center justify-start pl-4`}>
          <div className="flex items-center space-x-2">
            {leftActionIcon}
            <span className="text-white font-medium text-sm">{leftActionText}</span>
          </div>
        </div>

        {/* Правое действие (удалить - только для завершённых) */}
        {isCompleted && (
          <div className="flex-1 bg-red-500 flex items-center justify-end pr-4">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium text-sm">Удалить</span>
              <Trash2 className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Карточка задачи */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ 
          x, 
          opacity: isDragging ? opacity : 1,
          scale: isDragging ? scale : 1,
        }}
        className="relative z-10 bg-white dark:bg-gray-900"
        whileTap={{ scale: isDragging ? undefined : 0.98 }}
      >
        <TaskCard
          task={task}
          onTogglePin={onTogglePin}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
        />
      </motion.div>
    </div>
  );
};

export default SwipeableTaskCard;

