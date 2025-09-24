import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const AIProjectDesign: React.FC = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-white/95 to-blue-50/80 p-6 relative overflow-hidden"
    >
      {/* 梵高風格背景裝飾 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-purple-500/8 rounded-full blur-xl animate-van-gogh-pulse" />
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-br from-yellow-400/8 to-orange-500/8 rounded-full blur-lg animate-van-gogh-bounce" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-gradient-to-br from-green-400/6 to-teal-500/6 rounded-full blur-2xl animate-van-gogh-pulse" />
        
        {/* 梵高風格筆觸紋理 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-repeat opacity-20" 
               style={{
                 backgroundImage: `linear-gradient(45deg, var(--van-gogh-blue) 25%, transparent 25%, transparent 50%, var(--van-gogh-blue) 50%, var(--van-gogh-blue) 75%, transparent 75%, transparent)`,
                 backgroundSize: '20px 20px'
               }} 
          />
        </div>
      </div>

      {/* 導航 - 梵高風格 */}
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-50 backdrop-blur-xl bg-white/80 border-b border-neutral-200/50 shadow-lg rounded-xl mb-8"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-xl font-bold">AI</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
                  AI Native 項目設計
                </h1>
                <p className="text-sm text-neutral-600">梵高藝術風格 • 創意無限</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {['儀表板', '項目', '任務', '分析', '設定'].map((item, index) => (
                <Button
                  key={item}
                  variant={activeSection === item ? 'van-gogh' : 'glass'}
                  size="sm"
                  onClick={() => setActiveSection(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 主要內容區域 */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* 英雄區域 - 梵高風格 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-12 text-center"
        >
          <Card variant="van-gogh" size="lg" className="p-12">
            <div className="relative">
              <h2 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
                藝術與科技的
                <br />
                完美融合
              </h2>
              <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
                以梵高的藝術視野重新定義項目管理，讓每個任務都成為一幅傑作
              </p>
              
              {/* 梵高風格裝飾元素 */}
              <div className="absolute -top-8 -left-8 w-32 h-32 opacity-30">
                <svg viewBox="0 0 100 100" className="w-full h-full animate-van-gogh-rotate">
                  <path d="M50,10 Q70,30 50,50 Q30,70 50,90 Q70,70 90,50 Q70,30 50,10" 
                        fill="none" stroke="var(--van-gogh-yellow)" strokeWidth="3" strokeDasharray="5,5"/>
                </svg>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* 功能卡片網格 - 梵高風格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {[
            {
              title: 'AI 智能助手',
              description: '如梵高的畫筆般精準，AI助手理解您的每個創意',
              icon: '🎨',
              color: 'blue'
            },
            {
              title: '視覺化看板',
              description: '將項目轉化為動態的藝術作品，每個階段都是新的色彩',
              icon: '🖼️',
              color: 'purple'
            },
            {
              title: '智能分析',
              description: '如藝術評論家般深入，洞察項目的每個細節',
              icon: '📊',
              color: 'yellow'
            },
            {
              title: '協作畫布',
              description: '團隊如藝術家般協作，共同創造項目傑作',
              icon: '👥',
              color: 'green'
            },
            {
              title: '時間管理',
              description: '如梵高對光影的掌控，精確管理每個時刻',
              icon: '⏰',
              color: 'red'
            },
            {
              title: '成果展示',
              description: '將完成的項目如藝術品般精美展示',
              icon: '🏆',
              color: 'orange'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card 
                variant="van-gogh" 
                size="md" 
                className="h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group"
              >
                <div className="p-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-800 mb-4 group-hover:text-neutral-900 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed group-hover:text-neutral-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 底部CTA區域 */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Card variant="van-gogh" size="lg" className="p-12 text-center">
            <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-600 bg-clip-text text-transparent">
              開始您的藝術項目管理之旅
            </h3>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              讓AI與藝術的完美結合，為您的項目管理帶來前所未有的體驗
            </p>
            <Button
              variant="van-gogh"
              size="lg"
              glow
              className="px-12 py-4"
            >
              立即體驗
            </Button>
          </Card>
        </motion.div>
      </div>

      {/* 浮動裝飾元素 */}
      <div className="fixed top-20 right-20 w-64 h-64 opacity-10 pointer-events-none">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <path d="M100,20 Q150,50 120,100 Q90,150 100,180 Q50,150 80,100 Q110,50 100,20" 
                  fill="none" stroke="var(--van-gogh-blue)" strokeWidth="4" strokeDasharray="10,5"/>
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIProjectDesign;