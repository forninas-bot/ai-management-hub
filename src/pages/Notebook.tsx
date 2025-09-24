import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { 
  fetchFolders, 
  fetchNotes, 
  selectNote,
  selectFolder,
  createNote,
  updateNote 
} from '../features/notebook/notebookSlice';
import { Note } from '../types';

const Notebook: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    folders,
    notes,
    activeNote,
    activeFolder,
    isLoading
  } = useAppSelector(state => state.notebook);

  const [showInsightPanel, setShowInsightPanel] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [showBatchExport, setShowBatchExport] = useState(false);

  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  // 點擊外部區域關閉選單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showBatchExport && !target.closest('.batch-export-menu')) {
        setShowBatchExport(false);
      }
      if (showExportMenu && !target.closest('.export-menu-container')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBatchExport, showExportMenu]);

  useEffect(() => {
    if (activeFolder) {
      dispatch(fetchNotes(activeFolder.id));
    }
  }, [dispatch, activeFolder]);

  useEffect(() => {
    if (activeNote) {
      setNoteContent(activeNote.content);
    }
  }, [activeNote]);

  // 搜尋功能
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredNotes(notes);
    } else {
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredNotes(filtered);
    }
  }, [notes, searchQuery]);



  const handleSelectFolder = (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (folder) {
      dispatch(selectFolder(folderId));
      dispatch(fetchNotes(folder.id));
    }
  };

  const handleSelectNote = (noteId: string) => {
    dispatch(selectNote(noteId));
  };

  const handleCreateNote = () => {
    if (activeFolder) {
      dispatch(createNote({ folderId: activeFolder.id }));
    }
  };

  const handleUpdateNote = () => {
    if (activeNote) {
      dispatch(updateNote({ id: activeNote.id, content: noteContent }));
    }
  };

  const toggleInsightPanel = () => {
    setShowInsightPanel(!showInsightPanel);
  };

  const handleExport = async (format: 'markdown' | 'pdf') => {
    if (!activeNote) return;
    
    setShowExportMenu(false);
    
    try {
      if (format === 'markdown') {
        // 匯出為 Markdown 文件
        const content = `# ${activeNote.title}\n\n${activeNote.content}`;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${activeNote.title || '無標題筆記'}.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // 匯出為 PDF 文件
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();
        
        // 設定中文字體支援
        pdf.setFont('helvetica');
        pdf.setFontSize(16);
        
        // 添加標題
        pdf.text(activeNote.title || '無標題筆記', 20, 30);
        
        // 添加內容
        pdf.setFontSize(12);
        const lines = pdf.splitTextToSize(activeNote.content, 170);
        pdf.text(lines, 20, 50);
        
        // 下載 PDF
        pdf.save(`${activeNote.title || '無標題筆記'}.pdf`);
      }
    } catch (error) {
      console.error('匯出失敗:', error);
      alert('匯出失敗，請稍後再試');
    }
  };

  // 批量匯出處理函數
  const handleBatchExport = async (format: 'markdown' | 'pdf') => {
    if (selectedNotes.length === 0) return;
    
    const selectedNotesData = notes.filter(note => selectedNotes.includes(note.id));
    
    try {
      if (format === 'markdown') {
        // 創建包含所有選中筆記的 Markdown 文件
        const combinedContent = selectedNotesData.map(note => 
          `# ${note.title || '無標題筆記'}\n\n${note.content}\n\n---\n\n`
        ).join('');
        
        const blob = new Blob([combinedContent], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `批量匯出_${selectedNotes.length}個筆記.md`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        console.log('批量 PDF 匯出功能開發中...');
      }
    } catch (error) {
      console.error('批量匯出失敗:', error);
      alert('批量匯出失敗，請稍後再試');
    }
    
    setShowBatchExport(false);
    setSelectedNotes([]);
  };

  // 處理筆記選擇
  const handleNoteSelection = (noteId: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedNotes(prev => [...prev, noteId]);
    } else {
      setSelectedNotes(prev => prev.filter(id => id !== noteId));
    }
  };

  // 全選/取消全選
  const handleSelectAll = () => {
    if (selectedNotes.length === filteredNotes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(filteredNotes.map(note => note.id));
    }
  };

  return (
    <div className="flex h-full bg-gradient-to-br from-neural-50 to-neural-100/30">
      {/* 資料夾列表 */}
      <div className="w-1/6 p-4">
        <div className="neural-card h-full">
          <h3 className="text-lg font-semibold text-neural-800 mb-4 flex items-center">
            <div className="w-2 h-2 bg-gradient-to-r from-neural-400 to-neural-600 rounded-full mr-2 animate-pulse"></div>
            資料夾
          </h3>
          <div className="space-y-2 overflow-y-auto scrollbar-thin max-h-[calc(100%-4rem)]">
            {folders.map(folder => (
              <div
                key={folder.id}
                onClick={() => handleSelectFolder(folder.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  activeFolder?.id === folder.id
                    ? 'bg-gradient-to-r from-neural-200 to-neural-300 text-neural-800 shadow-lg border border-neural-300/50'
                    : 'hover:bg-neural-100/50 text-neural-700 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm"
                    style={{ backgroundColor: folder.color }}
                  />
                  <span className="text-sm font-medium">{folder.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 筆記列表 */}
      <div className="w-1/4 p-4">
        <div className="neural-card h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neural-800 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-neural-500 to-neural-700 rounded-full mr-2 animate-pulse"></div>
              筆記
              {selectedNotes.length > 0 && (
                <span className="ml-2 text-sm text-neural-500">({selectedNotes.length} 已選)</span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              {filteredNotes.length > 0 && (
                <>
                  <button
                    onClick={handleSelectAll}
                    className="text-xs px-3 py-1.5 bg-neural-100 hover:bg-neural-200 text-neural-700 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{selectedNotes.length === filteredNotes.length ? '取消全選' : '全選'}</span>
                  </button>
                  {selectedNotes.length > 0 && (
                    <div className="relative batch-export-menu">
                      <button
                        onClick={() => setShowBatchExport(!showBatchExport)}
                        className="text-xs px-3 py-1.5 bg-gradient-to-r from-neural-400 to-neural-500 hover:from-neural-500 hover:to-neural-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>批量匯出</span>
                      </button>
                      {showBatchExport && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neural-200/50 z-50">
                          <div className="p-2">
                            <button
                              onClick={() => handleBatchExport('markdown')}
                              className="block w-full text-left px-3 py-2 text-xs text-neural-700 hover:bg-neural-100/50 transition-colors duration-200 flex items-center space-x-2 rounded-lg"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>匯出為 Markdown</span>
                            </button>
                            <button
                              onClick={() => handleBatchExport('pdf')}
                              className="block w-full text-left px-3 py-2 text-xs text-neural-700 hover:bg-neural-100/50 transition-colors duration-200 flex items-center space-x-2 rounded-lg"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              <span>匯出為 PDF</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              <button
                onClick={handleCreateNote}
                className="ai-button text-sm px-4 py-2 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>新增</span>
              </button>
            </div>
          </div>
          
          {/* 搜尋框 */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋筆記標題或內容..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 bg-neural-50/50 border border-neural-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-neural-400/50 focus:border-neural-400 text-sm transition-all duration-300"
              />
              <svg className="w-4 h-4 text-neural-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2 flex-1 overflow-y-auto scrollbar-thin">
            {filteredNotes.length > 0 ? (
              filteredNotes.map(note => (
                <div
                  key={note.id}
                  className={`p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                    activeNote?.id === note.id
                      ? 'bg-gradient-to-r from-neural-200 to-neural-300 text-neural-800 shadow-lg border border-neural-300/50'
                      : 'hover:bg-neural-100/50 text-neural-700 hover:shadow-md border border-transparent'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 pt-1">
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleNoteSelection(note.id, e.target.checked);
                        }}
                        className="w-4 h-4 text-neural-500 bg-neural-100 border-neural-300 rounded focus:ring-neural-400 focus:ring-2 transition-colors duration-200"
                      />
                    </div>
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => handleSelectNote(note.id)}
                    >
                      <div className="font-medium text-sm mb-2 line-clamp-2">{note.title || '無標題筆記'}</div>
                      <div className="text-xs text-neural-500 flex items-center justify-between">
                        <span>{new Date(note.updatedAt).toLocaleDateString('zh-TW')}</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-neural-400 rounded-full"></div>
                          <span>{note.content.length} 字</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-neural-500 text-sm py-12 flex flex-col items-center">
                <svg className="w-12 h-12 text-neural-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{searchQuery ? '沒有找到符合條件的筆記' : '此資料夾中沒有筆記'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 筆記編輯區域 */}
      <div className={`${showInsightPanel ? 'w-2/5' : 'w-7/12'} p-4`}>
        <div className="neural-card h-full flex flex-col">
          {activeNote ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-neural-200/50">
                <input
                  type="text"
                  value={activeNote.title}
                  className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 w-2/3 text-neural-800 placeholder-neural-400"
                  placeholder="無標題筆記"
                  onChange={(e) => dispatch(updateNote({ 
                    id: activeNote.id, 
                    content: noteContent,
                    title: e.target.value 
                  }))}
                />
                <div className="flex items-center space-x-3">
                  <div className="relative export-menu-container">
                    <button
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="bg-neural-100 hover:bg-neural-200 text-neural-700 rounded-xl px-4 py-2 text-sm flex items-center space-x-2 transition-all duration-300 hover:shadow-md"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>匯出</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showExportMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-neural-200/50 z-10">
                        <div className="py-2">
                          <button
                            onClick={() => handleExport('markdown')}
                            className="block w-full text-left px-4 py-3 text-sm text-neural-700 hover:bg-neural-100/50 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>匯出為 Markdown (.md)</span>
                          </button>
                          <button
                            onClick={() => handleExport('pdf')}
                            className="block w-full text-left px-4 py-3 text-sm text-neural-700 hover:bg-neural-100/50 transition-colors duration-200 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>匯出為 PDF (.pdf)</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={toggleInsightPanel}
                    className={`ai-button text-sm px-4 py-2 flex items-center space-x-2 ${showInsightPanel ? 'bg-gradient-to-r from-neural-500 to-neural-600' : ''}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI 洞察</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-hidden">
                <textarea
                  className="w-full h-full p-4 bg-neural-50/30 border border-neural-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-neural-400/50 focus:border-neural-400 resize-none text-neural-700 placeholder-neural-400 transition-all duration-300 overflow-y-auto"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  onBlur={handleUpdateNote}
                  placeholder="開始撰寫你的筆記..."
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-neural-500 flex-col">
              <svg className="w-16 h-16 text-neural-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-lg font-medium">選擇或建立一個新筆記</span>
              <span className="text-sm text-neural-400 mt-1">開始記錄你的想法和靈感</span>
            </div>
          )}
        </div>
      </div>

      {/* AI 洞察面板 */}
      {showInsightPanel && activeNote && (
        <div className="w-1/4 p-4">
          <div className="neural-card h-full">
            <h4 className="text-lg font-semibold text-neural-800 mb-4 flex items-center">
              <div className="w-2 h-2 bg-gradient-to-r from-neural-600 to-neural-800 rounded-full mr-2 animate-pulse"></div>
              AI 洞察
            </h4>
            <div className="space-y-4 overflow-y-auto scrollbar-thin max-h-[calc(100%-4rem)]">
              <div className="p-4 bg-neural-50/50 rounded-xl border border-neural-200/30">
                <h5 className="font-medium text-sm mb-3 text-neural-700 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  內容摘要
                </h5>
                <p className="text-sm text-neural-600 leading-relaxed">
                  {activeNote.content.substring(0, 200)}{activeNote.content.length > 200 ? '...' : ''}
                </p>
              </div>
              
              {activeNote.aiInsights && activeNote.aiInsights.length > 0 && (
                <div className="space-y-3">
                  {activeNote.aiInsights.map(insight => (
                    <div key={insight.id} className="p-4 bg-neural-50/50 rounded-xl border border-neural-200/30">
                      <div className="font-medium text-sm mb-2 text-neural-700 flex items-center">
                        {insight.type === 'summary' && (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            摘要
                          </>
                        )}
                        {insight.type === 'keypoints' && (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            關鍵點
                          </>
                        )}
                        {insight.type === 'tasks' && (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            任務建議
                          </>
                        )}
                        {insight.type === 'analysis' && (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            分析
                          </>
                        )}
                      </div>
                      <div className="text-sm text-neural-600 leading-relaxed">
                        {typeof insight.content === 'string' 
                          ? insight.content 
                          : JSON.stringify(insight.content)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebook;