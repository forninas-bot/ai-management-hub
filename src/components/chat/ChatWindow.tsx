import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Conversation, ChatMessage } from '../../types';

interface ChatWindowProps {
  conversation: Conversation;
  isStreaming?: boolean;
}

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
        <div className={`max-w-[70%] rounded-lg p-3 ${
          isUser 
            ? 'bg-primary text-white' 
            : 'bg-secondaryBg text-dark'
        }`}>
          <div className="text-sm mb-1 opacity-75">
            {formatTime(message.timestamp)}
          </div>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {message.role === 'assistant' ? (
              <ReactMarkdown 
                components={{
                  p: ({ children }) => <p className="mb-3 leading-relaxed whitespace-pre-wrap">{children}</p>,
                  ul: ({ children }) => <ul className="mb-3 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="mb-3 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="ml-4">{children}</li>,
                  h1: ({ children }) => <h1 className="text-lg font-bold mb-3">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                  code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">{children}</code>,
                  pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 overflow-x-auto text-sm">{children}</pre>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-blue-500 pl-3 my-3 italic">{children}</blockquote>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            ) : (
              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
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
      
      <div className="flex-grow overflow-auto p-4 space-y-4">
        {conversation.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray">
            開始與AI對話...
          </div>
        ) : (
          <>
            {conversation.messages.map(renderMessage)}
            {isStreaming && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[70%] rounded-lg p-3 bg-secondaryBg text-dark">
                  <ThinkingAnimation />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;