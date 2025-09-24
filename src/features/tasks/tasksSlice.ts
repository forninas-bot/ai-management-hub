import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '../../types';

interface AITaskInsight {
  id: string;
  type: 'productivity' | 'priority' | 'time_management' | 'optimization';
  title: string;
  content: string;
  suggestions: string[];
  affectedTasks?: string[];
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
}

interface TaskClassificationResult {
  taskId: string;
  suggestedPriority: 'low' | 'medium' | 'high';
  suggestedQuadrant: 1 | 2 | 3 | 4;
  reasoning: string;
  confidence: number;
}

interface TasksState {
  tasks: Task[];
  activeTask: Task | null;
  isLoading: boolean;
  error: string | null;
  aiInsights: AITaskInsight[];
  isAnalyzing: boolean;
  classificationResults: TaskClassificationResult[];
}

const initialState: TasksState = {
  tasks: [],
  activeTask: null,
  isLoading: false,
  error: null,
  aiInsights: [],
  isAnalyzing: false,
  classificationResults: []
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasks: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchTasksFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectTask: (state, action: PayloadAction<string>) => {
      const task = state.tasks.find(t => t.id === action.payload);
      if (task) {
        state.activeTask = task;
      }
    },
    createTask: (state, action: PayloadAction<Partial<Task>>) => {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: '新任務',
        description: '',
        status: 'to-do',
        priority: 'medium',
        quadrant: 'important-not-urgent',
        completionPercentage: 0,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminders: [],
        subtasks: [],
        relatedNoteIds: [],
        ...action.payload
      };
      state.tasks.unshift(newTask);
      state.activeTask = newTask;
    },
    updateTask: (state, action: PayloadAction<Partial<Task> & { id: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        Object.assign(task, action.payload, { updatedAt: new Date().toISOString() });
        
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = { ...task };
        }
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
      if (state.activeTask?.id === action.payload) {
        state.activeTask = null;
      }
    },
    updateTaskStatus: (state, action: PayloadAction<{ id: string; status: Task['status'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        task.updatedAt = new Date().toISOString();
        
        if (action.payload.status === 'completed') {
          task.completionPercentage = 100;
        }
        
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = { ...task };
        }
      }
    },
    updateTaskPriority: (state, action: PayloadAction<{ id: string; priority: Task['priority'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.priority = action.payload.priority;
        task.updatedAt = new Date().toISOString();
        
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = { ...task };
        }
      }
    },
    updateTaskQuadrant: (state, action: PayloadAction<{ id: string; quadrant: Task['quadrant'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.quadrant = action.payload.quadrant;
        task.updatedAt = new Date().toISOString();
        
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = { ...task };
        }
      }
    },
    addSubtask: (state, action: PayloadAction<{ taskId: string; title: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.subtasks.push({
          id: `subtask-${Date.now()}`,
          title: action.payload.title,
          completed: false
        });
        task.updatedAt = new Date().toISOString();
        
        if (state.activeTask?.id === action.payload.taskId) {
          state.activeTask = { ...task };
        }
      }
    },
    updateSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string; completed: boolean }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        const subtask = task.subtasks.find(st => st.id === action.payload.subtaskId);
        if (subtask) {
          subtask.completed = action.payload.completed;
          task.updatedAt = new Date().toISOString();
          
          if (state.activeTask?.id === action.payload.taskId) {
            state.activeTask = { ...task };
          }
        }
      }
    },
    deleteSubtask: (state, action: PayloadAction<{ taskId: string; subtaskId: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.subtasks = task.subtasks.filter(st => st.id !== action.payload.subtaskId);
        task.updatedAt = new Date().toISOString();
        
        if (state.activeTask?.id === action.payload.taskId) {
          state.activeTask = { ...task };
        }
      }
    },
    addTag: (state, action: PayloadAction<{ taskId: string; tag: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task && !task.tags.includes(action.payload.tag)) {
        task.tags.push(action.payload.tag);
        task.updatedAt = new Date().toISOString();
        
        if (state.activeTask?.id === action.payload.taskId) {
          state.activeTask = { ...task };
        }
      }
    },
    removeTag: (state, action: PayloadAction<{ taskId: string; tag: string }>) => {
      const task = state.tasks.find(t => t.id === action.payload.taskId);
      if (task) {
        task.tags = task.tags.filter(tag => tag !== action.payload.tag);
        task.updatedAt = new Date().toISOString();
        
        if (state.activeTask?.id === action.payload.taskId) {
          state.activeTask = { ...task };
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    requestAIAnalysis: (state) => {
      state.isAnalyzing = true;
    },
    receiveAIInsight: (state, action: PayloadAction<AITaskInsight>) => {
      state.isAnalyzing = false;
      state.aiInsights.unshift(action.payload);
      // 保持最多10個洞察
      if (state.aiInsights.length > 10) {
        state.aiInsights = state.aiInsights.slice(0, 10);
      }
    },
    clearAIInsights: (state) => {
      state.aiInsights = [];
    },
    receiveTaskClassification: (state, action: PayloadAction<TaskClassificationResult>) => {
      const existingIndex = state.classificationResults.findIndex(
        result => result.taskId === action.payload.taskId
      );
      
      if (existingIndex >= 0) {
        state.classificationResults[existingIndex] = action.payload;
      } else {
        state.classificationResults.push(action.payload);
      }
    },
    applyAIClassification: (state, action: PayloadAction<{ taskId: string; acceptClassification: boolean }>) => {
      const { taskId, acceptClassification } = action.payload;
      
      if (acceptClassification) {
        const classification = state.classificationResults.find(r => r.taskId === taskId);
        const task = state.tasks.find(t => t.id === taskId);
        
        if (classification && task) {
          task.priority = classification.suggestedPriority;
          const quadrantMap = {
            1: 'important-urgent' as const,
            2: 'important-not-urgent' as const,
            3: 'not-important-urgent' as const,
            4: 'not-important-not-urgent' as const
          };
          task.quadrant = quadrantMap[classification.suggestedQuadrant];
          task.updatedAt = new Date().toISOString();
          
          if (state.activeTask?.id === taskId) {
            state.activeTask = { ...task };
          }
        }
      }
      
      // 移除分類結果
      state.classificationResults = state.classificationResults.filter(
        result => result.taskId !== taskId
      );
    },
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
    }
  }
});

export const {
  fetchTasks,
  fetchTasksSuccess,
  fetchTasksFailure,
  selectTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskQuadrant,
  addSubtask,
  updateSubtask,
  deleteSubtask,
  addTag,
  removeTag,
  setLoading,
  setError,
  requestAIAnalysis,
  receiveAIInsight,
  clearAIInsights,
  receiveTaskClassification,
  applyAIClassification,
  setAnalyzing
} = tasksSlice.actions;

export default tasksSlice.reducer;