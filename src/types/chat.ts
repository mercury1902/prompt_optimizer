export interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'error';

export interface ChatState {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | null;
  input: string;
}

export type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'APPEND_CHUNK'; payload: string }
  | { type: 'SET_STATUS'; payload: ChatStatus }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'STOP_STREAMING' }
  | { type: 'SET_INPUT'; payload: string };

export interface UseAstroChatReturn {
  messages: UIMessage[];
  input: string;
  setInput: (input: string) => void;
  status: ChatStatus;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  stop: () => void;
  error: Error | null;
}

export interface ChatInputProps {
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  onStop: () => void;
  placeholder?: string;
}

export interface MessageListProps {
  messages: UIMessage[];
  isStreaming: boolean;
}

export interface MessageContentProps {
  content: string;
}

export interface CodeBlockProps {
  code: string;
  language?: string;
}
