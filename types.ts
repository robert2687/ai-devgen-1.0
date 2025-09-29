
export enum LoadingState {
  Idle = 'idle',
  Generating = 'generating',
  Refining = 'refining',
  Cloning = 'cloning',
}

export enum SaveStatus {
  Idle = 'idle',
  Saving = 'saving',
  Saved = 'saved',
}

export type Theme = 'light' | 'dark';

export interface CodeSource {
  type: 'prompt' | 'upload' | 'github' | 'cleared' | 'initial';
  value: string;
}
