import { useState, useEffect } from 'react';
import { Note } from '@/types';
import { storage } from '@/lib/storage';
import { NoteCard } from '@/components/NoteCard';
import { NoteDialog } from '@/components/NoteDialog';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, StickyNote } from 'lucide-react';
import { toast } from 'sonner';

export default function Index() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredNotes(storage.searchNotes(searchQuery));
    } else {
      setFilteredNotes(notes);
    }
  }, [searchQuery, notes]);

  const loadNotes = () => {
    const loadedNotes = storage.getNotes();
    setNotes(loadedNotes);
    setFilteredNotes(loadedNotes);
  };

  const handleSaveNote = (noteData: { title: string; content: string }) => {
    if (editingNote) {
      storage.updateNote(editingNote.id, noteData);
      toast.success('Note updated successfully!');
    } else {
      storage.addNote(noteData);
      toast.success('Note created successfully!');
    }
    loadNotes();
    setEditingNote(null);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    setDeletingNoteId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingNoteId) {
      storage.deleteNote(deletingNoteId);
      toast.success('Note deleted successfully!');
      loadNotes();
      setDeletingNoteId(null);
    }
  };

  const handleNewNote = () => {
    setEditingNote(null);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <StickyNote className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Notes App
              </h1>
            </div>
            <Button
              onClick={handleNewNote}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <StickyNote className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first note to get started'}
            </p>
            {!searchQuery && (
              <Button
                onClick={handleNewNote}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Note
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditNote}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <NoteDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveNote}
        editNote={editingNote}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}