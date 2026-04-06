// Refactored ChatFrame - Modular Architecture
// Break down from 656 lines to <200 lines by extracting components
// Components extracted: MessageBubbleUser, MessageBubbleAssistant, CommandPalette, ChatInput, ChatHeader
// Version: 2026-04-07-003

const BUILD_VERSION = '2026-04-07-003';
console.log('[Chat] Build version:', BUILD_VERSION);

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { MessageBubbleUser } from './message-bubble-user-simple';
import { MessageBubbleAssistant } from './message-bubble-assistant-with-actions';
import { CommandPalette } from './command-palette-with-cmdk';
import { ChatInput } from './chat-input-with-keyboard-shortcuts';
import { ChatHeader } from './chat-header-with-status';
import { CodeBlockWithCopy } from './code-block-with-copy-button';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    setErrorMessage(null); // Clear error on new message

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

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

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
      const errorMsg = 'Lỗi kết nối: ' + (error instanceof Error ? error.message : 'Unknown');
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsStreaming(false);
    }
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
    toast.info('Đã xóa cuộc trò chuyện');
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
        <div className="w-full max-w-4xl flex flex-col bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <ChatHeader
            apiStatus={apiStatus}
            onRefresh={() => { localStorage.clear(); window.location.reload(); }}
            onToggleHistory={() => setShowHistory(!showHistory)}
            onNewChat={handleClear}
            showHistory={showHistory}
          />

          <div className="flex-1 flex overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto">
              {errorMessage && (
                <div data-testid="error-message" className="p-4 bg-red-900/30 border-b border-red-700/50">
                  <p className="text-red-400 text-sm">{errorMessage}</p>
                </div>
              )}
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="mb-2">Bắt đầu cuộc trò chuyện mới</p>
                    <p className="text-sm text-gray-600">Nhập / để xem danh sách lệnh</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {messages.map((message) => (
                    <div key={message.id}>
                      {message.role === 'user' ? (
                        <MessageBubbleUser content={message.content} />
                      ) : (
                        <MessageBubbleAssistant content={message.content} />
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
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
