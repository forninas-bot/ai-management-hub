import React, { useState, useRef, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { addMessage } from '../../features/chat/chatSlice';
import { ChatMessage } from '../../types';

interface MultimodalChatProps {
  onSendMessage: (content: string, attachments?: FileAttachment[]) => void;
  isLoading?: boolean;
}

interface FileAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video';
  url: string;
  size: number;
  file: File;
}

const MultimodalChat: React.FC<MultimodalChatProps> = ({ 
  onSendMessage, 
  isLoading = false 
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // 處理文件上傳
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const attachment: FileAttachment = {
          id: `file-${Date.now()}-${Math.random()}`,
          name: file.name,
          type: getFileType(file.type),
          url: e.target?.result as string,
          size: file.size,
          file
        };
        
        setAttachments(prev => [...prev, attachment]);
      };
      
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
    
    // 清空input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const getFileType = (mimeType: string): FileAttachment['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
  };

  // 移除附件
  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  // 開始錄音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioFile = new File([audioBlob], `recording-${Date.now()}.wav`, { type: 'audio/wav' });
        
        const attachment: FileAttachment = {
          id: `audio-${Date.now()}`,
          name: audioFile.name,
          type: 'audio',
          url: URL.createObjectURL(audioBlob),
          size: audioBlob.size,
          file: audioFile
        };
        
        setAttachments(prev => [...prev, attachment]);
        
        // 清理資源
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // 開始計時
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('無法開始錄音:', error);
      alert('無法訪問麥克風，請檢查權限設置');
    }
  };

  // 停止錄音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // 發送消息
  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    
    onSendMessage(message, attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
  };

  // 處理鍵盤事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: FileAttachment['type']) => {
    switch (type) {
      case 'image': return '🖼️';
      case 'audio': return '🎵';
      case 'video': return '🎬';
      case 'document': return '📄';
      default: return '📎';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3">
      {/* 附件預覽 */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {attachments.map(attachment => (
            <div key={attachment.id} className="relative group">
              {attachment.type === 'image' ? (
                <div className="relative">
                  <img 
                    src={attachment.url} 
                    alt={attachment.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white 
                             rounded-full text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                  <span className="text-lg">{getFileIcon(attachment.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="w-4 h-4 text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 輸入區域 */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="輸入消息... (支持 Shift+Enter 換行)"
            className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none 
                     focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     min-h-[44px] max-h-32"
            rows={1}
            disabled={isLoading}
          />
          
          {/* 工具按鈕 */}
          <div className="absolute right-2 top-2 flex gap-1">
            {/* 文件上傳 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-1 text-gray-500 hover:text-blue-500 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
              title="上傳文件"
            >
              📎
            </button>
            
            {/* 錄音按鈕 */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        ${isRecording 
                          ? 'text-red-500 hover:text-red-600 animate-pulse' 
                          : 'text-gray-500 hover:text-blue-500'
                        }`}
              title={isRecording ? `錄音中 ${formatTime(recordingTime)}` : '開始錄音'}
            >
              🎤
            </button>
          </div>
        </div>
        
        {/* 發送按鈕 */}
        <button
          onClick={handleSend}
          disabled={isLoading || (!message.trim() && attachments.length === 0)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center gap-2"
        >
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          ) : (
            '發送'
          )}
        </button>
      </div>
      
      {/* 隱藏的文件輸入 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      {/* 錄音狀態 */}
      {isRecording && (
        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700">
            錄音中... {formatTime(recordingTime)}
          </span>
          <button
            onClick={stopRecording}
            className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            停止
          </button>
        </div>
      )}
    </div>
  );
};

export default MultimodalChat;