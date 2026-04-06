import React, { useState } from 'react';
import { Command } from 'cmdk';
import { Search, ChevronRight, Wrench, Megaphone, Zap } from 'lucide-react';

interface CommandItem {
  id: string;
  name: string;
  category: string;
  complexity: number;
  description: string;
}

const demoCommands: CommandItem[] = [
  { id: 'ck:cook', name: '/ck:cook', category: 'Engineer', complexity: 2, description: 'Triển khai tính năng thông minh với workflow tự động' },
  { id: 'ck:plan', name: '/ck:plan', category: 'Engineer', complexity: 3, description: 'Tạo kế hoạch triển khai với các phase' },
  { id: 'ck:code', name: '/ck:code', category: 'Engineer', complexity: 2, description: 'Tạo và xem xét code' },
  { id: 'ck:debug', name: '/ck:debug', category: 'Engineer', complexity: 3, description: 'Gỡ lỗi và sửa chữa' },
  { id: 'ck:ask', name: '/ck:ask', category: 'Marketing', complexity: 1, description: 'Đặt câu hỏi về marketing' },
  { id: 'ck:analyze', name: '/ck:analyze', category: 'Marketing', complexity: 2, description: 'Phân tích chiến dịch và chỉ số' },
];

const IconBolt = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconTool = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const IconSpeaker = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (command: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onOpenChange, onSelect }) => {
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
        <div className="flex items-center border-b border-gray-700/50 px-4">
          <Search className="w-5 h-5 text-gray-500" />
          <Command.Input
            placeholder="Tìm kiếm lệnh..."
            value={search}
            onValueChange={setSearch}
            className="flex-1 bg-transparent border-0 px-4 py-4 text-gray-100 placeholder:text-gray-500 focus:outline-none"
          />
          <kbd className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-500">ESC</kbd>
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-8 text-center text-gray-500">
            Không tìm thấy lệnh nào. Thử tìm kiếm khác.
          </Command.Empty>
          <Command.Group heading="Engineer Kit" className="px-2 py-2">
            <div className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> KỸ SƯ
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
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-t border-gray-700/50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-700 rounded">↑↓</kbd> để di chuyển</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-gray-700 rounded">↵</kbd> để chọn</span>
          </div>
          <span>{demoCommands.length} lệnh có sẵn</span>
        </div>
      </div>
    </Command.Dialog>
  );
};
