/**
 * Version Repository
 * Data layer for ChapterVersion entity
 */

import { base44 } from '@/api/base44Client';
import { countWords } from '../types';

/**
 * Calculate simple diff stats between two texts
 */
function calculateDiffStats(oldText, newText) {
  const oldLines = (oldText || '').split('\n');
  const newLines = (newText || '').split('\n');
  
  let additions = 0;
  let deletions = 0;
  
  // Simple line-based diff
  const oldSet = new Set(oldLines);
  const newSet = new Set(newLines);
  
  newLines.forEach(line => {
    if (!oldSet.has(line)) additions++;
  });
  
  oldLines.forEach(line => {
    if (!newSet.has(line)) deletions++;
  });
  
  return {
    additions,
    deletions,
    changes: additions + deletions
  };
}

export const versionRepository = {
  /**
   * List versions for a chapter
   */
  listByChapter: async (chapterId) => {
    return await base44.entities.ChapterVersion.filter(
      { chapter_id: chapterId },
      '-version_number',
      100
    );
  },

  /**
   * Get specific version
   */
  getById: async (versionId) => {
    return await base44.entities.ChapterVersion.get(versionId);
  },

  /**
   * Get latest version number for a chapter
   */
  getLatestVersionNumber: async (chapterId) => {
    const versions = await base44.entities.ChapterVersion.filter(
      { chapter_id: chapterId },
      '-version_number',
      1
    );
    return versions[0]?.version_number || 0;
  },

  /**
   * Create initial version (when chapter is created)
   */
  createInitial: async (chapter, author) => {
    return await base44.entities.ChapterVersion.create({
      chapter_id: chapter.id,
      book_id: chapter.book_id,
      version_number: 1,
      title: chapter.title,
      content: chapter.content,
      excerpt: chapter.excerpt,
      word_count: countWords(chapter.content),
      author_email: author.email,
      author_name: author.full_name || author.name,
      change_summary: 'Tạo chương mới',
      change_type: 'create',
      is_current: true,
      diff_stats: {
        additions: (chapter.content || '').split('\n').length,
        deletions: 0,
        changes: (chapter.content || '').split('\n').length
      }
    });
  },

  /**
   * Create new version (when chapter is edited)
   */
  createVersion: async (chapter, previousContent, author, changeSummary = '') => {
    // Get latest version number
    const latestVersion = await versionRepository.getLatestVersionNumber(chapter.id);
    const newVersionNumber = latestVersion + 1;

    // Mark old versions as not current
    const oldVersions = await versionRepository.listByChapter(chapter.id);
    for (const v of oldVersions) {
      if (v.is_current) {
        await base44.entities.ChapterVersion.update(v.id, { is_current: false });
      }
    }

    // Calculate diff
    const diffStats = calculateDiffStats(previousContent, chapter.content);

    // Create new version
    return await base44.entities.ChapterVersion.create({
      chapter_id: chapter.id,
      book_id: chapter.book_id,
      version_number: newVersionNumber,
      title: chapter.title,
      content: chapter.content,
      excerpt: chapter.excerpt,
      word_count: countWords(chapter.content),
      author_email: author.email,
      author_name: author.full_name || author.name,
      change_summary: changeSummary || `Cập nhật lần ${newVersionNumber}`,
      change_type: 'edit',
      is_current: true,
      diff_stats: diffStats
    });
  },

  /**
   * Restore a previous version
   */
  restoreVersion: async (versionId, author) => {
    const versionToRestore = await base44.entities.ChapterVersion.get(versionId);
    if (!versionToRestore) return null;

    // Get current chapter content for diff
    const currentVersions = await base44.entities.ChapterVersion.filter(
      { chapter_id: versionToRestore.chapter_id, is_current: true },
      '-version_number',
      1
    );
    const currentContent = currentVersions[0]?.content || '';

    // Get latest version number
    const latestVersion = await versionRepository.getLatestVersionNumber(versionToRestore.chapter_id);
    const newVersionNumber = latestVersion + 1;

    // Mark old versions as not current
    const oldVersions = await versionRepository.listByChapter(versionToRestore.chapter_id);
    for (const v of oldVersions) {
      if (v.is_current) {
        await base44.entities.ChapterVersion.update(v.id, { is_current: false });
      }
    }

    // Calculate diff
    const diffStats = calculateDiffStats(currentContent, versionToRestore.content);

    // Create restore version
    const newVersion = await base44.entities.ChapterVersion.create({
      chapter_id: versionToRestore.chapter_id,
      book_id: versionToRestore.book_id,
      version_number: newVersionNumber,
      title: versionToRestore.title,
      content: versionToRestore.content,
      excerpt: versionToRestore.excerpt,
      word_count: versionToRestore.word_count,
      author_email: author.email,
      author_name: author.full_name || author.name,
      change_summary: `Khôi phục từ phiên bản ${versionToRestore.version_number}`,
      change_type: 'restore',
      is_current: true,
      diff_stats: diffStats
    });

    // Update chapter with restored content
    await base44.entities.BookChapter.update(versionToRestore.chapter_id, {
      title: versionToRestore.title,
      content: versionToRestore.content,
      excerpt: versionToRestore.excerpt,
      version: newVersionNumber
    });

    return newVersion;
  },

  /**
   * Compare two versions
   */
  compareVersions: async (versionId1, versionId2) => {
    const [v1, v2] = await Promise.all([
      base44.entities.ChapterVersion.get(versionId1),
      base44.entities.ChapterVersion.get(versionId2)
    ]);

    return {
      version1: v1,
      version2: v2,
      diff: calculateDiffStats(v1.content, v2.content)
    };
  }
};

export { calculateDiffStats };
export default versionRepository;