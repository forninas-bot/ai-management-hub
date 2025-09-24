import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CogIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  responseFormat: 'text' | 'json' | 'structured';
  safetyLevel: 'standard' | 'strict' | 'creative';
  cacheEnabled: boolean;
  streamEnabled: boolean;
}

interface ModelConfigPanelProps {
  modelId: string;
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
  className?: string;
}

const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({
  modelId,
  config,
  onConfigChange,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'safety'>('basic');
  const [presets, setPresets] = useState<Record<string, Partial<ModelConfig>>>({});

  useEffect(() => {
    // 載入預設配置
    const defaultPresets = {
      creative: {
        temperature: 0.9,
        topP: 0.95,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3,
        safetyLevel: 'creative' as const
      },
      balanced: {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        safetyLevel: 'standard' as const
      },
      precise: {
        temperature: 0.2,
        topP: 0.8,
        frequencyPenalty: 0,
        presencePenalty: 0,
        safetyLevel: 'strict' as const
      },
      coding: {
        temperature: 0.1,
        topP: 0.95,
        frequencyPenalty: 0,
        presencePenalty: 0,
        responseFormat: 'structured' as const,
        safetyLevel: 'standard' as const
      }
    };
    setPresets(defaultPresets);
  }, []);

  const handleConfigChange = (key: keyof ModelConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    onConfigChange(newConfig);
  };

  const applyPreset = (presetName: string) => {
    const preset = presets[presetName];
    if (preset) {
      const newConfig = { ...config, ...preset };
      onConfigChange(newConfig);
    }
  };

  const getModelInfo = (modelId: string) => {
    const modelMap: Record<string, { name: string; provider: string; maxContext: number }> = {
      'gpt-4o': { name: 'GPT-4o', provider: 'OpenAI', maxContext: 128000 },
      'gpt-4o-mini': { name: 'GPT-4o Mini', provider: 'OpenAI', maxContext: 128000 },
      'claude-3-5-sonnet-20241022': { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', maxContext: 200000 },
      'claude-3-5-haiku-20241022': { name: 'Claude 3.5 Haiku', provider: 'Anthropic', maxContext: 200000 }
    };
    return modelMap[modelId] || { name: '未知模型', provider: '未知', maxContext: 4000 };
  };

  const modelInfo = getModelInfo(modelId);

  const tabs = [
    { id: 'basic', name: '基本設置', icon: AdjustmentsHorizontalIcon },
    { id: 'advanced', name: '高級參數', icon: CogIcon },
    { id: 'safety', name: '安全設置', icon: ShieldCheckIcon }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}>
      {/* 標題欄 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              模型配置
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {modelInfo.name} ({modelInfo.provider})
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="w-4 h-4" />
            <span>上下文: {modelInfo.maxContext.toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* 預設配置快捷按鈕 */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-3">
          <SparklesIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">快速預設</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(presets).map((presetName) => (
            <motion.button
              key={presetName}
              onClick={() => applyPreset(presetName)}
              className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors duration-150"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {presetName === 'creative' && '🎨 創意'}
              {presetName === 'balanced' && '⚖️ 平衡'}
              {presetName === 'precise' && '🎯 精確'}
              {presetName === 'coding' && '💻 編程'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 標籤頁 */}
      <div className="px-6 py-4">
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>

        {/* 基本設置 */}
        {activeTab === 'basic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 溫度設置 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  創造性 (Temperature)
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.temperature}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.temperature}
                onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>保守</span>
                <span>創新</span>
              </div>
            </div>

            {/* 最大 Token 數 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  最大回應長度
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.maxTokens} tokens
                </span>
              </div>
              <input
                type="range"
                min="100"
                max={Math.min(modelInfo.maxContext, 4000)}
                step="100"
                value={config.maxTokens}
                onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>簡短</span>
                <span>詳細</span>
              </div>
            </div>

            {/* 回應格式 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                回應格式
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['text', 'json', 'structured'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => handleConfigChange('responseFormat', format)}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-150 ${
                      config.responseFormat === format
                        ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {format === 'text' && '📝 文本'}
                    {format === 'json' && '🔧 JSON'}
                    {format === 'structured' && '📋 結構化'}
                  </button>
                ))}
              </div>
            </div>

            {/* 系統提示詞 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                系統提示詞
              </label>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
                placeholder="輸入系統提示詞來定義AI的行為和角色..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </motion.div>
        )}

        {/* 高級參數 */}
        {activeTab === 'advanced' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Top P */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  核心採樣 (Top P)
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.topP}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={config.topP}
                onChange={(e) => handleConfigChange('topP', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>聚焦</span>
                <span>多樣</span>
              </div>
            </div>

            {/* 頻率懲罰 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  頻率懲罰
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.frequencyPenalty}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.frequencyPenalty}
                onChange={(e) => handleConfigChange('frequencyPenalty', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>允許重複</span>
                <span>避免重複</span>
              </div>
            </div>

            {/* 存在懲罰 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  存在懲罰
                </label>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {config.presencePenalty}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.presencePenalty}
                onChange={(e) => handleConfigChange('presencePenalty', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>專注主題</span>
                <span>探索新話題</span>
              </div>
            </div>

            {/* 功能開關 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    啟用緩存
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    提高相似請求的回應速度
                  </p>
                </div>
                <button
                  onClick={() => handleConfigChange('cacheEnabled', !config.cacheEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    config.cacheEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      config.cacheEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    串流回應
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    即時顯示AI回應內容
                  </p>
                </div>
                <button
                  onClick={() => handleConfigChange('streamEnabled', !config.streamEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    config.streamEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      config.streamEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* 安全設置 */}
        {activeTab === 'safety' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* 安全級別 */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                安全級別
              </label>
              <div className="space-y-3">
                {([
                  { value: 'creative', label: '創意模式', desc: '較少限制，允許更多創意表達', icon: '🎨' },
                  { value: 'standard', label: '標準模式', desc: '平衡安全性和實用性', icon: '⚖️' },
                  { value: 'strict', label: '嚴格模式', desc: '最高安全標準，適合敏感環境', icon: '🛡️' }
                ] as const).map((level) => (
                  <div
                    key={level.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors duration-150 ${
                      config.safetyLevel === level.value
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onClick={() => handleConfigChange('safetyLevel', level.value)}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{level.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {level.label}
                          </h4>
                          {config.safetyLevel === level.value && (
                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                              已選擇
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {level.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 安全提醒 */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    安全提醒
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    請確保您的使用符合相關法律法規和平台政策。AI模型的輸出可能包含不準確或有偏見的信息，請謹慎使用。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* 底部操作欄 */}
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>預估延遲: ~2-5秒</span>
            </div>
            <div className="flex items-center space-x-1">
              <CurrencyDollarIcon className="w-4 h-4" />
              <span>成本: 中等</span>
            </div>
          </div>
          <button
            onClick={() => {
              // 重置為默認配置
              const defaultConfig: ModelConfig = {
                temperature: 0.7,
                maxTokens: 1000,
                topP: 0.9,
                frequencyPenalty: 0.1,
                presencePenalty: 0.1,
                systemPrompt: '',
                responseFormat: 'text',
                safetyLevel: 'standard',
                cacheEnabled: true,
                streamEnabled: true
              };
              onConfigChange(defaultConfig);
            }}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-150"
          >
            重置為默認
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigPanel;