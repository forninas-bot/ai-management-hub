import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CodeBracketIcon, 
  // PlayIcon, // 暫時註解，因為未使用
  DocumentDuplicateIcon,
  CheckIcon,
  SparklesIcon,
  CpuChipIcon,
  CommandLineIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

// 代碼生成請求接口
interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  complexity: 'simple' | 'medium' | 'complex';
  includeComments: boolean;
  includeTests: boolean;
  style: 'functional' | 'oop' | 'mixed';
}

// 生成的代碼接口
interface GeneratedCode {
  id: string;
  code: string;
  language: string;
  explanation: string;
  suggestions: string[];
  tests?: string;
  documentation?: string;
  aiModel: string;
  confidence: number;
  executionTime: number;
}

// 支持的編程語言
const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript', icon: '🟨' },
  { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  { value: 'python', label: 'Python', icon: '🐍' },
  { value: 'java', label: 'Java', icon: '☕' },
  { value: 'cpp', label: 'C++', icon: '⚡' },
  { value: 'rust', label: 'Rust', icon: '🦀' },
  { value: 'go', label: 'Go', icon: '🐹' },
  { value: 'swift', label: 'Swift', icon: '🍎' },
  { value: 'kotlin', label: 'Kotlin', icon: '🎯' },
  { value: 'php', label: 'PHP', icon: '🐘' }
];

// 框架選項
const FRAMEWORKS = {
  javascript: ['React', 'Vue', 'Angular', 'Node.js', 'Express'],
  typescript: ['React', 'Vue', 'Angular', 'Node.js', 'NestJS'],
  python: ['Django', 'Flask', 'FastAPI', 'Pandas', 'NumPy'],
  java: ['Spring', 'Spring Boot', 'Hibernate', 'Maven'],
  cpp: ['Qt', 'Boost', 'OpenCV'],
  rust: ['Tokio', 'Actix', 'Serde'],
  go: ['Gin', 'Echo', 'Fiber'],
  swift: ['SwiftUI', 'UIKit'],
  kotlin: ['Spring Boot', 'Ktor'],
  php: ['Laravel', 'Symfony', 'CodeIgniter']
};

