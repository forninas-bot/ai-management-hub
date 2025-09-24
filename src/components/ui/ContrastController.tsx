import React, { useState, useEffect } from 'react';

interface ContrastControllerProps {
  className?: string;
}

const ContrastController: React.FC<ContrastControllerProps> = ({ className = '' }) => {
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [isOpen, setIsOpen] = useState(false);

  // 應用濾鏡效果
  useEffect(() => {
    const filterValue = `contrast(${contrast}%) brightness(${brightness}%) saturate(${saturation}%)`;
    document.documentElement.style.filter = filterValue;
    
    // 保存設置到localStorage
    localStorage.setItem('visual-settings', JSON.stringify({
      contrast,
      brightness,
      saturation
    }));
  }, [contrast, brightness, saturation]);

  // 從localStorage載入設置
  useEffect(() => {
    const saved = localStorage.getItem('visual-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        setContrast(settings.contrast || 100);
        setBrightness(settings.brightness || 100);
        setSaturation(settings.saturation || 100);
      } catch (error) {
        console.warn('Failed to load visual settings:', error);
      }
    }
  }, []);

  // 預設配置
  const presets = {
    default: { contrast: 100, brightness: 100, saturation: 100 },
    eyeCare: { contrast: 95, brightness: 90, saturation: 85 },
    highContrast: { contrast: 130, brightness: 110, saturation: 120 },
    lowLight: { contrast: 85, brightness: 75, saturation: 90 },
    vibrant: { contrast: 110, brightness: 105, saturation: 130 }
  };

  const applyPreset = (preset: keyof typeof presets) => {
    const settings = presets[preset];
    setContrast(settings.contrast);
    setBrightness(settings.brightness);
    setSaturation(settings.saturation);
  };

  const resetToDefault = () => {
    applyPreset('default');
  };

  return (
    <div className={`relative ${className}`}>
      {/* 觸發按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-neural-200/50 hover:bg-neural-300/50 transition-all duration-300 hover:scale-110"
        title="視覺調整"
      >
        🎨
      </button>

      {/* 控制面板 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* 控制面板 */}
          <div className="absolute bottom-full right-0 mb-2 w-80 neural-card p-4 z-50 animate-in slide-in-from-bottom-2">
            <div className="space-y-4">
              {/* 標題 */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neural-800">視覺調整</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neural-500 hover:text-neural-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* 預設配置 */}
              <div>
                <label className="text-xs font-medium text-neural-600 mb-2 block">快速預設</label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(presets).map(([key, _]) => (
                    <button
                      key={key}
                      onClick={() => applyPreset(key as keyof typeof presets)}
                      className="px-3 py-2 text-xs rounded-lg bg-neural-100/50 hover:bg-neural-200/50 transition-colors text-neural-700 hover:text-neural-900"
                    >
                      {{
                        default: '預設',
                        eyeCare: '護眼',
                        highContrast: '高對比',
                        lowLight: '低光',
                        vibrant: '鮮豔'
                      }[key]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 對比度調整 */}
              <div>
                <label className="text-xs font-medium text-neural-600 mb-2 block">
                  對比度: {contrast}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2 bg-neural-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 亮度調整 */}
              <div>
                <label className="text-xs font-medium text-neural-600 mb-2 block">
                  亮度: {brightness}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-neural-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 飽和度調整 */}
              <div>
                <label className="text-xs font-medium text-neural-600 mb-2 block">
                  飽和度: {saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full h-2 bg-neural-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 重置按鈕 */}
              <button
                onClick={resetToDefault}
                className="w-full py-2 text-xs bg-neural-100/50 hover:bg-neural-200/50 rounded-lg transition-colors text-neural-700 hover:text-neural-900"
              >
                重置為預設
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(0, 212, 255), rgb(139, 92, 246));
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgb(0, 212, 255), rgb(139, 92, 246));
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ContrastController;