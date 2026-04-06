import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  X,
  ChevronDown,
  Lightbulb,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  PROMPT_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type PromptTemplate,
  type TemplateCategory,
} from './prompt-templates';
import { OptimizedResultView } from './optimized-prompt-result-view';
import {
  parsePromptResult,
  isStructuredFormat,
  type ParsedPromptResult,
} from '../../utils/prompt-response-parser';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parsedResult?: ParsedPromptResult;
  originalInput?: string;
}

const SYSTEM_PROMPT = `Bạn là Prompt Optimizer chuyên nghiệp cho Claude Code (ClaudeKit). Nhiệm vụ của bạn:

1. **Tối ưu prompt**: Nhận prompt thô từ user, phân tích và viết lại thành prompt chuyên nghiệp, rõ ràng, chi tiết.

2. **Gợi ý command**: Đề xuất command phù hợp nhất từ ClaudeKit (/ck:cook, /ck:plan, /ck:fix, /ck:ask, etc.)

3. **Định dạng output**:

   ✅ **Prompt đã tối ưu:**
   [prompt chuyên nghiệp ở đây - chi tiết, rõ ràng, có ngữ cảnh]

   💡 **Command đề xuất:**
   [command phù hợp với giải thích ngắn]

   🎯 **Lý do chọn command:**
   [giải thích tại sao command này phù hợp]

Nguyên tắc tối ưu prompt:
- Thêm context rõ ràng
- Chỉ định output mong muốn
- Liệt kê constraints nếu có
- Dùng ngôn ngữ cụ thể, không mơ hồ`;

const MAX_TEXTAREA_ROWS = 10;
const MIN_TEXTAREA_ROWS = 2;

export const PromptOptimizerChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Chào bạn!** Tôi là Prompt Optimizer.

Hãy nhập prompt thô của bạn (ví dụ: "làm trang login") hoặc chọn template bên dưới, tôi sẽ:
- ✨ Viết lại thành prompt chuyên nghiệp
- 💡 Gợi ý command phù hợp (/ck:cook, /ck:plan, etc.)
- 🎯 Giải thích lý do chọn command đó`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [textareaRows, setTextareaRows] = useState(MIN_TEXTAREA_ROWS);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'All'>('All');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-expand textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      const lineHeight = 24; // Approximate line height in pixels
      const lines = input.split('\n').length;
      const calculatedRows = Math.min(Math.max(lines, MIN_TEXTAREA_ROWS), MAX_TEXTAREA_ROWS);
      setTextareaRows(calculatedRows);
    }
  }, [input]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Đã sao chép');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const applyTemplate = (template: PromptTemplate) => {
    setInput(template.content);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  const clearInput = () => {
    setInput('');
    textareaRef.current?.focus();
  };

  const filteredTemplates =
    selectedCategory === 'All'
      ? PROMPT_TEMPLATES
      : PROMPT_TEMPLATES.filter((t) => t.category === selectedCategory);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
      const model = import.meta.env.PUBLIC_FIREPASS_MODEL || 'accounts/fireworks/routers/kimi-k2p5-turbo';
      const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL || 'https://api.fireworks.ai/inference/v1';

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userInput },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const optimizedContent = data.choices?.[0]?.message?.content || 'Không nhận được phản hồi';

      // Parse the result if it follows structured format
      const parsedResult = isStructuredFormat(optimizedContent)
        ? parsePromptResult(optimizedContent)
        : undefined;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: optimizedContent,
        parsedResult,
        originalInput: userInput,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Lỗi khi tối ưu prompt. Vui lòng thử lại.');
      console.error('Prompt optimizer error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `👋 **Chào bạn!** Tôi là Prompt Optimizer.

Hãy nhập prompt thô của bạn (ví dụ: "làm trang login") hoặc chọn template bên dưới, tôi sẽ:
- ✨ Viết lại thành prompt chuyên nghiệp
- 💡 Gợi ý command phù hợp (/ck:cook, /ck:plan, etc.)
- 🎯 Giải thích lý do chọn command đó`,
      },
    ]);
    setInput('');
  };

  const characterCount = input.length;
  const maxCharacters = 2000;

  return (
    <div className="relative rounded-2xl border border-gray-700/50 bg-gray-900/70 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Background effects - matching homepage vibe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[80px] animate-pulse" />
        <div
          className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/10 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Messages */}
      <div className="relative h-[500px] overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                message.role === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gradient-to-br from-purple-500 to-pink-500'
              }`}
            >
              {message.role === 'user' ? (
                <span className="text-white text-sm">B</span>
              ) : (
                <Sparkles className="w-4 h-4 text-white" />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
              {message.role === 'user' ? (
                <div className="inline-block text-left rounded-2xl px-4 py-3 bg-blue-500 text-white rounded-br-sm">
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              ) : message.parsedResult ? (
                // Structured result with tabs
                <div className="w-full">
                  <OptimizedResultView
                    result={message.parsedResult}
                    originalInput={message.originalInput || ''}
                  />
                </div>
              ) : (
                // Regular message or welcome message
                <div className="inline-block text-left rounded-2xl px-4 py-3 bg-gray-800/50 text-gray-100 rounded-bl-sm border border-gray-700/30">
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>
              )}

              {/* Actions for assistant messages */}
              {message.role === 'assistant' && !message.parsedResult && message.id !== 'welcome' && (
                <div className="flex items-center gap-2 mt-2 justify-start">
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-800/50 transition-all"
                  >
                    {copiedId === message.id ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Đã copy</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-800/50 border border-gray-700/30 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-gray-400">
                <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-indigo-400/60 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative border-t border-gray-700/50 p-4">
        {/* Template Selector */}
        <div className="mb-3">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            {showTemplates ? 'Ẩn templates' : 'Chọn template'}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showTemplates ? 'rotate-180' : ''}`}
            />
          </button>

          {showTemplates && (
            <div className="mt-2 p-3 rounded-xl bg-gray-800/70 border border-gray-700/50">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button
                  onClick={() => setSelectedCategory('All')}
                  className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                    selectedCategory === 'All'
                      ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                      : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  All
                </button>
                {TEMPLATE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      selectedCategory === cat
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Templates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="text-left p-2.5 rounded-lg bg-gray-700/30 hover:bg-gray-700/60 border border-gray-600/30 hover:border-gray-500/50 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white">
                        {template.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-600/50 text-gray-400">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1 truncate">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập prompt thô của bạn... (ví dụ: 'làm trang login')"
              className="w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 pr-10 text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 resize-none"
              rows={textareaRows}
              disabled={isLoading}
            />
            {/* Clear Button */}
            {input.length > 0 && (
              <button
                onClick={clearInput}
                className="absolute right-3 top-3 p-1 rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-200 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {/* Character Count */}
            <div
              className={`absolute right-3 bottom-2 text-[10px] ${
                characterCount > maxCharacters * 0.9
                  ? 'text-amber-400'
                  : characterCount > maxCharacters * 0.8
                    ? 'text-yellow-400'
                    : 'text-gray-600'
              }`}
            >
              {characterCount}/{maxCharacters}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center w-12 h-8 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all"
              title="Bắt đầu lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-500">Ví dụ:</span>
          {['thêm tính năng chat', 'sửa lỗi typescript', 'deploy lên vercel', 'làm UI đẹp hơn'].map(
            (example) => (
              <button
                key={example}
                onClick={() => setInput(example)}
                className="text-xs px-2 py-1 rounded-full bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-200 transition-all"
              >
                {example}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptOptimizerChat;
