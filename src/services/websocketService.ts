import { store } from '../store';
import {
  setRealtimeConnected,
  updateTypingUsers,
  addComment,
  addNotification,
  Comment,
  CommentNotification
} from '../features/comments/commentsSlice';

interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
}

interface TypingMessage {
  resourceId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private typingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private currentUserId: string | null = null;

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  connect(userId: string, token?: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    this.currentUserId = userId;
    
    try {
      // 在實際應用中，這裡應該是你的 WebSocket 服務器地址
      const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
      const url = token ? `${wsUrl}?token=${token}&userId=${userId}` : `${wsUrl}?userId=${userId}`;
      
      this.ws = new WebSocket(url);
      
      this.ws.onopen = this.handleOpen;
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
      
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close(1000, 'Client disconnect');
      }
      
      this.ws = null;
    }

    store.dispatch(setRealtimeConnected(false));
    this.reconnectAttempts = 0;
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    store.dispatch(setRealtimeConnected(true));
    this.reconnectAttempts = 0;
    
    // 開始心跳檢測
    this.startHeartbeat();
    
    // 發送認證消息
    this.sendMessage({
      type: 'auth',
      payload: {
        userId: this.currentUserId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'comment_added':
          this.handleCommentAdded(message.payload);
          break;
          
        case 'comment_updated':
          this.handleCommentUpdated(message.payload);
          break;
          
        case 'comment_deleted':
          this.handleCommentDeleted(message.payload);
          break;
          
        case 'user_typing':
          this.handleUserTyping(message.payload);
          break;
          
        case 'notification':
          this.handleNotification(message.payload);
          break;
          
        case 'pong':
          // 心跳回應
          break;
          
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    store.dispatch(setRealtimeConnected(false));
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    // 如果不是正常關閉，嘗試重連
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    store.dispatch(setRealtimeConnected(false));
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.currentUserId) {
        this.connect(this.currentUserId);
      }
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'ping', payload: {} });
      }
    }, 30000); // 每30秒發送一次心跳
  }

  private handleCommentAdded(comment: Comment): void {
    // 只有不是當前用戶發送的評論才添加到 store
    if (comment.authorId !== this.currentUserId) {
      store.dispatch(addComment(comment));
    }
  }

  private handleCommentUpdated(payload: { commentId: string; updates: Partial<Comment> }): void {
    // 處理評論更新
    // 這裡可以 dispatch 相應的 action
  }

  private handleCommentDeleted(payload: { commentId: string }): void {
    // 處理評論刪除
    // 這裡可以 dispatch 相應的 action
  }

  private handleUserTyping(payload: TypingMessage): void {
    const { resourceId, userId, userName, isTyping } = payload;
    
    // 不處理當前用戶的輸入狀態
    if (userId === this.currentUserId) {
      return;
    }

    const state = store.getState();
    const currentTypingUsers = state.comments.typingUsers[resourceId] || [];
    
    let updatedUsers: string[];
    
    if (isTyping) {
      // 添加用戶到正在輸入列表
      if (!currentTypingUsers.includes(userName)) {
        updatedUsers = [...currentTypingUsers, userName];
      } else {
        updatedUsers = currentTypingUsers;
      }
      
      // 設置超時，自動移除用戶
      const timeoutKey = `${resourceId}-${userId}`;
      if (this.typingTimeouts.has(timeoutKey)) {
        clearTimeout(this.typingTimeouts.get(timeoutKey)!);
      }
      
      const timeout = setTimeout(() => {
        const currentState = store.getState();
        const currentUsers = currentState.comments.typingUsers[resourceId] || [];
        const filteredUsers = currentUsers.filter((user: string) => user !== userName);
        
        store.dispatch(updateTypingUsers({
          resourceId,
          users: filteredUsers
        }));
        
        this.typingTimeouts.delete(timeoutKey);
      }, 3000); // 3秒後自動移除
      
      this.typingTimeouts.set(timeoutKey, timeout);
    } else {
      // 從正在輸入列表中移除用戶
      updatedUsers = currentTypingUsers.filter((user: string) => user !== userName);
      
      // 清除對應的超時
      const timeoutKey = `${resourceId}-${userId}`;
      if (this.typingTimeouts.has(timeoutKey)) {
        clearTimeout(this.typingTimeouts.get(timeoutKey)!);
        this.typingTimeouts.delete(timeoutKey);
      }
    }
    
    store.dispatch(updateTypingUsers({
      resourceId,
      users: updatedUsers
    }));
  }

  private handleNotification(notification: CommentNotification): void {
    // 只處理發給當前用戶的通知
    if (notification.toUserId === this.currentUserId) {
      store.dispatch(addNotification(notification));
      
      // 可以在這裡添加瀏覽器通知
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.message, {
          icon: '/favicon.ico',
          tag: notification.id
        });
      }
    }
  }

  sendMessage(message: Omit<WebSocketMessage, 'timestamp'>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      
      this.ws.send(JSON.stringify(fullMessage));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  // 發送評論相關消息
  sendComment(comment: Comment): void {
    this.sendMessage({
      type: 'comment_add',
      payload: comment
    });
  }

  sendCommentUpdate(commentId: string, updates: Partial<Comment>): void {
    this.sendMessage({
      type: 'comment_update',
      payload: { commentId, updates }
    });
  }

  sendCommentDelete(commentId: string): void {
    this.sendMessage({
      type: 'comment_delete',
      payload: { commentId }
    });
  }

  // 發送正在輸入狀態
  sendTypingStatus(resourceId: string, isTyping: boolean): void {
    this.sendMessage({
      type: 'typing',
      payload: {
        resourceId,
        userId: this.currentUserId,
        isTyping
      }
    });
  }

  // 訂閱資源的評論
  subscribeToResource(resourceType: string, resourceId: string): void {
    this.sendMessage({
      type: 'subscribe',
      payload: {
        resourceType,
        resourceId
      }
    });
  }

  // 取消訂閱資源的評論
  unsubscribeFromResource(resourceType: string, resourceId: string): void {
    this.sendMessage({
      type: 'unsubscribe',
      payload: {
        resourceType,
        resourceId
      }
    });
  }

  // 獲取連接狀態
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // 請求瀏覽器通知權限
  static async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
}

// 創建單例實例
export const websocketService = new WebSocketService();

// 導出類型
export type { WebSocketMessage, TypingMessage };
export default WebSocketService;