
import React from 'react';
import { ExpandIcon, ShrinkIcon } from './icons';

interface PreviewPanelProps {
  code: string;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ code, isZenMode, onToggleZenMode }) => {
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800/50">
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Live Preview</h2>
        <button
          onClick={onToggleZenMode}
          className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
          title={isZenMode ? "Exit Zen Mode (Esc)" : "Enter Zen Mode"}
          aria-label={isZenMode ? "Exit Zen Mode" : "Enter Zen Mode"}
        >
          {isZenMode ? <ShrinkIcon className="w-5 h-5" /> : <ExpandIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-grow bg-white">
        <iframe
          srcDoc={code}
          title="Live Preview"
          sandbox="allow-scripts allow-same-origin"
          className="w-full h-full border-0"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
