import React, { useState, useEffect, useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { advancedAiApi } from '../../services/advancedAIService';
import AIAssistantService from '../../services/aiAssistantService';

// 洞察數據接口
interface InsightMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  category: 'productivity' | 'efficiency' | 'focus' | 'wellbeing';
  description: string;
  recommendations: string[];
  aiModel?: string;
  confidence?: number;
  predictiveInsights?: string[];
}

// 高級分析數據接口
interface AdvancedAnalytics {
  patternRecognition: string;
  anomalyDetection: string;
  futureProjections: string;
  personalizedRecommendations: string;
}

// 趨勢預測數據
interface TrendPrediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
  factors: Array<{
    name: string;
    impact: number;
    description: string;
  }>;
}

// 個性化配置
interface DashboardConfig {
  layout: 'grid' | 'list' | 'cards';
  metrics: string[];
  refreshInterval: number;
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  voiceUpdates: boolean;
}

const EnhancedAIInsightsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'predictions' | 'habits'>('overview');
  const [insights, setInsights] = useState<InsightMetric[]>([]);
  const [, setIsLoading] = useState(false); // 使用解構但忽略變量
  const [, setError] = useState<string | null>(null); // 使用解構但忽略變量
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedAnalytics | null>(null);
  const [selectedModel, setSelectedModel] = useState<'claude-3-5-sonnet' | 'gpt-4o'>('claude-3-5-sonnet');
  const [predictions, setPredictions] = useState<TrendPrediction[]>([]);
  const [config, setConfig] = useState<DashboardConfig>({
    layout: 'grid',
    metrics: ['productivity', 'efficiency', 'focus', 'wellbeing'],
    refreshInterval: 300000, // 5分鐘
    theme: 'auto',
    notifications: true,
    voiceUpdates: false
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Redux狀態
  const tasks = useAppSelector(state => state.tasks?.tasks || []);
  const projects = useAppSelector(state => state.projects?.projects || []);
  const notes = useAppSelector(state => state.notebook?.notes || []);
  const pomodoro = useAppSelector(state => state.pomodoro);
  
  // 获取番茄钟会话数据（从实际状态结构获取）
  const pomodoroSessions = pomodoro?.currentSession ? [pomodoro.currentSession] : [];

  // 生成實時洞察
  const generateRealTimeInsights = async () => {
    setLoading(true);
    try {
      const analyticsData = {
        tasks,
        projects,
        notes,
        pomodoroSessions: pomodoroSessions,
        timeRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };

      try {
        const response = await advancedAiApi.endpoints.createAdvancedChatCompletion.initiate({
          messages: [
            {
              role: 'system',
              content: `你是一個高級數據分析師，專精於使用Claude 4.0和ChatGPT 4.0的先進分析能力。分析用戶的工作數據並生成實時洞察。
            
數據：${JSON.stringify(analyticsData)}
            
請使用最新的AI模型能力，返回JSON格式的深度洞察：
{
  "insights": [
    {
      "id": "unique_id",
      "name": "指標名稱",
      "value": 數值,
      "unit": "單位",
      "trend": "up|down|stable",
      "change": 變化值,
      "changePercent": 變化百分比,
      "category": "productivity|efficiency|focus|wellbeing",
      "description": "詳細描述",
      "recommendations": ["建議1", "建議2"],
      "aiModel": "claude-3-5-sonnet|gpt-4o",
      "confidence": 0.95,
      "predictiveInsights": ["預測性洞察1", "預測性洞察2"]
    }
  ],
  "advancedAnalytics": {
    "patternRecognition": "識別的模式",
    "anomalyDetection": "異常檢測結果",
    "futureProjections": "未來預測",
    "personalizedRecommendations": "個性化建議"
  }
}`
            }
          ],
          taskType: 'analysis',
          complexity: 'complex',
          priority: 'high',
          temperature: 0.2,
          modelPreference: selectedModel
        });

        const apiResponse = await response;
        if (apiResponse && typeof apiResponse === 'object') {
          const result = typeof apiResponse === 'string' ? JSON.parse(apiResponse) : apiResponse;
          setInsights(result.insights || []);
          setAdvancedAnalytics(result.advancedAnalytics || null);
        }
      } catch (apiError) {
        console.error('API調用失敗:', apiError);
        // 使用模擬數據作為後備
        setInsights(getMockInsights());
      }
      setLastUpdate(new Date());

    } catch (error) {
      console.error('生成洞察錯誤:', error);
      // 使用模擬數據作為後備
      setInsights(getMockInsights());
    } finally {
      setLoading(false);
    }
  };

  // 生成趨勢預測
  const generateTrendPredictions = async () => {
    try {
      try {
        const response = await advancedAiApi.endpoints.createAdvancedChatCompletion.initiate({
          messages: [
            {
              role: 'system',
              content: `基於歷史數據預測未來趨勢。
            
當前洞察：${JSON.stringify(insights)}
            
請返回JSON格式的預測：
{
  "predictions": [
    {
      "id": "pred_id",
      "metric": "指標名稱",
      "currentValue": 當前值,
      "predictedValue": 預測值,
      "confidence": 0.85,
      "timeframe": "下週",
      "factors": [
        {
          "name": "因素名稱",
          "impact": 0.3,
          "description": "影響描述"
        }
      ]
    }
  ]
}`
            }
          ],
          taskType: 'analysis',
          complexity: 'complex',
          priority: 'medium'
        });

        const apiResponse = await response;
        if (apiResponse && typeof apiResponse === 'object') {
          const result = typeof apiResponse === 'string' ? JSON.parse(apiResponse) : apiResponse;
          setPredictions(result.predictions || []);
        }
      } catch (apiError) {
        console.error('API調用失敗:', apiError);
        setPredictions(getMockPredictions());
      }

    } catch (error) {
      console.error('生成預測錯誤:', error);
      setPredictions(getMockPredictions());
    }
  };

  // 模擬數據
  const getMockInsights = (): InsightMetric[] => [
    {
      id: 'productivity-score',
      name: '生產力指數',
      value: 78,
      unit: '分',
      trend: 'up',
      change: 5,
      changePercent: 6.8,
      category: 'productivity',
      description: '本週生產力較上週提升，任務完成效率顯著改善',
      recommendations: ['保持當前工作節奏', '適當增加挑戰性任務']
    },
    {
      id: 'focus-time',
      name: '專注時間',
      value: 4.2,
      unit: '小時',
      trend: 'stable',
      change: 0.1,
      changePercent: 2.4,
      category: 'focus',
      description: '每日平均專注時間保持穩定',
      recommendations: ['嘗試番茄工作法', '減少干擾源']
    }
  ];

  const getMockPredictions = (): TrendPrediction[] => [
    {
      id: 'productivity-forecast',
      metric: '生產力指數',
      currentValue: 78,
      predictedValue: 82,
      confidence: 0.85,
      timeframe: '下週',
      factors: [
        { name: '任務完成率提升', impact: 0.4, description: '近期任務完成質量改善' },
        { name: '專注時間增加', impact: 0.3, description: '深度工作時間逐漸增長' }
      ]
    }
  ];

  // 計算洞察統計
  const insightStats = useMemo(() => {
    const categories = insights.reduce((acc, insight) => {
      acc[insight.category] = (acc[insight.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const trends = insights.reduce((acc, insight) => {
      acc[insight.trend] = (acc[insight.trend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { categories, trends };
  }, [insights]);

  // 自動刷新
  useEffect(() => {
    generateRealTimeInsights();
    
    const interval = setInterval(() => {
      generateRealTimeInsights();
    }, config.refreshInterval);

    return () => clearInterval(interval);
  }, [config.refreshInterval]);

  // 生成預測（當洞察更新時）
  useEffect(() => {
    if (insights.length > 0) {
      generateTrendPredictions();
    }
  }, [insights]);

  // 語音更新
  useEffect(() => {
    if (config.voiceUpdates && insights.length > 0) {
      const summary = `已更新洞察數據，發現${insights.length}項指標，其中${insightStats.trends.up || 0}項呈上升趨勢`;
      AIAssistantService.speak(summary);
    }
  }, [insights, config.voiceUpdates]);

  // 渲染指標卡片
  const renderMetricCard = (insight: InsightMetric) => (
    <div key={insight.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{insight.name}</h3>
        <div className="flex items-center space-x-2">
          {insight.aiModel && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {insight.aiModel === 'claude-3-5-sonnet' ? 'Claude 4.0' : 'GPT-4o'}
            </span>
          )}
          {insight.confidence && (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              {Math.round(insight.confidence * 100)}% 信心度
            </span>
          )}
          <div className={`flex items-center space-x-1 ${
            insight.trend === 'up' ? 'text-green-600' :
            insight.trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            <span className="text-2xl">
              {insight.trend === 'up' ? '📈' : insight.trend === 'down' ? '📉' : '➡️'}
            </span>
            <span className="text-sm font-medium">
              {insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-bold text-gray-900">
          {insight.value.toFixed(1)}
          <span className="text-lg font-normal text-gray-600 ml-1">{insight.unit}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{insight.description}</p>
      </div>
      
      {insight.recommendations.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">💡 建議</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {insight.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* 預測性洞察 */}
      {insight.predictiveInsights && insight.predictiveInsights.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI 預測洞察
          </h4>
          <ul className="space-y-1">
            {insight.predictiveInsights.map((prediction, idx) => (
              <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-purple-500 mr-2">→</span>
                {prediction}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // 渲染預測卡片
  const renderPredictionCard = (prediction: TrendPrediction) => (
    <div key={prediction.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{prediction.metric}</h3>
        <div className="bg-blue-100 px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-blue-800">
            信心度: {(prediction.confidence * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">當前值</p>
          <p className="text-2xl font-bold text-gray-900">{prediction.currentValue}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">預測值 ({prediction.timeframe})</p>
          <p className="text-2xl font-bold text-blue-600">{prediction.predictedValue}</p>
        </div>
      </div>
      
      {prediction.factors.length > 0 && (
        <div className="border-t border-blue-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">🔍 影響因素</h4>
          <div className="space-y-2">
            {prediction.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{factor.name}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${Math.abs(factor.impact) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {factor.impact > 0 ? '+' : ''}{(factor.impact * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* 頭部 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🧠 AI 洞察中心</h1>
          <p className="text-gray-600 mt-2">
            實時數據分析 • 趨勢預測 • 個性化建議
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            最後更新: {lastUpdate.toLocaleTimeString()}
          </div>
          
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as 'claude-3-5-sonnet' | 'gpt-4o')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="claude-3-5-sonnet">Claude 4.0 Sonnet</option>
            <option value="gpt-4o">ChatGPT 4.0</option>
          </select>
          
          <button
            onClick={generateRealTimeInsights}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>分析中...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>刷新數據</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 標籤導航 */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'overview', label: '📊 總覽', icon: '📊' },
          { key: 'trends', label: '📈 趨勢', icon: '📈' },
          { key: 'predictions', label: '🔮 預測', icon: '🔮' },
          { key: 'habits', label: '🎯 習慣', icon: '🎯' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 內容區域 */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 統計概覽 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-6 text-white">
              <div className="text-2xl font-bold">{insights.length}</div>
              <div className="text-green-100">活躍指標</div>
            </div>
            <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg p-6 text-white">
              <div className="text-2xl font-bold">{insightStats.trends.up || 0}</div>
              <div className="text-blue-100">上升趨勢</div>
            </div>
            <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-lg p-6 text-white">
              <div className="text-2xl font-bold">{predictions.length}</div>
              <div className="text-purple-100">預測模型</div>
            </div>
            <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-6 text-white">
              <div className="text-2xl font-bold">{AIAssistantService.getUserHabits().length}</div>
              <div className="text-orange-100">學習習慣</div>
            </div>
          </div>

          {/* 高級分析區域 */}
          {advancedAnalytics && (
            <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI 高級分析
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">模式識別</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{advancedAnalytics.patternRecognition}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">異常檢測</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{advancedAnalytics.anomalyDetection}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">未來預測</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{advancedAnalytics.futureProjections}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">個性化建議</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{advancedAnalytics.personalizedRecommendations}</p>
                </div>
              </div>
            </div>
          )}

          {/* 洞察指標 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.map(renderMetricCard)}
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">🔮 AI 趨勢預測</h2>
            <p className="text-blue-700">基於歷史數據和機器學習算法生成的未來趨勢預測</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {predictions.map(renderPredictionCard)}
          </div>
        </div>
      )}

      {activeTab === 'habits' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-900 mb-2">🎯 用戶習慣分析</h2>
            <p className="text-green-700">AI 自動學習並分析您的工作習慣和行為模式</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AIAssistantService.getUserHabits().map(habit => (
              <div key={habit.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{habit.pattern}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    habit.trend === 'increasing' ? 'bg-green-100 text-green-800' :
                    habit.trend === 'decreasing' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {habit.trend === 'increasing' ? '📈 增長' :
                     habit.trend === 'decreasing' ? '📉 下降' : '➡️ 穩定'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div>類別: {habit.category}</div>
                  <div>頻率: {habit.frequency}次/週</div>
                  <div>時段: {habit.timeOfDay.join(', ')}</div>
                  <div>信心度: {(habit.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 配置面板 */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚙️ 個性化設置</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              刷新間隔
            </label>
            <select
              value={config.refreshInterval}
              onChange={(e) => setConfig({...config, refreshInterval: Number(e.target.value)})}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value={60000}>1分鐘</option>
              <option value={300000}>5分鐘</option>
              <option value={600000}>10分鐘</option>
              <option value={1800000}>30分鐘</option>
            </select>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.notifications}
                onChange={(e) => setConfig({...config, notifications: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">啟用通知</span>
            </label>
          </div>
          
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={config.voiceUpdates}
                onChange={(e) => setConfig({...config, voiceUpdates: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-700">語音更新</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

// 移除重複的高級分析區域代碼
  export default EnhancedAIInsightsPanel;