interface CodeGeneratorProps {
  onCodeGenerated?: (code: GeneratedCode) => void;
  className?: string;
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ 
  onCodeGenerated, 
  className = '' 
}) => {
  const [request, setRequest] = useState<CodeGenerationRequest>({
    prompt: '',
    language: 'javascript',
    framework: '',
    complexity: 'medium',
    includeComments: true,
    includeTests: false,
    style: 'functional'
  });

  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'claude-3-5-sonnet' | 'gpt-4o'>('claude-3-5-sonnet');
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'tests' | 'docs'>('code');
  const [history, setHistory] = useState<GeneratedCode[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自動調整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [request.prompt]);

  // 生成代碼
  const generateCode = async () => {
    if (!request.prompt.trim()) return;

    setIsGenerating(true);
    
    try {
      // 模擬API調用 - 實際應用中應該調用nextGenAIService
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockCode: GeneratedCode = {
        id: Date.now().toString(),
        code: generateMockCode(request),
        language: request.language,
        explanation: `這是一個${request.complexity === 'simple' ? '簡單' : request.complexity === 'medium' ? '中等複雜度' : '複雜'}的${request.language}代碼實現。代碼遵循${request.style === 'functional' ? '函數式' : request.style === 'oop' ? '面向對象' : '混合'}編程範式。`,
        suggestions: [
          '考慮添加錯誤處理機制',
          '可以優化性能表現',
          '建議添加單元測試',
          '考慮使用更現代的語法特性'
        ],
        tests: request.includeTests ? generateMockTests(request) : undefined,
        documentation: generateMockDocumentation(request),
        aiModel: selectedModel,
        confidence: 0.92,
        executionTime: Math.random() * 1000 + 500
      };

      setGeneratedCode(mockCode);
      setHistory(prev => [mockCode, ...prev.slice(0, 9)]); // 保留最近10個
      onCodeGenerated?.(mockCode);
      
    } catch (error) {
      console.error('代碼生成失敗:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 生成模擬代碼
  const generateMockCode = (req: CodeGenerationRequest): string => {
    const comments = req.includeComments;
    
    switch (req.language) {
      case 'javascript':
        return `${comments ? '// 根據您的需求生成的JavaScript代碼\n' : ''}
function processData(data) {
  ${comments ? '  // 數據驗證\n' : ''}  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid data format');
  }
  
  ${comments ? '  // 數據處理邏輯\n' : ''}  return data
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true,
      timestamp: new Date().toISOString()
    }))
    .sort((a, b) => a.priority - b.priority);
}

${comments ? '// 使用示例\n' : ''}const result = processData(inputData);
console.log('處理結果:', result);`;

      case 'python':
        return `${comments ? '# 根據您的需求生成的Python代碼\n' : ''}
def process_data(data):
    """
    處理輸入數據並返回結果
    
    Args:
        data: 輸入數據列表
        
    Returns:
        處理後的數據列表
    """
    ${comments ? '    # 數據驗證\n' : ''}    if not isinstance(data, list):
        raise ValueError("數據必須是列表格式")
    
    ${comments ? '    # 數據處理邏輯\n' : ''}    processed_data = [
        {**item, 'processed': True, 'timestamp': datetime.now().isoformat()}
        for item in data
        if item.get('active', False)
    ]
    
    return sorted(processed_data, key=lambda x: x.get('priority', 0))

${comments ? '# 使用示例\n' : ''}result = process_data(input_data)
print(f"處理結果: {result}")`;

      default:
        return `${comments ? `// ${req.language} 代碼示例\n` : ''}
// 這裡是根據您的需求生成的 ${req.language} 代碼
// 請根據實際需求進行調整和優化`;
    }
  };

  // 生成模擬測試代碼
  const generateMockTests = (req: CodeGenerationRequest): string => {
    switch (req.language) {
      case 'javascript':
        return `// Jest 測試用例
describe('processData', () => {
  test('應該正確處理有效數據', () => {
    const input = [
      { id: 1, active: true, priority: 2 },
      { id: 2, active: false, priority: 1 },
      { id: 3, active: true, priority: 1 }
    ];
    
    const result = processData(input);
    
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(3);
    expect(result[0].processed).toBe(true);
  });
  
  test('應該拋出錯誤當輸入無效時', () => {
    expect(() => processData(null)).toThrow('Invalid data format');
    expect(() => processData('invalid')).toThrow('Invalid data format');
  });
});`;

      case 'python':
        return `# pytest 測試用例
import pytest
from datetime import datetime

def test_process_data_valid_input():
    """測試有效輸入的處理"""
    input_data = [
        {'id': 1, 'active': True, 'priority': 2},
        {'id': 2, 'active': False, 'priority': 1},
        {'id': 3, 'active': True, 'priority': 1}
    ]
    
    result = process_data(input_data)
    
    assert len(result) == 2
    assert result[0]['id'] == 3
    assert result[0]['processed'] is True

def test_process_data_invalid_input():
    """測試無效輸入的錯誤處理"""
    with pytest.raises(ValueError, match="數據必須是列表格式"):
        process_data("invalid")
    
    with pytest.raises(ValueError, match="數據必須是列表格式"):
        process_data(None)`;

      default:
        return `// ${req.language} 測試代碼
// 這裡是相應的測試用例`;
    }
  };

  // 生成模擬文檔
  const generateMockDocumentation = (req: CodeGenerationRequest): string => {
    return `# ${req.language.toUpperCase()} 代碼文檔

## 概述
這個模塊實現了數據處理功能，使用${req.style === 'functional' ? '函數式' : req.style === 'oop' ? '面向對象' : '混合'}編程範式。

## 功能特性
- 數據驗證和過濾
- 自動添加處理標記
- 按優先級排序
- 錯誤處理機制

## 使用方法
\`\`\`${req.language}
${req.language === 'javascript' ? 'const result = processData(inputData);' : 'result = process_data(input_data)'}
\`\`\`

## 參數說明
- \`data\`: 輸入數據${req.language === 'javascript' ? '數組' : '列表'}
- 返回值: 處理後的數據${req.language === 'javascript' ? '數組' : '列表'}

## 注意事項
- 確保輸入數據格式正確
- 處理大量數據時注意性能
- 建議添加適當的錯誤處理`;
  };

  // 複製代碼到剪貼板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg ${className}`}>
      {/* 標題區域 */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CodeBracketIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                AI 代碼生成器
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                使用 Claude 4.0 和 ChatGPT 4.0 生成高質量代碼
              </p>
            </div>
          </div>
          
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as 'claude-3-5-sonnet' | 'gpt-4o')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="claude-3-5-sonnet">Claude 4.0 Sonnet</option>
            <option value="gpt-4o">ChatGPT 4.0</option>
          </select>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 代碼需求輸入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            描述您需要的代碼功能
          </label>
          <textarea
            ref={textareaRef}
            value={request.prompt}
            onChange={(e) => setRequest(prev => ({ ...prev, prompt: e.target.value }))}
            placeholder="例如：創建一個用戶認證系統，包含登錄、註冊和密碼重置功能..."
            className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            rows={3}
          />
        </div>

        {/* 配置選項 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 編程語言 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              編程語言
            </label>
            <select
              value={request.language}
              onChange={(e) => setRequest(prev => ({ 
                ...prev, 
                language: e.target.value,
                framework: '' // 重置框架選擇
              }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>
                  {lang.icon} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* 框架選擇 */}
          {FRAMEWORKS[request.language as keyof typeof FRAMEWORKS] && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                框架/庫
              </label>
              <select
                value={request.framework}
                onChange={(e) => setRequest(prev => ({ ...prev, framework: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">選擇框架（可選）</option>
                {FRAMEWORKS[request.language as keyof typeof FRAMEWORKS].map(framework => (
                  <option key={framework} value={framework}>
                    {framework}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 複雜度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              複雜度
            </label>
            <select
              value={request.complexity}
              onChange={(e) => setRequest(prev => ({ ...prev, complexity: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="simple">簡單</option>
              <option value="medium">中等</option>
              <option value="complex">複雜</option>
            </select>
          </div>

          {/* 編程風格 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              編程風格
            </label>
            <select
              value={request.style}
              onChange={(e) => setRequest(prev => ({ ...prev, style: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="functional">函數式</option>
              <option value="oop">面向對象</option>
              <option value="mixed">混合風格</option>
            </select>
          </div>
        </div>

        {/* 附加選項 */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={request.includeComments}
              onChange={(e) => setRequest(prev => ({ ...prev, includeComments: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">包含註釋</span>
          </label>
          
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={request.includeTests}
              onChange={(e) => setRequest(prev => ({ ...prev, includeTests: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">生成測試代碼</span>
          </label>
        </div>

        {/* 生成按鈕 */}
        <button
          onClick={generateCode}
          disabled={!request.prompt.trim() || isGenerating}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>AI 正在生成代碼...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>生成代碼</span>
            </>
          )}
        </button>

        {/* 生成結果 */}
        <AnimatePresence>
          {generatedCode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* 結果標題 */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CpuChipIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        生成完成
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        使用 {generatedCode.aiModel === 'claude-3-5-sonnet' ? 'Claude 4.0' : 'ChatGPT 4.0'} • 
                        信心度: {Math.round(generatedCode.confidence * 100)}% • 
                        耗時: {Math.round(generatedCode.executionTime)}ms
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => copyToClipboard(generatedCode.code)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <CheckIcon className="w-4 h-4" />
                        <span>已複製</span>
                      </>
                    ) : (
                      <>
                        <DocumentDuplicateIcon className="w-4 h-4" />
                        <span>複製代碼</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 標籤頁 */}
              <div className="flex border-b border-gray-200 dark:border-gray-600">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'code'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <CodeBracketIcon className="w-4 h-4 inline mr-1" />
                  代碼
                </button>
                
                {generatedCode.tests && (
                  <button
                    onClick={() => setActiveTab('tests')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'tests'
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <CommandLineIcon className="w-4 h-4 inline mr-1" />
                    測試
                  </button>
                )}
                
                <button
                  onClick={() => setActiveTab('docs')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'docs'
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                  文檔
                </button>
              </div>

              {/* 內容區域 */}
              <div className="p-4">
                {activeTab === 'code' && (
                  <div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{generatedCode.code}</code>
                    </pre>
                    
                    {/* 代碼說明 */}
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">代碼說明</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{generatedCode.explanation}</p>
                    </div>

                    {/* 改進建議 */}
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">改進建議</h4>
                      <ul className="space-y-1">
                        {generatedCode.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-300 flex items-start">
                            <span className="text-yellow-500 mr-2">💡</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'tests' && generatedCode.tests && (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{generatedCode.tests}</code>
                  </pre>
                )}

                {activeTab === 'docs' && generatedCode.documentation && (
                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                      {generatedCode.documentation}
                    </pre>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 歷史記錄 */}
        {history.length > 0 && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              生成歷史
            </h3>
            <div className="space-y-2">
              {history.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setGeneratedCode(item)}
                  className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.language.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {item.aiModel === 'claude-3-5-sonnet' ? 'Claude 4.0' : 'ChatGPT 4.0'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {Math.round(item.confidence * 100)}% 信心度
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeGenerator;