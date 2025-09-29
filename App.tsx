
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import ErrorDisplay from './components/ErrorDisplay';
import { generateCode, refineCode } from './services/geminiService';
import { useDebounce } from './hooks/useDebounce';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LoadingState, SaveStatus, type Theme, type CodeSource } from './types';

const formatHtml = (html: string): string => {
  if (!html) return '';
  const tab = '  ';
  let indentLevel = 0;
  
  // Split tags to handle them on separate lines
  const lines = html.replace(/>\s*</g, '>\n<').split('\n');
  
  return lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';

    // If it's a closing tag, decrease indent before processing the line
    if (trimmed.startsWith('</')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indentedLine = tab.repeat(indentLevel) + trimmed;

    // If it's an opening tag (but not self-closing or paired on one line), increase indent for subsequent lines
    const isOpeningTag = trimmed.startsWith('<') && !trimmed.startsWith('</');
    const isSelfClosing = trimmed.endsWith('/>') || ['<meta', '<link', '<br', '<hr', '<img', '<input', '<!DOCTYPE'].some(tag => trimmed.startsWith(tag));
    const isPairedOneline = isOpeningTag && /<\w+[^>]*>.*<\/\w+>/.test(trimmed);

    if (isOpeningTag && !isSelfClosing && !isPairedOneline) {
      indentLevel++;
    }

    return indentedLine;
  }).filter(Boolean).join('\n');
};

const App: React.FC = () => {
  const [prompt, setPrompt] = useLocalStorage<string>('prompt', '');
  const [code, setCode] = useLocalStorage<string>('code', '<!-- Welcome to AI DevGen Studio! Enter a prompt on the left and click Generate. -->');
  const [previousCode, setPreviousCode] = useLocalStorage<string>('previousCode', '');
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'dark');
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.Idle);
  const [error, setError] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(SaveStatus.Idle);
  const [codeSource, setCodeSource] = useLocalStorage<CodeSource>('codeSource', { type: 'initial', value: 'Welcome' });
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  const debouncedCode = useDebounce(code, 500);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isZenMode]);

  // Auto-save logic
  useEffect(() => {
    if (debouncedCode !== localStorage.getItem('code')) {
      setSaveStatus(SaveStatus.Saving);
      const timer = setTimeout(() => {
        // This effect runs when debouncedCode changes, so useLocalStorage is already handling the save.
        // We just manage the visual status.
        setSaveStatus(SaveStatus.Saved);
        const hideTimer = setTimeout(() => setSaveStatus(SaveStatus.Idle), 2000);
        return () => clearTimeout(hideTimer);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [debouncedCode]);

  const handleApiCall = async (apiFunc: () => Promise<string>, loading: LoadingState, source: CodeSource) => {
    setLoadingState(loading);
    setError('');
    try {
      const newCodeRaw = await apiFunc();
      if (!newCodeRaw || newCodeRaw.trim() === '') {
        throw new Error("The AI returned an empty response. Please try a different prompt.");
      }
      const newCode = formatHtml(newCodeRaw);
      setPreviousCode(code);
      setCode(newCode);
      setCodeSource(source);
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoadingState(LoadingState.Idle);
    }
  };

  const handleGenerate = () => {
    handleApiCall(
      () => generateCode(prompt),
      LoadingState.Generating,
      { type: 'prompt', value: prompt }
    );
  };
  
  const handleRefine = () => {
    handleApiCall(
      () => refineCode(prompt, code),
      LoadingState.Refining,
      { type: 'prompt', value: prompt }
    );
  };

  const ensureTailwindAndFont = (htmlContent: string): string => {
    let updatedContent = htmlContent;
    if (!updatedContent.includes('cdn.tailwindcss.com')) {
      updatedContent = updatedContent.replace('</head>', '<script src="https://cdn.tailwindcss.com"></script></head>');
    }
    if (!updatedContent.includes('fonts.googleapis.com/css2?family=Inter')) {
      const fontLink = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>`;
      updatedContent = updatedContent.replace('</head>', fontLink);
    }
    return updatedContent;
  };

  const handleUpload = (content: string) => {
    const formattedContent = formatHtml(content);
    const finalCode = ensureTailwindAndFont(formattedContent);
    setPreviousCode(code);
    setCode(finalCode);
    setCodeSource({ type: 'upload', value: 'local file' });
  };

  const handleClone = async (repoUrl: string) => {
    setLoadingState(LoadingState.Cloning);
    setError('');
    try {
      // Basic URL parsing: https://github.com/user/repo -> user/repo
      const match = repoUrl.match(/github\.com\/([^/]+\/[^/]+)/);
      if (!match) {
        throw new Error("Invalid GitHub repository URL. Expected format: https://github.com/user/repo");
      }
      const repoPath = match[1];
      const rawUrl = `https://raw.githubusercontent.com/${repoPath}/main/index.html`;
      
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch index.html. Status: ${response.status}. Check repo URL and if 'main' branch exists.`);
      }
      const htmlContent = await response.text();
      const formattedContent = formatHtml(htmlContent);
      const finalCode = ensureTailwindAndFont(formattedContent);
      setPreviousCode(code);
      setCode(finalCode);
      setCodeSource({ type: 'github', value: repoPath });

    } catch (err: any) {
      setError(err.message || 'Failed to clone repository.');
    } finally {
      setLoadingState(LoadingState.Idle);
    }
  };
  
  const handleClear = () => {
    setPreviousCode(code);
    setCode('');
    setPrompt('');
    setCodeSource({ type: 'cleared', value: '' });
  };
  
  const handleFormatCode = useCallback(() => {
    setCode(prevCode => formatHtml(prevCode));
  }, []);

  const toggleZenMode = () => setIsZenMode(prev => !prev);

  return (
    <div className={`font-sans min-h-screen flex flex-col text-gray-900 bg-gray-100 dark:text-gray-100 dark:bg-gray-900 transition-colors duration-300`}>
      <Header theme={theme} setTheme={setTheme} saveStatus={saveStatus} />
      <ErrorDisplay error={error} onClear={() => setError('')} />
      
      {isZenMode ? (
        <main className="flex-grow overflow-hidden">
          <PreviewPanel
            code={debouncedCode}
            isZenMode={isZenMode}
            onToggleZenMode={toggleZenMode}
          />
        </main>
      ) : (
        <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-10 gap-px overflow-hidden">
          <div className="lg:col-span-4 xl:col-span-3 h-full overflow-y-auto">
            <ControlPanel
              prompt={prompt}
              setPrompt={setPrompt}
              loadingState={loadingState}
              hasCode={!!code}
              onGenerate={handleGenerate}
              onRefine={handleRefine}
              onUpload={handleUpload}
              onClone={handleClone}
              onClear={handleClear}
              codeSource={codeSource}
            />
          </div>
          <div className="lg:col-span-8 xl:col-span-7 grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-2 gap-px h-full bg-gray-200 dark:bg-gray-700">
            <div className="h-full overflow-hidden">
                <EditorPanel 
                  code={code}
                  previousCode={previousCode}
                  setCode={setCode} 
                  isLoading={loadingState !== LoadingState.Idle}
                  onFormatCode={handleFormatCode}
                />
            </div>
            <div className="h-full overflow-hidden">
              <PreviewPanel
                code={debouncedCode}
                isZenMode={isZenMode}
                onToggleZenMode={toggleZenMode}
              />
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
