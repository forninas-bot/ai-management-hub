/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 2025 AI科技風格色彩系統
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49'
        },
        neural: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617'
        },
        ai: {
          cyan: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ec4899',
          green: '#10b981',
          orange: '#f59e0b'
        },
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          medium: 'rgba(255, 255, 255, 0.2)',
          dark: 'rgba(0, 0, 0, 0.1)'
        },
        // 保留舊色彩以確保兼容性
        secondary: '#FFB400',
        accent: '#3A86FF',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
        dark: '#0f172a',
        gray: '#64748b',
        light: '#cbd5e1',
        background: '#ffffff',
        secondaryBg: '#f8fafc',
        lightGray: '#f1f5f9',
        border: '#e2e8f0'
      },
      fontFamily: {
        'ai': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neural': 'neural 8s linear infinite',
        'data-flow': 'dataFlow 3s ease-in-out infinite'
      },
      scrollbar: {
        'thin': {
          'width': '6px',
          'track': 'transparent',
          'thumb': 'rgba(156, 163, 175, 0.7)',
        },
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(14, 165, 233, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.8)' }
        },
        neural: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      backdropBlur: {
        xs: '2px'
      },
      boxShadow: {
        'neural': '0 8px 32px rgba(0, 0, 0, 0.12)',
        'glass': '0 8px 32px rgba(31, 38, 135, 0.37)',
        'ai-glow': '0 0 20px rgba(14, 165, 233, 0.3)'
      },
      borderRadius: {
        'neural': '20px'
      }
    },
  },
  plugins: [],
}