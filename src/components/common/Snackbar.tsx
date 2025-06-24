import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SnackbarProps {
  isVisible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
  duration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({
  isVisible,
  message,
  actionLabel = 'Отменить',
  onAction,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg z-50 mx-auto max-w-sm"
        >
          <div className="flex items-center justify-between p-4">
            <span className="text-sm font-medium flex-1">{message}</span>
            {onAction && (
              <button
                onClick={() => {
                  onAction();
                  onClose();
                }}
                className="ml-4 px-3 py-1 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                {actionLabel}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Snackbar;

