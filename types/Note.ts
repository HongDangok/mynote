/*
  Mục đích: Khai báo kiểu dữ liệu cho ghi chú, thư mục và bộ lọc tìm kiếm.
*/
export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  tags: string[];
  reminder?: Date;
  reminderEnabled: boolean;
  // Các ngày lặp lại nhắc nhở: 0=CN, 1=Th2, ... 6=Th7
  repeatDays?: number[];
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  folder?: string;
  // Đính kèm
  images?: string[]; // URI ảnh
  audioUri?: string; // URI file âm thanh đã ghi
  audioDurationMs?: number; // thời lượng ms
  checklist?: ChecklistItem[];
  // Soạn thảo dạng khối
  blocks?: NoteBlock[];
}

export interface NoteFormData {
  title: string;
  content: string;
  color: string;
  tags: string[];
  reminder?: Date;
  reminderEnabled: boolean;
  repeatDays?: number[];
  isPinned: boolean;
  folder?: string;
  // Đính kèm
  images?: string[];
  audioUri?: string;
  audioDurationMs?: number;
  checklist?: ChecklistItem[];
  // Soạn thảo dạng khối
  blocks?: NoteBlock[];
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface SearchFilters {
  query: string;
  tags: string[];
  folder?: string;
  hasReminder: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

// Block-based editor types
export type NoteBlock = TextBlock | ImageBlock | AudioBlock | ChecklistBlock;

export interface TextBlock {
  id: string;
  type: 'text';
  content: string;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  uri: string;
}

export interface AudioBlock {
  id: string;
  type: 'audio';
  uri: string;
  durationMs?: number;
}

export interface ChecklistBlockItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface ChecklistBlock {
  id: string;
  type: 'checklist';
  items: ChecklistBlockItem[];
}
