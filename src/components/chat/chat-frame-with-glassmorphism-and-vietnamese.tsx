// Refactored ChatFrame - Modular Architecture
// Break down from 656 lines to <200 lines by extracting components
// Components extracted: MessageBubbleUser, MessageBubbleAssistant, CommandPalette, ChatInput, ChatHeader
// Added: ErrorBannerWithRetry, ScrollToBottomButton, HistoryPanelWireframe, useScrollPosition hook
// Version: 2026-04-07-004

const BUILD_VERSION = '2026-04-07-004';
console.log('[Chat] Build version:', BUILD_VERSION);

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageBubbleUser } from './message-bubble-user-simple';
import { MessageBubbleAssistant } from './message-bubble-assistant-with-actions';
import { CommandPalette } from './command-palette-with-cmdk';
import { ChatInput } from './chat-input-with-keyboard-shortcuts';
import { ChatHeader } from './chat-header-with-status';
import { CodeBlockWithCopy } from './code-block-with-copy-button';
import { ErrorBannerWithRetry } from './error-banner-with-retry';
import { ScrollToBottomButton } from './scroll-to-bottom-button';
import { HistoryPanelWireframe } from './history-panel-wireframe';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import { EmptyStateWithSuggestions } from './empty-state-with-suggestions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatFrameWithGlassmorphismAndVietnamese() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [commandOpen, setCommandOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'network' | 'server' | 'unknown'>('unknown');
  const [isRetrying, setIsRetrying] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { isNearBottom } = useScrollPosition(messagesContainerRef, 150);

  useEffect(() => {
    console.log('[Chat] Build version:', BUILD_VERSION);
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await fetch('/api/health');
      setApiStatus(response.ok ? 'ready' : 'error');
    } catch {
      setApiStatus('error');
    }
  };

  // Auto-scroll only when near bottom
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isNearBottom]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    setErrorMessage(null);
    setErrorType('unknown');

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, sessionId: null }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let assistantId: string | null = null;

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'chunk' && parsed.content) {
                assistantContent += parsed.content;
                setMessages((prev) => {
                  if (assistantId && prev.find((m) => m.id === assistantId)) {
                    return prev.map((m) =>
                      m.id === assistantId ? { ...m, content: assistantContent } : m
                    );
                  }
                  assistantId = (Date.now() + 1).toString();
                  return [
                    ...prev,
                    { id: assistantId, role: 'assistant', content: assistantContent },
                  ];
                });
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('[Chat] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      const isNetworkError = errorMsg.includes('fetch') || errorMsg.includes('network');
      setErrorType(isNetworkError ? 'network' : 'server');
      setErrorMessage(`Lỗi kết nối: ${errorMsg}`);
      toast.error(`Lỗi: ${errorMsg}`);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleRetry = async () => {
    if (!errorMessage || isRetrying) return;

    setIsRetrying(true);
    await checkApiHealth();

    // Retry the last user message if available
    const lastUserMessage = messages.findLast((m) => m.role === 'user');
    if (lastUserMessage) {
      setInput(lastUserMessage.content);
      // Remove the failed assistant message if exists
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg?.role === 'assistant' && lastMsg.content === '') {
          return prev.slice(0, -1);
        }
        return prev;
      });
      setTimeout(() => handleSend(), 100);
    }

    setIsRetrying(false);
  };

  const handleDismissError = () => {
    setErrorMessage(null);
    setErrorType('unknown');
  };

  const handleCommandSelect = (command: string) => {
    setInput(command + ' ');
    setCommandOpen(false);
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    if (errorMessage) setErrorMessage(null);
  };

  const handleClear = () => {
    setMessages([]);
    setErrorMessage(null);
    toast.info('Đã xóa cuộc trò chuyện');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative h-full flex justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden relative">
          <ChatHeader
            apiStatus={apiStatus}
            onRefresh={() => { localStorage.clear(); window.location.reload(); }}
            onToggleHistory={() => setShowHistory(!showHistory)}
            onNewChat={handleClear}
            showHistory={showHistory}
          />

          <div className="flex-1 flex overflow-hidden relative">
            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto relative"
            >
              {errorMessage && (
                <ErrorBannerWithRetry
                  message={errorMessage}
                  type={errorType}
                  onRetry={handleRetry}
                  onDismiss={handleDismissError}
                  isRetrying={isRetrying}
                />
              )}
              {messages.length === 0 ? (
                <EmptyStateWithSuggestions
                  onSuggestionClick={(text) => {
                    setInput(text);
                    if (text === '/') setCommandOpen(true);
                  }}
                  onCommandPaletteOpen={() => setCommandOpen(true)}
                />
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === 'user' ? (
                        <MessageBubbleUser content={message.content} messageId={message.id} />
                      ) : (
                        <MessageBubbleAssistant content={message.content} messageId={message.id} />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}

              {/* Scroll to bottom button */}
              <ScrollToBottomButton
                onClick={scrollToBottom}
                isVisible={!isNearBottom && messages.length > 0}
              />
            </div>

            {/* History Panel */}
            <HistoryPanelWireframe
              isOpen={showHistory}
              onClose={() => setShowHistory(false)}
              onNewChat={() => {
                handleClear();
                setShowHistory(false);
              }}
            />
          </div>

          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSend={handleSend}
            onCommandPaletteOpen={() => setCommandOpen(true)}
            isStreaming={isStreaming}
          />

          <CommandPalette
            open={commandOpen}
            onOpenChange={setCommandOpen}
            onSelect={handleCommandSelect}
          />
        </div>
      </div>
    </div>
  );
}
