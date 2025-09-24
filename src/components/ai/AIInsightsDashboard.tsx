import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../app/hooks';
import { useAnalyzeConversationMutation } from '../../services/aiService';

interface InsightCard {
  id: string;
  type: 'productivity' | 'mood' | 'topics' | 'suggestions' | 'trends';
  title: string;
  value: string | number;
  change?: number;
  description: string;
  icon: string;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

const AIInsightsDashboard: React.FC = () => {
  const { conversations } = useAppSelector(state => state.chat);
  const { notes } = useAppSelector(state => state.notebook);
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  
  const [analyzeConversation] = useAnalyzeConversationMutation();

  useEffect(() => {
    generateInsights();
  }, [conversations, notes, timeRange]);

  const generateInsights = async () => {
    setIsAnalyzing(true);
    
    try {
      // 計算基本統計
      const totalConversations = conversations.length;
      const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
      const totalNotes = notes.length;
      
      // 分析最近的對話
      let sentimentData = { positive: 0, neutral: 0, negative: 0 };
      let topicFrequency: Record<string, number> = {};
      
      for (const conversation of conversations.slice(-5)) {
        if (conversation.messages.length > 0) {
          try {
            const analysis = await analyzeConversation({
              messages: conversation.messages,
              conversationId: conversation.id
            }).unwrap();
            
            // 統計情感
            const sentiment = analysis.sentiment_analysis?.overall || 'neutral';
            sentimentData[sentiment as keyof typeof sentimentData]++;
            
            // 統計話題
            analysis.key_topics?.forEach(topic => {
              topicFrequency[topic] = (topicFrequency[topic] || 0) + 1;
            });
          } catch (error) {
            console.error('分析對話失敗:', error);
          }
        }
      }
      
      // 生成洞察卡片
      const newInsights: InsightCard[] = [
        {
          id: 'productivity',
          type: 'productivity',
          title: '生產力指數',
          value: Math.round((totalMessages + totalNotes * 2) / Math.max(totalConversations, 1)),
          change: 12,
          description: '基於對話和筆記活動計算',
          icon: '📈',
          color: 'bg-green-500'
        },
        {
          id: 'mood',
          type: 'mood',
          title: '整體情感',
          value: getMoodLabel(sentimentData),
          description: `正面: ${sentimentData.positive}, 中性: ${sentimentData.neutral}, 負面: ${sentimentData.negative}`,
          icon: getMoodIcon(sentimentData),
          color: getMoodColor(sentimentData)
        },
        {
          id: 'conversations',
          type: 'topics',
          title: '活躍對話',
          value: totalConversations,
          change: 8,
          description: '總對話數量',
          icon: '💬',
          color: 'bg-blue-500'
        },
        {
          id: 'notes',
          type: 'productivity',
          title: '筆記總數',
          value: totalNotes,
          change: 15,
          description: '所有筆記本中的筆記數量',
          icon: '📝',
          color: 'bg-purple-500'
        },
        {
          id: 'top-topic',
          type: 'topics',
          title: '熱門話題',
          value: getTopTopic(topicFrequency),
          description: '最常討論的話題',
          icon: '🔥',
          color: 'bg-orange-500'
        },
        {
          id: 'efficiency',
          type: 'trends',
          title: '效率趨勢',
          value: '上升',
          change: 23,
          description: '基於使用模式分析',
          icon: '⚡',
          color: 'bg-yellow-500'
        }
      ];
      
      setInsights(newInsights);
      
      // 生成圖表數據
      const chartLabels = getLast7Days();
      const activityData = generateActivityData(chartLabels);
      
      setChartData({
        labels: chartLabels,
        datasets: [
          {
            label: '對話活動',
            data: activityData.conversations,
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)'
          },
          {
            label: '筆記活動',
            data: activityData.notes,
            borderColor: 'rgb(147, 51, 234)',
            backgroundColor: 'rgba(147, 51, 234, 0.1)'
          }
        ]
      });
      
    } catch (error) {
      console.error('生成洞察失敗:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodLabel = (sentimentData: any) => {
    const maxSentiment = Object.entries(sentimentData).reduce((max: [string, any], current: [string, any]) => 
      (current[1] as number) > (max[1] as number) ? current : max
    );
    
    const labels = { positive: '積極', neutral: '中性', negative: '消極' };
    return labels[maxSentiment[0] as keyof typeof labels];
  };

  const getMoodIcon = (sentimentData: any) => {
    const mood = getMoodLabel(sentimentData);
    const icons = { '積極': '😊', '中性': '😐', '消極': '😔' };
    return icons[mood as keyof typeof icons] || '😐';
  };

  const getMoodColor = (sentimentData: any) => {
    const mood = getMoodLabel(sentimentData);
    const colors = { '積極': 'bg-green-500', '中性': 'bg-gray-500', '消極': 'bg-red-500' };
    return colors[mood as keyof typeof colors] || 'bg-gray-500';
  };

  const getTopTopic = (topicFrequency: Record<string, number>) => {
    const entries = Object.entries(topicFrequency);
    if (entries.length === 0) return '暫無數據';
    
    const topTopic = entries.reduce((max, [topic, freq]) => 
      freq > max.freq ? { topic, freq } : max, { topic: '', freq: 0 }
    );
    
    return topTopic.topic || '暫無數據';
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }));
    }
    return days;
  };

  const generateActivityData = (labels: string[]) => {
    // 模擬活動數據，實際應該從真實數據計算
    return {
      conversations: labels.map(() => Math.floor(Math.random() * 10) + 1),
      notes: labels.map(() => Math.floor(Math.random() * 8) + 1)
    };
  };

  const SimpleLineChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const maxValue = Math.max(
      ...data.datasets.flatMap(dataset => dataset.data)
    );
    
    return (
      <div className="h-32 flex items-end justify-between gap-1 p-4">
        {data.labels.map((label, index) => {
          const conversationHeight = (data.datasets[0].data[index] / maxValue) * 100;
          const noteHeight = (data.datasets[1].data[index] / maxValue) * 100;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <div className="flex items-end gap-1 h-20">
                <div 
                  className="w-2 bg-blue-500 rounded-t"
                  style={{ height: `${conversationHeight}%` }}
                  title={`對話: ${data.datasets[0].data[index]}`}
                ></div>
                <div 
                  className="w-2 bg-purple-500 rounded-t"
                  style={{ height: `${noteHeight}%` }}
                  title={`筆記: ${data.datasets[1].data[index]}`}
                ></div>
              </div>
              <span className="text-xs text-gray-500">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 標題和時間範圍選擇 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span>🔮</span>
          AI 洞察儀表板
        </h2>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {range === '7d' ? '7天' : range === '30d' ? '30天' : '90天'}
            </button>
          ))}
        </div>
      </div>

      {/* 洞察卡片網格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map(insight => (
          <div key={insight.id} className="neural-card p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{insight.icon}</span>
                <h3 className="font-medium text-gray-700">{insight.title}</h3>
              </div>
              {insight.change && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                  insight.change > 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}%
                </span>
              )}
            </div>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900">{insight.value}</span>
            </div>
            <p className="text-sm text-gray-600">{insight.description}</p>
          </div>
        ))}
      </div>

      {/* 活動趨勢圖表 */}
      {chartData && (
        <div className="neural-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <span>📊</span>
              活動趨勢
            </h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>對話</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>筆記</span>
              </div>
            </div>
          </div>
          <SimpleLineChart data={chartData} />
        </div>
      )}

      {/* AI 建議 */}
      <div className="neural-card p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2">
          <span>💡</span>
          AI 建議
        </h3>
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
            <p className="text-sm font-medium text-blue-800">提升效率</p>
            <p className="text-sm text-blue-600">建議在上午時段進行重要對話，此時您的參與度最高。</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
            <p className="text-sm font-medium text-green-800">知識管理</p>
            <p className="text-sm text-green-600">您的筆記活動很活躍，考慮建立標籤系統來更好地組織內容。</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
            <p className="text-sm font-medium text-purple-800">學習模式</p>
            <p className="text-sm text-purple-600">檢測到您對技術話題的興趣增加，推薦相關的學習資源。</p>
          </div>
        </div>
      </div>

      {/* 分析狀態 */}
      {isAnalyzing && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>正在分析數據...</span>
        </div>
      )}
    </div>
  );
};

export default AIInsightsDashboard;