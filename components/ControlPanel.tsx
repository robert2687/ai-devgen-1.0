
import React, { useState, useRef } from 'react';
import { LoadingState, type CodeSource } from '../types';
import { SparklesIcon, RefreshIcon, UploadIcon, GithubIcon, TrashIcon } from './icons';

interface ControlPanelProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  loadingState: LoadingState;
  hasCode: boolean;
  onGenerate: () => void;
  onRefine: () => void;
  onUpload: (content: string) => void;
  onClone: (repoUrl: string) => void;
  onClear: () => void;
  codeSource: CodeSource;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  prompt,
  setPrompt,
  loadingState,
  hasCode,
  onGenerate,
  onRefine,
  onUpload,
  onClone,
  onClear,
  codeSource
}) => {
  const [githubUrl, setGithubUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isLoading = loadingState !== LoadingState.Idle;
  const isGenerating = loadingState === LoadingState.Generating;
  const isRefining = loadingState === LoadingState.Refining;
  const isCloning = loadingState === LoadingState.Cloning;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onUpload(content);
      };
      reader.readAsText(file);
    }
  };

  const handleCloneClick = () => {
    if (githubUrl) {
      onClone(githubUrl);
    }
  };
  
  const handleClearClick = () => {
    if(window.confirm("Are you sure you want to clear the current project? This action cannot be undone.")){
      onClear();
    }
  }

  const SourceDisplay = () => {
    let sourceText: string;
    switch(codeSource.type) {
      case 'prompt':
        sourceText = `From prompt: "${codeSource.value}"`;
        break;
      case 'upload':
        sourceText = `From uploaded file: ${codeSource.value}`;
        break;
      case 'github':
        sourceText = `From GitHub: ${codeSource.value}`;
        break;
      case 'cleared':
        sourceText = 'Project cleared.';
        break;
      case 'initial':
        sourceText = 'Welcome! Enter a prompt to start.';
        break;
      default:
        return null;
    }
    return <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded truncate" title={sourceText}>{sourceText}</div>
  }

  return (
    <div className="w-full h-full p-4 flex flex-col bg-white dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-800">
      <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Controls</h2>
      
      <div className="flex-grow flex flex-col gap-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern landing page for a SaaS product..."
            className="mt-1 block w-full rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-32 resize-none"
            disabled={isLoading}
          />
          <SourceDisplay />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onGenerate}
            disabled={isLoading || !prompt}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isGenerating ? <RefreshIcon className="w-5 h-5 mr-2 animate-spin" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
          <button
            onClick={onRefine}
            disabled={isLoading || !prompt || !hasCode}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isRefining ? <RefreshIcon className="w-5 h-5 mr-2 animate-spin" /> : <RefreshIcon className="w-5 h-5 mr-2" />}
            {isRefining ? 'Refining...' : 'Refine'}
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200">Import Code</h3>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".html" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
              <UploadIcon className="w-5 h-5 mr-2" /> Upload HTML File
            </button>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/user/repo"
                    className="flex-grow block w-full rounded-md bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    disabled={isLoading}
                />
                <button onClick={handleCloneClick} disabled={isLoading || !githubUrl} className="inline-flex items-center justify-center p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50">
                   {isCloning ? <RefreshIcon className="w-5 h-5 animate-spin" /> : <GithubIcon className="w-5 h-5 text-gray-700 dark:text-gray-200"/>}
                </button>
            </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <button onClick={handleClearClick} disabled={isLoading || !hasCode} className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-500/50 text-sm font-medium rounded-md shadow-sm text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
            <TrashIcon className="w-5 h-5 mr-2" /> Clear Project
        </button>
      </div>

    </div>
  );
};

export default ControlPanel;
