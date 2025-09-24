import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  CpuChipIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  CodeBracketIcon,
  PhotoIcon,
  MicrophoneIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// 導入新開發的AI組件
import MultimodalChat from '../components/MultimodalChat';
import CodeGenerator from '../components/ai/CodeGenerator';
import SmartSuggestionEngine from '../components/ai/SmartSuggestionEngine';
import MultimodalInterface from '../components/ai/MultimodalInterface';
import EnhancedAIInsightsPanel from '../components/EnhancedAIInsights/EnhancedAIInsightsPanel';

// AI功能類型
type AIFeatureType = 
  | 'chat' 
  | 'code' 
  | 'suggestions' 
  | 'multimodal' 
  | 'insights'
  | 'overview';

// AI功能配置
const AI_FEATURES = {
  overview: {
    title: '功能概覽',
    description: '探索我們的AI功能套件',
    icon: SparklesIcon,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
  },
  chat: {
    title: '多模態聊天',
    description: '支持文本、語音、圖像的智能對話',
    icon: ChatBubbleLeftRightIcon,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
  },
  code: {
    title: 'AI代碼生成',
    description: '智能代碼生成和優化建議',
    icon: CodeBracketIcon,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
  },
  suggestions: {
    title: '智能建議',
    description: '基於AI的個性化工作建議',
    icon: LightBulbIcon,
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20'
  },
  multimodal: {
    title: '多模態輸入',
    description: '支持多種媒體類型的AI處理',
    icon: PhotoIcon,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20'
  },
  insights: {
    title: 'AI洞察分析',
    description: '深度數據分析和預測洞察',
    icon: ChartBarIcon,
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20'
  }
};

// 模擬用戶上下文
const mockUserContext = {
  currentTask: '開發AI管理中心',
  recentActivities: [
    '完成多模態聊天組件',
    '實現代碼生成功能',
    '優化AI洞察面板',
    '集成智能建議引擎'
  ],
  workingHours: { start: 9, end: 18 },
  preferences: {
    workStyle: 'focused' as const,
    notificationLevel: 'moderate' as const,
    learningGoals: ['React開發', 'AI集成', 'TypeScript進階']
  },
  performanceMetrics: {
    productivity: 8.5,
    focus: 7.8,
    efficiency: 8.2,
    wellbeing: 7.5
  }
};

const AIShowcase: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<AIFeatureType>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // 功能統計
  const [stats, setStats] = useState({
    totalInteractions: 1247,
    codeGenerated: 89,
    suggestionsImplemented: 156,
    insightsGenerated: 234
  });

  // 模擬統計更新
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        totalInteractions: prev.totalInteractions + Math.floor(Math.random() * 3),
        codeGenerated: prev.codeGenerated + (Math.random() > 0.8 ? 1 : 0),
        suggestionsImplemented: prev.suggestionsImplemented + (Math.random() > 0.9 ? 1 : 0),
        insightsGenerated: prev.insightsGenerated + (Math.random() > 0.7 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 渲染功能概覽
  const renderOverview = () => (
    <div className="space-y-8">
      {/* 歡迎區域 */}
      <div className="text-center py-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <SparklesIcon className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">AI 功能展示中心</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            體驗下一代AI技術，包括多模態交互、智能代碼生成、個性化建議和深度洞察分析
          </p>
        </motion.div>
      </div>

      {/* 統計數據 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {stats.totalInteractions.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">總互動次數</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {stats.codeGenerated}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">代碼生成次數</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            {stats.suggestionsImplemented}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">建議已實施</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
        >
          <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            {stats.insightsGenerated}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">洞察已生成</div>
        </motion.div>
      </div>

      {/* 功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(AI_FEATURES).filter(([key]) => key !== 'overview').map(([key, feature], index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`${feature.bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700`}
              onClick={() => setActiveFeature(key as AIFeatureType)}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-lg flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {feature.description}
              </p>
              
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <span>立即體驗</span>
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 技術特色 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          技術特色
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CpuChipIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Claude 4.0 & ChatGPT 4.0
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              集成最新的大語言模型，提供卓越的AI能力
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhotoIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              多模態處理
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              支持文本、圖像、語音、視頻等多種輸入方式
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LightBulbIcon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              智能個性化
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              基於用戶行為和偏好提供個性化的AI體驗
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染活動功能
  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'overview':
        return renderOverview();
        
      case 'chat':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                多模態聊天體驗
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                與AI進行自然對話，支持文本、語音、圖像等多種交互方式
              </p>
            </div>
            <MultimodalChat 
              onSendMessage={(message: string, attachments?: any[], selectedModel?: string, modelConfig?: any) => {
                console.log('發送消息:', { message, attachments, selectedModel, modelConfig });
              }}
            />
          </div>
        );
        
      case 'code':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI 代碼生成器
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                描述您的需求，AI將為您生成高質量的代碼
              </p>
            </div>
            <CodeGenerator />
          </div>
        );
        
      case 'suggestions':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                智能建議引擎
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                基於您的工作模式，AI提供個性化的效率提升建議
              </p>
            </div>
            <SmartSuggestionEngine 
              userContext={mockUserContext}
              onSuggestionImplemented={(suggestion) => {
                console.log('建議已實施:', suggestion);
              }}
              onFeedback={(id, feedback) => {
                console.log('用戶反饋:', id, feedback);
              }}
            />
          </div>
        );
        
      case 'multimodal':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                多模態輸入界面
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                上傳和處理各種類型的媒體文件，獲得AI分析結果
              </p>
            </div>
            <MultimodalInterface 
              onMediaSubmit={(items) => {
                console.log('媒體已提交:', items);
              }}
              onMediaAnalysis={async (item) => {
                // 模擬AI分析
                await new Promise(resolve => setTimeout(resolve, 2000));
                return {
                  ...item,
                  aiAnalysis: {
                    description: '這是一個示例AI分析結果',
                    tags: ['示例', 'AI分析', '測試'],
                    confidence: 0.85,
                    extractedText: item.type === 'image' ? '檢測到的文本內容' : undefined,
                    emotions: item.type === 'image' ? ['快樂', '專注'] : undefined,
                    objects: item.type === 'image' ? ['電腦', '桌子', '書籍'] : undefined
                  }
                };
              }}
            />
          </div>
        );
        
      case 'insights':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI 洞察分析
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                深度分析您的數據，提供預測性洞察和建議
              </p>
            </div>
            <EnhancedAIInsightsPanel />
          </div>
        );
        
      default:
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 導航欄 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveFeature('overview')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeFeature === 'overview'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
              >
                <SparklesIcon className="w-5 h-5" />
                <span className="font-medium">AI 展示中心</span>
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {Object.entries(AI_FEATURES).filter(([key]) => key !== 'overview').map(([key, feature]) => {
                const Icon = feature.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveFeature(key as AIFeatureType)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      activeFeature === key
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{feature.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 主內容區域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeFeature}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderActiveFeature()}
        </motion.div>
      </div>
    </div>
  );
};

export default AIShowcase;