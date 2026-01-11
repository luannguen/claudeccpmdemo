import { useEffect, useRef, useCallback } from 'react';

/**
 * useAutoSaveDraft Hook
 * Auto-save post draft every 30 seconds
 */
export function useAutoSaveDraft(content, enabled = true) {
  const intervalRef = useRef(null);
  const lastSavedRef = useRef('');

  const saveDraft = useCallback(() => {
    if (!content || content === lastSavedRef.current) return;

    const draft = {
      content,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem('community-post-draft', JSON.stringify(draft));
      lastSavedRef.current = content;
      console.log('✅ Draft auto-saved');
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [content]);

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem('community-post-draft');
      if (saved) {
        const draft = JSON.parse(saved);
        return draft;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem('community-post-draft');
      lastSavedRef.current = '';
      console.log('Draft cleared');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Auto-save every 30 seconds
    intervalRef.current = setInterval(saveDraft, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, saveDraft]);

  return { saveDraft, loadDraft, clearDraft };
}