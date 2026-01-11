/**
 * useReadingHighlights Hook
 * Quản lý highlights và notes của user
 * Đồng bộ với BookUserInteraction entity
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const STORAGE_KEY_PREFIX = 'reading-highlights-';

export function useReadingHighlights(bookId, userEmail) {
  const queryClient = useQueryClient();
  const [highlights, setHighlights] = useState([]);
  const [notes, setNotes] = useState([]);
  const saveTimeoutRef = useRef(null);

  // Fetch from database if logged in
  const { data: interaction, isLoading } = useQuery({
    queryKey: ['book-highlights', bookId, userEmail],
    queryFn: async () => {
      if (!userEmail || !bookId) return null;
      const results = await base44.entities.BookUserInteraction.filter(
        { user_email: userEmail, book_id: bookId },
        '-created_date',
        1
      );
      return results[0] || null;
    },
    enabled: !!userEmail && !!bookId,
    staleTime: 60 * 1000
  });

  // Load data from interaction or localStorage
  useEffect(() => {
    if (!bookId) return;

    if (interaction) {
      // Logged in - use database data
      setHighlights(interaction.highlights || []);
      setNotes(interaction.notes || []);
    } else if (!userEmail) {
      // Not logged in - use localStorage
      const key = `${STORAGE_KEY_PREFIX}${bookId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setHighlights(data.highlights || []);
          setNotes(data.notes || []);
        } catch (e) {
          console.error('Failed to load highlights:', e);
        }
      }
    }
  }, [bookId, userEmail, interaction]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ newHighlights, newNotes }) => {
      if (!userEmail || !bookId) return null;

      // Always refetch to ensure we have current interaction
      const results = await base44.entities.BookUserInteraction.filter(
        { user_email: userEmail, book_id: bookId },
        '-created_date',
        1
      );
      const currentInteraction = results[0];

      if (currentInteraction) {
        // Update existing
        return await base44.entities.BookUserInteraction.update(currentInteraction.id, {
          highlights: newHighlights,
          notes: newNotes
        });
      } else {
        // Create new
        return await base44.entities.BookUserInteraction.create({
          user_email: userEmail,
          book_id: bookId,
          highlights: newHighlights,
          notes: newNotes,
          reading_status: null,
          is_bookmarked: false,
          bookmarked_chapters: [],
          current_chapter_index: 0,
          current_page: 0,
          progress_percent: 0,
          chapters_read: [],
          total_reading_time_minutes: 0
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-highlights', bookId, userEmail] });
      queryClient.invalidateQueries({ queryKey: ['book-interaction', bookId, userEmail] });
    }
  });

  // Save to storage (debounced)
  const saveToStorage = useCallback((newHighlights, newNotes) => {
    if (!bookId) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Always save to localStorage as backup
    const key = `${STORAGE_KEY_PREFIX}${bookId}`;
    const data = {
      highlights: newHighlights,
      notes: newNotes,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(data));

    // Debounce database save if logged in
    if (userEmail) {
      saveTimeoutRef.current = setTimeout(() => {
        saveMutation.mutate({ newHighlights, newNotes });
      }, 1000);
    }
  }, [bookId, userEmail, saveMutation]);

  // Add highlight
  const addHighlight = useCallback((text, pageIndex, chapterId = null, position = null) => {
    const newHighlight = {
      id: `hl-${Date.now()}`,
      text,
      pageIndex,
      chapter_id: chapterId,
      position,
      created_at: new Date().toISOString(),
      color: 'yellow' // default color
    };

    setHighlights(prev => {
      const updated = [...prev, newHighlight];
      saveToStorage(updated, notes);
      return updated;
    });

    return newHighlight;
  }, [notes, saveToStorage]);

  // Remove highlight
  const removeHighlight = useCallback((highlightId) => {
    setHighlights(prev => {
      const updated = prev.filter(h => h.id !== highlightId);
      saveToStorage(updated, notes);
      return updated;
    });
  }, [notes, saveToStorage]);

  // Update highlight color
  const updateHighlightColor = useCallback((highlightId, color) => {
    setHighlights(prev => {
      const updated = prev.map(h => 
        h.id === highlightId ? { ...h, color } : h
      );
      saveToStorage(updated, notes);
      return updated;
    });
  }, [notes, saveToStorage]);

  // Add note
  const addNote = useCallback((content, pageIndex, chapterId = null, highlightId = null) => {
    const newNote = {
      id: `note-${Date.now()}`,
      content,
      pageIndex,
      chapter_id: chapterId,
      highlightId,
      created_at: new Date().toISOString()
    };

    setNotes(prev => {
      const updated = [...prev, newNote];
      saveToStorage(highlights, updated);
      return updated;
    });

    return newNote;
  }, [highlights, saveToStorage]);

  // Update note
  const updateNote = useCallback((noteId, content) => {
    setNotes(prev => {
      const updated = prev.map(n =>
        n.id === noteId ? { ...n, content, updatedAt: new Date().toISOString() } : n
      );
      saveToStorage(highlights, updated);
      return updated;
    });
  }, [highlights, saveToStorage]);

  // Remove note
  const removeNote = useCallback((noteId) => {
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== noteId);
      saveToStorage(highlights, updated);
      return updated;
    });
  }, [highlights, saveToStorage]);

  // Get highlights for specific page
  const getPageHighlights = useCallback((pageIndex) => {
    return highlights.filter(h => h.pageIndex === pageIndex);
  }, [highlights]);

  // Get notes for specific page
  const getPageNotes = useCallback((pageIndex) => {
    return notes.filter(n => n.pageIndex === pageIndex);
  }, [notes]);

  // Export highlights as formatted text
  const exportHighlights = useCallback(() => {
    if (highlights.length === 0) return '';

    return highlights.map((h, idx) => 
      `${idx + 1}. "${h.text}" (Trang ${h.pageIndex + 1})`
    ).join('\n');
  }, [highlights]);

  // Get highlights for specific chapter
  const getChapterHighlights = useCallback((chapterId) => {
    return highlights.filter(h => h.chapter_id === chapterId);
  }, [highlights]);

  // Get notes for specific chapter
  const getChapterNotes = useCallback((chapterId) => {
    return notes.filter(n => n.chapter_id === chapterId);
  }, [notes]);

  // Sync status
  const isSyncing = saveMutation.isPending;
  const isSynced = !saveMutation.isPending && !!userEmail;

  return {
    highlights,
    notes,
    isLoading,
    isSyncing,
    isSynced,
    addHighlight,
    removeHighlight,
    updateHighlightColor,
    addNote,
    updateNote,
    removeNote,
    getPageHighlights,
    getPageNotes,
    getChapterHighlights,
    getChapterNotes,
    exportHighlights
  };
}

export default useReadingHighlights;