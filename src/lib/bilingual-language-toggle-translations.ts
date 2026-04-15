export type AppLanguage = "vi" | "en";

export const APP_LANGUAGE_STORAGE_KEY = "claudekit:language";
export const APP_LANGUAGE_EVENT_NAME = "claudekit:language-change";

type TranslationMap = Record<string, string>;

const TRANSLATIONS: Record<AppLanguage, TranslationMap> = {
  vi: {
    "common.language": "Ngôn ngữ",
    "common.vietnamese": "Tiếng Việt",
    "common.english": "English",

    "nav.chat": "Chat",
    "nav.guide": "Hướng dẫn",
    "nav.optimizer": "Tối ưu prompt",
    "nav.history": "Lịch sử",
    "nav.settings": "Cài đặt",
    "nav.assistant": "Trợ lý AI",
    "nav.version": "ClaudeKit Chat v1.0",
    "nav.toggle-language": "Chuyen ngon ngu",

    "chat.title": "ClaudeKit Chat",
    "chat.status.checking": "Đang kết nối...",
    "chat.status.ready": "Trợ lý AI đang hoạt động",
    "chat.status.error": "Lỗi kết nối API",
    "chat.refresh": "Làm mới",
    "chat.history": "Lịch sử",
    "chat.new-chat": "Cuộc trò chuyện mới",
    "chat.input.placeholder": "Nhập / để xem lệnh hoặc hỏi bất cứ điều gì...",
    "chat.input.placeholder-loading": "Đang chờ phản hồi...",
    "chat.input.command": "Lệnh",
    "chat.input.sending": "Đang gửi...",
    "chat.input.hint.commands": "cho lệnh",
    "chat.input.hint.palette": "cho palette",
    "chat.input.hint.send": "để gửi",
    "chat.suggestion.command": "Command gợi ý",
    "chat.suggestion.workflow": "Workflow gợi ý",
    "chat.suggestion.apply-command": "Chèn command",
    "chat.suggestion.open-guide": "Mở guide",
    "chat.empty.title": "Bắt đầu cuộc trò chuyện mới",
    "chat.empty.subtitle": "Chọn gợi ý bên dưới hoặc nhập câu hỏi của bạn",
    "chat.empty.write-code": "Viết code",
    "chat.empty.explain": "Giải thích",
    "chat.empty.debug": "Debug lỗi",
    "chat.empty.quick-command": "Lệnh nhanh",

    "optimizer.greeting": "Chào bạn! Tôi là Prompt Optimizer.",
    "optimizer.greeting.line1": "Hãy nhập prompt thô của bạn (ví dụ: \"làm trang login\") hoặc chọn template bên dưới, tôi sẽ:",
    "optimizer.greeting.line2": "Viết lại thành prompt chuyên nghiệp",
    "optimizer.greeting.line3": "Gợi ý command phù hợp (/ck:cook, /ck:plan, etc.)",
    "optimizer.greeting.line4": "Giải thích lý do chọn command đó",
    "optimizer.templates.show": "Chọn template",
    "optimizer.templates.hide": "Ẩn templates",
    "optimizer.input.placeholder": "Nhập prompt thô của bạn... (ví dụ: 'làm trang login')",
    "optimizer.reset": "Bắt đầu lại",
    "optimizer.examples": "Ví dụ:",
    "optimizer.copy.done": "Đã sao chép",
    "optimizer.error": "Lỗi khi tối ưu prompt. Vui lòng thử lại.",
  },
  en: {
    "common.language": "Language",
    "common.vietnamese": "Vietnamese",
    "common.english": "English",

    "nav.chat": "Chat",
    "nav.guide": "Guide",
    "nav.optimizer": "Prompt Optimizer",
    "nav.history": "History",
    "nav.settings": "Settings",
    "nav.assistant": "AI Assistant",
    "nav.version": "ClaudeKit Chat v1.0",
    "nav.toggle-language": "Switch language",

    "chat.title": "ClaudeKit Chat",
    "chat.status.checking": "Connecting...",
    "chat.status.ready": "AI assistant is online",
    "chat.status.error": "API connection error",
    "chat.refresh": "Refresh",
    "chat.history": "History",
    "chat.new-chat": "New conversation",
    "chat.input.placeholder": "Type / for commands or ask anything...",
    "chat.input.placeholder-loading": "Waiting for response...",
    "chat.input.command": "Command",
    "chat.input.sending": "Sending...",
    "chat.input.hint.commands": "for commands",
    "chat.input.hint.palette": "for palette",
    "chat.input.hint.send": "to send",
    "chat.suggestion.command": "Suggested command",
    "chat.suggestion.workflow": "Suggested workflow",
    "chat.suggestion.apply-command": "Insert command",
    "chat.suggestion.open-guide": "Open guide",
    "chat.empty.title": "Start a new conversation",
    "chat.empty.subtitle": "Pick a suggestion below or type your own question",
    "chat.empty.write-code": "Write code",
    "chat.empty.explain": "Explain",
    "chat.empty.debug": "Debug issue",
    "chat.empty.quick-command": "Quick command",

    "optimizer.greeting": "Hi! I am Prompt Optimizer.",
    "optimizer.greeting.line1": "Enter your raw prompt (for example: \"build a login page\") or pick a template below, I will:",
    "optimizer.greeting.line2": "Rewrite it into a professional prompt",
    "optimizer.greeting.line3": "Recommend a suitable command (/ck:cook, /ck:plan, etc.)",
    "optimizer.greeting.line4": "Explain why that command fits",
    "optimizer.templates.show": "Choose template",
    "optimizer.templates.hide": "Hide templates",
    "optimizer.input.placeholder": "Type your raw prompt... (for example: 'build login page')",
    "optimizer.reset": "Reset",
    "optimizer.examples": "Examples:",
    "optimizer.copy.done": "Copied",
    "optimizer.error": "Prompt optimization failed. Please try again.",
  },
};

export function normalizeLanguage(language: string | null | undefined): AppLanguage {
  return language === "en" ? "en" : "vi";
}

export function readStoredLanguage(): AppLanguage {
  if (typeof window === "undefined") {
    return "vi";
  }

  try {
    return normalizeLanguage(window.localStorage.getItem(APP_LANGUAGE_STORAGE_KEY));
  } catch {
    return "vi";
  }
}

export function writeStoredLanguage(language: AppLanguage): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(APP_LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Ignore storage exceptions silently.
  }
}

export function updateDocumentLanguage(language: AppLanguage): void {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.lang = language;
}

export function translate(
  language: AppLanguage,
  key: string,
  fallback?: string
): string {
  return TRANSLATIONS[language][key] ?? fallback ?? TRANSLATIONS.vi[key] ?? key;
}
