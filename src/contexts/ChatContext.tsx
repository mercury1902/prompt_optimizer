import { createContext, useContext, useReducer, ReactNode } from 'react';
import type { UIMessage, ChatStatus, ChatState, ChatAction } from '../types/chat';

const initialState: ChatState = {
  messages: [],
  status: 'idle',
  error: null,
  input: '',
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SEND_MESSAGE': {
      const userMsg: UIMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: action.payload,
        createdAt: new Date(),
      };
      return {
        ...state,
        messages: [...state.messages, userMsg],
        input: '',
        status: 'submitted',
      };
    }
    case 'APPEND_CHUNK': {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage?.role === 'assistant') {
        return {
          ...state,
          messages: [
            ...state.messages.slice(0, -1),
            { ...lastMessage, content: action.payload },
          ],
          status: 'streaming',
        };
      }
      const assistantMsg: UIMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: action.payload,
        createdAt: new Date(),
      };
      return {
        ...state,
        messages: [...state.messages, assistantMsg],
        status: 'streaming',
      };
    }
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, status: 'error' };
    case 'STOP_STREAMING':
      return { ...state, status: 'idle' };
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    default:
      return state;
  }
}

interface ChatContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
