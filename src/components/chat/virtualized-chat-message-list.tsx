import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

export interface VirtualizedChatMessage {
  id: string;
}

export interface VirtualizedChatMessageListHandle {
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

interface VirtualizedChatMessageListProps<TMessage extends VirtualizedChatMessage> {
  messages: TMessage[];
  renderMessage: (message: TMessage) => React.ReactNode;
  className?: string;
  gap?: number;
  overscan?: number;
  estimateRowHeight?: number;
  onNearBottomChange?: (isNearBottom: boolean) => void;
}

const DEFAULT_GAP = 28;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_ESTIMATE_ROW_HEIGHT = 132;
const NEAR_BOTTOM_THRESHOLD = 180;

export const VirtualizedChatMessageList = forwardRef<
  VirtualizedChatMessageListHandle,
  VirtualizedChatMessageListProps<VirtualizedChatMessage>
>(function VirtualizedChatMessageList(
  {
    messages,
    renderMessage,
    className,
    gap = DEFAULT_GAP,
    overscan = DEFAULT_OVERSCAN,
    estimateRowHeight = DEFAULT_ESTIMATE_ROW_HEIGHT,
    onNearBottomChange,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);
  const previousMessageCountRef = useRef(messages.length);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(1);
  const [rowHeights, setRowHeights] = useState<Record<string, number>>({});

  const rows = useMemo(() => {
    const positions: number[] = [];
    let currentTop = 0;

    for (let index = 0; index < messages.length; index += 1) {
      const message = messages[index];
      positions[index] = currentTop;
      const rowHeight = rowHeights[message.id] ?? estimateRowHeight;
      currentTop += rowHeight + gap;
    }

    const totalHeight = messages.length > 0 ? Math.max(0, currentTop - gap) : 0;
    return { positions, totalHeight };
  }, [messages, rowHeights, estimateRowHeight, gap]);

  const updateViewportHeight = useCallback(() => {
    if (!containerRef.current) return;
    setViewportHeight(containerRef.current.clientHeight || 1);
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      scrollToBottom,
    }),
    [scrollToBottom],
  );

  useEffect(() => {
    updateViewportHeight();
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => updateViewportHeight());
    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [updateViewportHeight]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    const isNearBottom = distanceToBottom <= NEAR_BOTTOM_THRESHOLD;

    if (nearBottomRef.current !== isNearBottom) {
      nearBottomRef.current = isNearBottom;
      onNearBottomChange?.(isNearBottom);
    }
  }, [messages.length, rows.totalHeight, onNearBottomChange]);

  useEffect(() => {
    const currentCount = messages.length;
    if (currentCount > previousMessageCountRef.current && nearBottomRef.current) {
      scrollToBottom('smooth');
    }
    previousMessageCountRef.current = currentCount;
  }, [messages.length, scrollToBottom]);

  const startIndex = useMemo(() => {
    const target = Math.max(0, scrollTop - gap * 2);
    let index = 0;
    while (index < rows.positions.length && rows.positions[index] < target) {
      index += 1;
    }
    return Math.max(0, index - overscan);
  }, [scrollTop, rows.positions, overscan, gap]);

  const endIndex = useMemo(() => {
    const target = scrollTop + viewportHeight + gap * 2;
    let index = startIndex;
    while (index < rows.positions.length && rows.positions[index] < target) {
      index += 1;
    }
    return Math.min(messages.length - 1, index + overscan);
  }, [scrollTop, viewportHeight, rows.positions, startIndex, overscan, messages.length, gap]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const container = event.currentTarget;
    setScrollTop(container.scrollTop);
    const distanceToBottom = container.scrollHeight - (container.scrollTop + container.clientHeight);
    const isNearBottom = distanceToBottom <= NEAR_BOTTOM_THRESHOLD;

    if (nearBottomRef.current !== isNearBottom) {
      nearBottomRef.current = isNearBottom;
      onNearBottomChange?.(isNearBottom);
    }
  };

  const handleRowHeightChange = useCallback((messageId: string, nextHeight: number) => {
    if (nextHeight <= 0) return;
    setRowHeights((previous) => {
      if (previous[messageId] === nextHeight) {
        return previous;
      }
      return { ...previous, [messageId]: nextHeight };
    });
  }, []);

  return (
    <div ref={containerRef} onScroll={handleScroll} className={className}>
      <div style={{ height: `${rows.totalHeight}px`, position: 'relative' }}>
        {messages.slice(startIndex, endIndex + 1).map((message, relativeIndex) => {
          const absoluteIndex = startIndex + relativeIndex;
          return (
            <MeasuredRow
              key={message.id}
              top={rows.positions[absoluteIndex]}
              onHeightChange={(height) => handleRowHeightChange(message.id, height)}
            >
              {renderMessage(message)}
            </MeasuredRow>
          );
        })}
      </div>
    </div>
  );
});

interface MeasuredRowProps {
  top: number;
  onHeightChange: (height: number) => void;
  children: React.ReactNode;
}

function MeasuredRow({ top, onHeightChange, children }: MeasuredRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => onHeightChange(Math.ceil(row.getBoundingClientRect().height));
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div ref={rowRef} style={{ position: 'absolute', top: `${top}px`, left: 0, right: 0 }}>
      {children}
    </div>
  );
}

