// Legacy neutral chat UI components are fully deprecated.
// Keep direct file imports only for historical tests/migrations.
export { MessageContent } from './MessageContent';
export { CodeBlock } from './CodeBlock';
export { TypingIndicator } from './TypingIndicator';
export { ToolCallVisualizer } from './ToolCallVisualizer';
export { ToolResultDisplay } from './ToolResultDisplay';

// New glassmorphism chat components (Vietnamese)
export {
  ChatFrameWithGlassmorphismAndVietnamese,
  MessageBubbleUser,
  MessageBubbleAssistant,
  CodeBlockWithCopy,
  CommandPaletteDemo,
  ChatInputWithCommandPalette,
  demoMessages,
  demoCommands,
  IconBolt,
  IconTool,
  IconSpeaker,
  IconLightbulb,
} from './chat/chat-frame-with-glassmorphism-and-vietnamese';

// Command components
export { CommandBrowserWithKitFilterAndSearch } from './command-browser-with-kit-filter-and-search';
export { CommandDetailViewWithTabsAndCopy } from './command-detail-view-with-tabs-and-copy';
export { CommandUsageExamplesWithVariants } from './command-usage-examples-with-variants';
export { RelatedCommandsSuggestions, RelatedCommandsCompact } from './related-commands-suggestions';

// Workflow components
export { WorkflowBrowserWithSearchAndFilter } from './workflow-browser-with-search-and-filter';
export { WorkflowCard } from './workflow-card-with-steps-preview';
export { WorkflowDetailViewWithStepGuide } from './workflow-detail-view-with-step-guide';

export type {
  MessageContentProps,
  CodeBlockProps,
} from '../types/chat';
