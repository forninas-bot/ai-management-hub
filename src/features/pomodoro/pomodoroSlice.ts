import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PomodoroSession } from '../../types';

interface PomodoroState {
  isActive: boolean;
  mode: 'work' | 'shortBreak' | 'longBreak';
  timeLeft: number;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  completedPomodoros: number;
  currentSession?: PomodoroSession;
  interruptions: Interruption[];
  aiInsights: AIInsight[];
  isAnalyzing: boolean;
  associatedTaskId?: string;
  taskStartTime?: number;
  // 統計數據
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
  customSettings: CustomSettings;
}

interface AIInsight {
  id: string;
  type: 'productivity' | 'focus' | 'break' | 'improvement';
  title: string;
  content: string;
  suggestions: string[];
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface Interruption {
  time: string;
  reason: string;
  duration: number;
}

interface DailyStats {
  date: string;
  completedPomodoros: number;
  totalWorkTime: number; // 分鐘
  totalBreakTime: number; // 分鐘
  interruptions: number;
  productivity: number; // 0-100
  focusScore: number; // 0-100
}

interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalPomodoros: number;
  totalWorkTime: number;
  averageProductivity: number;
  bestDay: string;
  improvementTrend: 'up' | 'down' | 'stable';
}

interface MonthlyStats {
  month: string;
  year: number;
  totalPomodoros: number;
  totalWorkTime: number;
  averageDaily: number;
  productivityTrend: number[];
  goals: {
    target: number;
    achieved: number;
  };
}

interface CustomSettings {
  dailyGoal: number;
  weeklyGoal: number;
  monthlyGoal: number;
  preferredWorkDuration: number;
  preferredBreakDuration: number;
  notifications: {
    dailyReport: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  };
}

