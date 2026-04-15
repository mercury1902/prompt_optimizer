import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Command } from 'cmdk';
import { Search, ChevronRight, Wrench, Megaphone } from 'lucide-react';
import { engineerCommands, marketingCommands } from '../../data/commands';
import {
  rawDiscoveredCommandCount,
  rawDiscoveredCommands,
  type RawDiscoveredCommand,
} from '../../data/command-discovery-raw-index';
import { getProgressiveRevealMatches } from '../../lib/command-catalog-layering';
import {
  trackCommandShownEvents,
  trackCommandTelemetryEvent,
} from '../../lib/local-command-usage-telemetry';

interface CommandItem {
  id: string;
  name: string;
  category: string;
  complexity: number;
  description: string;
}

function normalizeCommandToken(value: string): string {
  return value.trim().replace(/^\//, '').toLowerCase();
}

function toCompactSourcePath(sourcePath: string): string {
  const normalized = sourcePath.replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  if (segments.length <= 4) {
    return normalized;
  }
  return segments.slice(-4).join('/');
}

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
  contextInput?: string;
  interactionCount?: number;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  onSelect,
  contextInput = '',
  interactionCount = 0,
}) => {
  const [search, setSearch] = useState('');
  const shownCommandTokensRef = useRef<Set<string>>(new Set());
  const allCommands = useMemo(() => [...engineerCommands, ...marketingCommands], []);
  const totalCommands = allCommands.length;
  const sourceByCommandToken = useMemo(() => {
    const map = new Map<string, RawDiscoveredCommand>();
    for (const item of rawDiscoveredCommands) {
      map.set(normalizeCommandToken(item.id), item);
    }
    return map;
  }, []);

  useEffect(() => {
    if (!open) {
      setSearch('');
      shownCommandTokensRef.current.clear();
      return;
    }
    const seeded = contextInput.trim();
    if (seeded) {
      const normalizedSeed = seeded.startsWith('/') ? seeded.slice(1).trimStart() : seeded;
      setSearch(normalizedSeed);
    }
  }, [open, contextInput]);

  const normalizedSearch = search.trim().toLowerCase();
  const contextSeed = open ? contextInput.trim() : '';
  const activeQuery = search.trim() || contextSeed;
  const isSlashMode = contextSeed.startsWith('/');
  const intentQuery = isSlashMode ? search.trim() : activeQuery;
  const isIntentQuery = intentQuery.length > 0 && !isSlashMode;

  const progressiveReveal = useMemo(
    () =>
      isIntentQuery
        ? getProgressiveRevealMatches({
            input: intentQuery,
            curatedCommands: allCommands,
            interactionCount,
          })
        : null,
    [allCommands, intentQuery, isIntentQuery, interactionCount]
  );
  const rankedCommands = progressiveReveal?.curatedMatches ?? [];
  const revealedRawCommands = progressiveReveal?.rawMatches ?? [];
  const shouldRevealRaw = progressiveReveal?.shouldRevealRaw ?? false;
  const showRankedGroup = rankedCommands.length > 0 || revealedRawCommands.length > 0;
  const showCatalogSections = !isIntentQuery || !showRankedGroup;

  const matchesSearch = (cmd: CommandItem) => {
    if (!normalizedSearch) return true;
    const searchable = `${cmd.name} ${cmd.category} ${cmd.description}`.toLowerCase();
    return normalizedSearch.split(/\s+/).every((token) => searchable.includes(token));
  };

  const engineerCmds = engineerCommands.filter(matchesSearch).slice(0, 8);
  const marketingCmds = marketingCommands.filter(matchesSearch).slice(0, 8);
  const hasCatalogMatches = showCatalogSections && engineerCmds.length + marketingCmds.length > 0;
  const visibleCommandNames = useMemo(() => {
    const names: string[] = [];
    if (showRankedGroup) {
      names.push(...rankedCommands.map((match) => match.command.name));
      names.push(...revealedRawCommands.map((match) => match.command.name));
    }
    if (showCatalogSections) {
      names.push(...engineerCmds.map((command) => command.name));
      names.push(...marketingCmds.map((command) => command.name));
    }
    return names;
  }, [
    engineerCmds,
    marketingCmds,
    rankedCommands,
    revealedRawCommands,
    showCatalogSections,
    showRankedGroup,
  ]);

  useEffect(() => {
    if (!open || visibleCommandNames.length === 0) {
      return;
    }

    const newlyShownCommands: string[] = [];
    for (const commandName of visibleCommandNames) {
      const commandToken = normalizeCommandToken(commandName);
      if (!commandToken || shownCommandTokensRef.current.has(commandToken)) {
        continue;
      }

      shownCommandTokensRef.current.add(commandToken);
      newlyShownCommands.push(commandName);
    }

    if (newlyShownCommands.length > 0) {
      trackCommandShownEvents(newlyShownCommands);
    }
  }, [open, visibleCommandNames]);

  const handleTrackedSelect = (commandName: string) => {
    trackCommandTelemetryEvent('clicked', commandName);
    onSelect(commandName);
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center border-b border-white/10 px-4">
          <Search className="w-5 h-5 text-white/50" />
          <Command.Input
            aria-label="Tìm kiếm command"
            placeholder="Tìm kiếm lệnh..."
            value={search}
            onValueChange={setSearch}
            className="flex-1 bg-transparent border-0 px-4 py-4 text-white placeholder:text-white/50 focus:outline-none"
          />
          <kbd className="px-2 py-1 bg-white/10 rounded text-xs text-white/50">ESC</kbd>
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          {!showRankedGroup && !hasCatalogMatches && (
            <div className="py-8 text-center text-white/50">
              Không tìm thấy lệnh nào. Thử tìm kiếm khác.
            </div>
          )}
          {showRankedGroup && (
            <Command.Group heading="Gợi ý theo intent (curated)" className="px-2 py-2">
              <div className="text-xs text-emerald-400 font-medium mb-2 flex items-center gap-1">
                <IconBolt className="w-3 h-3" /> ƯU TIÊN THEO NGỮ CẢNH
              </div>
              {rankedCommands.map((match, idx) => {
                const confidence = `${Math.round(Math.min(match.score / 5, 1) * 100)}%`;
                const isEngineer = match.command.category.toLowerCase().includes('engineer');
                const source =
                  sourceByCommandToken.get(normalizeCommandToken(match.command.id)) ??
                  sourceByCommandToken.get(normalizeCommandToken(match.command.name));
                const accentClass = isEngineer
                  ? 'data-[selected=true]:bg-blue-500/20 data-[selected=true]:border-blue-500/30'
                  : 'data-[selected=true]:bg-purple-500/20 data-[selected=true]:border-purple-500/30';

                return (
                  <Command.Item
                    key={`ranked-${match.command.id}`}
                    value={`${match.command.name} ${match.reason}`}
                    onSelect={() => handleTrackedSelect(match.command.name)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 data-[selected=true]:border ${accentClass}`}
                  >
                    <div className="flex items-center gap-1">
                      {Array.from({ length: match.command.complexity }).map((_, i) => (
                        <IconBolt key={i} className="w-3 h-3 text-yellow-500" />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className={isEngineer ? 'text-blue-400 font-mono text-sm' : 'text-purple-400 font-mono text-sm'}>
                          {match.command.name}
                        </code>
                        <span className="text-[10px] uppercase tracking-wide text-white/50">{match.command.category}</span>
                        {idx === 0 && (
                          <span className="text-[10px] rounded bg-emerald-500/15 px-1.5 py-0.5 text-emerald-300">Top</span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 truncate">{match.reason} ({confidence})</p>
                      <p className="text-[11px] text-white/45 mt-0.5 truncate">
                        Tác dụng: {match.command.description}
                      </p>
                      <p className="text-[11px] text-white/45 mt-0.5 truncate">
                        Nguồn: {source ? `${source.sourceRepo} • ${toCompactSourcePath(source.sourcePath)}` : 'curated local catalog'}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/40" />
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}
          {revealedRawCommands.length > 0 && (
            <Command.Group heading="Mở rộng từ full catalog" className="px-2 py-2 mt-2">
              <div className="text-xs text-amber-300 font-medium mb-2 flex items-center gap-1">
                <IconBolt className="w-3 h-3" /> RAW REVEAL (KIỂM SOÁT)
              </div>
              {revealedRawCommands.map((match) => (
                <Command.Item
                  key={`raw-${match.command.id}`}
                  value={`${match.command.name} ${match.reason} ${match.sourceRepo}`}
                  onSelect={() => handleTrackedSelect(match.command.name)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 data-[selected=true]:bg-amber-500/20 data-[selected=true]:border data-[selected=true]:border-amber-500/30"
                >
                  <div className="flex items-center gap-1">
                    {Array.from({ length: match.command.complexity }).map((_, i) => (
                      <IconBolt key={i} className="w-3 h-3 text-amber-400" />
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-amber-300 font-mono text-sm">{match.command.name}</code>
                      <span className="text-[10px] uppercase tracking-wide text-white/50">{match.command.category}</span>
                      <span className="text-[10px] rounded bg-white/10 px-1.5 py-0.5 text-white/70">
                        {match.sourceKind}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 mt-0.5 truncate">
                      {match.reason} • {match.sourceRepo}
                    </p>
                    <p className="text-[11px] text-white/45 mt-0.5 truncate">
                      Tác dụng: {match.command.description}
                    </p>
                    <p className="text-[11px] text-white/45 mt-0.5 truncate">
                      Nguồn: {toCompactSourcePath(match.sourcePath)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/40" />
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {isIntentQuery && !shouldRevealRaw && interactionCount < 3 && (
            <div className="px-3 py-2 text-[11px] text-white/45">
              3 lượt chat đầu chỉ hiển thị curated để tránh ngợp command.
            </div>
          )}
          {isIntentQuery && !showRankedGroup && (
            <div className="px-3 py-2 text-[11px] text-white/45">
              Chưa nhận diện rõ intent. Mô tả theo mẫu: "mục tiêu + ngữ cảnh + ràng buộc".
            </div>
          )}
          {showCatalogSections && (
            <Command.Group heading="Engineer Kit" className="px-2 py-2">
            <div className="text-xs text-blue-400 font-medium mb-2 flex items-center gap-1">
              <Wrench className="w-3 h-3" /> KỸ SƯ
            </div>
            {engineerCmds.map((cmd) => (
              <Command.Item
                key={cmd.id}
                value={cmd.name}
                onSelect={() => handleTrackedSelect(cmd.name)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 data-[selected=true]:bg-blue-500/20 data-[selected=true]:border data-[selected=true]:border-blue-500/30"
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
                  <p className="text-xs text-white/50 mt-0.5 truncate">{cmd.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Command.Item>
            ))}
            </Command.Group>
          )}
          {showCatalogSections && (
            <Command.Group heading="Marketing Kit" className="px-2 py-2 mt-2">
            <div className="text-xs text-purple-400 font-medium mb-2 flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> MARKETING
            </div>
            {marketingCmds.map((cmd) => (
              <Command.Item
                key={cmd.id}
                value={cmd.name}
                onSelect={() => handleTrackedSelect(cmd.name)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-white/5 data-[selected=true]:bg-purple-500/20 data-[selected=true]:border data-[selected=true]:border-purple-500/30"
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
                  <p className="text-xs text-white/50 mt-0.5 truncate">{cmd.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-white/40" />
              </Command.Item>
            ))}
            </Command.Group>
          )}
        </Command.List>
        <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-t border-white/10 text-xs text-white/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1 bg-white/10 rounded">↑↓</kbd> để di chuyển</span>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-white/10 rounded">↵</kbd> để chọn</span>
          </div>
          <span>
            {showRankedGroup
              ? `${rankedCommands.length} curated + ${revealedRawCommands.length} raw (${rawDiscoveredCommandCount} raw total)`
              : `${totalCommands} lệnh curated có sẵn`}
          </span>
        </div>
      </div>
    </Command.Dialog>
  );
};
