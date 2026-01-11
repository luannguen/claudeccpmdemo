/**
 * Enhanced Chatbot Message
 * 
 * Smart renderer that detects content type
 * Renders markdown, products, orders, actions
 */

import React, { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Zap } from 'lucide-react';

import MarkdownRenderer from './renderers/MarkdownRenderer';
import ProductCardRenderer from './renderers/ProductCardRenderer';
import { ChatbotProductCard } from './renderers/ChatbotProductCard';
import OrderCardRenderer from './renderers/OrderCardRenderer';
import ActionRenderer from './renderers/ActionRenderer';
import CheckoutStepRenderer from './renderers/CheckoutStepRenderer';

const MESSAGE_ROLES = {
  USER: 'user',
  BOT: 'bot',
  SYSTEM: 'system'
};

/**
 * Smart content renderer
 */
function ContentRenderer({ message, onAddToCart, onAction }) {
  const { content, contentType, checkoutStep, autoPurchaseStep, orderPreview } = message;

  // Detect content type if not specified
  const detectedType = useMemo(() => {
    if (contentType) return contentType;
    
    // Try to detect JSON
    if (typeof content === 'object') {
      if (content.products) return 'product_list';
      if (content.orders || content.order) return 'order_list';
      return 'json';
    }
    
    // Check for markdown patterns
    if (typeof content === 'string') {
      if (content.includes('**') || content.includes('##') || content.includes('- ')) {
        return 'markdown';
      }
    }
    
    return 'text';
  }, [content, contentType]);

  // Check if this is a checkout/auto-purchase step message
  const hasCheckoutUI = checkoutStep || autoPurchaseStep || orderPreview;

  return (
    <div className="space-y-3">
      {/* Checkout Step UI (progress bar + order preview) */}
      {hasCheckoutUI && (
        <CheckoutStepRenderer 
          message={message} 
          onAction={onAction}
        />
      )}
      
      {/* Main Content */}
      {(() => {
        switch (detectedType) {
          case 'product_list':
            return (
              <ProductCardRenderer 
                data={typeof content === 'object' ? content : JSON.parse(content)}
                onAddToCart={onAddToCart}
              />
            );

          case 'product_detail':
            // Single product - render as card with full actions
            const productData = typeof content === 'object' ? content : JSON.parse(content);
            return (
              <div className="space-y-2">
                {productData.product && (
                  <ChatbotProductCard product={productData.product} compact={false} />
                )}
              </div>
            );

          case 'order_list':
            return (
              <OrderCardRenderer 
                data={typeof content === 'object' ? content : JSON.parse(content)}
                type="list"
              />
            );

          case 'order_detail':
            return (
              <OrderCardRenderer 
                data={typeof content === 'object' ? content : JSON.parse(content)}
                type="detail"
              />
            );

          case 'markdown':
            return <MarkdownRenderer content={content} />;

          case 'text':
          default:
            return (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {typeof content === 'string' ? content : JSON.stringify(content)}
              </p>
            );
        }
      })()}
    </div>
  );
}

/**
 * Message metadata badge
 */
function MessageMeta({ message, compact }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex items-center gap-2 mt-1 ${compact ? 'text-xs' : 'text-xs'}`}>
      <span className="text-gray-400">{formatTime(message.timestamp)}</span>
      
      {message.cached && (
        <span className="flex items-center gap-0.5 text-green-500" title="Từ cache">
          <Zap className="w-3 h-3" />
        </span>
      )}
      
      {message.tokensUsed > 0 && (
        <span className="text-gray-300" title={`${message.tokensUsed} tokens`}>
          ⚡{message.tokensUsed}
        </span>
      )}
    </div>
  );
}

/**
 * Main message component
 */
function ChatbotMessageEnhanced({ 
  message, 
  compact = false,
  onAddToCart,
  onAction,
  onQuickAction
}) {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const isBot = message.role === MESSAGE_ROLES.BOT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start gap-2 max-w-[90%] ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {/* Bot Avatar */}
        {isBot && (
          <div className={`
            ${compact ? 'w-6 h-6' : 'w-8 h-8'} 
            rounded-full bg-gradient-to-br from-[#7CB342] to-[#5a8f31]
            flex items-center justify-center flex-shrink-0
            shadow-sm
          `}>
            <Bot className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-white`} />
          </div>
        )}
        
        {/* Message Bubble */}
        <div 
          className={`
            ${compact ? 'p-2.5 rounded-xl' : 'p-3 rounded-2xl'}
            ${isUser 
              ? 'bg-gradient-to-br from-[#7CB342] to-[#5a8f31] text-white ml-1' 
              : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
            }
          `}
        >
          {/* Content */}
          <ContentRenderer 
            message={message}
            onAddToCart={onAddToCart}
            onAction={onAction}
          />
          
          {/* Suggested Actions */}
          {message.suggestedActions?.length > 0 && !isUser && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {message.suggestedActions.slice(0, 4).map((action, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    const handler = onQuickAction || onAction;
                    handler?.({ type: 'send_prompt', prompt: action });
                  }}
                  className="px-2.5 py-1 bg-gray-100 text-gray-700 text-[11px] rounded-full hover:bg-[#7CB342] hover:text-white transition-colors cursor-pointer"
                >
                  {action}
                </button>
              ))}
            </div>
          )}
          
          {/* Meta */}
          <MessageMeta message={message} compact={compact} />
        </div>
        
        {/* User Avatar */}
        {isUser && (
          <div className={`
            ${compact ? 'w-6 h-6' : 'w-8 h-8'} 
            rounded-full bg-gray-200
            flex items-center justify-center flex-shrink-0
          `}>
            <User className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-gray-600`} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default memo(ChatbotMessageEnhanced);