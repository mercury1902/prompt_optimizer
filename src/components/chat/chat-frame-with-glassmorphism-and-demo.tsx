// src/components/chat/chat-frame-with-glassmorphism-and-demo.tsx
// Complete chat frame with glassmorphism effects and demo content
// Contains: ChatFrame, ChatHeader, demo messages, hover actions, command palette

import React, { useState, useRef, useEffect } from 'react';
import { Command } from 'cmdk';
import { toast } from 'sonner';
import {
  Bot,
  User,
  Send,
  Square,
  Command as CommandIcon,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Sparkles,
  Zap,
  Code,
  Wrench,
  Megaphone,
  Search,
  ChevronRight,
} from 'lucide-react';

// ===== SVG Icon Components (Monochrome Style) =====
const IconBolt = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconTool = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const IconSpeaker = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const IconLightbulb = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.9.27-1.48.27-2.09A5.5 5.5 0 0 0 5.63 8.5a5.5 5.5 0 0 0-2.62 5.7c.2 1.1.64 1.84 1.43 2.88.47.62.78 1.13.78 1.92h11.56c0-.79.31-1.3.78-1.92.79-1.04 1.23-1.78 1.43-2.88A5.5 5.5 0 0 0 15.09 14z" />
  </svg>
);

// ===== Demo Message Data (empty by default) =====
const demoMessages: Array<{id: string, role: 'user' | 'assistant', content: string}> = [];

// ===== Demo Commands Data =====
const demoCommands = [
  { id: 'ck:cook', name: '/ck:cook', category: 'Engineer', complexity: 2, description: 'Smart feature implementation with automatic workflow', keywords: ['implement', 'feature', 'cook'] },
  { id: 'ck:plan', name: '/ck:plan', category: 'Engineer', complexity: 3, description: 'Create implementation plans with phases', keywords: ['plan', 'design', 'architecture'] },
  { id: 'ck:code', name: '/ck:code', category: 'Engineer', complexity: 2, description: 'Generate and review code', keywords: ['code', 'generate', 'write'] },
  { id: 'ck:debug', name: '/ck:debug', category: 'Engineer', complexity: 3, description: 'Debug and fix issues', keywords: ['debug', 'fix', 'error'] },
  { id: 'ck:ask', name: '/ck:ask', category: 'Marketing', complexity: 1, description: 'Ask questions about marketing', keywords: ['ask', 'question', 'help'] },
  { id: 'ck:analyze', name: '/ck:analyze', category: 'Marketing', complexity: 2, description: 'Analyze campaigns and metrics', keywords: ['analyze', 'metrics', 'report'] },
];

// ===== Message Bubble Components with Glassmorphism =====

function MessageBubbleUser({ content }: { content: string }) {
  return (
    <div className="group/message flex gap-3 py-4 px-4">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center order-2 shadow-lg shadow-blue-500/20">
        <User className="w-4 h-4 text-white" />
      </div>

      {/* Message bubble */}
      <div className="flex-1 flex flex-col items-end order-1">
        <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3 max-w-[85%] shadow-lg shadow-blue-500/10">
          <div className="text-gray-100 leading-relaxed">{content}</div>
        </div>
        <span className="text-xs text-gray-500 mt-1">Bạn</span>
      </div>
    </div>
  );
}

