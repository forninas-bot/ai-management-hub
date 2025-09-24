import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { generateWeeklyReport, generateMonthlyReport, updateCustomSettings } from '../features/pomodoro/pomodoroSlice';
import { Card, Button } from './ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface PomodoroStatsProps {
  onClose: () => void;
}

const PomodoroStats: React.FC<PomodoroStatsProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { dailyStats, weeklyStats, monthlyStats, customSettings } = useAppSelector(state => state.pomodoro);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly' | 'settings'>('daily');
  const [selectedWeek, setSelectedWeek] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // 生成週報
  const generateWeekReport = () => {
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
    const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
    
    dispatch(generateWeeklyReport({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0]
    }));
  };

  // 生成月報
  const generateMonthReport = () => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString();
    const year = today.getFullYear();
    
    dispatch(generateMonthlyReport({ month, year }));
  };

  // 更新設置
  const handleSettingsUpdate = (settings: Partial<typeof customSettings>) => {
    dispatch(updateCustomSettings(settings));
  };

  // 獲取最近7天的數據
  const getRecentDailyData = () => {
    const recent = dailyStats.slice(-7).map(stat => ({
      date: new Date(stat.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' }),
      pomodoros: stat.completedPomodoros,
      productivity: stat.productivity,
      focus: stat.focusScore
    }));
    return recent;
  };

  // 獲取最近幾週的數據
  const getRecentWeeklyData = () => {
    return weeklyStats.slice(-4).map(stat => ({
      week: `${new Date(stat.weekStart).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} - ${new Date(stat.weekEnd).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })}`,
      pomodoros: stat.totalPomodoros,
      productivity: Math.round(stat.averageProductivity),
      workTime: Math.round(stat.totalWorkTime / 60) // 轉換為小時
    }));
  };

  // 獲取最近幾個月的數據
  const getRecentMonthlyData = () => {
    return monthlyStats.slice(-6).map(stat => ({
      month: `${stat.year}/${stat.month}`,
      pomodoros: stat.totalPomodoros,
      average: Math.round(stat.averageDaily),
      goal: stat.goals.target,
      achieved: stat.goals.achieved
    }));
  };

  useEffect(() => {
    // 自動生成當週和當月報告
    generateWeekReport();
    generateMonthReport();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-dark">📊 番茄鐘統計報告</h2>
          <Button variant="text" onClick={onClose}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* 標籤導航 */}
        <div className="flex border-b">
          {[
            { key: 'daily', label: '📈 日統計', icon: '📈' },
            { key: 'weekly', label: '📊 週報', icon: '📊' },
            { key: 'monthly', label: '📋 月報', icon: '📋' },
            { key: 'settings', label: '⚙️ 設置', icon: '⚙️' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === tab.key
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-gray hover:text-dark hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* 日統計 */}
          {activeTab === 'daily' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <h3 className="font-semibold text-dark mb-2">今日完成</h3>
                  <div className="text-3xl font-bold text-primary">
                    {dailyStats[dailyStats.length - 1]?.completedPomodoros || 0}
                  </div>
                  <div className="text-sm text-gray">番茄鐘</div>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-dark mb-2">生產力指數</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round(dailyStats[dailyStats.length - 1]?.productivity || 0)}%
                  </div>
                  <div className="text-sm text-gray">目標達成率</div>
                </Card>
                <Card className="p-4">
                  <h3 className="font-semibold text-dark mb-2">專注分數</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.round(dailyStats[dailyStats.length - 1]?.focusScore || 0)}
                  </div>
                  <div className="text-sm text-gray">專注程度</div>
                </Card>
              </div>

              {getRecentDailyData().length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-dark mb-4">最近7天趨勢</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getRecentDailyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pomodoros" stroke="#8884d8" name="番茄鐘" />
                      <Line type="monotone" dataKey="productivity" stroke="#82ca9d" name="生產力%" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}

          {/* 週報 */}
          {activeTab === 'weekly' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-dark">週報分析</h3>
                <Button onClick={generateWeekReport} variant="secondary">
                  生成本週報告
                </Button>
              </div>

              {weeklyStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">本週總計</h4>
                    <div className="text-2xl font-bold text-primary">
                      {weeklyStats[weeklyStats.length - 1]?.totalPomodoros || 0}
                    </div>
                    <div className="text-sm text-gray">番茄鐘</div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">工作時間</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((weeklyStats[weeklyStats.length - 1]?.totalWorkTime || 0) / 60)}
                    </div>
                    <div className="text-sm text-gray">小時</div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">平均生產力</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(weeklyStats[weeklyStats.length - 1]?.averageProductivity || 0)}%
                    </div>
                    <div className="text-sm text-gray">效率指標</div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">趨勢</h4>
                    <div className={`text-2xl font-bold ${
                      weeklyStats[weeklyStats.length - 1]?.improvementTrend === 'up' ? 'text-green-600' :
                      weeklyStats[weeklyStats.length - 1]?.improvementTrend === 'down' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {weeklyStats[weeklyStats.length - 1]?.improvementTrend === 'up' ? '📈' :
                       weeklyStats[weeklyStats.length - 1]?.improvementTrend === 'down' ? '📉' : '➡️'}
                    </div>
                    <div className="text-sm text-gray">
                      {weeklyStats[weeklyStats.length - 1]?.improvementTrend === 'up' ? '上升' :
                       weeklyStats[weeklyStats.length - 1]?.improvementTrend === 'down' ? '下降' : '穩定'}
                    </div>
                  </Card>
                </div>
              )}

              {getRecentWeeklyData().length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-dark mb-4">週度對比</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={getRecentWeeklyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="pomodoros" fill="#8884d8" name="番茄鐘" />
                      <Bar dataKey="workTime" fill="#82ca9d" name="工作時間(小時)" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}

          {/* 月報 */}
          {activeTab === 'monthly' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-dark">月報分析</h3>
                <Button onClick={generateMonthReport} variant="secondary">
                  生成本月報告
                </Button>
              </div>

              {monthlyStats.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">本月總計</h4>
                    <div className="text-2xl font-bold text-primary">
                      {monthlyStats[monthlyStats.length - 1]?.totalPomodoros || 0}
                    </div>
                    <div className="text-sm text-gray">番茄鐘</div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">日均完成</h4>
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(monthlyStats[monthlyStats.length - 1]?.averageDaily || 0)}
                    </div>
                    <div className="text-sm text-gray">番茄鐘/天</div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">目標達成</h4>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(((monthlyStats[monthlyStats.length - 1]?.goals.achieved || 0) / (monthlyStats[monthlyStats.length - 1]?.goals.target || 1)) * 100)}%
                    </div>
                    <div className="text-sm text-gray">
                      {monthlyStats[monthlyStats.length - 1]?.goals.achieved || 0} / {monthlyStats[monthlyStats.length - 1]?.goals.target || 0}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-medium text-dark mb-2">工作時間</h4>
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((monthlyStats[monthlyStats.length - 1]?.totalWorkTime || 0) / 60)}
                    </div>
                    <div className="text-sm text-gray">小時</div>
                  </Card>
                </div>
              )}

              {getRecentMonthlyData().length > 0 && (
                <Card className="p-6">
                  <h4 className="text-lg font-semibold text-dark mb-4">月度趨勢</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={getRecentMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="pomodoros" stroke="#8884d8" name="完成數" />
                      <Line type="monotone" dataKey="goal" stroke="#ff7300" name="目標" strokeDasharray="5 5" />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}

          {/* 設置 */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">目標設置</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">日目標</label>
                    <input
                      type="number"
                      value={customSettings.dailyGoal}
                      onChange={(e) => handleSettingsUpdate({ dailyGoal: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      max="20"
                    />
                    <div className="text-xs text-gray mt-1">番茄鐘/天</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">週目標</label>
                    <input
                      type="number"
                      value={customSettings.weeklyGoal}
                      onChange={(e) => handleSettingsUpdate({ weeklyGoal: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      max="100"
                    />
                    <div className="text-xs text-gray mt-1">番茄鐘/週</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">月目標</label>
                    <input
                      type="number"
                      value={customSettings.monthlyGoal}
                      onChange={(e) => handleSettingsUpdate({ monthlyGoal: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      min="1"
                      max="500"
                    />
                    <div className="text-xs text-gray mt-1">番茄鐘/月</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">時長設置</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">工作時長</label>
                    <input
                      type="number"
                      value={Math.round(customSettings.preferredWorkDuration / 60)}
                      onChange={(e) => handleSettingsUpdate({ preferredWorkDuration: parseInt(e.target.value) * 60 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      min="15"
                      max="60"
                    />
                    <div className="text-xs text-gray mt-1">分鐘</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">休息時長</label>
                    <input
                      type="number"
                      value={Math.round(customSettings.preferredBreakDuration / 60)}
                      onChange={(e) => handleSettingsUpdate({ preferredBreakDuration: parseInt(e.target.value) * 60 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      min="3"
                      max="30"
                    />
                    <div className="text-xs text-gray mt-1">分鐘</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-dark mb-4">通知設置</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customSettings.notifications.dailyReport}
                      onChange={(e) => handleSettingsUpdate({
                        notifications: {
                          ...customSettings.notifications,
                          dailyReport: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <span className="text-dark">每日報告通知</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customSettings.notifications.weeklyReport}
                      onChange={(e) => handleSettingsUpdate({
                        notifications: {
                          ...customSettings.notifications,
                          weeklyReport: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <span className="text-dark">週報通知</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={customSettings.notifications.monthlyReport}
                      onChange={(e) => handleSettingsUpdate({
                        notifications: {
                          ...customSettings.notifications,
                          monthlyReport: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <span className="text-dark">月報通知</span>
                  </label>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PomodoroStats;