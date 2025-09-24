import { configureStore } from '@reduxjs/toolkit';
import chatReducer from '../features/chat/chatSlice';
import pomodoroReducer from '../features/pomodoro/pomodoroSlice';
import notebookReducer from '../features/notebook/notebookSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import projectsReducer from '../features/projects/projectsSlice';
import settingsReducer from '../features/settings/settingsSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    pomodoro: pomodoroReducer,
    notebook: notebookReducer,
    tasks: tasksReducer,
    projects: projectsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;