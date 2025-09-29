
import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onClear: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear }) => {
  if (!error) return null;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-lg" role="alert">
      <div className="flex">
        <div className="py-1"><svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-9h2V5h-2v4zm0 4h2v-2h-2v2z"/></svg></div>
        <div>
          <p className="font-bold">An Error Occurred</p>
          <p className="text-sm">{error}</p>
        </div>
        <button onClick={onClear} className="ml-auto text-red-500 hover:text-red-700">&times;</button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
