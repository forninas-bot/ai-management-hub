import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MouseEffect } from '../components/effects';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type MouseEffectType = 'trail' | 'particles' | 'ripple' | 'glow';

const MouseEffectsDemo: React.FC = () => {
  const [selectedEffect, setSelectedEffect] = useState<MouseEffectType>('trail');
  const [effectColor, setEffectColor] = useState('#3b82f6');
  const [effectSize, setEffectSize] = useState(8);
  const [effectOpacity, setEffectOpacity] = useState(0.6);
  const [isEnabled, setIsEnabled] = useState(true);

  const colors = [
    { name: '蓝色', value: '#3b82f6' },
    { name: '紫色', value: '#8b5cf6' },
    { name: '粉色', value: '#ec4899' },
    { name: '绿色', value: '#10b981' },
    { name: '橙色', value: '#f59e0b' },
    { name: '红色', value: '#ef4444' },
    { name: '青色', value: '#06b6d4' },
    { name: '黄色', value: '#eab308' },
  ];

  const effects = [
    { id: 'trail', name: '轨迹效果', description: '鼠标移动时留下渐隐的轨迹' },
    { id: 'particles', name: '粒子效果', description: '鼠标周围产生脉动的粒子' },
    { id: 'ripple', name: '涟漪效果', description: '鼠标移动时产生涟漪扩散' },
    { id: 'glow', name: '光晕效果', description: '鼠标周围有柔和的光晕' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden">
      {/* 鼠标效果 */}
      {isEnabled && (
        <MouseEffect
          type={selectedEffect}
          color={effectColor}
          size={effectSize}
          opacity={effectOpacity}
        />
      )}

      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            鼠标效果实验室
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            体验各种炫酷的鼠标跟随效果
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
          {/* 控制面板 */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">效果类型</h3>
              <div className="space-y-3">
                {effects.map((effect) => (
                  <div
                    key={effect.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      selectedEffect === effect.id
                        ? 'bg-blue-500/20 border border-blue-500'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedEffect(effect.id as MouseEffectType)}
                  >
                    <div className="font-medium text-white">{effect.name}</div>
                    <div className="text-sm text-gray-300">{effect.description}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">颜色选择</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      effectColor === color.value
                        ? 'border-white scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEffectColor(color.value)}
                    title={color.name}
                  />
                ))}
              </div>
            </Card>

            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">参数调节</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    大小: {effectSize}px
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="20"
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
            </Card>
          </div>

          {/* 预览区域 */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="p-8 h-96 flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="text-6xl mb-4"
                >
                  🖱️
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  移动鼠标体验效果
                </h3>
                <p className="text-gray-300">
                  当前效果: <span className="text-blue-400 font-semibold">
                    {effects.find(e => e.id === selectedEffect)?.name}
                  </span>
                </p>
              </div>
              
              {/* 装饰性元素 */}
              <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-purple-400 rounded-full animate-bounce" />
              <div className="absolute top-1/2 left-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" />
              <div className="absolute bottom-1/2 right-4 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <Card variant="glass" className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {effectSize}px
                </div>
                <div className="text-sm text-gray-300">效果大小</div>
              </Card>
              <Card variant="glass" className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(effectOpacity * 100)}%
                </div>
                <div className="text-sm text-gray-300">透明度</div>
              </Card>
            </div>
          </div>
        </div>

        {/* 说明文档 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-8"
        >
          <Card variant="glass" className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">使用说明</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">效果类型</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>轨迹效果:</strong> 留下渐隐的鼠标轨迹</li>
                  <li>• <strong>粒子效果:</strong> 脉动的粒子动画</li>
                  <li>• <strong>涟漪效果:</strong> 扩散的涟漪波纹</li>
                  <li>• <strong>光晕效果:</strong> 柔和的光晕效果</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">自定义选项</h4>
                <ul className="space-y-1 text-sm">
                  <li>• <strong>颜色:</strong> 8种预设颜色可选</li>
                  <li>• <strong>大小:</strong> 4-20px可调节</li>
                  <li>• <strong>透明度:</strong> 10-100%可调节</li>
                  <li>• <strong>开关:</strong> 随时启用或禁用效果</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MouseEffectsDemo;