import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SimpleEnhancedMouseEffect from '../components/effects/SimpleEnhancedMouseEffect';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type SimpleEffectType = 'fire-trail' | 'lightning' | 'butterfly' | 'crystal';

const SimpleEnhancedMouseEffectsDemo: React.FC = () => {
  const [selectedEffect, setSelectedEffect] = useState<SimpleEffectType>('fire-trail');
  const [effectColor, setEffectColor] = useState('#ff4500');
  const [effectSize, setEffectSize] = useState(12);
  const [effectOpacity, setEffectOpacity] = useState(0.8);
  const [isEnabled, setIsEnabled] = useState(true);

  const effects = [
    { 
      id: 'fire-trail', 
      name: '🔥 火焰轨迹', 
      description: '燃烧的火焰轨迹，热情奔放',
      defaultColor: '#ff4500',
      category: '轨迹效果'
    },
    { 
      id: 'lightning', 
      name: '⚡ 闪电效果', 
      description: '炫目的闪电分支，速度激情',
      defaultColor: '#9400d3',
      category: '能量效果'
    },
    { 
      id: 'butterfly', 
      name: '🦋 蝴蝶效果', 
      description: '飞舞的蝴蝶群，优雅灵动',
      defaultColor: '#ff69b4',
      category: '生物效果'
    },
    { 
      id: 'crystal', 
      name: '💎 水晶效果', 
      description: '旋转的水晶多边形，纯净闪耀',
      defaultColor: '#00ff7f',
      category: '几何效果'
    },
  ];

  const presetColors = [
    { name: '火焰红', value: '#ff4500' },
    { name: '闪电紫', value: '#9400d3' },
    { name: '蝴蝶粉', value: '#ff69b4' },
    { name: '水晶绿', value: '#00ff7f' },
    { name: '天空蓝', value: '#00bfff' },
    { name: '日落橙', value: '#ff8c00' },
  ];

  const currentEffect = effects.find(e => e.id === selectedEffect);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* 简化的鼠标效果 */}
      {isEnabled && (
        <SimpleEnhancedMouseEffect
          type={selectedEffect}
          color={effectColor}
          size={effectSize}
          opacity={effectOpacity}
        />
      )}

      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-bounce" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
            炫酷鼠标效果
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            体验火焰、闪电、蝴蝶、水晶四种震撼效果
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant={isEnabled ? 'primary' : 'secondary'}
              onClick={() => setIsEnabled(!isEnabled)}
            >
              {isEnabled ? '关闭效果' : '开启效果'}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 效果选择 */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">选择效果</h3>
              <div className="space-y-3">
                {effects.map((effect) => (
                  <motion.div
                    key={effect.id}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      selectedEffect === effect.id
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => {
                      setSelectedEffect(effect.id as SimpleEffectType);
                      setEffectColor(effect.defaultColor);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{effect.name.split(' ')[0]}</div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{effect.name.split(' ')[1]}</div>
                        <div className="text-sm text-gray-300">{effect.description}</div>
                        <div className="text-xs text-blue-400 mt-1">{effect.category}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* 颜色选择 */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">颜色选择</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {presetColors.map((color) => (
                  <button
                    key={color.value}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      effectColor === color.value
                        ? 'border-white scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEffectColor(color.value)}
                    title={color.name}
                  >
                    <div className="text-xs text-white font-medium">{color.name}</div>
                  </button>
                ))}
              </div>
              
              {/* 自定义颜色 */}
              <div className="flex space-x-2">
                <input
                  type="color"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-600 bg-transparent cursor-pointer"
                />
                <input
                  type="text"
                  value={effectColor}
                  onChange={(e) => setEffectColor(e.target.value)}
                  className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm"
                  placeholder="#ff4500"
                />
              </div>
            </Card>
          </div>

          {/* 预览区域 */}
          <div>
            <Card variant="glass" className="p-8 h-80 flex items-center justify-center relative overflow-hidden mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-center"
              >
                <div className="text-6xl mb-4 animate-bounce">🖱️</div>
                <h3 className="text-2xl font-bold text-white mb-2">移动鼠标</h3>
                <p className="text-gray-300 mb-4">
                  当前: <span className="text-cyan-400 font-semibold">{currentEffect?.name}</span>
                </p>
                <div className="text-sm text-gray-400">
                  {currentEffect?.description}
                </div>
              </motion.div>
              
              {/* 动态装饰 */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                  style={{
                    left: `${15 + Math.random() * 70}%`,
                    top: `${15 + Math.random() * 70}%`,
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    delay: i * 0.6,
                  }}
                />
              ))}
            </Card>

            {/* 参数控制 */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">参数调节</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    大小: {effectSize}px
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="25"
                    value={effectSize}
                    onChange={(e) => setEffectSize(Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
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
              </div>

              {/* 预设配置 */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-white mb-3">快速预设</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEffectColor('#ff4500');
                      setEffectSize(15);
                      setEffectOpacity(0.9);
                      setSelectedEffect('fire-trail');
                    }}
                  >
                    🔥 烈焰
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEffectColor('#9400d3');
                      setEffectSize(12);
                      setEffectOpacity(0.8);
                      setSelectedEffect('lightning');
                    }}
                  >
                    ⚡ 闪电
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEffectColor('#ff69b4');
                      setEffectSize(10);
                      setEffectOpacity(0.8);
                      setSelectedEffect('butterfly');
                    }}
                  >
                    🦋 蝴蝶
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setEffectColor('#00ff7f');
                      setEffectSize(14);
                      setEffectOpacity(0.85);
                      setSelectedEffect('crystal');
                    }}
                  >
                    💎 水晶
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* 说明和提示 */}
          <div className="space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">效果说明</h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span>🔥</span>
                  <div>
                    <div className="font-medium text-white">火焰轨迹</div>
                    <div>燃烧的火焰效果，跟随鼠标留下热情轨迹</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span>⚡</span>
                  <div>
                    <div className="font-medium text-white">闪电效果</div>
                    <div>炫目的闪电分支，瞬间爆发能量光芒</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span>🦋</span>
                  <div>
                    <div className="font-medium text-white">蝴蝶效果</div>
                    <div>优雅的蝴蝶围绕鼠标飞舞，翅膀轻盈扇动</div>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span>💎</span>
                  <div>
                    <div className="font-medium text-white">水晶效果</div>
                    <div>旋转的水晶多边形，纯净闪耀的几何美</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">使用提示</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• 移动鼠标速度越快，效果越明显</li>
                <li>• 可以尝试不同的颜色组合</li>
                <li>• 调整大小和透明度获得最佳视觉体验</li>
                <li>• 使用预设快速切换喜欢的风格</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleEnhancedMouseEffectsDemo;