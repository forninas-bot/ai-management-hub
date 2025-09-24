import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Comment,
  CommentReaction,
  AddCommentRequest,
  UpdateCommentRequest,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentPin,
  addCommentReaction,
  removeCommentReaction,
  setActiveResource,
  updateTypingUsers,
  selectCommentsByResource,
  selectCommentsLoading,
  selectCommentsError,
  selectTypingUsers,
  getTopLevelComments,
  getCommentReplies,
  getPinnedComments
} from './commentsSlice';
import { selectCurrentUser } from '../auth/authSlice';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

interface CommentSystemProps {
  resourceType: 'task' | 'project' | 'notebook' | 'pomodoro';
  resourceId: string;
  className?: string;
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  onReply: (parentId: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onPin: (commentId: string) => void;
  onReaction: (commentId: string, reactionType: string) => void;
  currentUserId: string;
  level?: number;
}

const REACTION_EMOJIS = ['👍', '👎', '❤️', '😄', '😮', '😢', '😡'];

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  replies,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onReaction,
  currentUserId,
  level = 0
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = comment.authorId === currentUserId;
  const canEdit = isOwner && !comment.isDeleted;
  const canDelete = isOwner && !comment.isDeleted;

  const handleEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit({ ...comment, content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleReaction = (reactionType: string) => {
    const existingReaction = comment.reactions.find(r => r.userId === currentUserId);
    if (existingReaction && existingReaction.type === reactionType) {
      // 移除反應
      onReaction(comment.id, '');
    } else {
      // 添加或更改反應
      onReaction(comment.id, reactionType);
    }
    setShowReactions(false);
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    comment.reactions.forEach(reaction => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    return counts;
  };

  const userReaction = comment.reactions.find(r => r.userId === currentUserId);

  return (
    <div className={`comment-item ${level > 0 ? 'reply' : ''} ${comment.isPinned ? 'pinned' : ''}`}
         style={{ marginLeft: level * 20 }}>
      {comment.isPinned && (
        <div className="pin-indicator">
          📌 置頂評論
        </div>
      )}
      
      <div className="comment-header">
        <div className="author-info">
          {comment.authorAvatar && (
            <img src={comment.authorAvatar} alt={comment.authorName} className="avatar" />
          )}
          <span className="author-name">{comment.authorName}</span>
          <span className="comment-time">
            {formatDistanceToNow(new Date(comment.createdAt), { 
              addSuffix: true, 
              locale: zhTW 
            })}
          </span>
          {comment.isEdited && (
            <span className="edited-indicator">已編輯</span>
          )}
        </div>
        
        <div className="comment-actions">
          {canEdit && (
            <button onClick={() => setIsEditing(!isEditing)} className="action-btn">
              ✏️
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(comment.id)} className="action-btn">
              🗑️
            </button>
          )}
          <button onClick={() => onPin(comment.id)} className="action-btn">
            {comment.isPinned ? '📌' : '📍'}
          </button>
        </div>
      </div>
      
      <div className="comment-content">
        {isEditing ? (
          <div className="edit-form">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
              rows={3}
            />
            <div className="edit-actions">
              <button onClick={handleEdit} className="save-btn">保存</button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">取消</button>
            </div>
          </div>
        ) : (
          <div className="content-text">{comment.content}</div>
        )}
      </div>
      
      {comment.attachments.length > 0 && (
        <div className="comment-attachments">
          {comment.attachments.map(attachment => (
            <div key={attachment.id} className="attachment">
              {attachment.type === 'image' ? (
                <img src={attachment.url} alt={attachment.name} className="attachment-image" />
              ) : (
                <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                  📎 {attachment.name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="comment-footer">
        <div className="reactions-section">
          <div className="reaction-display">
            {Object.entries(getReactionCounts()).map(([type, count]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`reaction-btn ${userReaction?.type === type ? 'active' : ''}`}
              >
                {type} {count}
              </button>
            ))}
          </div>
          
          <div className="action-buttons">
            <button 
              onClick={() => setShowReactions(!showReactions)}
              className="emoji-btn"
            >
              😊
            </button>
            <button onClick={() => onReply(comment.id)} className="reply-btn">
              💬 回覆
            </button>
          </div>
          
          {showReactions && (
            <div className="reaction-picker">
              {REACTION_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="reaction-option"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {replies.length > 0 && (
        <div className="replies-section">
          <button 
            onClick={() => setShowReplies(!showReplies)}
            className="toggle-replies"
          >
            {showReplies ? '隱藏' : '顯示'} {replies.length} 則回覆
          </button>
          
          {showReplies && (
            <div className="replies-list">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={getCommentReplies(replies, reply.id)}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onPin={onPin}
                  onReaction={onReaction}
                  currentUserId={currentUserId}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CommentForm: React.FC<{
  onSubmit: (content: string, parentId?: string) => void;
  parentId?: string;
  placeholder?: string;
  onCancel?: () => void;
}> = ({ onSubmit, parentId, placeholder = '寫下你的評論...', onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), parentId);
      setContent('');
      if (onCancel) onCancel();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="comment-form">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="comment-input"
        rows={3}
        disabled={isSubmitting}
      />
      <div className="form-actions">
        <button 
          type="submit" 
          disabled={!content.trim() || isSubmitting}
          className="submit-btn"
        >
          {isSubmitting ? '發送中...' : parentId ? '回覆' : '評論'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="cancel-btn">
            取消
          </button>
        )}
      </div>
    </form>
  );
};

const TypingIndicator: React.FC<{ users: string[] }> = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <div className="typing-indicator">
      <span className="typing-text">
        {users.length === 1 
          ? `${users[0]} 正在輸入...`
          : `${users.slice(0, 2).join(', ')}${users.length > 2 ? ` 等 ${users.length} 人` : ''} 正在輸入...`
        }
      </span>
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export const CommentSystem: React.FC<CommentSystemProps> = ({
  resourceType,
  resourceId,
  className = ''
}) => {
  const dispatch = useDispatch();
  const comments = useSelector(selectCommentsByResource(resourceId));
  const isLoading = useSelector(selectCommentsLoading);
  const error = useSelector(selectCommentsError);
  const typingUsers = useSelector(selectTypingUsers(resourceId));
  const currentUser = useSelector(selectCurrentUser);
  
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');

  useEffect(() => {
    dispatch(setActiveResource({ type: resourceType, id: resourceId }));
    // 這裡應該觸發載入評論的 action
    // dispatch(loadComments({ resourceType, resourceId }));
  }, [dispatch, resourceType, resourceId]);

  const handleAddComment = async (content: string, parentId?: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      resourceType,
      resourceId,
      parentId,
      mentions: [],
      attachments: [],
      reactions: [],
      isEdited: false,
      isPinned: false,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dispatch(addComment(newComment));
  };

  const handleEditComment = (comment: Comment) => {
    dispatch(updateComment({
      commentId: comment.id,
      updates: { content: comment.content }
    }));
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('確定要刪除這則評論嗎？')) {
      dispatch(deleteComment(commentId));
    }
  };

  const handlePinComment = (commentId: string) => {
    dispatch(toggleCommentPin(commentId));
  };

  const handleReaction = (commentId: string, reactionType: string) => {
    if (!currentUser) return;

    if (reactionType) {
      const reaction: CommentReaction = {
        id: `reaction_${Date.now()}`,
        type: reactionType as any,
        userId: currentUser.id,
        userName: currentUser.username,
        createdAt: new Date().toISOString()
      };
      dispatch(addCommentReaction({ commentId, reaction }));
    } else {
      dispatch(removeCommentReaction({ commentId, userId: currentUser.id }));
    }
  };

  const getSortedComments = () => {
    const topLevelComments = getTopLevelComments(comments);
    const pinnedComments = getPinnedComments(comments);
    const regularComments = topLevelComments.filter(c => !c.isPinned);

    let sortedRegular = [...regularComments];
    switch (sortBy) {
      case 'newest':
        sortedRegular.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        sortedRegular.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'popular':
        sortedRegular.sort((a, b) => b.reactions.length - a.reactions.length);
        break;
    }

    return [...pinnedComments, ...sortedRegular];
  };

  if (!currentUser) {
    return (
      <div className={`comment-system ${className}`}>
        <div className="auth-required">
          請登入以查看和發表評論
        </div>
      </div>
    );
  }

  return (
    <div className={`comment-system ${className}`}>
      <div className="comment-header">
        <h3>評論討論 ({comments.length})</h3>
        <div className="sort-controls">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="sort-select"
          >
            <option value="newest">最新</option>
            <option value="oldest">最舊</option>
            <option value="popular">最熱門</option>
          </select>
        </div>
      </div>

      <CommentForm onSubmit={handleAddComment} />
      
      <TypingIndicator users={typingUsers} />

      {error && (
        <div className="error-message">
          載入評論時發生錯誤: {error}
        </div>
      )}

      {isLoading ? (
        <div className="loading-indicator">
          載入評論中...
        </div>
      ) : (
        <div className="comments-list">
          {getSortedComments().map(comment => (
            <div key={comment.id}>
              <CommentItem
                comment={comment}
                replies={getCommentReplies(comments, comment.id)}
                onReply={setReplyingTo}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
                onPin={handlePinComment}
                onReaction={handleReaction}
                currentUserId={currentUser.id}
              />
              
              {replyingTo === comment.id && (
                <div className="reply-form">
                  <CommentForm
                    onSubmit={handleAddComment}
                    parentId={comment.id}
                    placeholder={`回覆 ${comment.authorName}...`}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </div>
          ))}
          
          {comments.length === 0 && (
            <div className="empty-state">
              還沒有評論，成為第一個發表評論的人吧！
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSystem;