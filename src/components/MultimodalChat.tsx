import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import Button from './ui/Button'; // 暫時註解，因為未使用
import ModelSelector from './ai/ModelSelector';
import ModelConfigPanel from './ai/ModelConfigPanel';
import { 
  SparklesIcon, 
  LanguageIcon, 
  CogIcon, 
  LightBulbIcon,
  MicrophoneIcon,
  PaperClipIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

// 定義模型配置類型
interface ModelConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt: string;
  responseFormat: 'text' | 'json' | 'structured';
  safetyLevel: 'standard' | 'strict' | 'creative';
  cacheEnabled: boolean;
  streamEnabled: boolean;
}

interface MultimodalChatProps {
  onSendMessage: (content: string, attachments?: any[], selectedModel?: string, modelConfig?: any) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showModelSelector?: boolean;
  showSmartSuggestions?: boolean;
  showTranslation?: boolean;
  showAdvancedConfig?: boolean;
}

interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'file';
  name: string;
  size: number;
  url: string;
  file: File;
}

const MultimodalChat: React.FC<MultimodalChatProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "輸入訊息...",
  className = "",
  showModelSelector = true,
  showSmartSuggestions = true,
  showTranslation = false,
  showAdvancedConfig = false
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // 新增的AI功能狀態
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showConfigPanel, setShowConfigPanel] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  
  // 模型配置狀態
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.7,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0,
    presencePenalty: 0,
    systemPrompt: '',
    responseFormat: 'text',
    safetyLevel: 'standard',
    cacheEnabled: true,
    streamEnabled: true,
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自動調整文本框高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    adjustTextareaHeight();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (message.trim() || attachments.length > 0) {
      onSendMessage(
        message.trim(), 
        attachments.length > 0 ? attachments : undefined,
        selectedModel,
        {
          modelId: selectedModel,
          config: modelConfig
        }
      );
      setMessage('');
      setAttachments([]);
      setSmartSuggestions([]);
      setTranslatedText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // 智能建議生成
  const generateSmartSuggestions = useCallback(async (text: string) => {
    if (!showSmartSuggestions || text.length < 10) {
      setSmartSuggestions([]);
      return;
    }

    setIsGeneratingSuggestions(true);
    try {
      // 模擬API調用生成智能建議
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const suggestions = [
        `繼續討論 "${text.slice(0, 20)}..." 的相關話題`,
        `請提供更多關於這個主題的詳細信息`,
        `能否舉一些具體的例子來說明？`,
        `這個觀點很有趣，你是如何得出這個結論的？`,
        `讓我們從不同角度來分析這個問題`
      ].slice(0, 3);
      
      setSmartSuggestions(suggestions);
    } catch (error) {
      console.error('生成智能建議失敗:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  }, [showSmartSuggestions]);

  // 實時翻譯
  const translateText = useCallback(async (text: string, targetLang: string) => {
    if (!showTranslation || !text.trim()) {
      setTranslatedText('');
      return;
    }

    setIsTranslating(true);
    try {
      // 模擬翻譯API調用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 這裡應該調用實際的翻譯服務
      const mockTranslation = `[${targetLang.toUpperCase()}] ${text}`;
      setTranslatedText(mockTranslation);
    } catch (error) {
      console.error('翻譯失敗:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [showTranslation]);

  // 監聽消息變化，生成智能建議和翻譯
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (message.trim()) {
        generateSmartSuggestions(message);
        if (showTranslation) {
          translateText(message, targetLanguage);
        }
      } else {
        setSmartSuggestions([]);
        setTranslatedText('');
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [message, generateSmartSuggestions, translateText, targetLanguage, showTranslation]);

  // 應用智能建議
  const applySuggestion = (suggestion: string) => {
    setMessage(suggestion);
    setSmartSuggestions([]);
    if (textareaRef.current) {
      textareaRef.current.focus();
      adjustTextareaHeight();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const attachment: Attachment = {
        id: `${Date.now()}-${Math.random()}`,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
        file
      };
      
      setAttachments(prev => [...prev, attachment]);
    });
    
    // 清空文件輸入
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const updated = prev.filter(att => att.id !== id);
      // 清理 URL
      const removed = prev.find(att => att.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return updated;
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        
        const attachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          type: 'audio',
          name: file.name,
          size: file.size,
          url: URL.createObjectURL(file),
          file
        };
        
        setAttachments(prev => [...prev, attachment]);
        
        // 停止所有音軌
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
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

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* AI模型選擇器 */}
      {showModelSelector && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI模型設置</h3>
            <div className="flex items-center space-x-2">
              {showAdvancedConfig && (
                <button
                  onClick={() => setShowConfigPanel(!showConfigPanel)}
                  className={`p-2 rounded-lg transition-colors duration-150 ${
                    showConfigPanel 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                      : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                  title="高級配置"
                >
                  <CogIcon className="w-4 h-4" />
                </button>
              )}
              {showTranslation && (
                <div className="flex items-center space-x-2">
                  <LanguageIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
            taskType="chat"
            requirements={{
              speed: 'balanced',
              quality: 'high',
              cost: 'medium',
              privacy: 'standard'
            }}
          />
          
          {/* 高級配置面板 */}
          <AnimatePresence>
            {showConfigPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <ModelConfigPanel
                  modelId={selectedModel}
                  config={modelConfig}
                  onConfigChange={setModelConfig}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* 主聊天界面 */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
        {/* 智能建議區域 */}
        {showSmartSuggestions && smartSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20"
          >
            <div className="flex items-center space-x-2 mb-2">
              <LightBulbIcon className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">智能建議</span>
              {isGeneratingSuggestions && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {smartSuggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => applySuggestion(suggestion)}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors duration-150 text-gray-700 dark:text-gray-300"
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 翻譯預覽區域 */}
        {showTranslation && translatedText && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20"
          >
            <div className="flex items-center space-x-2 mb-2">
              <LanguageIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">翻譯預覽</span>
              {isTranslating && (
                <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              {translatedText}
            </p>
          </motion.div>
        )}

        {/* 附件預覽區域 */}
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border-b border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative group"
                >
                  {attachment.type === 'image' ? (
                    <div className="relative">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                      />
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center transition-colors duration-150"
                      >
                        ×
                      </button>
                    </div>
                  ) : attachment.type === 'audio' ? (
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 pr-8 relative">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                        🎵
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-20">
                          {attachment.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center transition-colors duration-150"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-2 pr-8 relative">
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-sm">
                        📄
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-20">
                          {attachment.name}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                      <button
                        onClick={() => removeAttachment(attachment.id)}
                        className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 flex items-center justify-center transition-colors duration-150"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* 輸入區域 */}
        <div className="flex items-end space-x-2 p-3">
          {/* 文件上傳按鈕 */}
          <motion.button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="flex-shrink-0 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            title="上傳文件"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <PaperClipIcon className="w-5 h-5" />
          </motion.button>

          {/* 語音錄製按鈕 */}
          <motion.button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`flex-shrink-0 p-2 rounded-full transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              isRecording 
                ? 'bg-red-500 text-white hover:bg-red-600' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title={isRecording ? '停止錄音' : '開始錄音'}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isRecording ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-white rounded-sm"></div>
                <span className="text-xs font-mono">{formatTime(recordingTime)}</span>
              </div>
            ) : (
              <MicrophoneIcon className="w-5 h-5" />
            )}
          </motion.button>

          {/* 文本輸入框 */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full resize-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none min-h-[40px] max-h-[120px] py-2 pr-10"
              rows={1}
            />
            
            {/* AI增強指示器 */}
            {(showSmartSuggestions || showTranslation) && (
              <div className="absolute right-2 top-2 flex items-center space-x-1">
                {showSmartSuggestions && (
                  <SparklesIcon className="w-4 h-4 text-blue-400" title="智能建議已啟用" />
                )}
                {showTranslation && (
                  <LanguageIcon className="w-4 h-4 text-green-400" title="實時翻譯已啟用" />
                )}
              </div>
            )}
          </div>

          {/* 發送按鈕 */}
          <motion.button
            onClick={handleSend}
            disabled={disabled || (!message.trim() && attachments.length === 0)}
            className="flex-shrink-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </motion.button>
        </div>

        {/* 隱藏的文件輸入 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt,.md"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default MultimodalChat;