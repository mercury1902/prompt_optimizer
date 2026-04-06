import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '../../src/components/ChatInput';

describe('ChatInput', () => {
  const mockSubmit = vi.fn();
  const mockStop = vi.fn();
  const mockInputChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with correct initial state', () => {
    render(
      <ChatInput
        input=""
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={false}
        onStop={mockStop}
      />
    );

    expect(screen.getByLabelText(/message input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/send message/i)).toBeDisabled();
  });

  it('enables submit button when input has content', () => {
    render(
      <ChatInput
        input="Hello"
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={false}
        onStop={mockStop}
      />
    );

    expect(screen.getByLabelText(/send message/i)).toBeEnabled();
  });

  it('submits on Enter key press', () => {
    render(
      <ChatInput
        input="Hello"
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={false}
        onStop={mockStop}
      />
    );

    const textarea = screen.getByLabelText(/message input/i);
    fireEvent.keyDown(textarea, { key: 'Enter', code: 'Enter' });

    expect(mockSubmit).toHaveBeenCalled();
  });

  it('does not submit on Shift+Enter', () => {
    render(
      <ChatInput
        input="Hello"
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={false}
        onStop={mockStop}
      />
    );

    const textarea = screen.getByLabelText(/message input/i);
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true, code: 'Enter' });

    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it('shows stop button when streaming', () => {
    render(
      <ChatInput
        input=""
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={true}
        onStop={mockStop}
      />
    );

    expect(screen.queryByLabelText(/send message/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/stop generating/i)).toBeInTheDocument();
  });

  it('calls onStop when stop button clicked', () => {
    render(
      <ChatInput
        input=""
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={true}
        onStop={mockStop}
      />
    );

    const stopButton = screen.getByLabelText(/stop generating/i);
    fireEvent.click(stopButton);

    expect(mockStop).toHaveBeenCalled();
  });

  it('disables input when streaming', () => {
    render(
      <ChatInput
        input=""
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={true}
        onStop={mockStop}
      />
    );

    expect(screen.getByLabelText(/message input/i)).toBeDisabled();
  });

  it('calls onInputChange when typing', () => {
    render(
      <ChatInput
        input=""
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={false}
        onStop={mockStop}
      />
    );

    const textarea = screen.getByLabelText(/message input/i);
    fireEvent.change(textarea, { target: { value: 'Hello' } });

    expect(mockInputChange).toHaveBeenCalled();
  });

  it('renders with custom placeholder', () => {
    render(
      <ChatInput
        input=""
        onInputChange={mockInputChange}
        onSubmit={mockSubmit}
        isStreaming={false}
        onStop={mockStop}
        placeholder="Custom placeholder"
      />
    );

    expect(screen.getByPlaceholderText(/custom placeholder/i)).toBeInTheDocument();
  });
});
