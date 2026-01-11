import React from "react";
import { Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogDetailContent({ post }) {
  return (
    <>
      {/* Excerpt */}
      {post.excerpt && (
        <div className="bg-[#7CB342]/5 border-l-4 border-[#7CB342] p-6 rounded-r-2xl mb-8">
          <p className="text-lg text-gray-700 italic leading-relaxed">
            {post.excerpt}
          </p>
        </div>
      )}

      {/* Main Content - Markdown Renderer */}
      <div className="prose prose-lg max-w-none mb-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 border-b border-gray-200 pb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-[#7CB342] rounded-full"></span>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 leading-relaxed my-4">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#7CB342] pl-4 py-2 my-6 bg-green-50/50 rounded-r-lg italic text-gray-700">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="my-4 ml-4 space-y-2 list-disc text-gray-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="my-4 ml-4 space-y-2 list-decimal text-gray-700">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-700">{children}</li>
            ),
            code: ({ inline, className, children, ...props }) => {
              if (inline) {
                return (
                  <code className="px-1.5 py-0.5 bg-gray-100 rounded text-[#7CB342] text-sm font-mono">
                    {children}
                  </code>
                );
              }
              return (
                <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto my-4">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-xl border border-gray-200">
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
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-4 py-3 text-sm text-gray-700">
                {children}
              </td>
            ),
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#7CB342] hover:underline font-medium">
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
            hr: () => (
              <hr className="my-8 border-t-2 border-gray-200" />
            ),
            img: ({ src, alt }) => (
              <img src={src} alt={alt || ''} className="rounded-xl max-w-full h-auto my-6 shadow-lg" />
            )
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-gray-200">
          <Tag className="w-5 h-5 text-gray-400" />
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-[#7CB342]/10 hover:text-[#7CB342] transition-colors cursor-pointer"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}