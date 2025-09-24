import React from 'react';
import { motion } from 'framer-motion';
import { 
  CogIcon, 
  InformationCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';

// 定義模型配置類型
interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  responseFormat: 'text' | 'json' | 'structured';
  safetyLevel: 'low' | 'standard' | 'high';
  cacheEnabled: boolean;
  streamEnabled: boolean;
}

interface ModelConfigPanelProps {
  modelId: string;
  config: ModelConfig;
  onConfigChange: (config: ModelConfig) => void;
  className?: string;
}

export const ModelConfigPanel: React.FC<ModelConfigPanelProps> = ({
  modelId,
  config,
  onConfigChange,
  className = ''
}) => {
  const handleConfigChange = (key: keyof ModelConfig, value: any) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  const presets = [
    {
      name: '創意寫作',
      icon: '✨',
      config: {
        temperature: 0.9,
        maxTokens: 3000,
        topP: 0.95,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3
      }
    },
    {
      name: '分析推理',
      icon: '🧠',
      config: {
        temperature: 0.3,
        maxTokens: 2000,
        topP: 0.8,
        frequencyPenalty: 0,
        presencePenalty: 0
      }
    },
    {
      name: '代碼生成',
      icon: '💻',
      config: {
        temperature: 0.1,
        maxTokens: 4000,
        topP: 0.7,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      }
    },
    {
      name: '平衡模式',
      icon: '⚖️',
      config: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0,
        presencePenalty: 0
      }
    }
  ];

  const applyPreset = (preset: any) => {
    onConfigChange({
      ...config,
      ...preset.config
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-4 ${className}`}
    >
      {/* 標題 */}
      <div className="flex items-center space-x-2 mb-4">
        <CogIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">模型配置</h4>
        <div className="flex-1"></div>
        <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
          {modelId}
        </span>
      </div>

      {/* 預設配置 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">快速預設</label>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset, index) => (
            <motion.button
              key={index}
              onClick={() => applyPreset(preset)}
              className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{preset.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 基本參數 */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <BoltIcon className="w-4 h-4" />
          <span>基本參數</span>
        </h5>

        {/* 溫度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">溫度 (Temperature)</label>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{config.temperature}</span>
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
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>保守</span>
            <span>創意</span>
          </div>
        </div>

        {/* 最大Token數 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">最大Token數</label>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{config.maxTokens}</span>
          </div>
          <input
            type="range"
            min="100"
            max="8000"
            step="100"
            value={config.maxTokens}
            onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Top P */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">Top P</label>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{config.topP}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={config.topP}
            onChange={(e) => handleConfigChange('topP', parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* 頻率懲罰 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">頻率懲罰</label>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{config.frequencyPenalty}</span>
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
        </div>

        {/* 存在懲罰 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">存在懲罰</label>
            <span className="text-sm font-mono text-gray-500 dark:text-gray-400">{config.presencePenalty}</span>
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
        </div>
      </div>

      {/* 高級設置 */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
          <CpuChipIcon className="w-4 h-4" />
          <span>高級設置</span>
        </h5>

        {/* 回應格式 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">回應格式</label>
          <select
            value={config.responseFormat}
            onChange={(e) => handleConfigChange('responseFormat', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="text">純文本</option>
            <option value="json">JSON格式</option>
            <option value="structured">結構化輸出</option>
          </select>
        </div>

        {/* 安全級別 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-1">
            <ShieldCheckIcon className="w-4 h-4" />
            <span>安全級別</span>
          </label>
          <select
            value={config.safetyLevel}
            onChange={(e) => handleConfigChange('safetyLevel', e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="low">低 - 較少限制</option>
            <option value="standard">標準 - 平衡安全性</option>
            <option value="high">高 - 嚴格過濾</option>
          </select>
        </div>

        {/* 系統提示詞 */}
        <div className="space-y-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">系統提示詞</label>
          <textarea
            value={config.systemPrompt}
            onChange={(e) => handleConfigChange('systemPrompt', e.target.value)}
            placeholder="輸入自定義系統提示詞..."
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
            rows={3}
          />
        </div>

        {/* 開關選項 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">啟用緩存</label>
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
            <label className="text-sm text-gray-600 dark:text-gray-400">串流回應</label>
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
      </div>

      {/* 信息提示 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">配置說明：</p>
            <ul className="space-y-1 text-xs">
              <li>• 溫度：控制回應的創意性和隨機性</li>
              <li>• Top P：控制詞彙選擇的多樣性</li>
              <li>• 懲罰參數：減少重複內容的生成</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
};