---
phase: 3
title: Workflow Browser Implementation
priority: medium
esteffort: 3h
blockedBy: [phase-02-command-detail-view-implementation]
---

# Phase 3: Workflow Browser

## Context

Tạo Workflow Browser tương tự Command Browser để browse và search workflows. Workflows là chuỗi các commands để hoàn thành một task phức tạp.

## Key Insights

1. **Workflow Card Design**:
   - Workflow name và description
   - Step count (số bước)
   - Difficulty level (Easy/Medium/Hard)
   - Time estimate
   - Gateway steps highlighted

2. **Workflow Detail**:
   - Step-by-step view
   - Each step với command, description, flags
   - Progress indicator
   - Start workflow button

## Architecture

```
┌─────────────────────────────────────────┐
│  Workflow Browser                       │
├─────────────────────────────────────────┤
│  🔍 Search workflows...                 │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ 🔄 Bootstrap New Project        │  │
│  │ 5 steps • Hard • ~30 mins       │  │
│  │ [ck:plan] → [ck:research] →    │  │
│  └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Files to Create

1. `src/components/workflow-browser-with-search-and-filter.tsx`
2. `src/components/workflow-card-with-steps-preview.tsx`
3. `src/components/workflow-detail-view-with-step-guide.tsx`
4. `src/lib/workflow-filtering-by-complexity-and-search.ts`

## Implementation Steps

### Step 1: Workflow Type Definition
```typescript
// Extend existing Workflow type
export interface WorkflowStep {
  step: number;
  command: string;
  description: string;
  flags?: string[];
  required: boolean;
  gateway?: boolean;
  note?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  category: 'Engineer' | 'Marketing';
}
```

### Step 2: Workflow Filtering
```typescript
// src/lib/workflow-filtering-by-complexity-and-search.ts
export function filterWorkflows(
  workflows: Workflow[],
  searchQuery: string,
  difficultyFilter?: 'all' | 'easy' | 'medium' | 'hard'
): Workflow[] {
  return workflows.filter(wf => {
    // Difficulty filter
    if (difficultyFilter && difficultyFilter !== 'all' && 
        wf.difficulty !== difficultyFilter) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        wf.name.toLowerCase().includes(query) ||
        wf.description.toLowerCase().includes(query) ||
        wf.steps.some(s => 
          s.command.toLowerCase().includes(query) ||
          s.description.toLowerCase().includes(query)
        )
      );
    }
    
    return true;
  });
}
```

### Step 3: Workflow Card Component
```typescript
// src/components/workflow-card-with-steps-preview.tsx
interface WorkflowCardProps {
  workflow: Workflow;
  onClick: () => void;
}

export function WorkflowCard({ workflow, onClick }: WorkflowCardProps) {
  const difficultyColors = {
    easy: 'text-green-600 bg-green-50',
    medium: 'text-yellow-600 bg-yellow-50',
    hard: 'text-red-600 bg-red-50',
  };
  
  return (
    <div 
      onClick={onClick}
      className="p-4 border rounded-xl hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-lg">{workflow.name}</h3>
        <span className={cn('px-2 py-1 rounded-full text-xs', difficultyColors[workflow.difficulty])}>
          {workflow.difficulty}
        </span>
      </div>
      
      <p className="text-sm text-gray-600 mb-3">{workflow.description}</p>
      
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>{workflow.steps.length} steps</span>
        <span>•</span>
        <span>{workflow.timeEstimate}</span>
      </div>
      
      {/* Step preview */}
      <div className="mt-3 flex gap-1">
        {workflow.steps.slice(0, 4).map(step => (
          <div 
            key={step.step}
            className={cn(
              'w-8 h-1 rounded-full',
              step.gateway ? 'bg-purple-400' : 'bg-gray-300'
            )}
            title={`${step.step}. ${step.command}`}
          />
        ))}
        {workflow.steps.length > 4 && (
          <div className="text-xs text-gray-400">+{workflow.steps.length - 4}</div>
        )}
      </div>
    </div>
  );
}
```

### Step 4: Workflow Detail View
```typescript
// src/components/workflow-detail-view-with-step-guide.tsx
interface WorkflowDetailProps {
  workflow: Workflow;
  isOpen: boolean;
  onClose: () => void;
  onStartWorkflow: (workflow: Workflow) => void;
}

export function WorkflowDetailView({ 
  workflow, 
  isOpen, 
  onClose,
  onStartWorkflow 
}: WorkflowDetailProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{workflow.name}</h2>
              <p className="text-gray-600 mt-1">{workflow.description}</p>
            </div>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Steps */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {workflow.steps.map((step, idx) => (
              <WorkflowStepCard 
                key={idx}
                step={step}
                isActive={idx === 0}
                isCompleted={false}
              />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={() => onStartWorkflow(workflow)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Start Workflow
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkflowStepCard({ 
  step, 
  isActive, 
  isCompleted 
}: { 
  step: WorkflowStep;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className={cn(
      'flex gap-4 p-4 rounded-lg border',
      isActive && 'border-blue-500 bg-blue-50',
      isCompleted && 'border-green-500 bg-green-50',
      !isActive && !isCompleted && 'border-gray-200'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center font-medium',
        isActive && 'bg-blue-600 text-white',
        isCompleted && 'bg-green-600 text-white',
        !isActive && !isCompleted && 'bg-gray-200'
      )}>
        {isCompleted ? <Check className="w-4 h-4" /> : step.step}
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <code className="bg-gray-100 px-2 py-0.5 rounded text-sm">
            {step.command}
          </code>
          {step.gateway && (
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
              Gateway
            </span>
          )}
          {!step.required && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              Optional
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700">{step.description}</p>
        {step.flags && step.flags.length > 0 && (
          <div className="mt-2 flex gap-2">
            {step.flags.map(flag => (
              <span key={flag} className="text-xs text-gray-500">
                {flag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

## Success Criteria

- [ ] Workflow browser với search và difficulty filter
- [ ] Workflow cards hiển thị steps preview
- [ ] Workflow detail với step-by-step guide
- [ ] Start workflow button
- [ ] Gateway steps highlighted
- [ ] Responsive và dark mode

## Next Steps

Phase 4: Favorites & Recent commands (lưu trữ và truy cập nhanh)
