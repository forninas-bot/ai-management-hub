import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EnhancedMouseEffect from '../components/effects/EnhancedMouseEffect';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type EnhancedMouseEffectType = 'neon-trail' | 'magnetic-field' | 'fire-trail' | 'star-field' | 'lightning' | 'butterfly' | 'galaxy' | 'crystal';

const EnhancedMouseEffectsDemo: React.FC = () => {
  const [selectedEffect, setSelectedEffect] = useState<EnhancedMouseEffectType>('neon-trail');
  const [effectColor, setEffectColor] = useState('#00ffff');
  const [effectSize, setEffectSize] = useState(10);
  const [effectOpacity, setEffectOpacity] = useState(0.8);
  const [effectIntensity, setEffectIntensity] = useState(1);
  const [isEnabled, setIsEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [backgroundMode, setBackgroundMode] = useState('space');

  const effects = [
    { 
      id: 'neon-trail', 
      name: '霓虹轨迹', 
      description: '炫酷的霓虹光轨迹效果',
      icon: '✨',
      category: '轨迹'
    },
    { 
      id: 'fire-trail', 
      name: '火焰轨迹', 
      description: '燃烧的火焰轨迹',
      icon: '🔥',
      category: '轨迹'
    },
    { 
      id: 'magnetic-field', 
      name: '磁场效果', 
      description: '神秘的磁场波纹',
      icon: '🧲',
      category: '场效'
    },
    { 
      id: 'lightning', 
      name: '闪电效果', 
      description: '炫目的闪电分支',
      icon: '⚡',
      category: '能量'
    },
    { 
      id: 'star-field', 
      name: '星域效果', 
      description: '闪烁的星域粒子',
      icon: '⭐',
      category: '粒子'
    },
    { 
      id: 'galaxy', 
      name: '星系效果', 
      description: '螺旋星系粒子',
      icon: '🌌',
      category: '粒子'
    },
    { 
      id: 'crystal', 
      name: '水晶效果', 
      description: '旋转的水晶多边形',
      icon: '💎',
      category: '几何'
    },
    { 
      id: 'butterfly', 
      name: '蝴蝶效果', 
      description: '飞舞的蝴蝶群',
      icon: '🦋',
      category: '生物'
    },
  ];

  const colors = [
    { name: '霓虹蓝', value: '#00ffff', gradient: 'from-cyan-400 to-blue-500' },
    { name: '火焰红', value: '#ff4500', gradient: 'from-red-500 to-orange-500' },
    { name: '闪电紫', value: '#9400d3', gradient: 'from-purple-500 to-violet-500' },
    { name: '星空金', value: '#ffd700', gradient: 'from-yellow-400 to-amber-500' },
    { name: '水晶绿', value: '#00ff7f', gradient: 'from-emerald-400 to-green-500' },
    { name: '蝴蝶粉', value: '#ff69b4', gradient: 'from-pink-400 to-rose-500' },
    { name: '银河银', value: '#c0c0c0', gradient: 'from-gray-300 to-slate-400' },
    { name: '磁场青', value: '#40e0d0', gradient: 'from-teal-400 to-cyan-500' },
  ];

  const backgrounds = [
    { id: 'space', name: '深空', style: 'from-slate-900 via-purple-900 to-slate-900' },
    { id: 'ocean', name: '海洋', style: 'from-blue-900 via-teal-800 to-blue-900' },
    { id: 'forest', name: '森林', style: 'from-green-900 via-emerald-800 to-green-900' },
    { id: 'sunset', name: '日落', style: 'from-orange-900 via-red-800 to-pink-900' },
    { id: 'matrix', name: '矩阵', style: 'from-black via-green-900 to-black' },
    { id: 'aurora', name: '极光', style: 'from-indigo-900 via-purple-800 to-teal-900' },
  ];

  const currentBackground = backgrounds.find(bg => bg.id === backgroundMode);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentBackground?.style} p-6 relative overflow-hidden`}>
      {/* 增强鼠标效果 */}
      {isEnabled && (
        <EnhancedMouseEffect
          type={selectedEffect}
          color={effectColor}
          size={effectSize}
          opacity={effectOpacity}
          intensity={effectIntensity}
        />
      )}

      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-bounce" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-br from-pink-400/10 to-red-400/10 rounded-full blur-lg animate-ping" />
        <div className="absolute bottom-1/3 right-1/3 w-28 h-28 bg-gradient-to-br from-green-400/10 to-teal-400/10 rounded-full blur-xl animate-pulse" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            增强鼠标效果实验室
          </h1>
          <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
            探索下一代鼠标交互效果，体验前所未有的视觉盛宴
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant={isEnabled ? 'primary' : 'secondary'}
              onClick={() => setIsEnabled(!isEnabled)}
              className="px-6 py-3"
            >
              {isEnabled ? '关闭效果' : '开启效果'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-6 py-3"
            >
              {showAdvanced ? '简化模式' : '高级模式'}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* 效果选择面板 */}
          <div className="xl:col-span-1 space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                🎨 效果类型
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {effects.map((effect) => (
                  <motion.div
                    key={effect.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedEffect === effect.id
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50'
                        : 'bg-white/5 hover:bg-white/10 border border-transparent'
                    }`}
                    onClick={() => setSelectedEffect(effect.id as EnhancedMouseEffectType)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{effect.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{effect.name}</div>
                        <div className="text-sm text-gray-300">{effect.description}</div>
                        <div className="text-xs text-blue-400 mt-1">{effect.category}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* 背景选择 */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                🌌 背景主题
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      backgroundMode === bg.id
                        ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                    onClick={() => setBackgroundMode(bg.id)}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* 主要预览区域 */}
          <div className="xl:col-span-2">
            <Card variant="glass" className="p-8 h-[500px] flex items-center justify-center relative overflow-hidden">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-8xl mb-6 animate-bounce"
                >
                  🖱️
                </div>
                <h3 className="text-3xl font-bold text-white mb-4"
                >
                  移动鼠标体验效果
                </h3>
                <p className="text-gray-300 mb-6"
                >
                  当前效果: <span className="text-cyan-400 font-semibold text-xl"
                  >
                    {effects.find(e => e.id === selectedEffect)?.name}
                  </span>
                </p>
                <div className="flex justify-center space-x-4"
                >
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <div className="text-sm text-gray-300">大小</div>
                    <div className="text-lg font-bold text-white">{effectSize}px</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <div className="text-sm text-gray-300">透明度</div>
                    <div className="text-lg font-bold text-white">{Math.round(effectOpacity * 100)}%</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <div className="text-sm text-gray-300">强度</div>
                    <div className="text-lg font-bold text-white">{effectIntensity.toFixed(1)}</div>
                  </div>
                </div>
              </motion.div>
              
              {/* 动态装饰元素 */}
              <AnimatePresence>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </AnimatePresence>
            </Card>

            {/* 参数控制面板 */}
            {showAdvanced && (
              <Card variant="glass" className="p-6 mt-6"
              >
                <h3 className="text-lg font-semibold text-white mb-4">高级参数</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      效果大小: {effectSize}px
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={effectSize}
                      onChange={(e) => setEffectSize(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      透明度: {Math.round(effectOpacity * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={effectOpacity}
                      onChange={(e) => setEffectOpacity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      效果强度: {effectIntensity.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={effectIntensity}
                      onChange={(e) => setEffectIntensity(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* 颜色和控制面板 */}
          <div className="xl:col-span-1 space-y-6"
003e
            <Card variant="glass" className="p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">颜色选择</h3>
              <div className="grid grid-cols-2 gap-3"
              >
                {colors.map((color) => (
                  <motion.button
                    key={color.value}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      effectColor === color.value
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ 
                      background: `linear-gradient(135deg, ${color.value}22, ${color.value}44)`,
                    }}
                    onClick={() => setEffectColor(color.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={color.name}
                  >
                    <div className={`w-6 h-6 rounded-full mx-auto mb-2`} style={{ backgroundColor: color.value }} />
                    <div className="text-xs text-gray-300">{color.name}</div>
                  </motion.button>
                ))}
              </div>
              
              {/* 自定义颜色 */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">自定义颜色</label>
                <div className="flex space-x-2">
                  <input
                    type="color"
                    value={effectColor}
                    onChange={(e) => setEffectColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-600 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={effectColor}
                    onChange={(e) => setEffectColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm"
                    placeholder="#00ffff"
                  />
                </div>
              </div>
            </Card>

            {/* 预设配置 */}
            <Card variant="glass" className="p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">预设配置</h3>
              <div className="space-y-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEffectColor('#00ffff');
                    setEffectSize(12);
                    setEffectOpacity(0.8);
                    setEffectIntensity(1.2);
                    setSelectedEffect('neon-trail');
                  }}
                >
                  🌟 霓虹梦幻
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEffectColor('#ff4500');
                    setEffectSize(15);
                    setEffectOpacity(0.9);
                    setEffectIntensity(1.5);
                    setSelectedEffect('fire-trail');
                  }}
                >
                  🔥 烈焰燃烧
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEffectColor('#ffd700');
                    setEffectSize(8);
                    setEffectOpacity(0.7);
                    setEffectIntensity(2.0);
                    setSelectedEffect('galaxy');
                  }}
                >
                  🌌 星系漫游
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setEffectColor('#ff69b4');
                    setEffectSize(10);
                    setEffectOpacity(0.8);
                    setEffectIntensity(1.0);
                    setSelectedEffect('butterfly');
                  }}
                >
                  🦋 蝴蝶飞舞
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* 特性说明 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-8"
        >
          <Card variant="glass" className="p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">特性说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300"
            >
              <div className="bg-white/5 rounded-lg p-4"
              >
                <h4 className="font-medium text-white mb-2 flex items-center">
                  ⚡ 实时跟踪
                </h4>
                <p className="text-sm">毫秒级鼠标位置跟踪，确保效果与鼠标完美同步</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4"
              >
                <h4 className="font-medium text-white mb-2 flex items-center">
                  🎨 动态渲染
                </h4>
                <p className="text-sm">基于鼠标移动速度和角度智能调整效果强度</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4"
              >
                <h4 className="font-medium text-white mb-2 flex items-center">
                  🌈 多类型支持
                </h4>
                <p className="text-sm">轨迹、粒子、几何、生物等多种效果类型</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4"
              >
                <h4 className="font-medium text-white mb-2 flex items-center">
                  ⚙️ 高度自定义
                </h4>
                <p className="text-sm">颜色、大小、透明度、强度等参数完全可调</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedMouseEffectsDemo;