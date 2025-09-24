import React, { useState } from 'react';
import { Button } from '../ui';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  suggestions?: string[];
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled = false, suggestions = [] }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end space-x-2 w-full">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        placeholder="輸入訊息... (按 Enter 發送，Shift+Enter 換行)"
        className="flex-grow p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent min-h-[40px] max-h-[120px]"
        rows={1}
      />
      <Button type="submit" disabled={disabled || !message.trim()}>
        發送
      </Button>
    </form>
  );
};

export default ChatInput;