import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import ContrastController from './ui/ContrastController';
import { PageTransition } from './ui';

const Layout: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEyeCareMode, setIsEyeCareMode] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'AI 聊天', icon: '🤖', gradient: 'from-blue-500 to-purple-600', vanGoghColor: 'van-gogh-night-blue' },
    { path: '/ai-center', label: 'AI 管理中心', icon: '🧠', gradient: 'from-purple-500 to-pink-500', vanGoghColor: 'van-gogh-purple' },
    { path: '/ai-design', label: 'AI 設計展示', icon: '🎨', gradient: 'from-yellow-500 to-orange-500', vanGoghColor: 'van-gogh-gold' },
    { path: '/ai-showcase', label: 'AI 功能展示', icon: '✨', gradient: 'from-cyan-500 to-blue-600', vanGoghColor: 'van-gogh-sky-blue' },
    { path: '/mouse-effects', label: '滑鼠效果', icon: '🖱️', gradient: 'from-pink-500 to-rose-500', vanGoghColor: 'van-gogh-pink' },
    { path: '/pomodoro', label: '蕃茄鐘', icon: '⏱️', gradient: 'from-orange-500 to-pink-500', vanGoghColor: 'van-gogh-orange' },
    { path: '/notebook', label: '筆記本', icon: '📚', gradient: 'from-green-500 to-blue-500', vanGoghColor: 'van-gogh-green' },
    { path: '/tasks', label: '任務中心', icon: '🎯', gradient: 'from-purple-500 to-pink-500', vanGoghColor: 'van-gogh-violet' },
    { path: '/projects', label: '專案管理', icon: '🚀', gradient: 'from-blue-600 to-purple-600', vanGoghColor: 'van-gogh-sky-blue' },
    { path: '/settings', label: '設定', icon: '⚙️', gradient: 'from-neutral-500 to-neutral-700', vanGoghColor: 'van-gogh-olive' },
  ];

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleEyeCareMode = () => {
    setIsEyeCareMode(!isEyeCareMode);
    document.documentElement.classList.toggle('eye-care');
  };

  const handleAIAssistant = () => {
    console.log('AI助手功能開發中...');
    // 導航到AI聊天頁面的助手功能
    window.location.hash = '#/'; 
    // 等待頁面載入後切換到助手視圖
    setTimeout(() => {
      const assistantButton = document.querySelector('[data-view="assistant"]');
      if (assistantButton) {
        (assistantButton as HTMLElement).click();
      }
    }, 500);
  };

  const handleNotifications = () => {
    console.log('顯示通知中心...');
    // 創建簡單的通知提示
    const notificationCount = Math.floor(Math.random() * 5) + 1;
    alert(`您有 ${notificationCount} 條新通知！\n\n這裡將顯示：\n• AI 建議更新\n• 任務提醒\n• 專案進度通知\n• 系統消息`);
  };

  const handleUserProfile = () => {
    console.log('顯示用戶資料...');
    // 顯示用戶資料對話框
    const userData = {
      name: '用戶',
      email: 'user@example.com',
      joinDate: '2024-01-01',
      totalTasks: Math.floor(Math.random() * 50) + 10,
      completedProjects: Math.floor(Math.random() * 10) + 1,
      totalPomodoros: Math.floor(Math.random() * 200) + 50
    };
    
    alert(`用戶資料\n\n姓名: ${userData.name}\n郵箱: ${userData.email}\n加入時間: ${userData.joinDate}\n\n統計數據:\n• 任務總數: ${userData.totalTasks}\n• 完成專案: ${userData.completedProjects}\n• 番茄鐘: ${userData.totalPomodoros} 個`);
  };

  // 智能對比度調整
  const getContrastClass = () => {
    if (isDarkMode && isEyeCareMode) return 'contrast-125 brightness-90';
    if (isDarkMode) return 'contrast-110';
    if (isEyeCareMode) return 'contrast-95 brightness-95';
    return '';
  };

  return (
    <div className={`flex h-screen transition-all duration-500 ${isDarkMode ? 'dark' : ''} ${isEyeCareMode ? 'eye-care' : ''} ${getContrastClass()}`} 
         style={{ 
           background: isDarkMode 
             ? 'linear-gradient(135deg, rgb(15, 23, 42) 0%, rgb(30, 41, 59) 100%)'
             : 'linear-gradient(135deg, rgb(248, 250, 252) 0%, rgb(226, 232, 240) 100%)',
           backgroundImage: isDarkMode 
             ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%)'
             : 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.03) 0%, transparent 50%)'
         }}>
      
      {/* 移動端漢堡菜單按鈕 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl bg-white/90 backdrop-blur-sm border border-blue-200/30 shadow-lg"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block w-5 h-0.5 bg-blue-600 transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block w-5 h-0.5 bg-blue-600 transition-all duration-300 mt-1 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-blue-600 transition-all duration-300 mt-1 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </div>
      </button>

      {/* 移動端遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 側邊欄 - 梵高藝術風格設計 */}
      <div className={`w-72 p-4 transition-transform duration-300 z-40 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 fixed md:relative h-full`}>
        <div className="bg-gradient-to-br from-white/95 to-blue-50/80 backdrop-blur-xl border border-blue-200/30 shadow-xl rounded-2xl h-full flex flex-col transition-all duration-300 hover:shadow-2xl hover:border-blue-300/50">
          {/* Logo區域 - 梵高風格 */}
          <div className="p-6 border-b border-blue-200/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 flex items-center justify-center animate-van-gogh-glow shadow-lg">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
                  管理天地
                </h1>
                <p className="text-xs text-blue-600/70 font-mono">v2.0 Van Gogh</p>
              </div>
            </div>
          </div>
          
          {/* 導航區域 */}
          <nav className="flex-1 p-4">
            <ul className="space-y-3">
              {navItems.map(item => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ease-out relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r ' + item.gradient + ' text-white shadow-lg transform scale-105 animate-van-gogh-glow'
                          : 'text-neutral-700 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 hover:transform hover:scale-102 hover:shadow-md'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                          isActive ? 'bg-white/20 shadow-inner' : 'bg-white/30 group-hover:bg-white/50 shadow-sm'
                        }`}>
                          <span className="text-lg">{item.icon}</span>
                        </div>
                        <span className="font-medium font-ai">{item.label}</span>
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-neural" />
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* 底部用戶區域 */}
          <div className="p-4 border-t border-neural-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-ai-purple to-ai-pink animate-pulse-slow" />
                <div>
                  <p className="text-sm font-medium text-neural-800">用戶</p>
                  <p className="text-xs text-neural-500">在線</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                 <button
                   onClick={toggleDarkMode}
                   className="p-2 rounded-lg bg-neural-200/50 hover:bg-neural-300/50 transition-all duration-300 hover:scale-110"
                   title={isDarkMode ? '切換到亮色模式' : '切換到暗色模式'}
                 >
                   {isDarkMode ? '🌙' : '☀️'}
                 </button>
                 <button
                   onClick={toggleEyeCareMode}
                   className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                     isEyeCareMode 
                       ? 'bg-ai-cyan/20 text-ai-cyan border border-ai-cyan/30' 
                       : 'bg-neural-200/50 hover:bg-neural-300/50'
                   }`}
                   title={isEyeCareMode ? '關閉護眼模式' : '開啟護眼模式'}
                 >
                   👁️
                 </button>
                 <ContrastController />
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主內容區 */}
      <div className="flex-1 flex flex-col ml-0 md:ml-0">
        {/* 頂部搜索欄 */}
        <div className="p-4 pt-16 md:pt-4">
          <div className="bg-gradient-to-r from-white/95 to-blue-50/80 backdrop-blur-xl border border-blue-200/30 shadow-lg rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:border-blue-300/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className={`relative flex-1 max-w-md transition-all duration-300 ${
                isSearchFocused ? 'transform scale-105' : ''
              }`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-neural-400">🔍</span>
                </div>
                <input
                  type="text"
                  placeholder="智能搜索..."
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-3 bg-neural-50/50 border border-neural-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all duration-300 font-ai placeholder-neural-400"
                />
                {isSearchFocused && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-500/20 to-ai-purple/20 -z-10 animate-glow" />
                )}
              </div>
              <button 
                onClick={handleAIAssistant}
                className="ai-button px-4 py-2 text-sm font-medium"
              >
                AI 助手
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleNotifications}
                className="p-3 rounded-xl bg-neural-100/50 hover:bg-neural-200/50 transition-all duration-300 hover:transform hover:scale-110 relative"
              >
                <span className="text-lg">🔔</span>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-ai-pink rounded-full animate-pulse" />
              </button>
              <button 
                onClick={handleUserProfile}
                className="p-3 rounded-xl bg-neural-100/50 hover:bg-neural-200/50 transition-all duration-300 hover:transform hover:scale-110"
              >
                <span className="text-lg">👤</span>
              </button>
            </div>
          </div>
          </div>
        </div>

        {/* 主內容區域 */}
        <main className="flex-1 p-4 overflow-y-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
};

export default Layout;