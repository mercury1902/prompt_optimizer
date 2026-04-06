---
phase: 2
title: Command Detail View Implementation
priority: high
esteffort: 3h
blockedBy: [phase-01-command-browser-core-implementation]
---

# Phase 2: Command Detail View

## Context

Tạo Command Detail view/modal để hiển thị đầy đủ thông tin về một command khi user click vào command card.

## Key Insights from Research

1. **Detail View Patterns** (ChatGPT, Claude, VividKit):
   - Modal hoặc Slide-over sidebar
   - Tabs: Overview | Usage | Examples
   - Copy-to-clipboard buttons
   - Related commands suggestions

2. **Information Hierarchy**:
   - Command name (prominent)
   - Description (full)
   - Use cases (bullet list)
   - Arguments/flags (table format)
   - Variants (chips/tags)
   - Complexity indicator (visual)
   - Keywords (tags)

## Architecture

```
┌─────────────────────────────────────────────┐
│  Command Detail - /ck:cook                  │
├─────────────────────────────────────────────┤
│  ⚡⚡⚡  Complexity: 3 | Category: Engineer  │
│                                             │
│  [Overview] [Usage] [Examples]              │
│                                             │
│  ⚡⚡⚡ Implement feature [step by step]    │
│                                             │
│  Description:                               │
│  Intelligent feature implementation...      │
│                                             │
│  Use Cases:                                 │
│  • Implement features                       │
│  • Build functionality                      │
│  • Code end-to-end                          │
│                                             │
│  Arguments: [tasks]                         │
│                                             │
│  Variants:                                  │
│  /ck:cook:auto  /ck:cook:auto:fast         │
│                                             │
│  Keywords: implement feature tạo build    │
│                                             │
│  [Copy Command] [Use This Command]          │
│                                             │
│  Related Commands:                          │
│  /ck:plan, /ck:bootstrap, /ck:fix          │
└─────────────────────────────────────────────┘
```

## Files to Create

1. `src/components/command-detail-view-with-tabs-and-copy.tsx`
2. `src/components/command-usage-examples-with-variants.tsx`
3. `src/components/related-commands-suggestions.tsx`

## Implementation Steps

### Step 1: Command Detail Component Structure
```typescript
// src/components/command-detail-view-with-tabs-and-copy.tsx
import { useState } from 'react';
import { X, Copy, Check, Bolt } from 'lucide-react';

type DetailTab = 'overview' | 'usage' | 'examples';

interface CommandDetailProps {
  command: Command;
  isOpen: boolean;
  onClose: () => void;
  onUseCommand: (command: Command) => void;
}

export function CommandDetailView({ 
  command, 
  isOpen, 
  onClose,
  onUseCommand 
}: CommandDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(command.name);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ComplexityIndicator level={command.complexity} />
              <span className="text-sm text-gray-500">{command.category}</span>
            </div>
            <h2 className="text-2xl font-bold">{command.name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex border-b">
          {(['overview', 'usage', 'examples'] as DetailTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 font-medium capitalize',
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {activeTab === 'overview' && <OverviewTab command={command} />}
          {activeTab === 'usage' && <UsageTab command={command} />}
          {activeTab === 'examples' && <ExamplesTab command={command} />}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy Command'}
          </button>
          <button
            onClick={() => onUseCommand(command)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Bolt className="w-4 h-4" />
            Use This Command
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 2: Overview Tab
```typescript
function OverviewTab({ command }: { command: Command }) {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-lg font-semibold mb-2">Description</h3>
        <p className="text-gray-700">{command.description}</p>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold mb-2">Use Cases</h3>
        <ul className="list-disc list-inside space-y-1">
          {command.useCases.map((useCase, idx) => (
            <li key={idx} className="text-gray-700">{useCase}</li>
          ))}
        </ul>
      </section>
      
      <section>
        <h3 className="text-lg font-semibold mb-2">Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {command.keywords.map(keyword => (
            <span 
              key={keyword}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {keyword}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Step 3: Usage Tab với Arguments và Variants
```typescript
function UsageTab({ command }: { command: Command }) {
  return (
    <div className="space-y-6">
      {command.args && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Arguments</h3>
          <div className="bg-gray-100 rounded-lg p-3 font-mono text-sm">
            {command.name} {command.args}
          </div>
        </section>
      )}
      
      {command.variants && command.variants.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Variants</h3>
          <div className="space-y-2">
            {command.variants.map(variant => (
              <div 
                key={variant}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
              >
                <code className="text-sm">{variant}</code>
                <CopyButton text={variant} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

### Step 4: Related Commands Component
```typescript
// src/components/related-commands-suggestions.tsx
import { getRelatedCommands } from '../lib/command-recommender';

interface RelatedCommandsProps {
  currentCommand: Command;
  allCommands: Command[];
  onSelect: (command: Command) => void;
}

export function RelatedCommands({ 
  currentCommand, 
  allCommands, 
  onSelect 
}: RelatedCommandsProps) {
  const related = getRelatedCommands(currentCommand, allCommands).slice(0, 5);
  
  if (related.length === 0) return null;
  
  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="text-lg font-semibold mb-3">Related Commands</h3>
      <div className="flex flex-wrap gap-2">
        {related.map(cmd => (
          <button
            key={cmd.id}
            onClick={() => onSelect(cmd)}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors"
          >
            {cmd.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Success Criteria

- [ ] Modal/sidebar hiển thị khi click command card
- [ ] 3 tabs: Overview | Usage | Examples
- [ ] Copy-to-clipboard cho command và variants
- [ ] Complexity indicator và category badge
- [ ] Related commands suggestions
- [ ] Responsive và dark mode
- [ ] Animation mượt mà (fade in, slide)

## Testing

```typescript
// tests/components/CommandDetail.test.tsx
describe('CommandDetailView', () => {
  it('displays command information correctly', () => {});
  it('switches between tabs', () => {});
  it('copies command to clipboard', () => {});
  it('closes on X button click', () => {});
  it('calls onUseCommand when Use button clicked', () => {});
});
```

## Next Steps

Phase 3: Workflow Browser (tương tự Command Browser nhưng cho workflows)
