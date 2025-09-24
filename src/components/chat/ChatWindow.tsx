import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Conversation, ChatMessage } from '../../types';

interface ChatWindowProps {
  conversation: Conversation;
  isStreaming?: boolean;
}

// 增強的流式內容顯示組件
const StreamingContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="text-base leading-relaxed whitespace-pre-wrap break-words">
      {content || ' '}
    </div>
  );
};

// 思考中動畫組件
const ThinkingAnimation: React.FC = () => {
  return (
    <div className="flex items-center space-x-1 text-gray-500">
      <span>AI 正在思考</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ conversation, isStreaming = false }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 自動滾動到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 當有新消息時自動滾動
  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages, isStreaming]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div key={message.id} className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] rounded-lg p-4 ${
          isUser 
            ? 'bg-primary text-white' 
            : 'bg-secondaryBg text-dark'
        }`}>
          <div className="text-sm mb-1 opacity-75">
            {formatTime(message.timestamp)}
          </div>
          <div className="prose prose-base max-w-none dark:prose-invert text-base leading-relaxed">
            {message.role === 'assistant' ? (
              <ReactMarkdown 
                components={{
                  p: ({ children }) => <p className="mb-4 leading-relaxed whitespace-pre-wrap break-words text-base">{children}</p>,
                  ul: ({ children }) => <ul className="mb-4 space-y-2 list-disc pl-6">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-4 space-y-2 list-decimal pl-6">{children}</ol>,
                  li: ({ children }) => <li className="ml-4 mb-1">{children}</li>,
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-4">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold mb-3">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold mb-2">{children}</h3>,
                  code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                  pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4 overflow-x-auto text-sm font-mono border-l-4 border-blue-500">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic bg-blue-50 dark:bg-blue-900/20 py-2">{children}</blockquote>,
                  br: () => <br className="my-2" />,
                  hr: () => <hr className="my-4 border-gray-300 dark:border-gray-600" />,
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed break-words text-base">{message.content}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-dark">{conversation.title}</h3>
        <div className="text-sm text-gray">
          模型: {conversation.modelId} | 風格: {conversation.styleId}
        </div>
      </div>
      
      <div className="flex-grow overflow-auto p-6 space-y-6">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray">
            開始與AI對話...
          </div>
        ) : (
          <>
            {conversation.messages.map(renderMessage)}
            {isStreaming && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] rounded-lg p-4 bg-secondaryBg text-dark">
                  <ThinkingAnimation />
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatWindow;