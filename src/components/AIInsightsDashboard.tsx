import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SmartAnalyticsService, ProductivityInsight, TrendAnalysis } from '../services/smartAnalyticsService';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// 添加辅助函数
const getMoodLabel = (sentimentData: any) => {
  const maxSentiment = Object.entries(sentimentData).reduce((max: [string, any], current: [string, any]) => 
    (current[1] as number) > (max[1] as number) ? current : max
  );
  
  const labels = { positive: '積極', neutral: '中性', negative: '消極' };
  return labels[maxSentiment[0] as keyof typeof labels];
};

const getMoodIcon = (sentimentData: any) => {
  const maxSentiment = Object.entries(sentimentData).reduce((max: [string, any], current: [string, any]) => 
    (current[1] as number) > (max[1] as number) ? current : max
  );
  
  const icons = { positive: '😊', neutral: '😐', negative: '😔' };
  return icons[maxSentiment[0] as keyof typeof icons];
};

const getMoodColor = (sentimentData: any) => {
  const maxSentiment = Object.entries(sentimentData).reduce((max: [string, any], current: [string, any]) => 
    (current[1] as number) > (max[1] as number) ? current : max
  );
  
  const colors = { positive: 'text-green-600', neutral: 'text-yellow-600', negative: 'text-red-600' };
  return colors[maxSentiment[0] as keyof typeof colors];
};

// 註冊 Chart.js 組件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AIInsightsDashboardProps {
  className?: string;
}

const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = ({ className }) => {
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [trends, setTrends] = useState<TrendAnalysis | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'insights' | 'trends' | 'knowledge'>('insights');

  // 從 Redux store 獲取數據
  const notes = useSelector((state: RootState) => state.notebook.notes);
  const tasks = useSelector((state: RootState) => state.tasks?.tasks || []);
  const projects = useSelector((state: RootState) => state.projects?.projects || []);
  const pomodoroSessions = useSelector((state: RootState) => {
    // 将dailyStats转换为PomodoroSession格式
    const dailyStats = state.pomodoro?.dailyStats || [];
    return dailyStats.map((stat: any) => ({
      id: `session-${stat.date}`,
      startTime: stat.date,
      endTime: stat.date,
      completedPomodoros: stat.completedPomodoros || 0,
      totalWorkTime: stat.totalWorkTime || 0,
      totalBreakTime: stat.totalBreakTime || 0,
      interruptions: []
    }));
  });

  useEffect(() => {
    loadAnalytics();
  }, [notes, tasks, projects, pomodoroSessions]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const analyticsData = {
        notes,
        tasks,
        projects,
        pomodoroSessions: pomodoroSessions || [],
        timeRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      };

      // 生成洞察
      const productivityInsights = await SmartAnalyticsService.generateProductivityInsights(analyticsData);
      setInsights(productivityInsights);

      // 生成趨勢分析
      const trendAnalysis = await SmartAnalyticsService.generateTrendAnalysis(analyticsData);
      setTrends(trendAnalysis[0] || null);

      // 構建知識圖譜
      const graph = await SmartAnalyticsService.buildKnowledgeGraph(analyticsData);
      setKnowledgeGraph(graph);

    } catch (error) {
      console.error('載入分析數據失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {insights.map((insight, index) => (
        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {insight.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {insight.priority === 'high' ? '高優先級' : insight.priority === 'medium' ? '中優先級' : '低優先級'}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {insight.description}
          </p>
          
          {insight.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">建議行動：</h4>
              <ul className="list-disc list-inside space-y-1">
                {insight.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 dark:text-gray-300">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {insight.metrics && Object.keys(insight.metrics).length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">相關指標：</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(insight.metrics).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {typeof value === 'number' ? value.toFixed(1) : value}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {key}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderTrendsTab = () => {
    if (!trends) return <div>暫無趨勢數據</div>;

    const productivityChartData = {
      labels: trends.predictions.map((point: any) => point.date),
      datasets: [
        {
          label: '生產力指數',
          data: trends.predictions.map((point: any) => point.confidence),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };

    const taskCompletionData = {
      labels: trends.predictions.map((point: any) => point.date),
      datasets: [
        {
          label: '任務完成數',
          data: trends.predictions.map((point: any) => point.predictedValue),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
        },
      ],
    };

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">生產力趨勢</h3>
          <div className="h-64">
            <Line data={productivityChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">任務完成趨勢</h3>
          <div className="h-64">
            <Bar data={taskCompletionData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        {trends.predictions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">預測分析</h3>
            <div className="space-y-3">
              {trends.predictions.map((prediction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-900 dark:text-white">{prediction.date}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    信心度: {(prediction.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderKnowledgeTab = () => {
    if (!knowledgeGraph) return <div>暫無知識圖譜數據</div>;

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">知識網絡概覽</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {knowledgeGraph.nodes.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">知識節點</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {knowledgeGraph.nodes.reduce((sum: number, node: any) => sum + node.connections.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">連接數</div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {knowledgeGraph.clusters.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">知識群集</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">重要節點</h3>
          <div className="space-y-3">
            {knowledgeGraph.nodes
              .sort((a: any, b: any) => b.importance - a.importance)
              .slice(0, 10)
              .map((node: any, index: number) => (
                <div key={node.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${
                      node.type === 'note' ? 'bg-blue-500' :
                      node.type === 'task' ? 'bg-green-500' :
                      node.type === 'project' ? 'bg-purple-500' :
                      'bg-orange-500'
                    }`}></span>
                    <span className="text-gray-900 dark:text-white font-medium">{node.title}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{node.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {node.connections.length} 連接
                    </span>
                    <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${node.importance * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {knowledgeGraph.clusters.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">知識群集</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {knowledgeGraph.clusters.map((cluster: any, index: number) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    群集 {index + 1} ({cluster.nodeIds.length} 個節點)
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    主題: {cluster.theme}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    相關性: {(cluster.coherence * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-300">載入分析數據中...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 標籤導航 */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            智能洞察
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trends'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            趨勢分析
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'knowledge'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            知識圖譜
          </button>
        </nav>
      </div>

      {/* 內容區域 */}
      <div className="min-h-96">
        {activeTab === 'insights' && renderInsightsTab()}
        {activeTab === 'trends' && renderTrendsTab()}
        {activeTab === 'knowledge' && renderKnowledgeTab()}
      </div>
    </div>
  );
};

export default AIInsightsDashboard;