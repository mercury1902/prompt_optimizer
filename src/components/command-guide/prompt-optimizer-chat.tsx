import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Copy, Check, RotateCcw, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isOptimizing?: boolean;
  suggestedCommand?: string;
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

export const PromptOptimizerChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Chào bạn!** Tôi là Prompt Optimizer.

Hãy nhập prompt thô của bạn (ví dụ: "làm trang login"), tôi sẽ:
- ✨ Viết lại thành prompt chuyên nghiệp
- 💡 Gợi ý command phù hợp (/ck:cook, /ck:plan, etc.)
- 🎯 Giải thích lý do chọn command đó`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    toast.success('Đã sao chép');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.PUBLIC_FIREPASS_API_KEY;
      const model = import.meta.env.PUBLIC_FIREPASS_MODEL || 'accounts/fireworks/routers/kimi-k2p5-turbo';
      const baseUrl = import.meta.env.PUBLIC_FIREPASS_BASE_URL || 'https://api.fireworks.ai/inference/v1';

      console.log('[Prompt Optimizer] Using model:', model);
      console.log('[Prompt Optimizer] Using baseUrl:', baseUrl);
      console.log('[Prompt Optimizer] API Key exists:', !!apiKey);

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
            { role: 'user', content: input },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Prompt Optimizer] API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const optimizedContent = data.choices?.[0]?.message?.content || 'Không nhận được phản hồi';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: optimizedContent,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error('Lỗi khi tối ưu prompt. Vui lòng thử lại.');
      console.error('Prompt optimizer error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

Hãy nhập prompt thô của bạn (ví dụ: "làm trang login"), tôi sẽ:
- ✨ Viết lại thành prompt chuyên nghiệp
- 💡 Gợi ý command phù hợp (/ck:cook, /ck:plan, etc.)
- 🎯 Giải thích lý do chọn command đó`,
      },
    ]);
    setInput('');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
      {/* Messages */}
      <div className="h-[500px] overflow-y-auto p-4 space-y-4">
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
              <div
                className={`inline-block text-left rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-sm'
                    : 'bg-white/10 text-white rounded-bl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
              </div>

              {/* Actions for assistant messages */}
              {message.role === 'assistant' && message.id !== 'welcome' && (
                <div className="flex items-center gap-2 mt-2 justify-start">
                  <button
                    onClick={() => handleCopy(message.content, message.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs text-white/50 hover:text-white hover:bg-white/10 transition-all"
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
            <div className="bg-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-white/50">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập prompt thô của bạn... (ví dụ: 'làm trang login')"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-400/20 text-brand-300 hover:bg-brand-400/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center w-12 h-8 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-all"
              title="Bắt đầu lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-white/40">Ví dụ:</span>
          {[
            'thêm tính năng chat',
            'sửa lỗi typescript',
            'deploy lên vercel',
            'làm UI đẹp hơn',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="text-xs px-2 py-1 rounded-full bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromptOptimizerChat;
