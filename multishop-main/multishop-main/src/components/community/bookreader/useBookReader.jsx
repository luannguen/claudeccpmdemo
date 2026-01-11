/**
 * useBookReader Hook
 * Logic phân trang thông minh theo ngữ nghĩa nội dung
 * V2: Tối ưu cho PC - gom nhiều nội dung hơn, UX giống đọc sách
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { PAGE_TYPES, DEFAULT_READING_SETTINGS, VIEW_MODES } from './types';

/**
 * Tính toán kích thước trang dựa trên viewport
 * PC: nhiều nội dung hơn, Mobile: ít hơn
 */
function getPageCapacity(fontSize, viewMode) {
  const isPC = typeof window !== 'undefined' && window.innerWidth >= 1024;
  const isFocusMode = viewMode === VIEW_MODES.FOCUS;
  
  // Base capacity theo font size (chars)
  const baseChars = Math.round(2000 * (16 / fontSize));
  
  // PC có viewport lớn hơn -> nhiều nội dung hơn
  // Focus mode có width hẹp hơn -> ít nội dung hơn
  let multiplier = 1;
  if (isPC) {
    multiplier = isFocusMode ? 1.5 : 2.5; // PC: 3000-5000 chars
  } else {
    multiplier = isFocusMode ? 0.8 : 1; // Mobile: 1600-2000 chars
  }
  
  return {
    maxChars: Math.round(baseChars * multiplier),
    minChars: Math.round(400 * multiplier), // Minimum để tránh trang quá ngắn
    idealChars: Math.round(baseChars * multiplier * 0.8) // Target 80% capacity
  };
}

/**
 * Đếm số dòng ước tính của markdown content
 */
function estimateLines(text) {
  const lines = text.split('\n');
  let count = 0;
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      count += 0.5; // Empty line
    } else if (/^#{1,3}\s/.test(trimmed)) {
      count += 2; // Heading
    } else if (trimmed.startsWith('>')) {
      count += 2; // Blockquote
    } else if (trimmed.startsWith('|')) {
      count += 1.5; // Table row
    } else if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      count += 1.2; // List item
    } else if (trimmed.startsWith('```')) {
      count += 1; // Code fence
    } else {
      // Regular text - estimate based on length (60 chars per line)
      count += Math.ceil(trimmed.length / 60);
    }
  });
  
  return count;
}

/**
 * Kiểm tra xem đoạn text có phải là heading chính (H1, H2)
 */
function isMajorHeading(text) {
  return /^#{1,2}\s/.test(text.trim());
}

/**
 * Kiểm tra xem có nên break page trước đoạn này không
 */
function shouldBreakBefore(text, currentLength, capacity) {
  const trimmed = text.trim();
  
  // Luôn break trước H1
  if (/^#\s/.test(trimmed) && currentLength > capacity.minChars) {
    return true;
  }
  
  // Break trước H2 nếu trang đã có đủ nội dung
  if (/^##\s/.test(trimmed) && currentLength > capacity.idealChars * 0.5) {
    return true;
  }
  
  // Break trước horizontal rule
  if (/^---+$/.test(trimmed) && currentLength > capacity.minChars) {
    return true;
  }
  
  return false;
}

/**
 * Parse content và chia thành các trang - V2 Optimized
 */
function parseContentToPages(post, settings) {
  const pages = [];
  const postData = post?.data || post;
  
  if (!postData?.content) return pages;
  
  const capacity = getPageCapacity(settings.fontSize, settings.viewMode);
  const content = postData.content;
  
  // Split by double newlines but preserve structure
  const blocks = content.split(/\n\n+/).filter(p => p.trim());
  
  let currentPageText = '';
  let currentPageIndex = 0;
  
  // Helper: Tạo page từ text
  const createTextPage = (text) => {
    if (!text.trim()) return null;
    return {
      id: `page-${currentPageIndex++}`,
      index: currentPageIndex - 1,
      type: PAGE_TYPES.TEXT,
      text: text.trim()
    };
  };
  
  // Helper: Push current page nếu đủ nội dung
  const pushCurrentPage = () => {
    if (currentPageText.trim()) {
      const page = createTextPage(currentPageText);
      if (page) pages.push(page);
      currentPageText = '';
    }
  };
  
  // Process blocks
  blocks.forEach((block, idx) => {
    const trimmedBlock = block.trim();
    
    // Check if should break before this block
    if (shouldBreakBefore(trimmedBlock, currentPageText.length, capacity)) {
      pushCurrentPage();
    }
    
    // Calculate if adding this block would exceed capacity
    const newLength = currentPageText.length + trimmedBlock.length + 2;
    const estimatedNewLines = estimateLines(currentPageText + '\n\n' + trimmedBlock);
    
    // Check if page is "full" - consider both chars and estimated lines
    const isPageFull = newLength > capacity.maxChars || estimatedNewLines > 35;
    
    if (isPageFull && currentPageText.length >= capacity.minChars) {
      // Current page is full enough, create it
      pushCurrentPage();
      currentPageText = trimmedBlock;
    } else {
      // Add to current page
      currentPageText += (currentPageText ? '\n\n' : '') + trimmedBlock;
    }
    
    // Special: If this block is very long (code block, table), allow it alone
    if (trimmedBlock.length > capacity.maxChars * 0.8) {
      pushCurrentPage();
    }
  });
  
  // Push remaining text
  pushCurrentPage();
  
  // Merge very short pages with neighbors
  const mergedPages = [];
  let pendingPage = null;
  
  pages.forEach((page, idx) => {
    if (page.type !== PAGE_TYPES.TEXT) {
      if (pendingPage) {
        mergedPages.push(pendingPage);
        pendingPage = null;
      }
      mergedPages.push(page);
      return;
    }
    
    const pageLength = page.text.length;
    
    if (pageLength < capacity.minChars && pendingPage) {
      // Merge with pending page
      pendingPage = {
        ...pendingPage,
        text: pendingPage.text + '\n\n' + page.text
      };
    } else if (pageLength < capacity.minChars && idx < pages.length - 1) {
      // Too short, hold for potential merge
      pendingPage = page;
    } else {
      if (pendingPage) {
        // Check if can merge pending with current
        const combined = pendingPage.text.length + pageLength;
        if (combined < capacity.maxChars) {
          mergedPages.push({
            ...pendingPage,
            text: pendingPage.text + '\n\n' + page.text
          });
          pendingPage = null;
        } else {
          mergedPages.push(pendingPage);
          mergedPages.push(page);
          pendingPage = null;
        }
      } else {
        mergedPages.push(page);
      }
    }
  });
  
  if (pendingPage) {
    mergedPages.push(pendingPage);
  }
  
  // 2. Add media pages to merged pages
  // Images - group into pages (max 4 per page)
  if (postData.images?.length > 0) {
    const images = postData.images;
    
    if (images.length <= 2) {
      mergedPages.push({
        id: `page-media-${currentPageIndex++}`,
        index: currentPageIndex - 1,
        type: PAGE_TYPES.MEDIA,
        images: images
      });
    } else {
      for (let i = 0; i < images.length; i += 4) {
        const chunk = images.slice(i, i + 4);
        mergedPages.push({
          id: `page-media-${currentPageIndex++}`,
          index: currentPageIndex - 1,
          type: PAGE_TYPES.MEDIA,
          images: chunk
        });
      }
    }
  }
  
  // Video - separate page
  if (postData.video_url) {
    mergedPages.push({
      id: `page-video-${currentPageIndex++}`,
      index: currentPageIndex - 1,
      type: PAGE_TYPES.MEDIA,
      videoUrl: postData.video_url
    });
  }
  
  // Poll - separate page
  if (postData.poll) {
    mergedPages.push({
      id: `page-poll-${currentPageIndex++}`,
      index: currentPageIndex - 1,
      type: PAGE_TYPES.POLL,
      poll: postData.poll
    });
  }
  
  // Products - separate page
  if (postData.product_links?.length > 0) {
    mergedPages.push({
      id: `page-products-${currentPageIndex++}`,
      index: currentPageIndex - 1,
      type: PAGE_TYPES.PRODUCTS,
      products: postData.product_links
    });
  }
  
  // Re-index pages
  return mergedPages.map((page, idx) => ({
    ...page,
    index: idx,
    id: `page-${idx}`
  }));
}

/**
 * Main hook
 */
export function useBookReader(post, initialSettings = {}) {
  // Settings
  const [settings, setSettings] = useState({
    ...DEFAULT_READING_SETTINGS,
    ...initialSettings
  });
  
  // Reading state
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState(null);
  
  // Parse pages - re-parse when fontSize or viewMode changes
  const pages = useMemo(() => {
    return parseContentToPages(post, settings);
  }, [post, settings.fontSize, settings.viewMode]);
  
  const totalPages = pages.length;
  const currentPage = pages[currentPageIndex] || null;
  
  // Progress
  const progress = useMemo(() => ({
    current: currentPageIndex + 1,
    total: totalPages,
    percentage: totalPages > 0 ? Math.round(((currentPageIndex + 1) / totalPages) * 100) : 0
  }), [currentPageIndex, totalPages]);
  
  // Navigation
  const canGoNext = currentPageIndex < totalPages - 1;
  const canGoPrev = currentPageIndex > 0;
  
  const goToPage = useCallback((pageIndex) => {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    
    setFlipDirection(pageIndex > currentPageIndex ? 'next' : 'prev');
    setIsFlipping(true);
    
    setTimeout(() => {
      setCurrentPageIndex(pageIndex);
      setIsFlipping(false);
      
      // Haptic feedback
      if (settings.hapticEnabled && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }, 200);
  }, [currentPageIndex, totalPages, settings.hapticEnabled]);
  
  const goNext = useCallback(() => {
    if (canGoNext) goToPage(currentPageIndex + 1);
  }, [canGoNext, currentPageIndex, goToPage]);
  
  const goPrev = useCallback(() => {
    if (canGoPrev) goToPage(currentPageIndex - 1);
  }, [canGoPrev, currentPageIndex, goToPage]);
  
  // Settings updaters
  const updateSettings = useCallback((updates) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);
  
  const setFontSize = useCallback((size) => {
    updateSettings({ fontSize: Math.max(12, Math.min(24, size)) });
  }, [updateSettings]);
  
  const setTheme = useCallback((theme) => {
    updateSettings({ theme });
  }, [updateSettings]);
  
  const setViewMode = useCallback((mode) => {
    updateSettings({ viewMode: mode });
  }, [updateSettings]);
  
  const toggleAnimations = useCallback(() => {
    updateSettings({ animationsEnabled: !settings.animationsEnabled });
  }, [settings.animationsEnabled, updateSettings]);
  
  // Persist reading progress
  useEffect(() => {
    if (!post?.id || totalPages === 0) return;
    
    const key = `reading-progress-${post.id}`;
    const savedProgress = {
      currentPage: currentPageIndex,
      totalPages,
      percentage: progress.percentage,
      lastReadAt: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(savedProgress));
  }, [post?.id, currentPageIndex, totalPages, progress.percentage]);
  
  // Restore reading progress
  useEffect(() => {
    if (!post?.id) return;
    
    const key = `reading-progress-${post.id}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        const { currentPage } = JSON.parse(saved);
        if (currentPage > 0 && currentPage < totalPages) {
          // Don't auto-restore, let user decide
          // setCurrentPageIndex(currentPage);
        }
      } catch (e) {}
    }
  }, [post?.id, totalPages]);
  
  // Get saved progress for resume prompt
  const getSavedProgress = useCallback(() => {
    if (!post?.id) return null;
    
    const key = `reading-progress-${post.id}`;
    const saved = localStorage.getItem(key);
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  }, [post?.id]);
  
  const resumeReading = useCallback(() => {
    const saved = getSavedProgress();
    if (saved?.currentPage > 0) {
      goToPage(saved.currentPage);
    }
  }, [getSavedProgress, goToPage]);
  
  return {
    // Pages
    pages,
    currentPage,
    currentPageIndex,
    totalPages,
    
    // Progress
    progress,
    
    // Navigation
    canGoNext,
    canGoPrev,
    goToPage,
    goNext,
    goPrev,
    
    // Animation state
    isFlipping,
    flipDirection,
    
    // Settings
    settings,
    updateSettings,
    setFontSize,
    setTheme,
    setViewMode,
    toggleAnimations,
    
    // Resume
    getSavedProgress,
    resumeReading
  };
}

export default useBookReader;