const initialState: PomodoroState = {
  isActive: false,
  mode: 'work',
  timeLeft: 25 * 60,
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
  longBreakInterval: 4,
  completedPomodoros: 0,
  interruptions: [],
  aiInsights: [],
  isAnalyzing: false,
  associatedTaskId: undefined,
  taskStartTime: undefined,
  // 統計數據初始值
  dailyStats: [],
  weeklyStats: [],
  monthlyStats: [],
  customSettings: {
    dailyGoal: 8,
    weeklyGoal: 40,
    monthlyGoal: 160,
    preferredWorkDuration: 25 * 60,
    preferredBreakDuration: 5 * 60,
    notifications: {
      dailyReport: true,
      weeklyReport: true,
      monthlyReport: true
    }
  }
};

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    startTimer: (state) => {
      state.isActive = true;
      if (!state.currentSession) {
        state.currentSession = {
          id: `pom-${Date.now()}`,
          startTime: new Date().toISOString(),
          endTime: '',
          completedPomodoros: 0,
          totalWorkTime: 0,
          totalBreakTime: 0,
          interruptions: []
        };
      }
    },
    pauseTimer: (state) => {
      state.isActive = false;
    },
    resetTimer: (state) => {
      state.isActive = false;
      state.timeLeft = state.mode === 'work' ? state.workDuration : 
                     state.mode === 'shortBreak' ? state.shortBreakDuration : 
                     state.longBreakDuration;
    },
    skipTimer: (state) => {
      state.isActive = false;
      state.timeLeft = 0;
    },
    tick: (state) => {
      if (state.isActive && state.timeLeft > 0) {
        state.timeLeft -= 1;
      }
    },
    switchMode: (state) => {
      if (state.mode === 'work') {
        state.completedPomodoros += 1;
        if (state.currentSession) {
          state.currentSession.completedPomodoros += 1;
        }
        
        if (state.completedPomodoros % state.longBreakInterval === 0) {
          state.mode = 'longBreak';
          state.timeLeft = state.longBreakDuration;
        } else {
          state.mode = 'shortBreak';
          state.timeLeft = state.shortBreakDuration;
        }
      } else {
        state.mode = 'work';
        state.timeLeft = state.workDuration;
      }
    },
    recordInterruption: (state, action: PayloadAction<{ reason: string; duration: number }>) => {
      const interruption = {
        time: new Date().toISOString(),
        reason: action.payload.reason,
        duration: action.payload.duration
      };
      state.interruptions.push(interruption);
      if (state.currentSession) {
        state.currentSession.interruptions.push(interruption);
      }
    },
    updateSettings: (state, action: PayloadAction<{
      workDuration?: number;
      shortBreakDuration?: number;
      longBreakDuration?: number;
      longBreakInterval?: number;
    }>) => {
      if (action.payload.workDuration) {
        state.workDuration = action.payload.workDuration * 60;
        if (state.mode === 'work') {
          state.timeLeft = action.payload.workDuration * 60;
        }
      }
      if (action.payload.shortBreakDuration) {
        state.shortBreakDuration = action.payload.shortBreakDuration * 60;
        if (state.mode === 'shortBreak') {
          state.timeLeft = action.payload.shortBreakDuration * 60;
        }
      }
      if (action.payload.longBreakDuration) {
        state.longBreakDuration = action.payload.longBreakDuration * 60;
        if (state.mode === 'longBreak') {
          state.timeLeft = action.payload.longBreakDuration * 60;
        }
      }
      if (action.payload.longBreakInterval) {
        state.longBreakInterval = action.payload.longBreakInterval;
      }
    },
    completeSession: (state) => {
      if (state.currentSession) {
        state.currentSession.endTime = new Date().toISOString();
        state.currentSession.totalWorkTime = state.completedPomodoros * state.workDuration;
        state.currentSession.totalBreakTime = 
          (Math.floor(state.completedPomodoros / state.longBreakInterval) * state.longBreakDuration) +
          ((state.completedPomodoros % state.longBreakInterval) * state.shortBreakDuration);
      }
      state.currentSession = undefined;
      state.completedPomodoros = 0;
      state.interruptions = [];
    },
    requestAIAnalysis: (state) => {
      state.isAnalyzing = true;
    },
    receiveAIAnalysis: (state, action: PayloadAction<AIInsight>) => {
      state.aiInsights.unshift(action.payload);
      state.isAnalyzing = false;
      // 保持最多10個洞察
      if (state.aiInsights.length > 10) {
        state.aiInsights = state.aiInsights.slice(0, 10);
      }
    },
    clearAIInsights: (state) => {
      state.aiInsights = [];
    },
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
    },
    associateTask: (state, action: PayloadAction<string>) => {
      state.associatedTaskId = action.payload;
      state.taskStartTime = Date.now();
    },
    clearTaskAssociation: (state) => {
      state.associatedTaskId = undefined;
      state.taskStartTime = undefined;
    },
    // 統計相關actions
    updateDailyStats: (state, action: PayloadAction<{ date: string; completedPomodoros: number; workTime: number; breakTime: number; interruptions: number }>) => {
      const { date, completedPomodoros, workTime, breakTime, interruptions } = action.payload;
      const existingIndex = state.dailyStats.findIndex(stat => stat.date === date);
      
      const productivity = Math.min(100, Math.max(0, (completedPomodoros / state.customSettings.dailyGoal) * 100));
      const focusScore = Math.min(100, Math.max(0, 100 - (interruptions * 10)));
      
      const newStats: DailyStats = {
        date,
        completedPomodoros,
        totalWorkTime: workTime,
        totalBreakTime: breakTime,
        interruptions,
        productivity,
        focusScore
      };
      
      if (existingIndex >= 0) {
        state.dailyStats[existingIndex] = newStats;
      } else {
        state.dailyStats.push(newStats);
      }
    },
    generateWeeklyReport: (state, action: PayloadAction<{ weekStart: string; weekEnd: string }>) => {
      const { weekStart, weekEnd } = action.payload;
      const weekStats = state.dailyStats.filter(stat => {
        const statDate = new Date(stat.date);
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        return statDate >= start && statDate <= end;
      });
      
      if (weekStats.length > 0) {
        const totalPomodoros = weekStats.reduce((sum, stat) => sum + stat.completedPomodoros, 0);
        const totalWorkTime = weekStats.reduce((sum, stat) => sum + stat.totalWorkTime, 0);
        const averageProductivity = weekStats.reduce((sum, stat) => sum + stat.productivity, 0) / weekStats.length;
        const bestDay = weekStats.reduce((best, current) => 
          current.completedPomodoros > best.completedPomodoros ? current : best
        ).date;
        
        // 計算趨勢
        const firstHalf = weekStats.slice(0, Math.ceil(weekStats.length / 2));
        const secondHalf = weekStats.slice(Math.ceil(weekStats.length / 2));
        const firstAvg = firstHalf.reduce((sum, stat) => sum + stat.productivity, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, stat) => sum + stat.productivity, 0) / secondHalf.length;
        
        let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
        if (secondAvg > firstAvg + 5) improvementTrend = 'up';
        else if (secondAvg < firstAvg - 5) improvementTrend = 'down';
        
        const weeklyReport: WeeklyStats = {
          weekStart,
          weekEnd,
          totalPomodoros,
          totalWorkTime,
          averageProductivity,
          bestDay,
          improvementTrend
        };
        
        const existingIndex = state.weeklyStats.findIndex(stat => stat.weekStart === weekStart);
        if (existingIndex >= 0) {
          state.weeklyStats[existingIndex] = weeklyReport;
        } else {
          state.weeklyStats.push(weeklyReport);
        }
      }
    },
    generateMonthlyReport: (state, action: PayloadAction<{ month: string; year: number }>) => {
      const { month, year } = action.payload;
      const monthStats = state.dailyStats.filter(stat => {
        const statDate = new Date(stat.date);
        return statDate.getMonth() === parseInt(month) - 1 && statDate.getFullYear() === year;
      });
      
      if (monthStats.length > 0) {
        const totalPomodoros = monthStats.reduce((sum, stat) => sum + stat.completedPomodoros, 0);
        const totalWorkTime = monthStats.reduce((sum, stat) => sum + stat.totalWorkTime, 0);
        const averageDaily = totalPomodoros / monthStats.length;
        const productivityTrend = monthStats.map(stat => stat.productivity);
        
        const monthlyReport: MonthlyStats = {
          month,
          year,
          totalPomodoros,
          totalWorkTime,
          averageDaily,
          productivityTrend,
          goals: {
            target: state.customSettings.monthlyGoal,
            achieved: totalPomodoros
          }
        };
        
        const existingIndex = state.monthlyStats.findIndex(stat => stat.month === month && stat.year === year);
        if (existingIndex >= 0) {
          state.monthlyStats[existingIndex] = monthlyReport;
        } else {
          state.monthlyStats.push(monthlyReport);
        }
      }
    },
    updateCustomSettings: (state, action: PayloadAction<Partial<CustomSettings>>) => {
      state.customSettings = { ...state.customSettings, ...action.payload };
    }
  }
});

export const {
  startTimer,
  pauseTimer,
  resetTimer,
  skipTimer,
  tick,
  switchMode,
  recordInterruption,
  updateSettings,
  completeSession,
  requestAIAnalysis,
  receiveAIAnalysis,
  clearAIInsights,
  setAnalyzing,
  associateTask,
  clearTaskAssociation,
  updateDailyStats,
  generateWeeklyReport,
  generateMonthlyReport,
  updateCustomSettings
} = pomodoroSlice.actions;

export default pomodoroSlice.reducer;