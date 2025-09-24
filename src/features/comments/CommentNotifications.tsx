import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectNotifications,
  selectUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  CommentNotification
} from './commentsSlice';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import './CommentNotifications.css';

interface NotificationItemProps {
  notification: CommentNotification;
  onMarkAsRead: (id: string) => void;
  onNavigate: (resourceType: string, resourceId: string, commentId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onNavigate
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onNavigate(notification.resourceType, notification.resourceId, notification.commentId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return '🏷️';
      case 'reply':
        return '💬';
      case 'reaction':
        return '👍';
      case 'new_comment':
        return '💭';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'mention':
        return '#f59e0b';
      case 'reply':
        return '#3b82f6';
      case 'reaction':
        return '#10b981';
      case 'new_comment':
        return '#6b7280';
      default:
        return '#8b5cf6';
    }
  };

  return (
    <div 
      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <div className="notification-icon" style={{ color: getNotificationColor(notification.type) }}>
        {getNotificationIcon(notification.type)}
      </div>
      
      <div className="notification-content">
        <div className="notification-message">
          {notification.message}
        </div>
        
        <div className="notification-meta">
          <span className="notification-time">
            {formatDistanceToNow(new Date(notification.createdAt), { 
              addSuffix: true, 
              locale: zhTW 
            })}
          </span>
          
          <span className="notification-from">
            來自 {notification.fromUserName}
          </span>
        </div>
      </div>
      
      {!notification.isRead && (
        <div className="unread-indicator"></div>
      )}
    </div>
  );
};

interface CommentNotificationsProps {
  onNavigateToComment?: (resourceType: string, resourceId: string, commentId: string) => void;
  className?: string;
}

export const CommentNotifications: React.FC<CommentNotificationsProps> = ({
  onNavigateToComment,
  className = ''
}) => {
  const dispatch = useDispatch();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadNotificationsCount);
  
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = (notificationId: string) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleNavigateToComment = (resourceType: string, resourceId: string, commentId: string) => {
    if (onNavigateToComment) {
      onNavigateToComment(resourceType, resourceId, commentId);
    }
    setIsOpen(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') {
      return !notification.isRead;
    }
    return true;
  });

  // 按類型分組通知
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const today = new Date();
    const notificationDate = new Date(notification.createdAt);
    const diffTime = today.getTime() - notificationDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    let group: string;
    if (diffDays === 0) {
      group = '今天';
    } else if (diffDays === 1) {
      group = '昨天';
    } else if (diffDays <= 7) {
      group = '本週';
    } else if (diffDays <= 30) {
      group = '本月';
    } else {
      group = '更早';
    }
    
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(notification);
    
    return groups;
  }, {} as Record<string, CommentNotification[]>);

  return (
    <div className={`comment-notifications ${className}`}>
      {/* 通知按鈕 */}
      <button 
        className="notification-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`通知 (${unreadCount} 未讀)`}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 通知面板 */}
      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          
          <div className="notification-panel">
            <div className="notification-header">
              <h3>通知</h3>
              
              <div className="notification-controls">
                <div className="filter-tabs">
                  <button 
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                  >
                    全部 ({notifications.length})
                  </button>
                  <button 
                    className={filter === 'unread' ? 'active' : ''}
                    onClick={() => setFilter('unread')}
                  >
                    未讀 ({unreadCount})
                  </button>
                </div>
                
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read"
                    onClick={handleMarkAllAsRead}
                  >
                    全部標為已讀
                  </button>
                )}
              </div>
            </div>
            
            <div className="notification-content">
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="empty-notifications">
                  <div className="empty-icon">🔕</div>
                  <div className="empty-text">
                    {filter === 'unread' ? '沒有未讀通知' : '暫無通知'}
                  </div>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                  <div key={group} className="notification-group">
                    <div className="group-header">
                      {group}
                    </div>
                    
                    <div className="group-notifications">
                      {groupNotifications.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onMarkAsRead={handleMarkAsRead}
                          onNavigate={handleNavigateToComment}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {filteredNotifications.length > 10 && (
              <div className="notification-footer">
                <button className="view-all-btn">
                  查看全部通知
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// 簡化版通知列表組件
export const NotificationList: React.FC<{
  notifications: CommentNotification[];
  onMarkAsRead: (id: string) => void;
  onNavigate: (resourceType: string, resourceId: string, commentId: string) => void;
  className?: string;
}> = ({ notifications, onMarkAsRead, onNavigate, className = '' }) => {
  return (
    <div className={`notification-list ${className}`}>
      {notifications.length === 0 ? (
        <div className="empty-notifications">
          暫無通知
        </div>
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onNavigate={onNavigate}
          />
        ))
      )}
    </div>
  );
};

// 通知徽章組件
export const NotificationBadge: React.FC<{
  count: number;
  className?: string;
}> = ({ count, className = '' }) => {
  if (count === 0) return null;
  
  return (
    <span className={`notification-badge ${className}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default CommentNotifications;