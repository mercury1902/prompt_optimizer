import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Trash2, Sparkles, History } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FavoriteButtonWithToggleAnimation } from './favorite-button-with-toggle-animation';
import type { RecentCommand } from '../hooks/use-recent-commands-with-session-history';

function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

interface Command {
  id: string;
  name: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

type QuickAccessTab = 'favorites' | 'recent';

interface QuickAccessSidebarWithTabsProps {
  commands: Command[];
  favorites: string[];
  recents: RecentCommand[];
  onToggleFavorite: (commandId: string) => void;
  onSelectCommand: (command: Command) => void;
  onClearRecents: () => void;
  className?: string;
}

const tabTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.2 },
};

export function QuickAccessSidebarWithTabs({
  commands,
  favorites,
  recents,
  onToggleFavorite,
  onSelectCommand,
  onClearRecents,
  className,
}: QuickAccessSidebarWithTabsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<QuickAccessTab>('favorites');

  const favoriteCommands = useMemo(() => {
    return commands.filter((cmd) => favorites.includes(cmd.id));
  }, [commands, favorites]);

  const recentCommands = useMemo(() => {
    return recents
      .map((r) => commands.find((c) => c.id === r.commandId))
      .filter((cmd): cmd is Command => cmd !== undefined);
  }, [commands, recents]);

  return (
    <div
      className={cn(
        'w-72 border-l bg-gray-50/80 backdrop-blur-sm flex flex-col',
        className
      )}
    >
      <div className="flex border-b bg-white/50">
        <TabButton
          active={activeTab === 'favorites'}
          onClick={() => setActiveTab('favorites')}
          icon={<Star className="w-4 h-4" />}
          label="Favorites"
          count={favoriteCommands.length}
        />
        <TabButton
          active={activeTab === 'recent'}
          onClick={() => setActiveTab('recent')}
          icon={<Clock className="w-4 h-4" />}
          label="Recent"
          count={recents.length}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <AnimatePresence mode="wait">
          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              {...tabTransition}
              className="space-y-1"
            >
              {favoriteCommands.length === 0 ? (
                <EmptyFavoritesState />
              ) : (
                favoriteCommands.map((cmd) => (
                  <QuickAccessItem
                    key={cmd.id}
                    command={cmd}
                    isFavorite={true}
                    onToggleFavorite={() => onToggleFavorite(cmd.id)}
                    onClick={() => onSelectCommand(cmd)}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'recent' && (
            <motion.div
              key="recent"
              {...tabTransition}
              className="space-y-1"
            >
              {recentCommands.length === 0 ? (
                <EmptyRecentsState />
              ) : (
                <>
                  {recentCommands.map((cmd) => (
                    <QuickAccessItem
                      key={cmd.id}
                      command={cmd}
                      isFavorite={favorites.includes(cmd.id)}
                      onToggleFavorite={() => onToggleFavorite(cmd.id)}
                      onClick={() => onSelectCommand(cmd)}
                    />
                  ))}
                  <ClearHistoryButton onClear={onClearRecents} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count: number;
}

function TabButton({ active, onClick, icon, label, count }: TabButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors relative',
        active
          ? 'text-blue-600'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100/50'
      )}
    >
      {icon}
      <span>{label}</span>
      <span
        className={cn(
          'px-1.5 py-0.5 rounded text-xs transition-colors',
          active ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'
        )}
      >
        {count}
      </span>
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
        />
      )}
    </button>
  );
}

interface QuickAccessItemProps {
  command: Command;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}

function QuickAccessItem({
  command,
  isFavorite,
  onToggleFavorite,
  onClick,
}: QuickAccessItemProps): JSX.Element {
  const IconComponent = command.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      onClick={onClick}
      className="flex items-center justify-between p-2.5 hover:bg-white rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-2 min-w-0">
        {IconComponent && (
          <span className="text-gray-500 group-hover:text-blue-500 transition-colors">
            <IconComponent className="w-4 h-4" />
          </span>
        )}
        <div className="min-w-0">
          <span className="font-medium text-sm text-gray-700 group-hover:text-gray-900 truncate block">
            {command.name}
          </span>
          {command.description && (
            <span className="text-xs text-gray-400 truncate block">
              {command.description}
            </span>
          )}
        </div>
      </div>
      <FavoriteButtonWithToggleAnimation
        commandId={command.id}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
        size="sm"
      />
    </motion.div>
  );
}

function EmptyFavoritesState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
        <Sparkles className="w-6 h-6 text-yellow-500" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">No favorites yet</p>
      <p className="text-xs text-gray-500 max-w-[180px]">
        Star commands you use often to access them quickly here
      </p>
    </div>
  );
}

function EmptyRecentsState(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
        <History className="w-6 h-6 text-blue-500" />
      </div>
      <p className="text-sm font-medium text-gray-700 mb-1">No recent commands</p>
      <p className="text-xs text-gray-500 max-w-[180px]">
        Commands you use will appear here for quick access
      </p>
    </div>
  );
}

interface ClearHistoryButtonProps {
  onClear: () => void;
}

function ClearHistoryButton({ onClear }: ClearHistoryButtonProps): JSX.Element {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        onClear();
      }}
      className="w-full mt-3 py-2 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center gap-2 transition-colors border border-transparent hover:border-red-200"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      type="button"
    >
      <Trash2 className="w-4 h-4" />
      Clear History
    </motion.button>
  );
}
