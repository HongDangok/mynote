/*
  Mục đích: Context quản lý trạng thái ghi chú và thư mục toàn ứng dụng.
  - Lưu trữ notes/folders, tìm kiếm, filter, và xử lý CRUD qua NoteService
  - Tích hợp NotificationService để lập lịch/huỷ nhắc nhở
*/
import React, { createContext, ReactNode, useContext, useEffect, useReducer } from 'react';
import { NoteService } from '../services/NoteService';
import { NotificationService } from '../services/NotificationService';
import { Folder, Note, NoteFormData } from '../types/Note';

interface NoteState {
  notes: Note[];
  folders: Folder[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  selectedFolder: string | null;
  selectedTags: string[];
}

type NoteAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'SET_FOLDERS'; payload: Folder[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: Note }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'ADD_FOLDER'; payload: Folder }
  | { type: 'DELETE_FOLDER'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SELECTED_FOLDER'; payload: string | null }
  | { type: 'SET_SELECTED_TAGS'; payload: string[] };

const initialState: NoteState = {
  notes: [],
  folders: [],
  loading: false,
  error: null,
  searchQuery: '',
  selectedFolder: null,
  selectedTags: [],
};

function noteReducer(state: NoteState, action: NoteAction): NoteState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    case 'ADD_NOTE':
      return { ...state, notes: [action.payload, ...state.notes] };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id ? action.payload : note
        ),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
      };
    case 'ADD_FOLDER':
      return { ...state, folders: [...state.folders, action.payload] };
    case 'DELETE_FOLDER':
      return {
        ...state,
        folders: state.folders.filter(folder => folder.id !== action.payload),
      };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SELECTED_FOLDER':
      return { ...state, selectedFolder: action.payload };
    case 'SET_SELECTED_TAGS':
      return { ...state, selectedTags: action.payload };
    default:
      return state;
  }
}

interface NoteContextType {
  state: NoteState;
  dispatch: React.Dispatch<NoteAction>;
  createNote: (noteData: NoteFormData) => Promise<void>;
  updateNote: (id: string, noteData: Partial<NoteFormData>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  createFolder: (name: string, color: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  searchNotes: () => Promise<Note[]>;
  loadNotes: () => Promise<void>;
  loadFolders: () => Promise<void>;
  removeReminder: (noteId: string) => Promise<void>;
  toggleReminder: (noteId: string) => Promise<void>;
  togglePin: (id: string) => Promise<void>;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function useNoteContext() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNoteContext must be used within a NoteProvider');
  }
  return context;
}

interface NoteProviderProps {
  children: ReactNode;
}

export function NoteProvider({ children }: NoteProviderProps) {
  const [state, dispatch] = useReducer(noteReducer, initialState);

  useEffect(() => {
    loadNotes();
    loadFolders();
    NotificationService.setupNotificationHandler();
  }, []);

  const loadNotes = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const notes = await NoteService.getAllNotes();
      dispatch({ type: 'SET_NOTES', payload: notes });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load notes' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadFolders = async () => {
    try {
      const folders = await NoteService.getAllFolders();
      dispatch({ type: 'SET_FOLDERS', payload: folders });
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const createNote = async (noteData: NoteFormData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const newNote = await NoteService.createNote(noteData);
      dispatch({ type: 'ADD_NOTE', payload: newNote });
      
      // Schedule notification if reminder is set
      if (noteData.reminder) {
        await NotificationService.scheduleNotification(newNote);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create note' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateNote = async (id: string, noteData: Partial<NoteFormData>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedNote = await NoteService.updateNote(id, noteData);
      if (updatedNote) {
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
        
        // Update notification if reminder changed
        if (noteData.reminder !== undefined) {
          if (noteData.reminder) {
            await NotificationService.scheduleNotification(updatedNote);
          } else {
            // Cancel existing notification if reminder is removed
            await NotificationService.cancelNotificationsForNote(id);
          }
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update note' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function riêng cho toggle pin - không có loading state để tránh nháy
  const togglePin = async (id: string) => {
    try {
      const note = state.notes.find(n => n.id === id);
      if (!note) return;
      
      const updatedNote = await NoteService.updateNote(id, { isPinned: !note.isPinned });
      if (updatedNote) {
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle pin' });
    }
  };

  const deleteNote = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const success = await NoteService.deleteNote(id);
      if (success) {
        dispatch({ type: 'DELETE_NOTE', payload: id });
        
        // Cancel notification if exists
        await NotificationService.cancelNotificationsForNote(id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete note' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createFolder = async (name: string, color: string) => {
    try {
      const newFolder = await NoteService.createFolder(name, color);
      dispatch({ type: 'ADD_FOLDER', payload: newFolder });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create folder' });
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      const success = await NoteService.deleteFolder(id);
      if (success) {
        dispatch({ type: 'DELETE_FOLDER', payload: id });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete folder' });
    }
  };

  const removeReminder = async (noteId: string) => {
    try {
      // Cancel the notification
      await NotificationService.cancelNotificationsForNote(noteId);
      
      // Update the note to remove reminder
      const note = state.notes.find(n => n.id === noteId);
      if (note) {
        const updatedNote = await NoteService.updateNote(noteId, { reminder: undefined });
        if (updatedNote) {
          dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove reminder' });
    }
  };

  const toggleReminder = async (noteId: string) => {
    try {
      const note = state.notes.find(n => n.id === noteId);
      if (!note) return;

      const newReminderEnabled = !note.reminderEnabled;
      
      if (newReminderEnabled && note.reminder) {
        // Enable reminder - schedule notification
        await NotificationService.scheduleNotification(note);
      } else {
        // Disable reminder - cancel notification
        await NotificationService.cancelNotificationsForNote(noteId);
      }

      // Update the note
      const updatedNote = await NoteService.updateNote(noteId, { 
        reminderEnabled: newReminderEnabled 
      });
      if (updatedNote) {
        dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to toggle reminder' });
    }
  };

  const searchNotes = async (): Promise<Note[]> => {
    try {
      const filters = {
        tags: state.selectedTags,
        folder: state.selectedFolder,
        hasReminder: false, // Add this to state if needed
      };
      return await NoteService.searchNotes(state.searchQuery, filters);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search notes' });
      return [];
    }
  };

  const value: NoteContextType = {
    state,
    dispatch,
    createNote,
    updateNote,
    deleteNote,
    createFolder,
    deleteFolder,
    searchNotes,
    loadNotes,
    loadFolders,
    removeReminder,
    toggleReminder,
    togglePin,
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
}
