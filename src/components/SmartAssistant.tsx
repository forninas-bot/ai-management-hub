import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { SmartAnalyticsService, ProductivityInsight } from '../services/smartAnalyticsService';

interface SmartAssistantProps {
  className?: string;
  onSuggestionClick?: (suggestion: string) => void;
}

interface SmartSuggestion {
  id: string;
  type: 'task' | 'note' | 'project' | 'pomodoro' | 'general';
  title: string;
  description: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

const SmartAssistant: React.FC<SmartAssistantProps> = ({ className, onSuggestionClick }) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'suggestions' | 'insights' | 'quick-actions'>('suggestions');

  // 從 Redux store 獲取數據
  const notes = useSelector((state: RootState) => state.notebook.notes);
  const tasks = useSelector((state: RootState) => state.tasks?.tasks || []);
  const projects = useSelector((state: RootState) => state.projects?.projects || []);
  const pomodoroStats = useSelector((state: RootState) => state.pomodoro?.dailyStats || []);

  useEffect(() => {
    generateSmartSuggestions();
  }, [notes, tasks, projects, pomodoroStats]);

  const generateSmartSuggestions = async () => {
    try {
      setLoading(true);
      
      const analyticsData = {
        notes,
        tasks,
        projects,
        pomodoroSessions: [], // 暫時使用空數組，因為sessions不在state中
        timeRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30天前
          end: new Date().toISOString()
        }
      };

      // 生成智能建議
      const smartSuggestions = await generateSuggestions(analyticsData);
      setSuggestions(smartSuggestions);

      // 獲取洞察
      const productivityInsights = await SmartAnalyticsService.generateProductivityInsights(analyticsData);
      setInsights(productivityInsights.slice(0, 3)); // 只顯示前3個最重要的洞察

    } catch (error) {
      console.error('生成智能建議失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async (data: any): Promise<SmartSuggestion[]> => {
    const suggestions: SmartSuggestion[] = [];

    // 任務相關建議
    const overdueTasks = data.tasks.filter((task: any) => 
      task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed'
    );
    
    if (overdueTasks.length > 0) {
      suggestions.push({
        id: 'overdue-tasks',
        type: 'task',
        title: '處理逾期任務',
        description: `您有 ${overdueTasks.length} 個逾期任務需要處理`,
        action: '查看逾期任務',
        priority: 'high',
        confidence: 0.9
      });
    }

    // 高優先級任務建議
    const highPriorityTasks = data.tasks.filter((task: any) => 
      task.priority === 'high' && task.status === 'to-do'
    );
    
    if (highPriorityTasks.length > 0) {
      suggestions.push({
        id: 'high-priority-tasks',
        type: 'task',
        title: '專注高優先級任務',
        description: `建議優先處理 ${highPriorityTasks.length} 個高優先級任務`,
        action: '開始高優先級任務',
        priority: 'high',
        confidence: 0.85
      });
    }

    // 專案進度建議
    const stagnantProjects = data.projects.filter((project: any) => {
      const lastUpdate = new Date(project.updatedAt);
      const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate > 7 && project.status === 'in-progress';
    });

    if (stagnantProjects.length > 0) {
      suggestions.push({
        id: 'stagnant-projects',
        type: 'project',
        title: '更新專案進度',
        description: `有 ${stagnantProjects.length} 個專案超過一週未更新`,
        action: '檢查專案狀態',
        priority: 'medium',
        confidence: 0.8
      });
    }

    // 筆記整理建議
    const recentNotes = data.notes.filter((note: any) => {
      const noteDate = new Date(note.updatedAt);
      const daysSinceUpdate = (Date.now() - noteDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceUpdate <= 7;
    });

    if (recentNotes.length > 5) {
      suggestions.push({
        id: 'organize-notes',
        type: 'note',
        title: '整理最近筆記',
        description: `您最近創建了 ${recentNotes.length} 篇筆記，建議進行分類整理`,
        action: '整理筆記',
        priority: 'low',
        confidence: 0.7
      });
    }

    // 番茄鐘建議
    const today = new Date().toISOString().split('T')[0];
    const todayStats = pomodoroStats.find((stat: any) => stat.date === today);
    const todayPomodoros = todayStats?.completedPomodoros || 0;

    if (todayPomodoros === 0) {
      suggestions.push({
        id: 'start-pomodoro',
        type: 'pomodoro',
        title: '開始專注時間',
        description: '今天還沒有進行番茄鐘專注，建議開始一個專注時段',
        action: '開始番茄鐘',
        priority: 'medium',
        confidence: 0.75
      });
    }

    // 根據優先級和信心度排序
    return suggestions.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const scoreA = priorityWeight[a.priority] * a.confidence;
      const scoreB = priorityWeight[b.priority] * b.confidence;
      return scoreB - scoreA;
    }).slice(0, 6); // 最多顯示6個建議
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    console.log('智能建議被點擊:', suggestion);
    if (onSuggestionClick) {
      onSuggestionClick(suggestion.action);
    } else {
      // 默認處理：導航到相關頁面
      handleDefaultAction(suggestion);
    }
  };

