import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 用戶角色定義
export type UserRole = 'admin' | 'manager' | 'member' | 'viewer';

// 權限定義
export interface Permission {
  resource: string; // 資源名稱 (tasks, projects, notebooks, etc.)
  actions: string[]; // 允許的操作 (create, read, update, delete, share)
}

// 用戶介面
export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 認證狀態介面
export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  users: User[]; // 所有用戶列表（管理員可見）
  loginAttempts: number;
  lastLoginAttempt?: string;
}

// 登入請求介面
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 註冊請求介面
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName: string;
}

// 初始狀態
const initialState: AuthState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  users: [],
  loginAttempts: 0,
  lastLoginAttempt: undefined
};

// 預設權限配置
const getDefaultPermissions = (role: UserRole): Permission[] => {
  const basePermissions: Record<UserRole, Permission[]> = {
    admin: [
      { resource: '*', actions: ['*'] }, // 管理員擁有所有權限
    ],
    manager: [
      { resource: 'tasks', actions: ['create', 'read', 'update', 'delete', 'share'] },
      { resource: 'projects', actions: ['create', 'read', 'update', 'delete', 'share'] },
      { resource: 'notebooks', actions: ['create', 'read', 'update', 'delete', 'share'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'comments', actions: ['create', 'read', 'update', 'delete'] }
    ],
    member: [
      { resource: 'tasks', actions: ['create', 'read', 'update'] },
      { resource: 'projects', actions: ['read', 'update'] },
      { resource: 'notebooks', actions: ['create', 'read', 'update'] },
      { resource: 'comments', actions: ['create', 'read', 'update'] }
    ],
    viewer: [
      { resource: 'tasks', actions: ['read'] },
      { resource: 'projects', actions: ['read'] },
      { resource: 'notebooks', actions: ['read'] },
      { resource: 'comments', actions: ['read'] }
    ]
  };
  
  return basePermissions[role] || basePermissions.viewer;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 開始登入
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // 登入成功
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
      state.loginAttempts = 0;
    },
    
    // 登入失敗
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.loginAttempts += 1;
      state.lastLoginAttempt = new Date().toISOString();
    },
    
    // 開始註冊
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // 註冊成功
    registerSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    
    // 註冊失敗
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // 登出
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
      state.users = [];
    },
    
    // 更新用戶資料
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // 載入所有用戶（管理員功能）
    loadUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    
    // 更新用戶角色（管理員功能）
    updateUserRole: (state, action: PayloadAction<{ userId: string; role: UserRole }>) => {
      const { userId, role } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          role,
          permissions: getDefaultPermissions(role),
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // 停用/啟用用戶（管理員功能）
    toggleUserStatus: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      const userIndex = state.users.findIndex(user => user.id === userId);
      if (userIndex !== -1) {
        state.users[userIndex] = {
          ...state.users[userIndex],
          isActive: !state.users[userIndex].isActive,
          updatedAt: new Date().toISOString()
        };
      }
    },
    
    // 清除錯誤
    clearError: (state) => {
      state.error = null;
    },
    
    // 重置登入嘗試次數
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = undefined;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  updateUserProfile,
  loadUsers,
  updateUserRole,
  toggleUserStatus,
  clearError,
  resetLoginAttempts
} = authSlice.actions;

export default authSlice.reducer;

// 選擇器
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.currentUser;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectUsers = (state: { auth: AuthState }) => state.auth.users;
export const selectLoginAttempts = (state: { auth: AuthState }) => state.auth.loginAttempts;

// 權限檢查輔助函數
export const hasPermission = (user: User | null, resource: string, action: string): boolean => {
  if (!user || !user.isActive) return false;
  
  // 管理員擁有所有權限
  if (user.role === 'admin') return true;
  
  // 檢查具體權限
  return user.permissions.some(permission => {
    const resourceMatch = permission.resource === '*' || permission.resource === resource;
    const actionMatch = permission.actions.includes('*') || permission.actions.includes(action);
    return resourceMatch && actionMatch;
  });
};

// 角色檢查輔助函數
export const hasRole = (user: User | null, roles: UserRole | UserRole[]): boolean => {
  if (!user || !user.isActive) return false;
  
  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};