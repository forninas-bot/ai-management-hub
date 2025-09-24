import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LightBulbIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ChartBarIcon,
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

// 建議類型
type SuggestionType = 
  | 'productivity' 
  | 'workflow' 
  | 'optimization' 
  | 'learning' 
  | 'automation' 
  | 'collaboration'
  | 'health'
  | 'creativity';

// 建議優先級
type SuggestionPriority = 'low' | 'medium' | 'high' | 'urgent';

// 建議接口
interface SmartSuggestion {
  id: string;
  title: string;
  description: string;
  type: SuggestionType;
  priority: SuggestionPriority;
  confidence: number;
  estimatedImpact: number;
  timeToImplement: number; // 分鐘
  aiModel: string;
  reasoning: string;
  actionSteps: string[];
  relatedData?: any;
  createdAt: Date;
  isImplemented?: boolean;
  userFeedback?: 'helpful' | 'not_helpful' | 'implemented';
}

// 用戶上下文接口
interface UserContext {
  currentTask?: string;
  recentActivities: string[];
  workingHours: { start: number; end: number };
  preferences: {
    workStyle: 'focused' | 'collaborative' | 'flexible';
    notificationLevel: 'minimal' | 'moderate' | 'detailed';
    learningGoals: string[];
  };
  performanceMetrics: {
    productivity: number;
    focus: number;
    efficiency: number;
    wellbeing: number;
  };
}

// 建議類型配置
const SUGGESTION_TYPES = {
  productivity: { 
    icon: '⚡', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: '生產力提升' 
  },
  workflow: { 
    icon: '🔄', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    label: '工作流程' 
  },
  optimization: { 
    icon: '🎯', 
    color: 'text-green-600', 
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    label: '效率優化' 
  },
  learning: { 
    icon: '📚', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    label: '學習成長' 
  },
  automation: { 
    icon: '🤖', 
    color: 'text-indigo-600', 
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    label: '自動化' 
  },
  collaboration: { 
    icon: '👥', 
    color: 'text-pink-600', 
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    label: '協作優化' 
  },
  health: { 
    icon: '💚', 
    color: 'text-emerald-600', 
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    label: '健康提醒' 
  },
  creativity: { 
    icon: '🎨', 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    label: '創意激發' 
  }
};

interface SmartSuggestionEngineProps {
  userContext: UserContext;
  onSuggestionImplemented?: (suggestion: SmartSuggestion) => void;
  onFeedback?: (suggestionId: string, feedback: 'helpful' | 'not_helpful' | 'implemented') => void;
  className?: string;
}

