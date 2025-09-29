
import React from 'react';
import { type Theme, SaveStatus } from '../types';
import { SunIcon, MoonIcon, SaveIcon, CheckIcon } from './icons';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  saveStatus: SaveStatus;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme, saveStatus }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };
  
  const SaveIndicator = () => {
    switch(saveStatus) {
      case SaveStatus.Saving:
        return <div className="flex items-center gap-2 text-sm text-gray-400"><SaveIcon className="w-4 h-4 animate-pulse" /> Saving...</div>;
      case SaveStatus.Saved:
        return <div className="flex items-center gap-2 text-sm text-green-400"><CheckIcon className="w-4 h-4" /> Saved</div>;
      default:
        return <div className="w-20"></div>; // Placeholder for alignment
    }
  };

  return (
    <header className="bg-gray-800 dark:bg-gray-900 text-white p-3 flex justify-between items-center border-b border-gray-700 dark:border-gray-800 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
        </div>
        <h1 className="text-xl font-bold tracking-wider">AI DevGen Studio</h1>
      </div>
      <div className="flex items-center gap-4">
        <SaveIndicator />
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
          {theme === 'light' ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
