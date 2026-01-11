/**
 * PostContentRenderer - Render markdown content cho PostCard
 * UI Layer - Presentation only
 * 
 * Hỗ trợ:
 * - Headings (# ## ###)
 * - Lists (- * 1.)
 * - Bold/Italic (**text** *text*)
 * - Blockquotes (>)
 * - Code (`code` và code blocks)
 * - Tables (| col1 | col2 |)
 * - Hashtags (#tag)
 * - Mentions (@user)
 * - Links
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function PostContentRenderer({ content, className = '' }) {
  if (!content) return null;
  

  
  // Custom text renderer để xử lý hashtags/mentions trong text nodes
  const renderTextWithHashtags = (text) => {
    if (typeof text !== 'string') return text;
    
    // Split by hashtags và mentions
    const parts = text.split(/(#[\w\u0080-\uFFFF]+|@[\w\u0080-\uFFFF]+)/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span 
            key={i} 
            className="text-[#7CB342] font-medium cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span 
            key={i} 
            className="text-blue-600 font-medium cursor-pointer hover:underline"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  return (
    <div className={`prose prose-gray max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-4 mb-2 text-gray-900 border-b border-gray-200 pb-1">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-bold mt-3 mb-2 text-gray-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#7CB342] rounded-full flex-shrink-0"></span>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-3 mb-1 text-gray-900">
              {children}
            </h3>
          ),
          
          // Paragraphs - xử lý hashtags/mentions
          p: ({ children }) => (
            <p className="my-2 leading-relaxed text-gray-800">
              {React.Children.map(children, child => {
                if (typeof child === 'string') {
                  return renderTextWithHashtags(child);
                }
                return child;
              })}
            </p>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#7CB342] pl-4 py-1 my-3 bg-green-50 rounded-r-lg italic text-gray-600">
              {children}
            </blockquote>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="my-2 ml-4 space-y-1 list-disc text-gray-800">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2 ml-4 space-y-1 list-decimal text-gray-800">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800">
              {React.Children.map(children, child => {
                if (typeof child === 'string') {
                  return renderTextWithHashtags(child);
                }
                return child;
              })}
            </li>
          ),
          
          // Code
          code: ({ inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[#7CB342] text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-3 overflow-x-auto my-3 text-sm">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          

          
          // Tables - với remarkGfm
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#7CB342]/10">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 text-left text-sm font-semibold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-sm text-gray-700">
              {children}
            </td>
          ),
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#7CB342] hover:underline"
            >
              {children}
            </a>
          ),
          
          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">{children}</strong>
          ),
          
          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
          
          // Horizontal rule
          hr: () => (
            <hr className="my-4 border-t-2 border-gray-200" />
          ),
          
          // Images
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt || ''} 
              className="rounded-xl max-w-full h-auto my-3 shadow-md"
            />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}