import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Note, NoteFolder } from '../../types';

interface NotebookState {
  folders: NoteFolder[];
  notes: Note[];
  activeNote: Note | null;
  activeFolder: NoteFolder | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotebookState = {
  folders: [
    {
      id: 'folder-1',
      name: '個人筆記',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#3A86FF'
    },
    {
      id: 'folder-2', 
      name: '工作筆記',
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#06D6A0'
    },
    {
      id: 'folder-3',
      name: '學習筆記', 
      parentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: '#F72585'
    }
  ],
  notes: [],
  activeNote: null,
  activeFolder: null,
  isLoading: false,
  error: null
};

const notebookSlice = createSlice({
  name: 'notebook',
  initialState,
  reducers: {
    fetchFolders: (state) => {
      state.isLoading = true;
      state.error = null;
      // 模拟异步操作完成，直接使用初始数据
      state.isLoading = false;
      // 如果没有activeFolder，自动选择第一个文件夹
      if (!state.activeFolder && state.folders.length > 0) {
        state.activeFolder = state.folders[0];
      }
    },
    fetchFoldersSuccess: (state, action: PayloadAction<NoteFolder[]>) => {
      state.folders = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchFoldersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchNotes: (state, action: PayloadAction<string>) => {
      state.isLoading = true;
      state.error = null;
      // 模拟异步操作完成，根据folderId过滤笔记
      const folderId = action.payload;
      state.notes = state.notes.filter(note => note.folderId === folderId);
      state.isLoading = false;
    },
    fetchNotesSuccess: (state, action: PayloadAction<Note[]>) => {
      state.notes = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    fetchNotesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    selectNote: (state, action: PayloadAction<string>) => {
      const note = state.notes.find(n => n.id === action.payload);
      if (note) {
        state.activeNote = note;
      }
    },
    selectFolder: (state, action: PayloadAction<string>) => {
      const folder = state.folders.find(f => f.id === action.payload);
      if (folder) {
        state.activeFolder = folder;
      }
    },
    createNote: (state, action: PayloadAction<{ folderId: string; title?: string }>) => {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        title: action.payload.title || '無標題筆記',
        content: '',
        format: 'markdown',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        folderId: action.payload.folderId,
        tags: [],
        attachments: [],
        aiInsights: []
      };
      state.notes.unshift(newNote);
      state.activeNote = newNote;
    },
    updateNote: (state, action: PayloadAction<{ id: string; content: string; title?: string }>) => {
      const note = state.notes.find(n => n.id === action.payload.id);
      if (note) {
        note.content = action.payload.content;
        if (action.payload.title) {
          note.title = action.payload.title;
        }
        note.updatedAt = new Date().toISOString();
        
        if (state.activeNote?.id === action.payload.id) {
          state.activeNote = { ...note };
        }
      }
    },
    deleteNote: (state, action: PayloadAction<string>) => {
      state.notes = state.notes.filter(n => n.id !== action.payload);
      if (state.activeNote?.id === action.payload) {
        state.activeNote = null;
      }
    },
    createFolder: (state, action: PayloadAction<{ name: string; parentId?: string }>) => {
      const newFolder: NoteFolder = {
        id: `folder-${Date.now()}`,
        name: action.payload.name,
        parentId: action.payload.parentId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: '#3A86FF'
      };
      state.folders.push(newFolder);
    },
    updateFolder: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const folder = state.folders.find(f => f.id === action.payload.id);
      if (folder) {
        folder.name = action.payload.name;
        folder.updatedAt = new Date().toISOString();
      }
    },
    deleteFolder: (state, action: PayloadAction<string>) => {
      state.folders = state.folders.filter(f => f.id !== action.payload);
      if (state.activeFolder?.id === action.payload) {
        state.activeFolder = null;
      }
    },
    addTag: (state, action: PayloadAction<{ noteId: string; tag: string }>) => {
      const note = state.notes.find(n => n.id === action.payload.noteId);
      if (note && !note.tags.includes(action.payload.tag)) {
        note.tags.push(action.payload.tag);
        note.updatedAt = new Date().toISOString();
      }
    },
    removeTag: (state, action: PayloadAction<{ noteId: string; tag: string }>) => {
      const note = state.notes.find(n => n.id === action.payload.noteId);
      if (note) {
        note.tags = note.tags.filter(tag => tag !== action.payload.tag);
        note.updatedAt = new Date().toISOString();
      }
    },
    addAIInsight: (state, action: PayloadAction<{ noteId: string; insight: typeof initialState.notes[0]['aiInsights'][0] }>) => {
      const note = state.notes.find(n => n.id === action.payload.noteId);
      if (note) {
        note.aiInsights.push(action.payload.insight);
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

export const {
  fetchFolders,
  fetchFoldersSuccess,
  fetchFoldersFailure,
  fetchNotes,
  fetchNotesSuccess,
  fetchNotesFailure,
  selectNote,
  selectFolder,
  createNote,
  updateNote,
  deleteNote,
  createFolder,
  updateFolder,
  deleteFolder,
  addTag,
  removeTag,
  addAIInsight,
  setLoading,
  setError
} = notebookSlice.actions;

export default notebookSlice.reducer;