const SmartSuggestionEngine: React.FC<SmartSuggestionEngineProps> = ({
  userContext,
  onSuggestionImplemented,
  onFeedback,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'claude-3-5-sonnet' | 'gpt-4o'>('claude-3-5-sonnet');
  const [activeFilter, setActiveFilter] = useState<SuggestionType | 'all'>('all');
  const [showImplemented, setShowImplemented] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 生成智能建議
  const generateSuggestions = useCallback(async () => {
    setIsGenerating(true);
    
    try {
      // 模擬API調用 - 實際應用中應該調用nextGenAIService
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions: SmartSuggestion[] = [
        {
          id: '1',
          title: '建議使用番茄工作法提高專注力',
          description: '根據您的工作模式分析，使用25分鐘專注+5分鐘休息的番茄工作法可以提高您的工作效率約30%。',
          type: 'productivity',
          priority: 'high',
          confidence: 0.89,
          estimatedImpact: 8.5,
          timeToImplement: 5,
          aiModel: selectedModel,
          reasoning: '分析您的工作數據發現，您在長時間工作後效率會明顯下降，番茄工作法可以幫助維持穩定的專注力。',
          actionSteps: [
            '設置25分鐘的專注時間',
            '選擇一個重要任務開始',
            '在計時器響起前不要中斷工作',
            '休息5分鐘後開始下一個番茄時段',
            '每4個番茄時段後休息15-30分鐘'
          ],
          createdAt: new Date()
        },
        {
          id: '2',
          title: '自動化重複性任務',
          description: '檢測到您經常執行相似的數據整理工作，建議創建自動化腳本來節省時間。',
          type: 'automation',
          priority: 'medium',
          confidence: 0.76,
          estimatedImpact: 7.2,
          timeToImplement: 30,
          aiModel: selectedModel,
          reasoning: '您在過去一週中有60%的時間用於重複性的數據處理任務，自動化可以節省大量時間。',
          actionSteps: [
            '識別最常重複的任務模式',
            '選擇合適的自動化工具',
            '創建自動化腳本或工作流',
            '測試自動化流程',
            '部署並監控自動化效果'
          ],
          createdAt: new Date()
        },
        {
          id: '3',
          title: '學習新的快捷鍵提高效率',
          description: '基於您的應用使用情況，學習這些快捷鍵可以提高操作速度約40%。',
          type: 'learning',
          priority: 'medium',
          confidence: 0.82,
          estimatedImpact: 6.8,
          timeToImplement: 15,
          aiModel: selectedModel,
          reasoning: '觀察到您經常使用滑鼠進行可以用快捷鍵完成的操作，學習快捷鍵可以顯著提高效率。',
          actionSteps: [
            '學習Ctrl+Shift+T重新打開關閉的標籤',
            '使用Alt+Tab快速切換應用程序',
            '掌握Ctrl+F進行頁面搜索',
            '練習Ctrl+Z/Y進行撤銷/重做',
            '使用Win+D快速顯示桌面'
          ],
          createdAt: new Date()
        },
        {
          id: '4',
          title: '定期休息保護視力和健康',
          description: '您已經連續工作2小時，建議進行眼部休息和簡單運動。',
          type: 'health',
          priority: 'urgent',
          confidence: 0.95,
          estimatedImpact: 9.0,
          timeToImplement: 10,
          aiModel: selectedModel,
          reasoning: '長時間盯著螢幕會導致眼部疲勞和身體僵硬，定期休息對健康和長期生產力都很重要。',
          actionSteps: [
            '每20分鐘看向20英尺外的物體20秒',
            '每小時起身活動5分鐘',
            '做簡單的頸部和肩部伸展運動',
            '保持正確的坐姿',
            '調整螢幕亮度和對比度'
          ],
          createdAt: new Date()
        },
        {
          id: '5',
          title: '優化工作環境佈局',
          description: '根據您的工作習慣，重新安排工作區域可以提高效率和舒適度。',
          type: 'optimization',
          priority: 'low',
          confidence: 0.71,
          estimatedImpact: 5.5,
          timeToImplement: 20,
          aiModel: selectedModel,
          reasoning: '分析您的工作模式發現，經常需要在不同工具間切換，優化佈局可以減少不必要的移動。',
          actionSteps: [
            '將常用工具放在觸手可及的地方',
            '整理桌面，移除不必要的物品',
            '調整螢幕高度和角度',
            '確保充足的照明',
            '準備一個舒適的椅子'
          ],
          createdAt: new Date()
        }
      ];

      setSuggestions(prev => {
        const newSuggestions = mockSuggestions.filter(
          newSug => !prev.some(existingSug => existingSug.id === newSug.id)
        );
        return [...newSuggestions, ...prev].slice(0, 20); // 保留最新的20個建議
      });
      
    } catch (error) {
      console.error('生成建議失敗:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedModel]);

  // 自動刷新建議
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        generateSuggestions();
      }, 300000); // 每5分鐘刷新一次

      return () => clearInterval(interval);
    }
  }, [autoRefresh, generateSuggestions]);

  // 初始加載
  useEffect(() => {
    generateSuggestions();
  }, [generateSuggestions]);

  // 處理建議反饋
  const handleFeedback = (suggestionId: string, feedback: 'helpful' | 'not_helpful' | 'implemented') => {
    setSuggestions(prev => 
      prev.map(sug => 
        sug.id === suggestionId 
          ? { ...sug, userFeedback: feedback, isImplemented: feedback === 'implemented' }
          : sug
      )
    );
    onFeedback?.(suggestionId, feedback);
    
    if (feedback === 'implemented') {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        onSuggestionImplemented?.(suggestion);
      }
    }
  };

  // 過濾建議
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (!showImplemented && suggestion.isImplemented) return false;
    if (activeFilter === 'all') return true;
    return suggestion.type === activeFilter;
  });

  // 按優先級排序
  const sortedSuggestions = filteredSuggestions.sort((a, b) => {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* 標題區域 */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-lg">
              <LightBulbIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI 智能建議
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                基於您的工作模式提供個性化建議
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as 'claude-3-5-sonnet' | 'gpt-4o')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            >
              <option value="claude-3-5-sonnet">Claude 4.0</option>
              <option value="gpt-4o">ChatGPT 4.0</option>
            </select>
            
            <button
              onClick={generateSuggestions}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <SparklesIcon className="w-4 h-4" />
                  <span>刷新建議</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 過濾器 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              activeFilter === 'all'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            全部
          </button>
          {Object.entries(SUGGESTION_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type as SuggestionType)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                activeFilter === type
                  ? `${config.bgColor} ${config.color}`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {config.icon} {config.label}
            </button>
          ))}
        </div>

        {/* 設置選項 */}
        <div className="flex items-center space-x-4 text-sm">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showImplemented}
              onChange={(e) => setShowImplemented(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">顯示已實施</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-gray-700 dark:text-gray-300">自動刷新</span>
          </label>
        </div>
      </div>

      {/* 建議列表 */}
      <div className="p-6">
        {sortedSuggestions.length === 0 ? (
          <div className="text-center py-12">
            <LightBulbIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {isGenerating ? 'AI 正在分析您的工作模式...' : '暫無建議，請稍後刷新'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {sortedSuggestions.map((suggestion) => {
                const typeConfig = SUGGESTION_TYPES[suggestion.type];
                
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`border rounded-lg p-4 ${
                      suggestion.isImplemented 
                        ? 'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* 建議標題 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
                          <span className="text-lg">{typeConfig.icon}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {suggestion.title}
                            </h3>
                            
                            {/* 優先級標籤 */}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              suggestion.priority === 'urgent' 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : suggestion.priority === 'high'
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                : suggestion.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                            }`}>
                              {suggestion.priority === 'urgent' ? '緊急' : 
                               suggestion.priority === 'high' ? '高' :
                               suggestion.priority === 'medium' ? '中' : '低'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {suggestion.description}
                          </p>
                          
                          {/* 指標 */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <CpuChipIcon className="w-3 h-3" />
                              <span>{suggestion.aiModel === 'claude-3-5-sonnet' ? 'Claude 4.0' : 'ChatGPT 4.0'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ChartBarIcon className="w-3 h-3" />
                              <span>信心度: {Math.round(suggestion.confidence * 100)}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ClockIcon className="w-3 h-3" />
                              <span>預計: {suggestion.timeToImplement}分鐘</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>影響: {suggestion.estimatedImpact}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI 推理 */}
                    <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        AI 分析推理
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {suggestion.reasoning}
                      </p>
                    </div>

                    {/* 行動步驟 */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        實施步驟
                      </h4>
                      <ol className="space-y-1">
                        {suggestion.actionSteps.map((step, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium mr-2 mt-0.5 flex-shrink-0">
                              {idx + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* 操作按鈕 */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center space-x-2">
                        {!suggestion.isImplemented && (
                          <>
                            <button
                              onClick={() => handleFeedback(suggestion.id, 'implemented')}
                              className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>已實施</span>
                            </button>
                            
                            <button
                              onClick={() => handleFeedback(suggestion.id, 'helpful')}
                              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                            >
                              <span>👍</span>
                              <span>有用</span>
                            </button>
                            
                            <button
                              onClick={() => handleFeedback(suggestion.id, 'not_helpful')}
                              className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm transition-colors"
                            >
                              <span>👎</span>
                              <span>無用</span>
                            </button>
                          </>
                        )}
                        
                        {suggestion.isImplemented && (
                          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="w-4 h-4" />
                            <span className="text-sm font-medium">已實施</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        {suggestion.createdAt.toLocaleTimeString()}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartSuggestionEngine;