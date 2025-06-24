import React from 'react';
import { Globe, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Theme, Language } from '@/types';

interface HeaderProps {
  theme: Theme;
  language: Language;
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({
  theme,
  language,
  onThemeToggle,
  onLanguageToggle,
}) => {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          {t('app.title')}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Language Toggle */}
        <button
          onClick={onLanguageToggle}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('accessibility.toggleLanguage')}
        >
          <Globe className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          aria-label={t('accessibility.toggleTheme')}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

