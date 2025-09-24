import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { 
  useAnalyzeConversationMutation, 
  useGenerateSmartSuggestionsMutation
  // contextMemory // 暫時註解，因為未使用
} from '../../services/aiService';
// import { addMessage } from '../../features/chat/chatSlice'; // 暫時註解，因為未使用
// import { ChatMessage } from '../../types'; // 暫時註解，因為未使用

interface SmartAssistantProps {
  conversationId?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ 
  conversationId, 
  onSuggestionClick 
}) => {
  // const dispatch = useAppDispatch(); // 暫時註解，因為未使用
  const { activeConversation } = useAppSelector(state => state.chat);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [emotion, setEmotion] = useState<string>('neutral');
  const [insights, setInsights] = useState<any[]>([]);
  
  const [analyzeConversation] = useAnalyzeConversationMutation();
  const [generateSuggestions] = useGenerateSmartSuggestionsMutation();
  
  const lastAnalysisRef = useRef<number>(0);

  const performAnalysis = useCallback(async () => {
    if (!activeConversation || isAnalyzing) return;
    
    setIsAnalyzing(true);
    try {
      // 分析對話
      const analysisResult = await analyzeConversation({
        messages: activeConversation.messages,
        conversationId: activeConversation.id
      }).unwrap();
      
      setInsights(analysisResult.insights || []);
      setEmotion(analysisResult.sentiment_analysis?.overall || 'neutral');
      
      // 生成智能建議
      const lastMessage = activeConversation.messages[activeConversation.messages.length - 1];
      if (lastMessage) {
        const context = activeConversation.messages
          .slice(-3)
          .map(m => `${m.role}: ${m.content}`)
          .join('\n');
          
        const suggestionsResult = await generateSuggestions({
          context,
          userInput: lastMessage.content
        }).unwrap();
        
        setSuggestions(suggestionsResult);
      }
    } catch (error) {
      console.error('分析失敗:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [activeConversation, isAnalyzing, analyzeConversation, generateSuggestions]);

  useEffect(() => {
    if (activeConversation && activeConversation.messages.length > 0) {
      const now = Date.now();
      // 每30秒或新增5條消息後進行分析
      if (now - lastAnalysisRef.current > 30000 || 
          activeConversation.messages.length % 5 === 0) {
        performAnalysis();
        lastAnalysisRef.current = now;
      }
    }
  }, [activeConversation?.messages, performAnalysis]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'positive': return '😊';
      case 'negative': return '😔';
      default: return '😐';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return '📈';
      case 'pattern': return '🔍';
      case 'suggestion': return '💡';
      case 'warning': return '⚠️';
      default: return '📊';
    }
  };

  if (!activeConversation) {
    return (
      <div className="neural-card p-4 text-center text-gray-500">
        <div className="text-2xl mb-2">🤖</div>
        <p>開始對話以獲得AI助手建議</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 情感狀態 */}
      <div className="neural-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">{getEmotionIcon(emotion)}</span>
          <span className="font-medium">對話情感</span>
          {isAnalyzing && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
        </div>
        <p className="text-sm text-gray-600 capitalize">{emotion}</p>
      </div>

      {/* 智能建議 */}
      {suggestions.length > 0 && (
        <div className="neural-card p-3">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>💡</span>
            智能建議
          </h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(suggestion)}
                className="w-full text-left p-2 rounded-lg bg-blue-50 hover:bg-blue-100 
                         text-sm transition-colors duration-200 border border-blue-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI洞察 */}
      {insights.length > 0 && (
        <div className="neural-card p-3">
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>🔮</span>
            AI洞察
          </h4>
          <div className="space-y-3">
            {insights.slice(0, 3).map((insight, index) => (
              <div key={index} className="border-l-4 border-purple-400 pl-3">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getInsightIcon(insight.type)}</span>
                  <span className="font-medium text-sm">{insight.title}</span>
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                    {Math.round(insight.confidence * 100)}%
                  </span>
                </div>
                <p className="text-xs text-gray-600">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 快速操作 */}
      <div className="neural-card p-3">
        <h4 className="font-medium mb-3 flex items-center gap-2">
          <span>⚡</span>
          快速操作
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={performAnalysis}
            disabled={isAnalyzing}
            className="p-2 text-xs bg-green-50 hover:bg-green-100 rounded-lg 
                     border border-green-200 transition-colors duration-200
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🔄 重新分析
          </button>
          <button 
            onClick={() => {
              const context = activeConversation.messages
                .map(m => `${m.role}: ${m.content}`)
                .join('\n');
              navigator.clipboard.writeText(context);
            }}
            className="p-2 text-xs bg-blue-50 hover:bg-blue-100 rounded-lg 
                     border border-blue-200 transition-colors duration-200"
          >
            📋 複製對話
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;