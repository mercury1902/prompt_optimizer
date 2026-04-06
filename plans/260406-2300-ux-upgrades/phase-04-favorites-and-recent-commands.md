---
phase: 4
title: Favorites and Recent Commands
priority: medium
esteffort: 3h
blockedBy: [phase-03-workflow-browser-implementation]
---

# Phase 4: Favorites & Recent Commands

## Context

Thêm tính năng Favorites (đánh dấu commands yêu thích) và Recent (lịch sử commands đã dùng) để truy cập nhanh.

## Key Insights from Research

1. **Favorites Pattern**:
   - Star icon toggle
   - Persist in localStorage
   - Quick access sidebar/section
   - No login required

2. **Recent Pattern**:
   - Last 10-20 commands used
   - Timestamp display
   - Clear history option
   - Click to reuse

## Architecture

```
┌─────────────────────────────────────────┐
│  Quick Access                           │
├─────────────────────────────────────────┤
│  ⭐ Favorites                🕐 Recent │
│  ─────────────────────────────────────  │
│  /ck:cook                   /ck:plan    │
│  /ck:fix                    /ck:cook   │
│  /ck:plan:auto              /content   │
└─────────────────────────────────────────┘
```

## Files to Create

1. `src/hooks/use-favorites-with-local-storage-persistence.ts`
2. `src/hooks/use-recent-commands-with-session-history.ts`
3. `src/components/favorites-panel-with-toggle.tsx`
4. `src/components/recent-commands-list-with-clear.tsx`
5. `src/components/quick-access-sidebar-with-tabs.tsx`

## Implementation Steps

### Step 1: Favorites Hook
```typescript
// src/hooks/use-favorites-with-local-storage-persistence.ts
const FAVORITES_KEY = 'claudekit:favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
  });
  
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }, [favorites]);
  
  const toggleFavorite = useCallback((commandId: string) => {
    setFavorites(prev => 
      prev.includes(commandId)
        ? prev.filter(id => id !== commandId)
        : [...prev, commandId]
    );
  }, []);
  
  const isFavorite = useCallback((commandId: string) => {
    return favorites.includes(commandId);
  }, [favorites]);
  
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);
  
  return { favorites, toggleFavorite, isFavorite, clearFavorites };
}
```

### Step 2: Recent Commands Hook
```typescript
// src/hooks/use-recent-commands-with-session-history.ts
const RECENTS_KEY = 'claudekit:recents';
const MAX_RECENTS = 20;

export interface RecentCommand {
  commandId: string;
  commandName: string;
  usedAt: number;
}

export function useRecentCommands() {
  const [recents, setRecents] = useState<RecentCommand[]>(() => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]');
  });
  
  useEffect(() => {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
  }, [recents]);
  
  const addRecent = useCallback((commandId: string, commandName: string) => {
    setRecents(prev => {
      const filtered = prev.filter(r => r.commandId !== commandId);
      return [
        { commandId, commandName, usedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENTS);
    });
  }, []);
  
  const clearRecents = useCallback(() => {
    setRecents([]);
  }, []);
  
  return { recents, addRecent, clearRecents };
}
```

### Step 3: Favorite Button Component
```typescript
// src/components/favorite-button-with-toggle-animation.tsx
import { Star } from 'lucide-react';

interface FavoriteButtonProps {
  commandId: string;
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function FavoriteButton({ 
  commandId, 
  isFavorite, 
  onToggle,
  size = 'md'
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };
  
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        'transition-all duration-200',
        isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-gray-600'
      )}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star 
        className={cn(
          sizeClasses[size],
          'transition-transform',
          isFavorite && 'fill-current scale-110'
        )} 
      />
    </button>
  );
}
```

### Step 4: Quick Access Panel
```typescript
// src/components/quick-access-sidebar-with-tabs.tsx
type QuickAccessTab = 'favorites' | 'recent';

interface QuickAccessPanelProps {
  commands: Command[];
  favorites: string[];
  recents: RecentCommand[];
  onToggleFavorite: (commandId: string) => void;
  onSelectCommand: (command: Command) => void;
  onClearRecents: () => void;
}

export function QuickAccessPanel({
  commands,
  favorites,
  recents,
  onToggleFavorite,
  onSelectCommand,
  onClearRecents,
}: QuickAccessPanelProps) {
  const [activeTab, setActiveTab] = useState<QuickAccessTab>('favorites');
  
  const favoriteCommands = useMemo(() => {
    return commands.filter(cmd => favorites.includes(cmd.id));
  }, [commands, favorites]);
  
  const recentCommands = useMemo(() => {
    return recents
      .map(r => commands.find(c => c.id === r.commandId))
      .filter(Boolean) as Command[];
  }, [commands, recents]);
  
  return (
    <div className="w-64 border-l bg-gray-50 p-4">
      <div className="flex border-b mb-4">
        <button
          onClick={() => setActiveTab('favorites')}
          className={cn(
            'flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2',
            activeTab === 'favorites'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          )}
        >
          <Star className="w-4 h-4" />
          Favorites
          <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
            {favoriteCommands.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={cn(
            'flex-1 py-2 text-sm font-medium flex items-center justify-center gap-2',
            activeTab === 'recent'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600'
          )}
        >
          <Clock className="w-4 h-4" />
          Recent
          <span className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
            {recents.length}
          </span>
        </button>
      </div>
      
      <div className="space-y-2">
        {activeTab === 'favorites' && (
          <>
            {favoriteCommands.length === 0 ? (
              <EmptyFavoritesState />
            ) : (
              favoriteCommands.map(cmd => (
                <QuickAccessItem
                  key={cmd.id}
                  command={cmd}
                  isFavorite={true}
                  onToggleFavorite={() => onToggleFavorite(cmd.id)}
                  onClick={() => onSelectCommand(cmd)}
                />
              ))
            )}
          </>
        )}
        
        {activeTab === 'recent' && (
          <>
            {recentCommands.length === 0 ? (
              <EmptyRecentsState />
            ) : (
              <>
                {recentCommands.map(cmd => (
                  <QuickAccessItem
                    key={cmd.id}
                    command={cmd}
                    isFavorite={favorites.includes(cmd.id)}
                    onToggleFavorite={() => onToggleFavorite(cmd.id)}
                    onClick={() => onSelectCommand(cmd)}
                  />
                ))}
                <button
                  onClick={onClearRecents}
                  className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  Clear History
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function QuickAccessItem({ 
  command, 
  isFavorite, 
  onToggleFavorite, 
  onClick 
}: {
  command: Command;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-2 hover:bg-white rounded cursor-pointer group"
    >
      <span className="font-medium text-sm">{command.name}</span>
      <FavoriteButton
        commandId={command.id}
        isFavorite={isFavorite}
        onToggle={onToggleFavorite}
        size="sm"
      />
    </div>
  );
}
```

## Success Criteria

- [ ] Star button toggle favorites trên command cards
- [ ] Favorites persisted in localStorage
- [ ] Recent commands tracked khi user sử dụng
- [ ] Quick Access panel với tabs (Favorites | Recent)
- [ ] Clear history button cho Recent
- [ ] Empty states cho cả 2 tabs
- [ ] Responsive design

## Next Steps

Phase 5: UX Polish & Animations (hoàn thiện cuối cùng)
