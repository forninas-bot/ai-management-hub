import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSettings } from '../../types';

const initialState: UserSettings = {
  id: 'user-1',
  displayName: '使用者',
  theme: 'light',
  language: 'zh-TW',
  aiSettings: {
    defaultModel: 'gpt-4',
    customStyles: [
      {
        id: 'minimal',
        name: '極簡風格',
        description: '簡潔直接的回應風格',
        prompt: '你是一個極簡風格的助手，提供簡潔明了的回應，避免冗長解釋。'
      },
      {
        id: 'leverage',
        name: '槓桿思維',
        description: '注重效率和槓桿效應的建議',
        prompt: '你是一個專注於槓桿思維的顧問，總是尋找最有效率的方法和最大的投資回報。'
      }
    ],
    activeStyleId: 'minimal'
  },
  pomodoroSettings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    alarmSound: 'bell',
    alarmVolume: 0.8
  },
  notificationSettings: {
    desktop: true,
    sound: true,
    taskReminders: true,
    pomodoroAlerts: true
  }
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      return { ...state, ...action.payload };
    },
    updateAISettings: (state, action: PayloadAction<Partial<typeof initialState.aiSettings>>) => {
      state.aiSettings = { ...state.aiSettings, ...action.payload };
    },
    updatePomodoroSettings: (state, action: PayloadAction<Partial<typeof initialState.pomodoroSettings>>) => {
      state.pomodoroSettings = { ...state.pomodoroSettings, ...action.payload };
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<typeof initialState.notificationSettings>>) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
    },
    addCustomStyle: (state, action: PayloadAction<typeof initialState.aiSettings.customStyles[0]>) => {
      state.aiSettings.customStyles.push(action.payload);
    },
    removeCustomStyle: (state, action: PayloadAction<string>) => {
      state.aiSettings.customStyles = state.aiSettings.customStyles.filter(
        style => style.id !== action.payload
      );
    },
    setActiveStyle: (state, action: PayloadAction<string>) => {
      state.aiSettings.activeStyleId = action.payload;
    }
  }
});

export const {
  updateSettings,
  updateAISettings,
  updatePomodoroSettings,
  updateNotificationSettings,
  addCustomStyle,
  removeCustomStyle,
  setActiveStyle
} = settingsSlice.actions;

export default settingsSlice.reducer;