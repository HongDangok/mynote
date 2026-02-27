/*
  Mục đích: Lớp dịch vụ thao tác dữ liệu ghi chú/thư mục.
  - Lưu trữ bằng AsyncStorage: CRUD notes/folders, tìm kiếm, xuất/nhập dữ liệu
*/
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Folder, Note, NoteFormData } from '../types/Note';
import EncryptionService from './EncryptionService';

// Generate UUID v4 using expo-crypto (works on all platforms)
const generateUUID = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  const bytes = Array.from(randomBytes);
  
  // Set version (4) and variant bits
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
  
  // Convert to UUID string format
  const hex = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32)
  ].join('-');
};

const NOTES_STORAGE_KEY = '@notes';
const FOLDERS_STORAGE_KEY = '@folders';

export class NoteService {
  // Migration: Encrypt existing plaintext data
  private static async migrateToEncryption(): Promise<void> {
    try {
      const isEncrypted = await EncryptionService.isDataEncrypted();
      if (isEncrypted) return; // Already encrypted

      // Get plaintext data
      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      const foldersJson = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);

      if (notesJson && !EncryptionService.isEncrypted(notesJson)) {
        // Encrypt notes
        const encrypted = await EncryptionService.encrypt(notesJson);
        await AsyncStorage.setItem(NOTES_STORAGE_KEY, encrypted);
      }

      if (foldersJson && !EncryptionService.isEncrypted(foldersJson)) {
        // Encrypt folders
        const encrypted = await EncryptionService.encrypt(foldersJson);
        await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, encrypted);
      }

