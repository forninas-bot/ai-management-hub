import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { 
  updateAISettings, 
  updatePomodoroSettings, 
  updateNotificationSettings,
  setActiveStyle 
} from '../features/settings/settingsSlice';
import { Button, Input, Card, FeedbackAnimation, ButtonFeedback } from '../components/ui';

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const settings = useAppSelector(state => state.settings);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openRouterApiKey') || '');

  const handleApiKeySave = () => {
    localStorage.setItem('openRouterApiKey', apiKey);
    alert('API 密鑰已保存');
  };

  return (
    <div className="space-y-6 neural-bg max-h-screen overflow-y-auto p-6">
      {/* 頁面標題 */}
      <div className="neural-card p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-ai-purple to-ai-pink flex items-center justify-center animate-glow">
            <span className="text-white text-xl">⚙️</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">系統設定</h1>
            <p className="text-neural-500">個性化您的AI管理體驗</p>
          </div>
        </div>
      </div>

      {/* AI 設定 */}
      <div className="neural-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-ai-cyan to-ai-purple flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <h2 className="text-xl font-bold gradient-text">AI 智能設定</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              OpenRouter API 密鑰
            </label>
            <div className="flex space-x-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="輸入您的 OpenRouter API 密鑰"
                className="flex-1 px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-cyan/50 focus:border-ai-cyan transition-all duration-300 text-neural-800 placeholder-neural-400"
              />
              <ButtonFeedback>
                <button 
                  onClick={handleApiKeySave}
                  className="ai-button px-6 py-3 font-medium"
                >
                  💾 保存
                </button>
              </ButtonFeedback>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              預設 AI 模型
            </label>
            <select
              value={settings.aiSettings.defaultModel}
              onChange={(e) => dispatch(updateAISettings({ defaultModel: e.target.value }))}
              className="w-full px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-cyan/50 focus:border-ai-cyan transition-all duration-300 text-neural-800"
            >
              <option value="gpt-4">GPT-4</option>
              <option value="claude-2">Claude 2</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              活躍風格
            </label>
            <select
              value={settings.aiSettings.activeStyleId}
              onChange={(e) => dispatch(setActiveStyle(e.target.value))}
              className="w-full px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-cyan/50 focus:border-ai-cyan transition-all duration-300 text-neural-800"
            >
              {settings.aiSettings.customStyles.map(style => (
                <option key={style.id} value={style.id}>{style.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 蕃茄鐘設定 */}
      <div className="neural-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-ai-orange to-ai-pink flex items-center justify-center">
            <span className="text-white text-sm">🍅</span>
          </div>
          <h2 className="text-xl font-bold gradient-text">蕃茄鐘設定</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              工作時長 (分鐘)
            </label>
            <input
              type="number"
              value={settings.pomodoroSettings.workDuration}
              onChange={(e) => dispatch(updatePomodoroSettings({ 
                workDuration: parseInt(e.target.value) 
              }))}
              min="1"
              max="60"
              className="w-full px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-orange/50 focus:border-ai-orange transition-all duration-300 text-neural-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              短休息時長 (分鐘)
            </label>
            <input
              type="number"
              value={settings.pomodoroSettings.shortBreakDuration}
              onChange={(e) => dispatch(updatePomodoroSettings({ 
                shortBreakDuration: parseInt(e.target.value) 
              }))}
              min="1"
              max="30"
              className="w-full px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-orange/50 focus:border-ai-orange transition-all duration-300 text-neural-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              長休息時長 (分鐘)
            </label>
            <input
              type="number"
              value={settings.pomodoroSettings.longBreakDuration}
              onChange={(e) => dispatch(updatePomodoroSettings({ 
                longBreakDuration: parseInt(e.target.value) 
              }))}
              min="1"
              max="60"
              className="w-full px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-orange/50 focus:border-ai-orange transition-all duration-300 text-neural-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              長休息間隔 (個)
            </label>
            <input
              type="number"
              value={settings.pomodoroSettings.longBreakInterval}
              onChange={(e) => dispatch(updatePomodoroSettings({ 
                longBreakInterval: parseInt(e.target.value) 
              }))}
              min="2"
              max="10"
              className="w-full px-4 py-3 bg-neural-50 border border-neural-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-orange/50 focus:border-ai-orange transition-all duration-300 text-neural-800"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.pomodoroSettings.autoStartBreaks}
              onChange={(e) => dispatch(updatePomodoroSettings({ 
                autoStartBreaks: e.target.checked 
              }))}
              className="w-4 h-4 text-ai-orange bg-neural-100 border-neural-300 rounded focus:ring-ai-orange focus:ring-2"
            />
            <span className="text-sm text-neural-700 font-medium">自動開始休息</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.pomodoroSettings.autoStartPomodoros}
              onChange={(e) => dispatch(updatePomodoroSettings({ 
                autoStartPomodoros: e.target.checked 
              }))}
              className="w-4 h-4 text-ai-orange bg-neural-100 border-neural-300 rounded focus:ring-ai-orange focus:ring-2"
            />
            <span className="text-sm text-neural-700 font-medium">自動開始蕃茄鐘</span>
          </label>
        </div>
      </div>

      {/* 通知設定 */}
      <div className="neural-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-ai-green to-ai-cyan flex items-center justify-center">
            <span className="text-white text-sm">🔔</span>
          </div>
          <h2 className="text-xl font-bold gradient-text">通知設定</h2>
        </div>
        
        <div className="space-y-3">
          {[
            { key: 'desktop', label: '桌面通知' },
            { key: 'sound', label: '聲音提示' },
            { key: 'taskReminders', label: '任務提醒' },
            { key: 'pomodoroAlerts', label: '蕃茄鐘提醒' }
          ].map(setting => (
            <label key={setting.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.notificationSettings[setting.key as keyof typeof settings.notificationSettings]}
                onChange={(e) => dispatch(updateNotificationSettings({ 
                  [setting.key]: e.target.checked 
                } as any))}
                className="w-4 h-4 text-ai-green bg-neural-100 border-neural-300 rounded focus:ring-ai-green focus:ring-2"
              />
              <span className="text-sm text-neural-700 font-medium">{setting.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;