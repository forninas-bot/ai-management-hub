export interface UserSettings {
  id: string;
  displayName: string;
  theme: 'light' | 'dark';
  language: string;
  aiSettings: AISettings;
  pomodoroSettings: PomodoroSettings;
  notificationSettings: NotificationSettings;
}

export interface AISettings {
  defaultModel: string;
  customStyles: AIStyle[];
  activeStyleId: string;
}

export interface AIStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  alarmVolume: number;
}

export interface NotificationSettings {
  desktop: boolean;
  sound: boolean;
  taskReminders: boolean;
  pomodoroAlerts: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  styleId: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime: string;
  completedPomodoros: number;
  totalWorkTime: number;
  totalBreakTime: number;
  interruptions: Interruption[];
  associatedTaskId?: string;
  notes?: string;
}

export interface Interruption {
  time: string;
  reason: string;
  duration: number;
}

export interface PomodoroStats {
  daily: DailyStats;
  weekly: WeeklyStats;
  monthly: MonthlyStats;
}

export interface DailyStats {
  date: string;
  totalPomodoros: number;
  totalWorkTime: number;
  completionRate: number;
  interruptions: number;
}

export interface WeeklyStats {
  week: string;
  totalPomodoros: number;
  totalWorkTime: number;
  completionRate: number;
  interruptions: number;
}

export interface MonthlyStats {
  month: string;
  totalPomodoros: number;
  totalWorkTime: number;
  completionRate: number;
  interruptions: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  format: 'markdown' | 'text';
  createdAt: string;
  updatedAt: string;
  folderId: string;
  tags: string[];
  attachments: Attachment[];
  aiInsights: AIInsight[];
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface AIInsight {
  id: string;
  type: 'summary' | 'keypoints' | 'tasks' | 'analysis';
  content: any;
  createdAt: string;
}

export interface NoteFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'to-do' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  quadrant: 'important-urgent' | 'important-not-urgent' | 'not-important-urgent' | 'not-important-not-urgent';
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  completionPercentage: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  reminders: Reminder[];
  subtasks: Subtask[];
  relatedNoteIds: string[];
  relatedProjectId?: string;
  dependencies?: string[]; // 依賴的任務ID列表
  startDate?: string; // 任務開始日期
}

export interface Reminder {
  time: string;
  message: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed';
  startDate: string;
  targetEndDate: string;
  actualEndDate?: string;
  completionPercentage: number;
  taskIds: string[];
  milestones: Milestone[];
  kanbanColumns: KanbanColumn[];
  tags: string[];
  notes?: string;
}

export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
}

export interface KanbanColumn {
  id: string;
  title: string;
  taskIds: string[];
}