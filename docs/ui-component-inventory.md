# UI Component Inventory

**Last Updated:** 2026-04-14

## Active Core Components
| Area | Component | Path | Status |
|---|---|---|---|
| Chat shell | ChatFrameWithGlassmorphismAndVietnamese | `src/components/chat/chat-frame-with-glassmorphism-and-vietnamese.tsx` | Active |
| Chat nav | VerticalNavSidebar | `src/components/chat/vertical-navigation-sidebar.tsx` | Active |
| Chat header | ChatHeader | `src/components/chat/chat-header-with-status.tsx` | Active |
| Chat input | ChatInput | `src/components/chat/chat-input-with-keyboard-shortcuts.tsx` | Active |
| Empty state | EmptyStateWithSuggestions | `src/components/chat/empty-state-with-suggestions.tsx` | Active |
| Prompt optimizer | PromptOptimizerChat | `src/components/command-guide/prompt-optimizer-chat.tsx` | Active |
| Prompt result | OptimizedResultView | `src/components/command-guide/optimized-prompt-result-view.tsx` | Active |

## Deprecated Legacy Components
| Component | Path | Deprecation |
|---|---|---|
| ChatContainer | `src/components/ChatContainer.tsx` | Fully deprecated |
| ChatInput (legacy neutral) | `src/components/ChatInput.tsx` | Fully deprecated |
| MessageList (legacy neutral) | `src/components/MessageList.tsx` | Fully deprecated |
| UserMessage (legacy neutral) | `src/components/UserMessage.tsx` | Fully deprecated |
| AssistantMessage (legacy neutral) | `src/components/AssistantMessage.tsx` | Fully deprecated |

## Notes
- Deprecated components are not exported from `src/components/index.ts`.
- New development should not depend on deprecated neutral components.
