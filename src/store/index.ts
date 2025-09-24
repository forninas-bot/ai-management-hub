import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// 導入現有的 reducers
import tasksReducer from '../features/tasks/tasksSlice';
import projectsReducer from '../features/projects/projectsSlice';
import notebookReducer from '../features/notebook/notebookSlice';
import pomodoroReducer from '../features/pomodoro/pomodoroSlice';

// 導入新的 reducers
import authReducer from '../features/auth/authSlice';
import commentsReducer from '../features/comments/commentsSlice';

// 配置 store
export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    projects: projectsReducer,
    notebook: notebookReducer,
    pomodoro: pomodoroReducer,
    auth: authReducer,
    comments: commentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略這些 action types 的序列化檢查
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/REGISTER',
        ],
        // 忽略這些 paths 的序列化檢查
        ignoredPaths: [
          'register',
          'rehydrate',
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

// 導出 store 類型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 導出 typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// 默認導出
export default store;