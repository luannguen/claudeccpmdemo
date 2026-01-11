/**
 * Markdown Renderer for Chatbot
 * 
 * ENHANCED: Clickable links with proper navigation
 * Renders markdown content with proper styling
 */

import React, { memo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

function MarkdownRenderer({ content }) {
  const navigate = useNavigate();

  // Handle internal link clicks
  const handleLinkClick = useCallback((e, href) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!href) return;
    
    // Parse the href to navigate properly
    if (href.includes('ProductDetail') && href.includes('id=')) {
      const idMatch = href.match(/id=([^&]+)/);
      if (idMatch) {
        navigate(createPageUrl('ProductDetail') + `?id=${idMatch[1]}`);
        return;
      }
    }
    
    // Handle page names like /Services, /MyOrders
    if (href.startsWith('/')) {
      const pageName = href.replace('/', '').split('?')[0];
      const query = href.includes('?') ? href.split('?')[1] : '';
      
      // Common page mappings
      const pageMap = {
        'Services': 'Services',
        'MyOrders': 'MyOrders', 
        'Contact': 'Contact',
        'Community': 'Community',
        'PreOrderLots': 'PreOrderLots',
        'Home': 'Home'
      };
      
      if (pageMap[pageName]) {
        navigate(createPageUrl(pageMap[pageName]) + (query ? `?${query}` : ''));
        return;
      }
      
      // Fallback - direct navigate
      navigate(href);
    }
  }, [navigate]);

  // Convert chatbot-style links to proper URLs
  const processedContent = content?.replace(
    /\[([^\]]+)\]\(ProductDetail\?id=([^)]+)\)/g, 
    (_, text, id) => `[${text}](${createPageUrl('ProductDetail')}?id=${id})`
  );

  return (
    <ReactMarkdown
      className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0"
      components={{
        p: ({ children }) => <p className="my-1 leading-relaxed text-sm">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold text-[#2E7D32]">{children}</strong>,
        ul: ({ children }) => <ul className="my-1 ml-4 space-y-0.5">{children}</ul>,
        ol: ({ children }) => <ol className="my-1 ml-4 space-y-0.5 list-decimal">{children}</ol>,
        li: ({ children }) => <li className="text-sm">{children}</li>,
        h1: ({ children }) => <h1 className="text-lg font-bold my-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-base font-bold my-2">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-bold my-1">{children}</h3>,
        a: ({ href, children }) => {
          // Check if internal link
          const isInternal = href && (
            href.startsWith('/') || 
            href.includes('ProductDetail') || 
            href.includes('Services') ||
            href.includes('MyOrders') ||
            href.includes('Contact') ||
            href.includes('Community')
          );

          if (isInternal) {
            return (
              <span
                onClick={(e) => handleLinkClick(e, href)}
                className="text-[#7CB342] underline hover:text-[#5a8f31] cursor-pointer font-medium inline-block"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleLinkClick(e, href)}
              >
                {children}
              </span>
            );
          }

          // External link
          return (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#7CB342] underline hover:text-[#5a8f31]"
            >
              {children}
            </a>
          );
        },
        code: ({ children }) => (
          <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[#7CB342] pl-3 my-2 italic text-gray-600">
            {children}
          </blockquote>
        )
      }}
    >
      {processedContent || content}
    </ReactMarkdown>
  );
}

export default memo(MarkdownRenderer);