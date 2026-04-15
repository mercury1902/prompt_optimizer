import React, { useState, useMemo } from 'react';
import { Search, Terminal, BookOpen, ArrowRight, Star, Sparkles } from 'lucide-react';
import type { Command } from '../../data/claudekit-full-commands-catalog';
import { commands, categories } from '../../data/claudekit-full-commands-catalog';

interface CommandCardProps {
  command: Command;
  onClick?: () => void;
  isFeatured?: boolean;
}

const CommandCard: React.FC<CommandCardProps> = ({ command, onClick, isFeatured }) => {
  const complexityDots = '⚡'.repeat(command.complexity);

  return (
    <div
      onClick={onClick}
      className={`
        group relative rounded-xl border border-white/10
        backdrop-blur-md transition-all duration-300 ease-out cursor-pointer
        ${isFeatured
          ? 'bg-gradient-to-br from-brand-400/20 to-brand-500/10 hover:from-brand-400/30 hover:to-brand-500/20 border-brand-400/30'
          : 'bg-white/5 hover:bg-white/10 hover:border-white/20'
        }
        hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-400/10
        p-4
      `}
    >
      <div className="flex items-start gap-3">
        <div className={`
          p-2 rounded-lg shrink-0
          ${isFeatured ? 'bg-brand-400/20 text-brand-200' : 'bg-white/10 text-white/70'}
        `}>
          <Terminal className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <code className="text-sm font-mono text-brand-300 font-semibold">
              {command.name}
            </code>
            {isFeatured && <Star className="w-4 h-4 text-brand-300 fill-brand-300" />}
          </div>
          <p className="text-sm text-white/80 line-clamp-2">{command.description}</p>
          <div className="flex items-center gap-2 mt-2 text-xs">
            <span className="text-white/50">{command.category}</span>
            <span className="text-brand-300/80" title={`Complexity: ${command.complexity}/5`}>
              {complexityDots}
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
      </div>
    </div>
  );
};

export const CommandBrowserWithSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredCommands = useMemo(() => {
    let filtered = commands;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (cmd) =>
          cmd.name.toLowerCase().includes(query) ||
          cmd.description.toLowerCase().includes(query) ||
          cmd.keywords.some((k) => k.toLowerCase().includes(query)) ||
          cmd.useCases.some((u) => u.toLowerCase().includes(query))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((cmd) => cmd.category === selectedCategory);
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const featuredCommands = useMemo(() => {
    return commands.filter((cmd) => ['ck:cook', 'ck:plan', 'ck:fix', 'ck:ask'].includes(cmd.id));
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-400" />
          Command Browser
        </h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm commands..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`
              px-3 py-1.5 rounded-lg text-sm font-medium transition-all
              ${selectedCategory === 'all'
                ? 'bg-brand-400/20 text-brand-200 border border-brand-400/40'
                : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
              }
            `}
          >
            Tất cả ({commands.length})
          </button>
          {categories.map((cat) => {
            const count = commands.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${selectedCategory === cat
                    ? 'bg-brand-400/20 text-brand-200 border border-brand-400/40'
                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }
                `}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Commands (when no search) */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="rounded-2xl border border-brand-400/20 bg-gradient-to-br from-brand-400/10 to-transparent backdrop-blur-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-400" />
            Commands Phổ Biến
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {featuredCommands.map((cmd) => (
              <CommandCard key={cmd.id} command={cmd} isFeatured />
            ))}
          </div>
        </div>
      )}

      {/* All Commands */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          {searchQuery ? `Kết quả tìm kiếm (${filteredCommands.length})` : 'Tất cả Commands'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCommands.map((cmd) => (
            <CommandCard key={cmd.id} command={cmd} />
          ))}
        </div>
        {filteredCommands.length === 0 && (
          <div className="text-center py-12 text-white/50">
            <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy command nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandBrowserWithSearch;
