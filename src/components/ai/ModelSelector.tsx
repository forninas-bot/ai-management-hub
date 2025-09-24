import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  CpuChipIcon, 
  SparklesIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { AdvancedAIModel } from '../../services/advancedAIService';
import { ModelSelector as ModelSelectorType } from '../../services/nextGenAIService';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  taskType?: 'chat' | 'analysis' | 'coding' | 'creative' | 'reasoning' | 'multimodal';
  requirements?: {
    speed: 'fast' | 'balanced' | 'thorough';
    quality: 'good' | 'high' | 'premium';
    cost: 'low' | 'medium' | 'high';
    privacy: 'standard' | 'enhanced' | 'maximum';
  };
  className?: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  taskType = 'chat',
  requirements = {
    speed: 'balanced',
    quality: 'high',
    cost: 'medium',
    privacy: 'standard'
  },
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<AdvancedAIModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<AdvancedAIModel[]>([]);

  // 模擬獲取模型列表
  useEffect(() => {
    const availableModels: AdvancedAIModel[] = [
      {
        id: 'gpt-4o',
        name: 'GPT-4o (ChatGPT 4.0)',
        provider: 'openai',
        version: '2024-11-20',
        capabilities: {
          reasoning: 10,
          creativity: 9,
          speed: 9,
          accuracy: 10,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 128000,
        costPerToken: { input: 0.0025, output: 0.01 },
        rateLimit: { requestsPerMinute: 10000, tokensPerMinute: 800000 }
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        provider: 'openai',
        version: '2024-07-18',
        capabilities: {
          reasoning: 8,
          creativity: 8,
          speed: 10,
          accuracy: 9,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 128000,
        costPerToken: { input: 0.00015, output: 0.0006 },
        rateLimit: { requestsPerMinute: 30000, tokensPerMinute: 2000000 }
      },
      {
        id: 'claude-3-5-sonnet-20241022',
        name: 'Claude 3.5 Sonnet (Claude 4.0)',
        provider: 'anthropic',
        version: '20241022',
        capabilities: {
          reasoning: 10,
          creativity: 10,
          speed: 8,
          accuracy: 10,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 200000,
        costPerToken: { input: 0.003, output: 0.015 },
        rateLimit: { requestsPerMinute: 4000, tokensPerMinute: 400000 }
      },
      {
        id: 'claude-3-5-haiku-20241022',
        name: 'Claude 3.5 Haiku',
        provider: 'anthropic',
        version: '20241022',
        capabilities: {
          reasoning: 8,
          creativity: 7,
          speed: 10,
          accuracy: 9,
          multimodal: true,
          codeGeneration: true,
          mathSolving: true,
          languageSupport: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es', 'pt', 'ru', 'ar']
        },
        contextLength: 200000,
        costPerToken: { input: 0.0008, output: 0.004 },
        rateLimit: { requestsPerMinute: 5000, tokensPerMinute: 500000 }
      }
    ];

    setModels(availableModels);
    setFilteredModels(availableModels);
  }, []);

  // 根據任務類型和需求過濾模型
  useEffect(() => {
    let filtered = [...models];

    // 根據任務類型排序
    filtered.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      switch (taskType) {
        case 'coding':
          scoreA += a.capabilities.codeGeneration ? 20 : 0;
          scoreB += b.capabilities.codeGeneration ? 20 : 0;
          break;
        case 'reasoning':
          scoreA += a.capabilities.reasoning * 2;
          scoreB += b.capabilities.reasoning * 2;
          break;
        case 'creative':
          scoreA += a.capabilities.creativity * 2;
          scoreB += b.capabilities.creativity * 2;
          break;
        case 'multimodal':
          scoreA += a.capabilities.multimodal ? 25 : 0;
          scoreB += b.capabilities.multimodal ? 25 : 0;
          break;
      }

      // 根據需求調整分數
      if (requirements.speed === 'fast') {
        scoreA += a.capabilities.speed;
        scoreB += b.capabilities.speed;
      }
      if (requirements.quality === 'premium') {
        scoreA += a.capabilities.accuracy;
        scoreB += b.capabilities.accuracy;
      }
      if (requirements.cost === 'low') {
        scoreA += (1 / a.costPerToken.input) * 5;
        scoreB += (1 / b.costPerToken.input) * 5;
      }

      return scoreB - scoreA;
    });

    setFilteredModels(filtered);
  }, [models, taskType, requirements]);

  const selectedModelData = models.find(m => m.id === selectedModel);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      default:
        return '🔮';
    }
  };

  const getCapabilityColor = (value: number) => {
    if (value >= 9) return 'text-green-500';
    if (value >= 7) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatCost = (cost: number) => {
    return `$${(cost * 1000).toFixed(3)}/1K tokens`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* 選擇器按鈕 */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getProviderIcon(selectedModelData?.provider || 'openai')}</span>
          <div className="text-left">
            <div className="font-medium text-gray-900 dark:text-white">
              {selectedModelData?.name || '選擇AI模型'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedModelData?.provider === 'openai' ? 'OpenAI' : 'Anthropic'} • 
              {selectedModelData ? formatCost(selectedModelData.costPerToken.input) : ''}
            </div>
          </div>
        </div>
        <ChevronDownIcon 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </motion.button>

      {/* 下拉選單 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {/* 任務類型指示器 */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <SparklesIcon className="w-4 h-4" />
                <span>針對 {taskType} 任務優化排序</span>
              </div>
            </div>

            {/* 模型列表 */}
            <div className="py-2">
              {filteredModels.map((model, index) => (
                <motion.button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                    selectedModel === model.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl mt-1">{getProviderIcon(model.provider)}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {model.name}
                          </h3>
                          {selectedModel === model.id && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              已選擇
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {model.provider === 'openai' ? 'OpenAI' : 'Anthropic'} • 
                          版本 {model.version}
                        </div>

                        {/* 能力指標 */}
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <CpuChipIcon className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm font-medium ${getCapabilityColor(model.capabilities.reasoning)}`}>
                              推理 {model.capabilities.reasoning}/10
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="w-4 h-4 text-gray-400" />
                            <span className={`text-sm font-medium ${getCapabilityColor(model.capabilities.speed)}`}>
                              速度 {model.capabilities.speed}/10
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {formatCost(model.costPerToken.input)}
                            </span>
                          </div>
                        </div>

                        {/* 特殊能力標籤 */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {model.capabilities.multimodal && (
                            <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                              多模態
                            </span>
                          )}
                          {model.capabilities.codeGeneration && (
                            <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                              代碼生成
                            </span>
                          )}
                          {model.capabilities.mathSolving && (
                            <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                              數學解題
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 推薦指示器 */}
                    {index === 0 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
                        <SparklesIcon className="w-4 h-4" />
                        <span>推薦</span>
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* 底部信息 */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>所有模型均支援企業級安全和隱私保護</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 點擊外部關閉 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ModelSelector;