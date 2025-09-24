import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { setActiveStyle } from '../../features/settings/settingsSlice';

const StyleSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { customStyles, activeStyleId } = useAppSelector(state => state.settings.aiSettings);
  const [isOpen, setIsOpen] = useState(false);

  const handleStyleSelect = (styleId: string) => {
    dispatch(setActiveStyle(styleId));
    setIsOpen(false);
  };

  const activeStyle = customStyles.find(style => style.id === activeStyleId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-secondaryBg hover:bg-secondaryBg/80 text-dark rounded-lg px-3 py-2 text-sm font-medium transition-colors"
      >
        {activeStyle?.name || '選擇風格'}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-border z-10">
          <div className="p-2">
            {customStyles.map(style => (
              <button
                key={style.id}
                onClick={() => handleStyleSelect(style.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  activeStyleId === style.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-secondaryBg text-dark'
                }`}
              >
                <div className="font-medium text-sm">{style.name}</div>
                <div className="text-xs text-gray mt-1">{style.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleSelector;