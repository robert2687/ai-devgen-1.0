import React, { useState } from 'react';
import { CodeIcon } from './icons';

interface EditorPanelProps {
  code: string;
  previousCode: string;
  setCode: (code: string) => void;
  isLoading: boolean;
  onFormatCode: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ code, previousCode, setCode, isLoading, onFormatCode }) => {
  const [showDiff, setShowDiff] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800/50">
      <div className="flex justify-between items-center p-2 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Editor</h2>
        {previousCode && (
          <button 
            onClick={() => setShowDiff(!showDiff)} 
            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-md ${showDiff ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}
          >
            <CodeIcon className="w-4 h-4" />
            {showDiff ? 'Hide Diff' : 'Show Diff'}
          </button>
        )}
      </div>

      <div className="flex-grow relative">
        {showDiff && previousCode ? (
            <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 h-full">
                <div className="bg-white dark:bg-gray-800 h-full overflow-auto">
                    <h3 className="text-sm font-medium p-2 sticky top-0 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">Previous Code</h3>
                    <pre className="p-2 text-xs font-mono whitespace-pre-wrap">{previousCode}</pre>
                </div>
                <div className="bg-white dark:bg-gray-800 h-full overflow-auto">
                    <h3 className="text-sm font-medium p-2 sticky top-0 bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">Current Code</h3>
                    <pre className="p-2 text-xs font-mono whitespace-pre-wrap">{code}</pre>
                </div>
            </div>
        ) : (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={onFormatCode}
            className="w-full h-full p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none border-0 focus:ring-0"
            placeholder="Generated code will appear here..."
            spellCheck="false"
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default EditorPanel;