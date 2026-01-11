/**
 * useChapterVersions Hook
 * Manages chapter versioning
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { versionRepository } from '../data/versionRepository';
import { useToast } from '@/components/NotificationToast';

export function useChapterVersions(chapterId, currentUser) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState([]);
  
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // Fetch versions
  const { 
    data: versions = [], 
    isLoading 
  } = useQuery({
    queryKey: ['chapter-versions', chapterId],
    queryFn: () => versionRepository.listByChapter(chapterId),
    enabled: !!chapterId,
    staleTime: 30 * 1000
  });

  // Current version
  const currentVersion = versions.find(v => v.is_current);

  // Restore version mutation
  const restoreMutation = useMutation({
    mutationFn: (versionId) => versionRepository.restoreVersion(versionId, currentUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapter-versions', chapterId] });
      queryClient.invalidateQueries({ queryKey: ['book-chapters'] });
      addToast('Đã khôi phục phiên bản!', 'success');
    },
    onError: () => {
      addToast('Không thể khôi phục', 'error');
    }
  });

  // Compare versions
  const { data: comparisonResult, isLoading: isComparing } = useQuery({
    queryKey: ['version-compare', selectedVersions[0], selectedVersions[1]],
    queryFn: () => versionRepository.compareVersions(selectedVersions[0], selectedVersions[1]),
    enabled: compareMode && selectedVersions.length === 2
  });

  // Handlers
  const handleRestore = useCallback((versionId) => {
    restoreMutation.mutate(versionId);
  }, [restoreMutation]);

  const toggleCompareMode = useCallback(() => {
    setCompareMode(prev => !prev);
    setSelectedVersions([]);
  }, []);

  const selectVersionForCompare = useCallback((versionId) => {
    setSelectedVersions(prev => {
      if (prev.includes(versionId)) {
        return prev.filter(id => id !== versionId);
      }
      if (prev.length >= 2) {
        return [prev[1], versionId];
      }
      return [...prev, versionId];
    });
  }, []);

  return {
    versions,
    currentVersion,
    isLoading,
    
    // Compare
    compareMode,
    selectedVersions,
    comparisonResult,
    isComparing,
    toggleCompareMode,
    selectVersionForCompare,
    
    // Actions
    handleRestore,
    isRestoring: restoreMutation.isPending
  };
}

export default useChapterVersions;