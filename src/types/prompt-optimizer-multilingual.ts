export type InputLanguagePreference = 'auto' | 'vi' | 'en';
export type OutputLanguageMode = 'both' | 'vi' | 'en';
export type OptimizerDisplayMode = 'side-by-side' | 'tab-toggle' | 'inline-translation';
export type OptimizerPreviewMode = 'english' | 'bilingual';

export interface MultilingualOptimizedPromptResult {
  optimizedPromptEn: string;
  optimizedPromptVi: string;
  suggestedCommand: string;
  explanation: string;
  detectedInputLanguage?: 'vi' | 'en' | 'mixed';
  rawContent?: string;
}

export interface PromptOptimizerApiRequest {
  modelMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  inputLanguagePreference: InputLanguagePreference;
  outputLanguageMode: OutputLanguageMode;
}

export interface PromptOptimizerApiResponse {
  result: MultilingualOptimizedPromptResult;
}
