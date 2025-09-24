import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../../types';
import { AIProjectInsight, ProjectRiskAssessment, ProjectOptimization } from '../../services/projectAIService';

interface ProjectsState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;
  aiInsights: AIProjectInsight[];
  riskAssessments: { [projectId: string]: ProjectRiskAssessment };
  optimizations: { [projectId: string]: ProjectOptimization };
  isAnalyzing: boolean;
}

const initialState: ProjectsState = {
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null,
  aiInsights: [],
  riskAssessments: {},
  optimizations: {},
  isAnalyzing: false
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    fetchProjects: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectProject: (state, action: PayloadAction<string>) => {
      const project = state.projects.find(p => p.id === action.payload);
      if (project) {
        state.activeProject = project;
      }
    },
    createProject: (state, action: PayloadAction<Partial<Project>>) => {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        title: '新專案',
        description: '',
        status: 'planning',
        startDate: new Date().toISOString(),
        targetEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        completionPercentage: 0,
        taskIds: [],
        milestones: [],
        kanbanColumns: [
          { id: 'todo', title: '待辦', taskIds: [] },
          { id: 'in-progress', title: '進行中', taskIds: [] },
          { id: 'completed', title: '已完成', taskIds: [] }
        ],
        tags: [],
        ...action.payload
      };
      state.projects.unshift(newProject);
      state.activeProject = newProject;
    },
    updateProject: (state, action: PayloadAction<Partial<Project> & { id: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.id);
      if (project) {
        Object.assign(project, action.payload);
        
        if (state.activeProject?.id === action.payload.id) {
          state.activeProject = { ...project };
        }
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload);
      if (state.activeProject?.id === action.payload) {
        state.activeProject = null;
      }
    },
    updateProjectStatus: (state, action: PayloadAction<{ id: string; status: Project['status'] }>) => {
      const project = state.projects.find(p => p.id === action.payload.id);
      if (project) {
        project.status = action.payload.status;
        
        if (state.activeProject?.id === action.payload.id) {
          state.activeProject = { ...project };
        }
      }
    },
    addTaskToProject: (state, action: PayloadAction<{ projectId: string; taskId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.taskIds.push(action.payload.taskId);
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    updateProjectProgress: (state, action: PayloadAction<{ projectId: string; tasks: any[] }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        const projectTasks = action.payload.tasks.filter(task => project.taskIds.includes(task.id));
        const completedTasks = projectTasks.filter(task => task.status === 'completed');
        const completionPercentage = projectTasks.length > 0 ? Math.round((completedTasks.length / projectTasks.length) * 100) : 0;
        
        project.completionPercentage = completionPercentage;
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    removeTaskFromProject: (state, action: PayloadAction<{ projectId: string; taskId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.taskIds = project.taskIds.filter(id => id !== action.payload.taskId);
        
        // 也從看板欄位中移除
        project.kanbanColumns.forEach(column => {
          column.taskIds = column.taskIds.filter(id => id !== action.payload.taskId);
        });
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    addMilestone: (state, action: PayloadAction<{ projectId: string; title: string; dueDate: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.milestones.push({
          id: `milestone-${Date.now()}`,
          title: action.payload.title,
          dueDate: action.payload.dueDate,
          completed: false,
          completedAt: undefined
        });
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    updateMilestone: (state, action: PayloadAction<{ 
      projectId: string; 
      milestoneId: string; 
      updates: { title?: string; dueDate?: string; completed?: boolean } 
    }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        const milestone = project.milestones.find(m => m.id === action.payload.milestoneId);
        if (milestone) {
          if (action.payload.updates.title !== undefined) {
            milestone.title = action.payload.updates.title;
          }
          if (action.payload.updates.dueDate !== undefined) {
            milestone.dueDate = action.payload.updates.dueDate;
          }
          if (action.payload.updates.completed !== undefined) {
            milestone.completed = action.payload.updates.completed;
            milestone.completedAt = action.payload.updates.completed ? new Date().toISOString() : undefined;
          }
        }
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    deleteMilestone: (state, action: PayloadAction<{ projectId: string; milestoneId: string }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.milestones = project.milestones.filter(m => m.id !== action.payload.milestoneId);
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    updateKanbanColumns: (state, action: PayloadAction<{ projectId: string; columns: Project['kanbanColumns'] }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        project.kanbanColumns = action.payload.columns;
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
        }
      }
    },
    moveTaskInKanban: (state, action: PayloadAction<{
      projectId: string;
      taskId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      destinationIndex: number;
    }>) => {
      const project = state.projects.find(p => p.id === action.payload.projectId);
      if (project) {
        const sourceColumn = project.kanbanColumns.find(col => col.id === action.payload.sourceColumnId);
        const destColumn = project.kanbanColumns.find(col => col.id === action.payload.destinationColumnId);
        
        if (sourceColumn && destColumn) {
          // 從源欄位移除
          sourceColumn.taskIds = sourceColumn.taskIds.filter(id => id !== action.payload.taskId);
          
          // 在目標欄位插入
          destColumn.taskIds.splice(action.payload.destinationIndex, 0, action.payload.taskId);
        }
        
        if (state.activeProject?.id === action.payload.projectId) {
          state.activeProject = { ...project };
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
    receiveAIInsight: (state, action: PayloadAction<AIProjectInsight>) => {
      state.aiInsights.unshift(action.payload);
      state.isAnalyzing = false;
    },
    receiveRiskAssessment: (state, action: PayloadAction<{ projectId: string; assessment: ProjectRiskAssessment }>) => {
      state.riskAssessments[action.payload.projectId] = action.payload.assessment;
      state.isAnalyzing = false;
    },
    receiveOptimization: (state, action: PayloadAction<{ projectId: string; optimization: ProjectOptimization }>) => {
      state.optimizations[action.payload.projectId] = action.payload.optimization;
      state.isAnalyzing = false;
    },
    clearAIInsights: (state) => {
      state.aiInsights = [];
    },
    setAnalyzing: (state, action: PayloadAction<boolean>) => {
      state.isAnalyzing = action.payload;
    }
  }
});

export const {
  fetchProjects,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  selectProject,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  addTaskToProject,
  updateProjectProgress,
  removeTaskFromProject,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  updateKanbanColumns,
  moveTaskInKanban,
  setLoading,
  setError,
  requestAIAnalysis,
  receiveAIInsight,
  receiveRiskAssessment,
  receiveOptimization,
  clearAIInsights,
  setAnalyzing
} = projectsSlice.actions;

export default projectsSlice.reducer;