      // Mark as encrypted
      await EncryptionService.markAsEncrypted();
    } catch (error) {
      console.error('Migration to encryption failed:', error);
      // Don't throw - allow app to continue with plaintext if encryption fails
    }
  }

  // Note operations
  static async getAllNotes(): Promise<Note[]> {
    try {
      // Migrate to encryption on first access
      await this.migrateToEncryption();

      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (notesJson) {
        // Decrypt if encrypted
        const decryptedJson = await EncryptionService.decrypt(notesJson);
        const notes = this.safeJsonParse(decryptedJson);
        return notes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
          reminder: note.reminder ? new Date(note.reminder) : undefined,
          // Backward compat: if no blocks but has legacy fields, build a basic blocks array
          blocks: note.blocks || (note.content || (note.images && note.images.length) || note.audioUri || (note.checklist && note.checklist.length)
            ? [
                ...(note.content ? [{ id: `${note.id}-t1`, type: 'text', content: note.content }] : []),
                ...((note.images || []).map((u: string, idx: number) => ({ id: `${note.id}-i${idx+1}`, type: 'image', uri: u })) as any),
                ...(note.audioUri ? [{ id: `${note.id}-a1`, type: 'audio', uri: note.audioUri, durationMs: note.audioDurationMs }] as any : []),
                ...((note.checklist || []).length ? [{ id: `${note.id}-c1`, type: 'checklist', items: (note.checklist || []).map((it: any, idx: number) => ({ id: `${idx+1}`, text: it.text || it, checked: !!it.done })) }] as any : [])
              ]
            : []),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  static async createNote(noteData: NoteFormData): Promise<Note> {
    try {
      const notes = await this.getAllNotes();
      // Use UUID for better security
      const newNote: Note = {
        id: await generateUUID(),
        ...noteData,
        images: noteData.images || [],
        audioUri: noteData.audioUri,
        audioDurationMs: noteData.audioDurationMs,
        checklist: noteData.checklist || [],
        blocks: noteData.blocks || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      notes.push(newNote);
      // Encrypt before storing
      const notesJson = JSON.stringify(notes);
      const encrypted = await EncryptionService.encrypt(notesJson);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, encrypted);
      await EncryptionService.markAsEncrypted();
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }

  static async updateNote(id: string, noteData: Partial<NoteFormData>): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      const noteIndex = notes.findIndex(note => note.id === id);
      
      if (noteIndex === -1) return null;
      
      notes[noteIndex] = {
        ...notes[noteIndex],
        ...noteData,
        images: noteData.images ?? notes[noteIndex].images ?? [],
        audioUri: noteData.audioUri ?? notes[noteIndex].audioUri,
        audioDurationMs: noteData.audioDurationMs ?? notes[noteIndex].audioDurationMs,
        checklist: noteData.checklist ?? notes[noteIndex].checklist ?? [],
        blocks: noteData.blocks ?? notes[noteIndex].blocks ?? [],
        updatedAt: new Date(),
      };
      
      // Encrypt before storing
      const notesJson = JSON.stringify(notes);
      const encrypted = await EncryptionService.encrypt(notesJson);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, encrypted);
      await EncryptionService.markAsEncrypted();
      return notes[noteIndex];
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }

  static async deleteNote(id: string): Promise<boolean> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      // Encrypt before storing
      const notesJson = JSON.stringify(filteredNotes);
      const encrypted = await EncryptionService.encrypt(notesJson);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, encrypted);
      await EncryptionService.markAsEncrypted();
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }

  static async getNoteById(id: string): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('Error getting note by id:', error);
      return null;
    }
  }

  static async searchNotes(query: string, filters?: any): Promise<Note[]> {
    try {
      const notes = await this.getAllNotes();
      let filteredNotes = notes;
      
      // Text search
      if (query) {
        const lowerQuery = query.toLowerCase();
        filteredNotes = filteredNotes.filter(note =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.content.toLowerCase().includes(lowerQuery) ||
          note.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      }
      
      // Apply filters
      if (filters) {
        if (filters.tags && filters.tags.length > 0) {
          filteredNotes = filteredNotes.filter(note =>
            filters.tags.some((tag: string) => note.tags.includes(tag))
          );
        }
        
        if (filters.folder) {
          filteredNotes = filteredNotes.filter(note => note.folder === filters.folder);
        }
        
        if (filters.hasReminder) {
          filteredNotes = filteredNotes.filter(note => note.reminder !== undefined);
        }
      }
      
      return filteredNotes.sort((a, b) => {
        // Pinned notes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        // Then by updated date
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  }

  // Folder operations
  static async getAllFolders(): Promise<Folder[]> {
    try {
      // Migrate to encryption on first access
      await this.migrateToEncryption();

      const foldersJson = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
      if (foldersJson) {
        // Decrypt if encrypted
        const decryptedJson = await EncryptionService.decrypt(foldersJson);
        const folders = this.safeJsonParse(decryptedJson);
        return folders.map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting folders:', error);
      return [];
    }
  }

  static async createFolder(name: string, color: string): Promise<Folder> {
    try {
      const folders = await this.getAllFolders();
      // Use UUID for better security
      const newFolder: Folder = {
        id: await generateUUID(),
        name,
        color,
        createdAt: new Date(),
      };
      
      folders.push(newFolder);
      // Encrypt before storing
      const foldersJson = JSON.stringify(folders);
      const encrypted = await EncryptionService.encrypt(foldersJson);
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, encrypted);
      await EncryptionService.markAsEncrypted();
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      throw error;
    }
  }

  static async deleteFolder(id: string): Promise<boolean> {
    try {
      const folders = await this.getAllFolders();
      const filteredFolders = folders.filter(folder => folder.id !== id);
      // Encrypt before storing
      const foldersJson = JSON.stringify(filteredFolders);
      const encryptedFolders = await EncryptionService.encrypt(foldersJson);
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, encryptedFolders);
      
      // Remove folder reference from notes
      const notes = await this.getAllNotes();
      const updatedNotes = notes.map(note => 
        note.folder === id ? { ...note, folder: undefined } : note
      );
      // Encrypt before storing
      const notesJson = JSON.stringify(updatedNotes);
      const encryptedNotes = await EncryptionService.encrypt(notesJson);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, encryptedNotes);
      await EncryptionService.markAsEncrypted();
      
      return true;
    } catch (error) {
      console.error('Error deleting folder:', error);
      return false;
    }
  }

  // Export/Import functionality
  static async exportData(): Promise<string> {
    try {
      const notes = await this.getAllNotes();
      const folders = await this.getAllFolders();
      const data = { notes, folders, exportDate: new Date().toISOString() };
      return JSON.stringify(data);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  // Safe JSON parse to prevent prototype pollution
  private static safeJsonParse(json: string): any {
    return JSON.parse(json, (key, value) => {
      // Prevent prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return undefined;
      }
      return value;
    });
  }

  // Validate note structure
  private static validateNoteStructure(note: any): boolean {
    if (!note || typeof note !== 'object') return false;
    if (typeof note.id !== 'string' || note.id.length === 0) return false;
    if (typeof note.title !== 'string') return false;
    if (!Array.isArray(note.tags)) return false;
    return true;
  }

  static async importData(dataJson: string): Promise<boolean> {
    try {
      // Validate size (max 10MB)
      const MAX_IMPORT_SIZE = 10 * 1024 * 1024; // 10MB
      if (dataJson.length > MAX_IMPORT_SIZE) {
        throw new Error('File quá lớn. Tối đa 10MB.');
      }

      // Safe JSON parse
      const data = this.safeJsonParse(dataJson);
      
      // Validate structure
      if (!data || typeof data !== 'object') {
        throw new Error('Cấu trúc dữ liệu không hợp lệ');
      }

      if (!data.notes || !Array.isArray(data.notes)) {
        throw new Error('Dữ liệu notes không hợp lệ');
      }

      if (!data.folders || !Array.isArray(data.folders)) {
        throw new Error('Dữ liệu folders không hợp lệ');
      }

      // Validate number of records
      const MAX_NOTES = 10000;
      const MAX_FOLDERS = 1000;
      
      if (data.notes.length > MAX_NOTES) {
        throw new Error(`Quá nhiều notes. Tối đa ${MAX_NOTES} notes.`);
      }

      if (data.folders.length > MAX_FOLDERS) {
        throw new Error(`Quá nhiều folders. Tối đa ${MAX_FOLDERS} folders.`);
      }

      // Validate each note structure
      for (let i = 0; i < data.notes.length; i++) {
        if (!this.validateNoteStructure(data.notes[i])) {
          throw new Error(`Note thứ ${i + 1} không hợp lệ`);
        }
      }

      // Backup current data before import
      try {
        const currentNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
        const currentFolders = await AsyncStorage.getItem(FOLDERS_STORAGE_KEY);
        if (currentNotes) await AsyncStorage.setItem('@backup_notes', currentNotes);
        if (currentFolders) await AsyncStorage.setItem('@backup_folders', currentFolders);
      } catch (backupError) {
        console.warn('Could not create backup:', backupError);
      }

      // Encrypt and import data
      const notesJson = JSON.stringify(data.notes);
      const foldersJson = JSON.stringify(data.folders);
      const encryptedNotes = await EncryptionService.encrypt(notesJson);
      const encryptedFolders = await EncryptionService.encrypt(foldersJson);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, encryptedNotes);
      await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, encryptedFolders);
      await EncryptionService.markAsEncrypted();
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      // Rollback on error
      try {
        const backupNotes = await AsyncStorage.getItem('@backup_notes');
        const backupFolders = await AsyncStorage.getItem('@backup_folders');
        if (backupNotes) await AsyncStorage.setItem(NOTES_STORAGE_KEY, backupNotes);
        if (backupFolders) await AsyncStorage.setItem(FOLDERS_STORAGE_KEY, backupFolders);
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError);
      }
      throw error;
    }
  }
}