  const handleDefaultAction = (suggestion: SmartSuggestion) => {
    console.log('執行默認動作:', suggestion.action);
    
    switch (suggestion.type) {
      case 'task':
        // 導航到任務頁面
        window.location.hash = '#/tasks';
        break;
      case 'project':
        // 導航到專案頁面
        window.location.hash = '#/projects';
        break;
      case 'note':
        // 導航到筆記頁面
        window.location.hash = '#/notebook';
        break;
      case 'pomodoro':
        // 導航到番茄鐘頁面
        window.location.hash = '#/pomodoro';
        break;
      default:
        console.log('未知的建議類型:', suggestion.type);
    }
  };

  const handleQuickAction = (action: string) => {
    console.log('快速操作被點擊:', action);
    
    switch (action) {
      case '創建新任務':
        window.location.hash = '#/tasks';
        break;
      case '新增筆記':
        window.location.hash = '#/notebook';
        break;
      case '開始番茄鐘':
        window.location.hash = '#/pomodoro';
        break;
      case '查看今日統計':
        window.location.hash = '#/pomodoro';
        break;
      default:
        if (onSuggestionClick) {
          onSuggestionClick(action);
        }
    }
  };

  const quickActions = [
    { id: 'new-task', title: '創建新任務', icon: '✓', action: '創建新任務' },
    { id: 'new-note', title: '新增筆記', icon: '📝', action: '新增筆記' },
    { id: 'start-pomodoro', title: '開始專注', icon: '🍅', action: '開始番茄鐘' },
    { id: 'review-today', title: '今日回顧', icon: '📊', action: '查看今日統計' },
  ];

  const renderSuggestionsSection = () => (
    <div className="space-y-4">
      {suggestions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">🎉</div>
          <p>太棒了！目前沒有緊急建議</p>
          <p className="text-sm">繼續保持良好的工作習慣</p>
        </div>
      ) : (
        suggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`w-2 h-2 rounded-full ${
                    suggestion.priority === 'high' ? 'bg-red-500' :
                    suggestion.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></span>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {suggestion.title}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {suggestion.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {suggestion.description}
                </p>
                <div className="flex items-center justify-between">
                  <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                    {suggestion.action}
                  </button>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>信心度:</span>
                    <span>{(suggestion.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderInsightsSection = () => (
    <div className="space-y-4">
      {insights.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📈</div>
          <p>正在分析您的工作模式...</p>
        </div>
      ) : (
        insights.map((insight, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {insight.title}
              </h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                insight.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              }`}>
                {insight.priority === 'high' ? '高' : insight.priority === 'medium' ? '中' : '低'}
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {insight.description}
            </p>
            {insight.recommendations.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                💡 {insight.recommendations[0]}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderQuickActionsSection = () => (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => (
        <button
          key={action.id}
          onClick={() => handleQuickAction(action.action)}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:scale-105 text-center"
        >
          <div className="text-2xl mb-2">{action.icon}</div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {action.title}
          </div>
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">生成智能建議中...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 標籤導航 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setActiveSection('suggestions')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'suggestions'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          智能建議
        </button>
        <button
          onClick={() => setActiveSection('insights')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'insights'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          洞察分析
        </button>
        <button
          onClick={() => setActiveSection('quick-actions')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeSection === 'quick-actions'
              ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          快速操作
        </button>
      </div>

      {/* 內容區域 */}
      <div className="min-h-96">
        {activeSection === 'suggestions' && renderSuggestionsSection()}
        {activeSection === 'insights' && renderInsightsSection()}
        {activeSection === 'quick-actions' && renderQuickActionsSection()}
      </div>
    </div>
  );
};

export default SmartAssistant;