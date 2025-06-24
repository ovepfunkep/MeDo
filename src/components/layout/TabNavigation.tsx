import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface TabNavigationProps {
  activeTab: 'active' | 'completed';
  onTabChange: (tab: 'active' | 'completed') => void;
  activeCount: number;
  completedCount: number;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  activeCount,
  completedCount,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-30">
      <div className="flex relative">
        {/* Индикатор активной вкладки */}
        <motion.div
          className="absolute top-0 h-1 bg-blue-500"
          initial={false}
          animate={{
            left: activeTab === 'active' ? '0%' : '50%',
            width: '50%',
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
        
        <motion.button
          onClick={() => onTabChange('active')}
          className={`
            flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors relative
            ${activeTab === 'active'
              ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          <Circle className="w-5 h-5 mr-2" />
          <span>{t('navigation.active')}</span>
          {activeCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
            >
              {activeCount}
            </motion.span>
          )}
        </motion.button>
        
        <motion.button
          onClick={() => onTabChange('completed')}
          className={`
            flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors relative
            ${activeTab === 'completed'
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }
          `}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{t('navigation.completed')}</span>
          {completedCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-2 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full"
            >
              {completedCount}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default TabNavigation;

