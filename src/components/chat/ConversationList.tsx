import React, { useState } from 'react';
import { Conversation } from '../../types';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({ 
  conversations, 
  activeId, 
  onSelect,
  onDelete,
  isLoading = false
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' });
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-semibold text-dark mb-3">對話歷史</h3>
        <button
          onClick={() => onSelect('new')}
          className="w-full bg-primary hover:bg-primary/80 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
        >
          + 新對話
        </button>
      </div>
      
      <div className="flex-grow overflow-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray">
            暫無對話記錄
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                className={`p-3 rounded-lg transition-colors relative group ${
                  activeId === conversation.id
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'hover:bg-secondaryBg text-dark'
                }`}
              >
                <div 
                  onClick={() => onSelect(conversation.id)}
                  className="cursor-pointer"
                >
                  <div className="font-medium text-sm mb-1">
                    {truncateText(conversation.title, 20)}
                  </div>
                  <div className="text-xs text-gray mb-1">
                    {conversation.messages.length > 0 && (
                      truncateText(conversation.messages[conversation.messages.length - 1]?.content || '', 30)
                    )}
                  </div>
                  <div className="text-xs text-gray flex justify-between items-center">
                    <span>{formatDate(conversation.updatedAt)}</span>
                    <span>{conversation.messages.length} 訊息</span>
                  </div>
                </div>
                
                {/* 刪除按鈕 */}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(conversation.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    title="刪除對話"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* 刪除確認對話框 */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-dark mb-3">確認刪除</h3>
            <p className="text-gray mb-4">
              確定要刪除這個對話嗎？此操作無法復原。
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray hover:text-dark transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (onDelete && deleteConfirm) {
                    onDelete(deleteConfirm);
                    setDeleteConfirm(null);
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;