import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 評論介面
export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  resourceType: 'task' | 'project' | 'notebook' | 'pomodoro';
  resourceId: string;
  parentId?: string; // 回覆評論的父評論ID
  mentions: string[]; // 提及的用戶ID列表
  attachments: CommentAttachment[];
  reactions: CommentReaction[];
  isEdited: boolean;
  isPinned: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

// 評論附件介面
export interface CommentAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'link';
  url: string;
  size?: number;
  mimeType?: string;
}

// 評論反應介面
export interface CommentReaction {
  id: string;
  type: '👍' | '👎' | '❤️' | '😄' | '😮' | '😢' | '😡';
  userId: string;
  userName: string;
  createdAt: string;
}

// 評論通知介面
export interface CommentNotification {
  id: string;
  type: 'mention' | 'reply' | 'reaction' | 'new_comment';
  commentId: string;
  resourceType: string;
  resourceId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// 評論狀態介面
export interface CommentsState {
  comments: Record<string, Comment[]>; // 按資源ID分組的評論
  notifications: CommentNotification[];
  isLoading: boolean;
  error: string | null;
  activeResource: {
    type: string;
    id: string;
  } | null;
  realtimeConnected: boolean;
  typingUsers: Record<string, string[]>; // 正在輸入的用戶
}

// 新增評論請求介面
export interface AddCommentRequest {
  content: string;
  resourceType: 'task' | 'project' | 'notebook' | 'pomodoro';
  resourceId: string;
  parentId?: string;
  mentions?: string[];
  attachments?: CommentAttachment[];
}

// 更新評論請求介面
export interface UpdateCommentRequest {
  commentId: string;
  content: string;
  mentions?: string[];
}

// 初始狀態
const initialState: CommentsState = {
  comments: {},
  notifications: [],
  isLoading: false,
  error: null,
  activeResource: null,
  realtimeConnected: false,
  typingUsers: {}
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {
    // 設置活動資源
    setActiveResource: (state, action: PayloadAction<{ type: string; id: string }>) => {
      state.activeResource = action.payload;
    },
    
    // 載入評論開始
    loadCommentsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    
    // 載入評論成功
    loadCommentsSuccess: (state, action: PayloadAction<{ resourceId: string; comments: Comment[] }>) => {
      const { resourceId, comments } = action.payload;
      state.isLoading = false;
      state.comments[resourceId] = comments.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    
    // 載入評論失敗
    loadCommentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    
    // 新增評論
    addComment: (state, action: PayloadAction<Comment>) => {
      const comment = action.payload;
      const resourceId = comment.resourceId;
      
      if (!state.comments[resourceId]) {
        state.comments[resourceId] = [];
      }
      
      state.comments[resourceId].push(comment);
      state.comments[resourceId].sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    },
    
    // 更新評論
    updateComment: (state, action: PayloadAction<{ commentId: string; updates: Partial<Comment> }>) => {
      const { commentId, updates } = action.payload;
      
      Object.keys(state.comments).forEach(resourceId => {
        const commentIndex = state.comments[resourceId].findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          state.comments[resourceId][commentIndex] = {
            ...state.comments[resourceId][commentIndex],
            ...updates,
            isEdited: true,
            updatedAt: new Date().toISOString()
          };
        }
      });
    },
    
    // 刪除評論
    deleteComment: (state, action: PayloadAction<string>) => {
      const commentId = action.payload;
      
      Object.keys(state.comments).forEach(resourceId => {
        const commentIndex = state.comments[resourceId].findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          state.comments[resourceId][commentIndex] = {
            ...state.comments[resourceId][commentIndex],
            isDeleted: true,
            content: '[此評論已被刪除]',
            updatedAt: new Date().toISOString()
          };
        }
      });
    },
    
    // 切換評論置頂
    toggleCommentPin: (state, action: PayloadAction<string>) => {
      const commentId = action.payload;
      
      Object.keys(state.comments).forEach(resourceId => {
        const commentIndex = state.comments[resourceId].findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          state.comments[resourceId][commentIndex].isPinned = 
            !state.comments[resourceId][commentIndex].isPinned;
        }
      });
    },
    
