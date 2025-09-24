import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { ChatWindow, ChatInput, ConversationList } from '../components/chat';
import SmartAssistant from '../components/SmartAssistant';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { 
  fetchConversations, 
  selectActiveConversation, 
  createConversation, 
  addMessage,
  deleteConversation,
  updateStreamingMessage
} from '../features/chat/chatSlice';
import { 
  useCreateChatCompletionMutation,
  createStreamingChatCompletion
} from '../services/aiService';
import { ChatMessage } from '../types';

const AIChat: React.FC = () => {
  const dispatch = useAppDispatch();
  const { conversations, activeConversation, isLoading } = useAppSelector(state => state.chat);
  const { aiSettings } = useAppSelector(state => state.settings);
  const [_, { isLoading: isSending }] = useCreateChatCompletionMutation(); // 使用解構但忽略第一個返回值
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentView, setCurrentView] = useState<'chat' | 'insights' | 'assistant'>('chat');
  // const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]); // 暫時註解，因為未使用

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  const handleSendMessage = async (content: string, attachments?: any[]) => {
    if (!activeConversation) {
      dispatch(createConversation({
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        modelId: aiSettings.defaultModel,
        styleId: aiSettings.activeStyleId
      }));
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };

    dispatch(addMessage({ conversationId: activeConversation.id, message: newMessage }));

    try {
      setIsStreaming(true);
      const assistantMessageId = (Date.now() + 1).toString();
      
      dispatch(addMessage({
        conversationId: activeConversation.id,
        message: {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString()
        }
      }));

      await createStreamingChatCompletion(
        {
          messages: [...activeConversation.messages, newMessage],
          model: aiSettings.defaultModel,
          temperature: 0.7,
          max_tokens: 1000
        },
        (chunk) => {
          dispatch(updateStreamingMessage({
            conversationId: activeConversation.id,
            messageId: assistantMessageId,
            content: chunk
          }));
        },
        () => {
          // 完成回調
        },
        (error) => {
          console.error('流式回應錯誤:', error);
        }
      );
    } catch (error) {
      console.error('發送消息失敗:', error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSelectConversation = (id: string) => {
    if (id === 'new') {
      dispatch(createConversation({
        title: '新對話',
        modelId: aiSettings.defaultModel,
        styleId: aiSettings.activeStyleId
      }));
    } else {
      dispatch(selectActiveConversation(id));
    }
  };

  const handleDeleteConversation = (id: string) => {
    dispatch(deleteConversation(id));
    console.log('刪除對話:', id); // 添加實際使用
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-white/95 to-blue-50/80 p-6 relative overflow-hidden"
    >
      {/* 梵高風格背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-purple-500/8 rounded-full blur-xl animate-van-gogh-pulse" />
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/8 to-orange-500/8 rounded-full blur-lg animate-van-gogh-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/6 to-teal-500/6 rounded-full blur-2xl animate-van-gogh-pulse" />
        
        {/* 梵高風格筆觸紋理 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-repeat opacity-20" 
               style={{
                 backgroundImage: `linear-gradient(45deg, var(--van-gogh-blue) 25%, transparent 25%, transparent 50%, var(--van-gogh-blue) 50%, var(--van-gogh-blue) 75%, transparent 75%, transparent)`,
                 backgroundSize: '20px 20px'
               }} 
          />
        </div>
      </div>

      {/* 導航 - 梵高風格 */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 backdrop-blur-xl bg-white/80 border-b border-neutral-200/50 shadow-lg rounded-xl mb-8"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">AI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
                  AI 智能對話
                </h1>
                <p className="text-sm text-neutral-600">梵高藝術風格 • 創意無限</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant={currentView === 'chat' ? 'van-gogh' : 'glass'}
                size="sm"
                onClick={() => setCurrentView('chat')}
              >
                對話
              </Button>
              <Button
                variant={currentView === 'insights' ? 'van-gogh' : 'glass'}
                size="sm"
                onClick={() => setCurrentView('insights')}
              >
                洞察
              </Button>
              <Button
                variant={currentView === 'assistant' ? 'van-gogh' : 'glass'}
                size="sm"
                onClick={() => setCurrentView('assistant')}
              >
                助手
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 主要內容區域 */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          {/* 左側對話列表 */}
          <Card variant="van-gogh" size="md" className="w-full md:w-64 p-4 h-[calc(100vh-180px)]">
            <div className="mb-4">
              <Button
                variant="van-gogh"
                size="sm"
                className="w-full"
                onClick={() => handleSelectConversation('new')}
              >
                + 新對話
              </Button>
            </div>
            <ConversationList 
              conversations={conversations}
              activeId={activeConversation?.id}
              onSelect={handleSelectConversation}
              onDelete={(id) => dispatch(deleteConversation(id))}
              isLoading={isLoading}
            />
          </Card>

          {/* 右側主要內容 */}
          <Card variant="van-gogh" size="md" className="flex-1 p-4 h-[calc(100vh-180px)] flex flex-col">
            <AnimatePresence mode="wait">
              {currentView === 'chat' && (
                <motion.div 
                  key="chat"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full"
                >
                  {activeConversation ? (
                    <ChatWindow 
                      conversation={activeConversation}
                      isStreaming={isSending || isStreaming}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-500">
                      選擇或開始一個新對話
                    </div>
                  )}
                  <ChatInput 
                    onSend={handleSendMessage}
                    disabled={isSending || isStreaming || !activeConversation}
                    // suggestions={smartSuggestions} // 暫時註解，因為未使用
                  />
                </motion.div>
              )}

              {currentView === 'insights' && (
                <motion.div 
                  key="insights"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <div className="text-center p-8">
                    <h2 className="text-2xl font-bold text-neutral-800 mb-4">AI 洞察分析</h2>
                    <p className="text-neutral-600">
                      基於您的對話歷史，AI將提供深度洞察和分析，幫助您更好地理解和應用對話內容。
                    </p>
                  </div>
                </motion.div>
              )}

              {currentView === 'assistant' && (
                <motion.div 
                  key="assistant"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full"
                >
                  <SmartAssistant onSuggestionClick={handleSuggestionClick} />
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      {/* 浮動裝飾元素 */}
      <div className="fixed top-20 right-20 w-64 h-64 opacity-10 pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M100,20 Q150,50 120,100 Q90,150 100,180 Q50,150 80,100 Q110,50 100,20" 
                  fill="none" stroke="var(--van-gogh-blue)" strokeWidth="4" strokeDasharray="10,5"/>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIChat;