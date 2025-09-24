import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
// import { AdvancedAIService } from '../services/advancedAIService'; // 暫時註解，因為未使用
import { AIAssistantService } from '../services/aiAssistantService';
import { AIPerformanceService } from '../services/aiPerformanceService';
import EnhancedAIInsightsPanel from '../components/EnhancedAIInsights/EnhancedAIInsightsPanel';
import SmartAssistant from '../components/ai/SmartAssistant';
import { Card, Button, StatCard, LoadingSpinner } from '../components/ui';

interface AIServiceStatus {
  name: string;
  status: 'active' | 'inactive' | 'error';
  performance: number;
  lastUpdate: string;
}

interface VoiceSettings {
  enabled: boolean;
  language: string;
  voice: string;
  speed: number;
  volume: number;
}

const AIManagementCenter: React.FC = () => {
  // const dispatch = useAppDispatch(); // 暫時註解，因為未使用
  const aiSettings = useAppSelector(state => state.settings.aiSettings);
  const [activeTab, setActiveTab] = useState<'overview' | 'assistant' | 'insights' | 'performance' | 'settings'>('overview');
  const [serviceStatus, setServiceStatus] = useState<AIServiceStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: false,
    language: 'zh-TW',
    voice: 'default',
    speed: 1.0,
    volume: 0.8
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    cacheHitRate: 0,
    errorRate: 0
  });

  useEffect(() => {
    initializeAIServices();
    loadPerformanceMetrics();
  }, []);

  const initializeAIServices = async () => {
    setIsLoading(true);
    try {
      // 初始化AI服務狀態
      const services: AIServiceStatus[] = [
        {
          name: '高級AI服務',
          status: 'active',
          performance: 95,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'AI助手服務',
          status: 'active',
          performance: 88,
          lastUpdate: new Date().toISOString()
        },
        {
          name: 'AI洞察分析',
          status: 'active',
          performance: 92,
          lastUpdate: new Date().toISOString()
        },
        {
          name: '性能優化服務',
          status: 'active',
          performance: 97,
          lastUpdate: new Date().toISOString()
        }
      ];
      setServiceStatus(services);
    } catch (error) {
      console.error('初始化AI服務失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      // 模擬性能指標數據
      setPerformanceMetrics({
        totalRequests: 1247,
        averageResponseTime: 850,
        cacheHitRate: 78.5,
        errorRate: 0.2
      });
    } catch (error) {
      console.error('載入性能指標失敗:', error);
    }
  };

  const handleVoiceToggle = async () => {
    try {
      const newEnabled = !voiceSettings.enabled;
      setVoiceSettings(prev => ({ ...prev, enabled: newEnabled }));
      
      if (newEnabled) {
        // 啟用語音功能
        await AIAssistantService.initialize();
        console.log('語音功能已啟用');
      } else {
        // 停用語音功能
        AIAssistantService.stopListening();
        console.log('語音功能已停用');
      }
    } catch (error) {
      console.error('語音設定失敗:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await AIPerformanceService.clearAllCache();
      loadPerformanceMetrics();
    } catch (error) {
      console.error('清除快取失敗:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const tabs = [
    { id: 'overview', label: '總覽', icon: '📊' },
    { id: 'assistant', label: 'AI助手', icon: '🤖' },
    { id: 'insights', label: '智能洞察', icon: '🔮' },
    { id: 'performance', label: '性能監控', icon: '⚡' },
    { id: 'settings', label: '設定', icon: '⚙️' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      {/* 頁面標題 */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🧠 AI管理中心
            </h1>
            <p className="text-gray-600 mt-1">統一管理和監控所有AI功能服務</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">系統運行正常</span>
            </div>
          </div>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white/60 backdrop-blur-sm">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-lg transform scale-105'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 主要內容區域 */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* 服務狀態概覽 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="總請求數"
                value={performanceMetrics.totalRequests.toLocaleString()}
                icon="📈"
                trend={{ direction: 'up' as const, value: '+12%' }}
              />
              <StatCard
                title="平均響應時間"
                value={`${performanceMetrics.averageResponseTime}ms`}
                icon="⚡"
                trend={{ direction: 'down' as const, value: '-5%' }}
              />
              <StatCard
                title="快取命中率"
                value={`${performanceMetrics.cacheHitRate}%`}
                icon="🎯"
                trend={{ direction: 'up' as const, value: '+3%' }}
              />
              <StatCard
                title="錯誤率"
                value={`${performanceMetrics.errorRate}%`}
                icon="🛡️"
                trend={{ direction: 'down' as const, value: '-0.1%' }}
              />
            </div>

            {/* 服務狀態列表 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🔧</span>
                服務狀態監控
              </h3>
              <div className="space-y-3">
                {serviceStatus.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status === 'active' ? '運行中' : service.status === 'inactive' ? '停用' : '錯誤'}
                      </div>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        性能: {service.performance}%
                      </div>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${service.performance}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'assistant' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🤖</span>
                AI助手控制台
              </h3>
              
              {/* 語音設定 */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">語音交互</h4>
                    <p className="text-sm text-gray-600">啟用語音識別和語音合成功能</p>
                  </div>
                  <button
                    onClick={handleVoiceToggle}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      voiceSettings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      voiceSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                {voiceSettings.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">語言</label>
                      <select 
                        value={voiceSettings.language}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, language: e.target.value }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="zh-TW">繁體中文</option>
                        <option value="zh-CN">簡體中文</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">語速</label>
                      <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={voiceSettings.speed}
                        onChange={(e) => setVoiceSettings(prev => ({ ...prev, speed: parseFloat(e.target.value) }))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-500">{voiceSettings.speed}x</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* AI助手組件 */}
              <SmartAssistant />
            </Card>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">🔮</span>
                智能洞察分析
              </h3>
              <EnhancedAIInsightsPanel />
            </Card>
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">⚡</span>
                性能監控與優化
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 快取管理 */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium mb-2">快取管理</h4>
                  <p className="text-sm text-gray-600 mb-4">管理AI服務的快取系統</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">快取命中率</span>
                    <span className="font-medium">{performanceMetrics.cacheHitRate}%</span>
                  </div>
                  <Button
                    onClick={handleClearCache}
                    size="sm"
                    className="w-full border border-gray-300 hover:bg-gray-50"
                  >
                    清除快取
                  </Button>
                </div>
                
                {/* 並行處理 */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium mb-2">並行處理</h4>
                  <p className="text-sm text-gray-600 mb-4">監控並行任務執行狀況</p>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">活躍任務</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">隊列任務</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <span className="mr-2">⚙️</span>
                AI服務設定
              </h3>
              
              <div className="space-y-6">
                {/* 模型設定 */}
                <div>
                  <h4 className="font-medium mb-3">AI模型配置</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">預設模型</label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="claude-3">Claude 3</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">溫度設定</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        defaultValue="0.7"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 性能設定 */}
                <div>
                  <h4 className="font-medium mb-3">性能優化</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      啟用智能快取
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      啟用並行處理
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      啟用預載入
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIManagementCenter;