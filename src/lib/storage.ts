import { Note } from '@/types';

const STORAGE_KEY = 'notes_app_data';

export const storage = {
  getNotes: (): Note[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  },

  saveNotes: (notes: Note[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note => {
    const notes = storage.getNotes();
    const newNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    storage.saveNotes(notes);
    return newNote;
  },

  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>): Note | null => {
    const notes = storage.getNotes();
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) return null;

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storage.saveNotes(notes);
    return notes[index];
  },

  deleteNote: (id: string): boolean => {
    const notes = storage.getNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    if (filteredNotes.length === notes.length) return false;
    storage.saveNotes(filteredNotes);
    return true;
  },

  searchNotes: (query: string): Note[] => {
    const notes = storage.getNotes();
    if (!query.trim()) return notes;
    
    const lowerQuery = query.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(lowerQuery) || 
      note.content.toLowerCase().includes(lowerQuery)
    );
  },
};