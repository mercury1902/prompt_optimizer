import React from 'react';
import { MessageSquare, BookOpen, Sparkles, History, Settings } from 'lucide-react';

interface VerticalNavSidebarProps {
  currentPage?: 'chat' | 'guide' | 'optimizer';
  onNavigate?: (page: string) => void;
}

const navItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, href: '/' },
  { id: 'guide', label: 'Hướng dẫn', icon: BookOpen, href: '/guide/' },
  { id: 'optimizer', label: 'Tối ưu prompt', icon: Sparkles, href: '/guide/prompt-optimizer' },
  { id: 'history', label: 'Lịch sử', icon: History, href: '#' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, href: '#' },
];

export const VerticalNavSidebar: React.FC<VerticalNavSidebarProps> = ({
  currentPage = 'chat',
  onNavigate,
}) => {
  return (
    <aside className="w-64 h-screen bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">CK</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-100">ClaudeKit</h1>
            <p className="text-xs text-gray-500">Trợ lý AI</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                if (onNavigate && item.href === '#') {
                  e.preventDefault();
                  onNavigate(item.id);
                }
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive
                  ? 'bg-brand-400/20 text-brand-300 border border-brand-400/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700/50">
        <p className="text-xs text-gray-500 text-center">
          ClaudeKit Chat v1.0
        </p>
      </div>
    </aside>
  );
};