function MessageBubbleAssistant({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Copied to clipboard', {
      icon: <Check className="w-4 h-4 text-green-400" />,
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group/message flex gap-3 py-4 px-4 relative">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
        <Bot className="w-4 h-4 text-white" />
      </div>

      {/* Message bubble with glassmorphism */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-100">ClaudeKit</span>
          <span className="text-xs text-gray-500">AI Assistant</span>
          <Sparkles className="w-3 h-3 text-purple-400" />
        </div>

        <div className="relative">
          {/* Glassmorphism bubble */}
          <div className="bg-gray-800/80 backdrop-blur-md border border-gray-700/50 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[90%]">
            <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{content}</div>
          </div>

          {/* Hover actions toolbar */}
          <div className="absolute -top-2 right-0 opacity-0 group-hover/message:opacity-100 transition-all duration-200 translate-y-1 group-hover/message:translate-y-0">
            <div className="flex items-center gap-1 bg-gray-800/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-xl p-1">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-700/50 rounded-md transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <button
                className="p-1.5 hover:bg-gray-700/50 rounded-md transition-colors"
                title="Regenerate"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== Code Block with Copy Button =====

function CodeBlockWithCopy({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group/code my-3 rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-400 uppercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ===== Command Palette with cmdk =====

function CommandPaletteDemo({ open, onOpenChange, onSelect }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (command: string) => void;
}) {
  const [search, setSearch] = useState('');

  const engineerCmds = demoCommands.filter(c => c.category === 'Engineer');
  const marketingCmds = demoCommands.filter(c => c.category === 'Marketing');

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center border-b border-gray-700/50 px-4">
          <Search className="w-5 h-5 text-gray-500" />
          <Command.Input
            placeholder="Search commands..."
            value={search}
            onValueChange={setSearch}
            className="flex-1 bg-transparent border-0 px-4 py-4 text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">ESC</kbd>
        </div>

        {/* Command list */}
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-gray-500">
            No commands found. Try a different search.
          </Command.Empty>

          {/* Engineer Kit */}
          <Command.Group heading="Engineer Kit" className="px-2 py-2">
            <div className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> ENGINEER
            </div>
            {engineerCmds.map((cmd) => (
              <Command.Item
                key={cmd.id}
                value={cmd.name}
                onSelect={() => onSelect(cmd.name)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-800/50 data-[selected=true]:bg-blue-500/20 data-[selected=true]:border data-[selected=true]:border-blue-500/30"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: cmd.complexity }).map((_, i) => (
                    <IconBolt key={i} className="w-3 h-3 text-yellow-500" />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-blue-400 font-mono text-sm">{cmd.name}</code>
                    <IconTool className="w-3 h-3 text-blue-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cmd.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Command.Item>
            ))}
          </Command.Group>

          {/* Marketing Kit */}
          <Command.Group heading="Marketing Kit" className="px-2 py-2 mt-2">
            <div className="text-xs text-purple-400 font-medium mb-2 flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> MARKETING
            </div>
            {marketingCmds.map((cmd) => (
              <Command.Item
                key={cmd.id}
                value={cmd.name}
                onSelect={() => onSelect(cmd.name)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-gray-800/50 data-[selected=true]:bg-purple-500/20 data-[selected=true]:border data-[selected=true]:border-purple-500/30"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: cmd.complexity }).map((_, i) => (
                    <IconBolt key={i} className="w-3 h-3 text-yellow-500" />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <code className="text-purple-400 font-mono text-sm">{cmd.name}</code>
                    <IconSpeaker className="w-3 h-3 text-purple-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{cmd.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>

        {/* Footer hints */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-t border-gray-700/50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-700 rounded">↑↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-700 rounded">↵</kbd> to select</span>
          </div>
          <span>{demoCommands.length} commands available</span>
        </div>
      </div>
    </Command.Dialog>
  );
}

// ===== Chat Input with Command Support =====

function ChatInputWithCommandPalette({
  onSend,
}: {
  onSend?: (text: string) => void;
}) {
  const [input, setInput] = useState('');
  const [commandOpen, setCommandOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Detect slash command trigger
  useEffect(() => {
    if (input === '/') {
      setCommandOpen(true);
    }
  }, [input]);

  const handleCommandSelect = (command: string) => {
    setInput(command + ' ');
    setCommandOpen(false);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ⌘K to open command palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setCommandOpen(true);
    }

    // Enter to submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        onSend?.(input);
        setInput('');
      }
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend?.(input);
      setInput('');
    }
  };

  return (
    <>
      <form
        onSubmit={handleSend}
        className="border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-md p-4"
      >
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 items-end">
            {/* Command trigger button */}
            <button
              type="button"
              onClick={() => setCommandOpen(true)}
              className="flex-shrink-0 p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all border border-gray-600/50 hover:border-gray-500"
              title="Commands (⌘K)"
            >
              <CommandIcon className="w-4 h-4" />
            </button>

            {/* Textarea */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type / for commands or ask anything..."
                className="w-full min-h-[52px] max-h-[200px] rounded-xl border border-gray-600/50 bg-gray-900/80 text-gray-100 p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all"
                rows={1}
              />
              {input.startsWith('/') && (
                <div className="absolute right-3 top-3.5">
                  <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">Command</span>
                </div>
              )}
            </div>

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 disabled:text-blue-400/50 text-white rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Keyboard hints */}
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">/</kbd>
              <span>for commands</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">⌘K</kbd>
              <span>for palette</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-700/50 rounded text-gray-400">↵</kbd>
              <span>to send</span>
            </span>
          </div>
        </div>
      </form>

      <CommandPaletteDemo
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onSelect={handleCommandSelect}
      />
    </>
  );
}

// ===== Main Chat Frame Component =====

export function ChatFrameWithGlassmorphismAndDemo() {
  const [messages, setMessages] = useState(demoMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text: string) => {
    // Add user message
    const newMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: text,
    };
    setMessages(prev => [...prev, newMessage]);

    // Simulate assistant response after 1s
    setTimeout(() => {
      const response = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `I received your message: "${text}"\n\nThis is a demo response. In production, this would be connected to your AI backend.`,
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleClear = () => {
    setMessages([]);
    toast.info('Chat cleared');
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Main chat container */}
      <div className="relative h-full flex justify-center p-4">
        <div className="w-full max-w-4xl flex flex-col bg-gray-900/70 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">

          {/* Glassmorphism header */}
          <header className="flex items-center justify-between px-6 py-4 bg-gray-800/50 backdrop-blur-md border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-100">ClaudeKit Chat</h1>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  AI Assistant Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </button>
            </div>
          </header>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-200 mb-2">Welcome to ClaudeKit Chat</h2>
                <p className="text-gray-400 max-w-md mb-6">
                  Start a conversation by typing a message below, or use{' '}
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-300">/</kbd>
                  {' '}to access commands.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {['/ck:cook implement auth', '/ck:plan new feature', '/ck:debug error', '/ck:ask marketing tips'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSend(suggestion)}
                      className="px-3 py-1.5 rounded-full bg-gray-800/50 hover:bg-gray-700 border border-gray-700/50 text-xs text-gray-400 hover:text-gray-200 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-4">
                {messages.map((message) => (
                  message.role === 'user' ? (
                    <MessageBubbleUser key={message.id} content={message.content} />
                  ) : (
                    <MessageBubbleAssistant key={message.id} content={message.content} />
                  )
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area */}
          <ChatInputWithCommandPalette onSend={handleSend} />
        </div>
      </div>
    </div>
  );
}

// ===== Export all components =====
export {
  MessageBubbleUser,
  MessageBubbleAssistant,
  CodeBlockWithCopy,
  CommandPaletteDemo,
  ChatInputWithCommandPalette,
  demoMessages,
  demoCommands,
  IconBolt,
  IconTool,
  IconSpeaker,
  IconLightbulb,
};

export default ChatFrameWithGlassmorphismAndDemo;
