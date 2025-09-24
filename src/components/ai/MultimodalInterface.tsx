import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MicrophoneIcon,
  CameraIcon,
  PhotoIcon,
  DocumentIcon,
  VideoCameraIcon,
  SpeakerWaveIcon,
  StopIcon,
  PlayIcon,
  PauseIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 媒體類型
type MediaType = 'text' | 'audio' | 'image' | 'video' | 'document';

// 媒體項目接口
interface MediaItem {
  id: string;
  type: MediaType;
  content: string | File | Blob;
  preview?: string;
  duration?: number;
  size?: number;
  name?: string;
  timestamp: Date;
  processed?: boolean;
  aiAnalysis?: {
    description: string;
    tags: string[];
    confidence: number;
    extractedText?: string;
    emotions?: string[];
    objects?: string[];
  };
}

// 錄音狀態
interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  mediaRecorder?: MediaRecorder;
  audioChunks: Blob[];
}

// 組件屬性
interface MultimodalInterfaceProps {
  onMediaSubmit?: (items: MediaItem[]) => void;
  onMediaAnalysis?: (item: MediaItem) => Promise<MediaItem>;
  supportedTypes?: MediaType[];
  maxFileSize?: number; // MB
  className?: string;
}

const MultimodalInterface: React.FC<MultimodalInterfaceProps> = ({
  onMediaSubmit,
  onMediaAnalysis,
  supportedTypes = ['text', 'audio', 'image', 'video', 'document'],
  maxFileSize = 50,
  className = ''
}) => {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioChunks: []
  });
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 錄音計時器
  useEffect(() => {
    if (recordingState.isRecording && !recordingState.isPaused) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingState(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [recordingState.isRecording, recordingState.isPaused]);

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 開始錄音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioItem: MediaItem = {
          id: Date.now().toString(),
          type: 'audio',
          content: audioBlob,
          duration: recordingState.duration,
          size: audioBlob.size,
          name: `錄音_${new Date().toLocaleString()}.wav`,
          timestamp: new Date()
        };
        
        setMediaItems(prev => [...prev, audioItem]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState({
        isRecording: true,
        isPaused: false,
        duration: 0,
        mediaRecorder,
        audioChunks
      });
    } catch (error) {
      console.error('無法開始錄音:', error);
      alert('無法訪問麥克風，請檢查權限設置');
    }
  };

  // 停止錄音
  const stopRecording = () => {
    if (recordingState.mediaRecorder) {
      recordingState.mediaRecorder.stop();
      setRecordingState({
        isRecording: false,
        isPaused: false,
        duration: 0,
        audioChunks: []
      });
    }
  };

  // 暫停/恢復錄音
  const toggleRecordingPause = () => {
    if (recordingState.mediaRecorder) {
      if (recordingState.isPaused) {
        recordingState.mediaRecorder.resume();
      } else {
        recordingState.mediaRecorder.pause();
      }
      setRecordingState(prev => ({
        ...prev,
        isPaused: !prev.isPaused
      }));
    }
  };

  // 處理文件上傳
  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      // 檢查文件大小
      if (file.size > maxFileSize * 1024 * 1024) {
        alert(`文件 ${file.name} 超過 ${maxFileSize}MB 限制`);
        continue;
      }

      // 確定文件類型
      let mediaType: MediaType = 'document';
      if (file.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else if (file.type.startsWith('audio/')) {
        mediaType = 'audio';
      } else if (file.type.includes('text') || file.type.includes('pdf') || file.type.includes('document')) {
        mediaType = 'document';
      }

      // 檢查是否支持該類型
      if (!supportedTypes.includes(mediaType)) {
        alert(`不支持的文件類型: ${file.type}`);
        continue;
      }

      // 創建預覽
      let preview: string | undefined;
      if (mediaType === 'image') {
        preview = URL.createObjectURL(file);
      } else if (mediaType === 'video') {
        preview = URL.createObjectURL(file);
      }

      const mediaItem: MediaItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
        type: mediaType,
        content: file,
        preview,
        size: file.size,
        name: file.name,
        timestamp: new Date()
      };

      setMediaItems(prev => [...prev, mediaItem]);

      // 自動分析媒體
      if (onMediaAnalysis) {
        try {
          const analyzedItem = await onMediaAnalysis(mediaItem);
          setMediaItems(prev => 
            prev.map(item => 
              item.id === mediaItem.id ? analyzedItem : item
            )
          );
        } catch (error) {
          console.error('媒體分析失敗:', error);
        }
      }
    }
  };

  // 拖拽處理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // 拍照功能
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        cameraRef.current.play();
      }
    } catch (error) {
      console.error('無法訪問攝像頭:', error);
      alert('無法訪問攝像頭，請檢查權限設置');
    }
  };

  const capturePhoto = () => {
    if (cameraRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = cameraRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const photoItem: MediaItem = {
              id: Date.now().toString(),
              type: 'image',
              content: blob,
              preview: URL.createObjectURL(blob),
              size: blob.size,
              name: `拍照_${new Date().toLocaleString()}.jpg`,
              timestamp: new Date()
            };
            
            setMediaItems(prev => [...prev, photoItem]);
          }
        }, 'image/jpeg', 0.9);
      }
      
      // 停止攝像頭
      const stream = video.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // 添加文本
  const addTextItem = () => {
    if (textInput.trim()) {
      const textItem: MediaItem = {
        id: Date.now().toString(),
        type: 'text',
        content: textInput.trim(),
        timestamp: new Date()
      };
      
      setMediaItems(prev => [...prev, textItem]);
      setTextInput('');
    }
  };

  // 刪除媒體項目
  const removeMediaItem = (id: string) => {
    setMediaItems(prev => {
      const item = prev.find(item => item.id === id);
      if (item && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  // 提交所有媒體
  const handleSubmit = () => {
    if (mediaItems.length > 0) {
      onMediaSubmit?.(mediaItems);
      setMediaItems([]);
    }
  };

  // 清空所有媒體
  const clearAll = () => {
    mediaItems.forEach(item => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setMediaItems([]);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* 標題 */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          多模態輸入界面
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          支持文本、語音、圖像、視頻和文檔等多種輸入方式
        </p>
      </div>

      {/* 輸入區域 */}
      <div className="p-6">
        {/* 文本輸入 */}
        {supportedTypes.includes('text') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              文本輸入
            </label>
            <div className="flex space-x-2">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="輸入您的文本內容..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                rows={3}
              />
              <button
                onClick={addTextItem}
                disabled={!textInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        )}

        {/* 操作按鈕區域 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* 錄音按鈕 */}
          {supportedTypes.includes('audio') && (
            <div className="space-y-2">
              {!recordingState.isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <MicrophoneIcon className="w-5 h-5" />
                  <span>開始錄音</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={toggleRecordingPause}
                      className="flex-1 flex items-center justify-center space-x-1 p-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      {recordingState.isPaused ? (
                        <PlayIcon className="w-4 h-4" />
                      ) : (
                        <PauseIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={stopRecording}
                      className="flex-1 flex items-center justify-center space-x-1 p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <StopIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {formatTime(recordingState.duration)}
                    {recordingState.isPaused && ' (已暫停)'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 拍照按鈕 */}
          {supportedTypes.includes('image') && (
            <button
              onClick={startCamera}
              className="flex items-center justify-center space-x-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CameraIcon className="w-5 h-5" />
              <span>拍照</span>
            </button>
          )}

          {/* 上傳圖片 */}
          {supportedTypes.includes('image') && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PhotoIcon className="w-5 h-5" />
              <span>選擇圖片</span>
            </button>
          )}

          {/* 上傳視頻 */}
          {supportedTypes.includes('video') && (
            <button
              onClick={() => videoInputRef.current?.click()}
              className="flex items-center justify-center space-x-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <VideoCameraIcon className="w-5 h-5" />
              <span>選擇視頻</span>
            </button>
          )}
        </div>

        {/* 拖拽上傳區域 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            拖拽文件到此處上傳
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            支持圖片、視頻、音頻和文檔文件，最大 {maxFileSize}MB
          </p>
        </div>

        {/* 隱藏的文件輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="hidden"
        />

        {/* 攝像頭預覽 */}
        <video
          ref={cameraRef}
          className="hidden"
          autoPlay
          muted
        />
        <canvas
          ref={canvasRef}
          className="hidden"
        />
      </div>

      {/* 媒體項目列表 */}
      {mediaItems.length > 0 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              已添加的媒體 ({mediaItems.length})
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={clearAll}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                清空全部
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                提交處理
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {mediaItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
                >
                  {/* 媒體預覽 */}
                  <div className="mb-3">
                    {item.type === 'image' && item.preview && (
                      <img
                        src={item.preview}
                        alt={item.name}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    )}
                    
                    {item.type === 'video' && item.preview && (
                      <video
                        src={item.preview}
                        className="w-full h-32 object-cover rounded-lg"
                        controls
                      />
                    )}
                    
                    {item.type === 'audio' && (
                      <div className="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-600 rounded-lg">
                        <SpeakerWaveIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {item.type === 'text' && (
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                          {item.content as string}
                        </p>
                      </div>
                    )}
                    
                    {item.type === 'document' && (
                      <div className="flex items-center justify-center h-32 bg-gray-200 dark:bg-gray-600 rounded-lg">
                        <DocumentTextIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* 媒體信息 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {item.name || `${item.type}_${item.id.slice(-6)}`}
                      </span>
                      <button
                        onClick={() => removeMediaItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <div>類型: {item.type}</div>
                      {item.size && (
                        <div>大小: {(item.size / 1024 / 1024).toFixed(2)} MB</div>
                      )}
                      {item.duration && (
                        <div>時長: {formatTime(item.duration)}</div>
                      )}
                      <div>時間: {item.timestamp.toLocaleTimeString()}</div>
                    </div>

                    {/* AI 分析結果 */}
                    {item.aiAnalysis && (
                      <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-1">
                          AI 分析結果 (信心度: {Math.round(item.aiAnalysis.confidence * 100)}%)
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          {item.aiAnalysis.description}
                        </div>
                        {item.aiAnalysis.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.aiAnalysis.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1 py-0.5 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultimodalInterface;