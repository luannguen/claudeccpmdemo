/**
 * DynamicPageRenderer - Render nội dung trang từ CMS
 * 
 * Component chính để hiển thị nội dung trang động từ entity Page.
 * Hỗ trợ Live Edit cho admin.
 */

import React from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { usePageBySlug } from "@/components/hooks/useCMSPages";
import { LiveEditProvider, useLiveEdit, EditableText } from "./LiveEditOverlay";

/**
 * PageHeader - Header chung cho các trang CMS (hỗ trợ Live Edit)
 */
export function PageHeader({ title, subtitle, badge, editable = true }) {
  const { isEditing, updateField } = useLiveEdit();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center mb-16"
    >
      {badge && (
        <div className="inline-flex items-center gap-2 bg-[#7CB342]/10 rounded-full px-4 py-2 mb-6">
          <Sparkles className="w-4 h-4 text-[#7CB342]" />
          <span className="text-sm text-[#7CB342] font-medium">{badge}</span>
        </div>
      )}
      
      {isEditing && editable ? (
        <EditableText
          value={title}
          onChange={(val) => updateField('title', val)}
          isEditing={true}
          fieldName="title"
          className="font-serif font-medium text-4xl lg:text-5xl text-[#0F0F0F] mb-6 leading-tight"
          placeholder="Tiêu đề trang..."
        />
      ) : (
        <h1 
          className="font-serif font-medium text-[length:var(--font-h1)] text-[#0F0F0F] mb-6 leading-tight"
          data-editable={editable ? "Tiêu đề" : undefined}
        >
          {title}
        </h1>
      )}
      
      {(subtitle || isEditing) && (
        isEditing && editable ? (
          <EditableText
            value={subtitle}
            onChange={(val) => updateField('subtitle', val)}
            isEditing={true}
            fieldName="subtitle"
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]"
            placeholder="Phụ đề trang..."
            multiline
          />
        ) : (
          <p 
            className="text-xl text-gray-600 max-w-3xl mx-auto leading-[1.618]"
            data-editable={editable ? "Phụ đề" : undefined}
          >
            {subtitle}
          </p>
        )
      )}
    </motion.div>
  );
}

/**
 * PageContent - Render HTML content từ WYSIWYG
 */
export function PageContent({ content, className = "" }) {
  if (!content) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`prose prose-lg max-w-none 
        prose-headings:font-serif prose-headings:text-[#0F0F0F]
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-a:text-[#7CB342] prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-2xl prose-img:shadow-lg
        ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

/**
 * PageLoading - Loading state cho trang
 */
export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F9F3] to-white">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-[#7CB342] animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Đang tải trang...</p>
      </div>
    </div>
  );
}

/**
 * PageNotFound - Khi không tìm thấy trang
 */
export function PageNotFound({ slug }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F5F9F3] to-white">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Không tìm thấy trang</p>
        <p className="text-gray-500">Trang "{slug}" không tồn tại hoặc chưa được xuất bản.</p>
      </div>
    </div>
  );
}

/**
 * DynamicPageRenderer - Main component với Live Edit support
 */
export default function DynamicPageRenderer({ 
  slug, 
  children,
  showHeader = true,
  headerBadge,
  fallbackContent,
  enableLiveEdit = true
}) {
  const { data: page, isLoading, error } = usePageBySlug(slug);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!page) {
    // Nếu có fallback content, render nó
    if (fallbackContent) {
      return fallbackContent;
    }
    return <PageNotFound slug={slug} />;
  }

  // Nếu có children, render children với page data (wrapped in LiveEditProvider)
  if (children) {
    return (
      <LiveEditProvider pageSlug={slug} pageData={page} enabled={enableLiveEdit}>
        {children(page)}
      </LiveEditProvider>
    );
  }

  // Default render với LiveEditProvider
  return (
    <LiveEditProvider pageSlug={slug} pageData={page} enabled={enableLiveEdit}>
      <div className="pt-32 pb-24 bg-gradient-to-b from-[#F5F9F3] to-white min-h-screen">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {showHeader && (
            <PageHeader 
              title={page.title} 
              subtitle={page.subtitle}
              badge={headerBadge}
              editable={true}
            />
          )}
          <PageContent content={page.content} />
        </div>
      </div>
    </LiveEditProvider>
  );
}

/**
 * useCMSContent - Hook để lấy nội dung CMS
 */
export function useCMSContent(slug) {
  const { data: page, isLoading, error } = usePageBySlug(slug);
  
  // Parse sections_json nếu có
  const sections = React.useMemo(() => {
    if (!page?.sections_json) return [];
    try {
      return JSON.parse(page.sections_json);
    } catch {
      return [];
    }
  }, [page?.sections_json]);

  return {
    page,
    sections,
    isLoading,
    error,
    title: page?.title,
    subtitle: page?.subtitle,
    content: page?.content,
    meta: {
      title: page?.meta_title || page?.title,
      description: page?.meta_description || page?.subtitle,
      keywords: page?.meta_keywords
    }
  };
}

/**
 * useCMSSection - Lấy một section cụ thể từ CMS data
 */
export function useCMSSection(sections, type, defaultData = null) {
  return React.useMemo(() => {
    const section = sections?.find(s => s.type === type);
    return section?.data || section?.items || defaultData;
  }, [sections, type, defaultData]);
}

/**
 * withCMSPage - HOC để wrap page với CMS data và Live Edit
 */
export function withCMSPage(WrappedComponent, slug, options = {}) {
  return function CMSPageWrapper(props) {
    const { page, sections, isLoading } = useCMSContent(slug);
    
    if (isLoading) {
      return <PageLoading />;
    }

    return (
      <LiveEditProvider pageSlug={slug} pageData={page} enabled={options.enableLiveEdit !== false}>
        <WrappedComponent 
          {...props} 
          page={page} 
          sections={sections}
        />
      </LiveEditProvider>
    );
  };
}

// Re-export LiveEdit components for convenience
export { LiveEditProvider, useLiveEdit, EditableText } from "./LiveEditOverlay";