    // 新增評論反應
    addCommentReaction: (state, action: PayloadAction<{ commentId: string; reaction: CommentReaction }>) => {
      const { commentId, reaction } = action.payload;
      
      Object.keys(state.comments).forEach(resourceId => {
        const commentIndex = state.comments[resourceId].findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          const comment = state.comments[resourceId][commentIndex];
          
          // 移除用戶之前的反應（如果存在）
          comment.reactions = comment.reactions.filter(r => r.userId !== reaction.userId);
          
          // 添加新反應
          comment.reactions.push(reaction);
        }
      });
    },
    
    // 移除評論反應
    removeCommentReaction: (state, action: PayloadAction<{ commentId: string; userId: string }>) => {
      const { commentId, userId } = action.payload;
      
      Object.keys(state.comments).forEach(resourceId => {
        const commentIndex = state.comments[resourceId].findIndex(c => c.id === commentId);
        if (commentIndex !== -1) {
          const comment = state.comments[resourceId][commentIndex];
          comment.reactions = comment.reactions.filter(r => r.userId !== userId);
        }
      });
    },
    
    // 載入通知
    loadNotifications: (state, action: PayloadAction<CommentNotification[]>) => {
      state.notifications = action.payload.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    },
    
    // 新增通知
    addNotification: (state, action: PayloadAction<CommentNotification>) => {
      state.notifications.unshift(action.payload);
    },
    
    // 標記通知為已讀
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
      }
    },
    
    // 標記所有通知為已讀
    markAllNotificationsAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.isRead = true;
      });
    },
    
    // 設置即時連接狀態
    setRealtimeConnected: (state, action: PayloadAction<boolean>) => {
      state.realtimeConnected = action.payload;
    },
    
    // 更新正在輸入的用戶
    updateTypingUsers: (state, action: PayloadAction<{ resourceId: string; users: string[] }>) => {
      const { resourceId, users } = action.payload;
      state.typingUsers[resourceId] = users;
    },
    
    // 清除錯誤
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setActiveResource,
  loadCommentsStart,
  loadCommentsSuccess,
  loadCommentsFailure,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentPin,
  addCommentReaction,
  removeCommentReaction,
  loadNotifications,
  addNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setRealtimeConnected,
  updateTypingUsers,
  clearError
} = commentsSlice.actions;

export default commentsSlice.reducer;

// 選擇器
export const selectCommentsByResource = (resourceId: string) => 
  (state: { comments: CommentsState }) => state.comments.comments[resourceId] || [];

export const selectNotifications = (state: { comments: CommentsState }) => state.comments.notifications;

export const selectUnreadNotificationsCount = (state: { comments: CommentsState }) => 
  state.comments.notifications.filter(n => !n.isRead).length;

export const selectCommentsLoading = (state: { comments: CommentsState }) => state.comments.isLoading;

export const selectCommentsError = (state: { comments: CommentsState }) => state.comments.error;

export const selectActiveResource = (state: { comments: CommentsState }) => state.comments.activeResource;

export const selectRealtimeConnected = (state: { comments: CommentsState }) => state.comments.realtimeConnected;

export const selectTypingUsers = (resourceId: string) => 
  (state: { comments: CommentsState }) => state.comments.typingUsers[resourceId] || [];

// 輔助函數
export const getCommentReplies = (comments: Comment[], parentId: string): Comment[] => {
  return comments.filter(comment => comment.parentId === parentId);
};

export const getTopLevelComments = (comments: Comment[]): Comment[] => {
  return comments.filter(comment => !comment.parentId && !comment.isDeleted);
};

export const getPinnedComments = (comments: Comment[]): Comment[] => {
  return comments.filter(comment => comment.isPinned && !comment.isDeleted);
};