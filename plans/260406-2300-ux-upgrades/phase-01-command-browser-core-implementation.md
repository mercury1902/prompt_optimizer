---
phase: 1
title: Command Browser Core Implementation
priority: high
esteffort: 4h
---

# Phase 1: Command Browser Core

## Context

Xây dựng Command Browser module cho phép users browse và search commands từ Engineer và Marketing kits.

## Key Insights from Research

1. **Kit Filter Tabs Pattern** (ChatGPT, Claude):
   - Tabs: All | Engineer | Marketing
   - Clear visual separation
   - Count badges for each tab

2. **Search UX Patterns**:
   - Real-time search (debounced 150ms)
   - Highlight matching text
   - Empty state với suggestions
   - Command count display

3. **Command Card Design**:
   - Complexity indicator (1-5 dots/bolts)
   - Description preview
   - Keywords/tags
   - Click để view detail

## Architecture

```
┌─────────────────────────────────────────┐
│  Command Browser                        │
├─────────────────────────────────────────┤
│  [All] [Engineer] [Marketing] [count] │
│  ┌─────────────────────────────────┐  │
│  │  🔍 Search commands...          │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ ⚡ /ck:cook    ⚡⚡⚡          │  │
│  │ Implement feature...            │  │
│  │ [implement] [feature] [build] │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Files to Create/Modify

### Create
1. `src/components/command-browser-with-kit-filter-and-search.tsx`
2. `src/components/command-card-with-complexity-indicator.tsx` (enhanced)
3. `src/hooks/use-command-search-with-debounce.ts`
4. `src/lib/command-filtering-by-kit-and-keywords.ts`

### Modify
1. `src/components/ChatBot.tsx` - Integrate CommandBrowser
2. `src/components/index.ts` - Export new components

## Implementation Steps

### Step 1: Command Filtering Logic
```typescript
// src/lib/command-filtering-by-kit-and-keywords.ts
export type KitFilter = 'all' | 'engineer' | 'marketing';

export interface FilterOptions {
  kit: KitFilter;
  searchQuery: string;
}

export function filterCommands(
  commands: Command[],
  options: FilterOptions
): Command[] {
  return commands.filter(cmd => {
    // Kit filter
    if (options.kit !== 'all' && 
        cmd.category.toLowerCase() !== options.kit) {
      return false;
    }
    
    // Search filter (name, description, keywords)
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      return (
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.keywords.some(k => k.toLowerCase().includes(query))
      );
    }
    
    return true;
  });
}

export function getCommandCounts(commands: Command[]) {
  return {
    all: commands.length,
    engineer: commands.filter(c => c.category === 'Engineer').length,
    marketing: commands.filter(c => c.category === 'Marketing').length,
  };
}
```

### Step 2: Search Hook with Debounce
```typescript
// src/hooks/use-command-search-with-debounce.ts
import { useState, useMemo, useCallback } from 'react';
import { useDebounce } from './use-debounce';

export function useCommandSearch(commands: Command[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [kitFilter, setKitFilter] = useState<KitFilter>('all');
  
  const debouncedQuery = useDebounce(searchQuery, 150);
  
  const filteredCommands = useMemo(() => {
    return filterCommands(commands, {
      kit: kitFilter,
      searchQuery: debouncedQuery,
    });
  }, [commands, kitFilter, debouncedQuery]);
  
  const counts = useMemo(() => 
    getCommandCounts(commands), 
    [commands]
  );
  
  return {
    searchQuery,
    setSearchQuery,
    kitFilter,
    setKitFilter,
    filteredCommands,
    counts,
  };
}
```

### Step 3: Command Browser Component
```typescript
// src/components/command-browser-with-kit-filter-and-search.tsx
interface CommandBrowserProps {
  commands: Command[];
  onSelectCommand: (command: Command) => void;
  onViewDetails: (command: Command) => void;
}

export function CommandBrowser({ 
  commands, 
  onSelectCommand,
  onViewDetails 
}: CommandBrowserProps) {
  const { 
    searchQuery, 
    setSearchQuery, 
    kitFilter, 
    setKitFilter,
    filteredCommands,
    counts 
  } = useCommandSearch(commands);
  
  return (
    <div className="command-browser">
      {/* Kit Filter Tabs */}
      <KitFilterTabs 
        activeKit={kitFilter}
        onChange={setKitFilter}
        counts={counts}
      />
      
      {/* Search Bar */}
      <SearchBar 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search commands..."
        resultsCount={filteredCommands.length}
      />
      
      {/* Command List */}
      <div className="command-list">
        {filteredCommands.map(cmd => (
          <CommandCard
            key={cmd.id}
            command={cmd}
            onClick={() => onSelectCommand(cmd)}
            onViewDetails={() => onViewDetails(cmd)}
          />
        ))}
        
        {filteredCommands.length === 0 && (
          <EmptyState searchQuery={searchQuery} />
        )}
      </div>
    </div>
  );
}
```

### Step 4: Kit Filter Tabs Component
```typescript
interface KitFilterTabsProps {
  activeKit: KitFilter;
  onChange: (kit: KitFilter) => void;
  counts: { all: number; engineer: number; marketing: number };
}

function KitFilterTabs({ activeKit, onChange, counts }: KitFilterTabsProps) {
  const tabs: { id: KitFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'engineer', label: 'Engineer', count: counts.engineer },
    { id: 'marketing', label: 'Marketing', count: counts.marketing },
  ];
  
  return (
    <div className="flex gap-2 border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'px-4 py-2 font-medium transition-colors',
            activeKit === tab.id
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {tab.label}
          <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
}
```

## Success Criteria

- [ ] Kit filter tabs (All | Engineer | Marketing) hiển thị đúng count
- [ ] Search real-time với debounce 150ms
- [ ] Command cards hiển thị complexity indicator
- [ ] Empty state hiển thị khi không có results
- [ ] Click command để select/view details
- [ ] Responsive design (mobile & desktop)
- [ ] Dark mode support

## Testing

```typescript
// tests/components/CommandBrowser.test.tsx
describe('CommandBrowser', () => {
  it('filters by kit', () => {
    // Test kit filtering
  });
  
  it('searches by name/description/keywords', () => {
    // Test search functionality
  });
  
  it('displays correct counts', () => {
    // Test count badges
  });
});
```

## Next Steps

After Phase 1 → Phase 2: Command Detail View (modal/sidebar với đầy đủ thông tin command)
