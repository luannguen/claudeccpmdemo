/**
 * Context Compressor Service
 * 
 * ENHANCEMENT #4: Nén history thành summary, giữ ngữ cảnh mà tiết kiệm token
 * Giảm 60-70% tokens khi history dài
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const COMPRESSOR_CONFIG = {
  maxRawMessages: 4,          // Keep last 4 messages as-is
  summaryMessageCount: 10,    // Summarize older messages
  maxSummaryLength: 200,      // Max chars for summary
  maxTokenEstimate: 500       // Target token count for context
};

// ========== TOKEN ESTIMATION ==========

/**
 * Estimate token count (rough: ~4 chars per token for Vietnamese)
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens for message array
 */
function estimateMessagesTokens(messages) {
  return messages.reduce((sum, m) => {
    const content = typeof m.content === 'string' ? m.content : JSON.stringify(m.content);
    return sum + estimateTokens(content) + 5; // +5 for role/metadata
  }, 0);
}

// ========== COMPRESSION STRATEGIES ==========

/**
 * Extract key information from message
 */
function extractKeyInfo(message) {
  const content = typeof message.content === 'string' 
    ? message.content 
    : JSON.stringify(message.content);
  
  const role = message.role === 'user' ? 'U' : 'B';
  
  // Extract intent if available
  const intent = message.intent ? `[${message.intent}]` : '';
  
  // Truncate content
  const truncated = content.length > 100 
    ? content.substring(0, 100) + '...' 
    : content;
  
  return `${role}${intent}: ${truncated}`;
}

/**
 * Compress old messages into summary
 */
function compressToSummary(messages) {
  if (messages.length === 0) return '';
  
  // Group by intent
  const intentGroups = {};
  let lastTopic = null;
  
  messages.forEach(m => {
    const intent = m.intent || 'general';
    if (!intentGroups[intent]) {
      intentGroups[intent] = [];
    }
    intentGroups[intent].push(m);
    lastTopic = intent;
  });
  
  // Build summary
  const summaryParts = [];
  
  for (const [intent, msgs] of Object.entries(intentGroups)) {
    const count = msgs.length;
    const sample = msgs[0];
    const sampleContent = typeof sample.content === 'string' 
      ? sample.content.substring(0, 50) 
      : 'data';
    
    summaryParts.push(`${intent}(${count}): "${sampleContent}..."`);
  }
  
  const summary = summaryParts.join('; ');
  
  return summary.length > COMPRESSOR_CONFIG.maxSummaryLength
    ? summary.substring(0, COMPRESSOR_CONFIG.maxSummaryLength) + '...'
    : summary;
}

/**
 * Smart truncate based on importance
 */
function smartTruncate(messages, targetTokens) {
  const result = [];
  let currentTokens = 0;
  
  // Always include most recent messages first (reverse order)
  const reversed = [...messages].reverse();
  
  for (const msg of reversed) {
    const msgTokens = estimateTokens(
      typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)
    );
    
    if (currentTokens + msgTokens <= targetTokens) {
      result.unshift(msg);
      currentTokens += msgTokens;
    } else {
      // Try to fit a truncated version
      if (currentTokens < targetTokens * 0.8) {
        const remaining = targetTokens - currentTokens;
        const truncatedContent = (typeof msg.content === 'string' ? msg.content : '')
          .substring(0, remaining * 4);
        
        result.unshift({
          ...msg,
          content: truncatedContent + '...',
          truncated: true
        });
      }
      break;
    }
  }
  
  return result;
}

// ========== MAIN COMPRESSION FUNCTION ==========

/**
 * Compress conversation history for LLM context
 * 
 * @param {Array} messages - Full message history
 * @param {Object} options - Compression options
 * @returns {{ compressed: Array, summary: string, stats: Object }}
 */
export function compressHistory(messages, options = {}) {
  const {
    maxMessages = COMPRESSOR_CONFIG.maxRawMessages,
    targetTokens = COMPRESSOR_CONFIG.maxTokenEstimate
  } = options;
  
  if (!messages || messages.length === 0) {
    return {
      compressed: [],
      summary: '',
      stats: { original: 0, compressed: 0, savings: 0 }
    };
  }
  
  const originalTokens = estimateMessagesTokens(messages);
  
  // If already small enough, return as-is
  if (messages.length <= maxMessages && originalTokens <= targetTokens) {
    return {
      compressed: messages,
      summary: '',
      stats: { 
        original: originalTokens, 
        compressed: originalTokens, 
        savings: 0,
        method: 'none'
      }
    };
  }
  
  // Split into recent and older
  const recentMessages = messages.slice(-maxMessages);
  const olderMessages = messages.slice(0, -maxMessages);
  
  // Compress older messages to summary
  const summary = olderMessages.length > 0 
    ? compressToSummary(olderMessages) 
    : '';
  
  // Smart truncate recent if still too long
  let compressed = recentMessages;
  const summaryTokens = estimateTokens(summary);
  const remainingTokens = targetTokens - summaryTokens;
  
  if (estimateMessagesTokens(recentMessages) > remainingTokens) {
    compressed = smartTruncate(recentMessages, remainingTokens);
  }
  
  const compressedTokens = estimateMessagesTokens(compressed) + summaryTokens;
  
  return {
    compressed,
    summary,
    stats: {
      original: originalTokens,
      compressed: compressedTokens,
      savings: Math.round((1 - compressedTokens / originalTokens) * 100),
      method: 'compress',
      summarizedCount: olderMessages.length
    }
  };
}

/**
 * Build optimized context for LLM
 */
export function buildOptimizedContext(messages, userContext = {}) {
  const { compressed, summary, stats } = compressHistory(messages);
  
  const contextParts = [];
  
  // Add summary if exists
  if (summary) {
    contextParts.push(`[Lịch sử: ${summary}]`);
  }
  
  // Add user context (compressed)
  if (userContext.contextString) {
    const truncatedContext = userContext.contextString.length > 150
      ? userContext.contextString.substring(0, 150) + '...'
      : userContext.contextString;
    contextParts.push(`[User: ${truncatedContext}]`);
  }
  
  // Add recent messages
  compressed.forEach(msg => {
    const role = msg.role === 'user' ? 'User' : 'Bot';
    const content = typeof msg.content === 'string' 
      ? msg.content.substring(0, 200) 
      : '[data]';
    contextParts.push(`${role}: ${content}`);
  });
  
  return {
    context: contextParts.join('\n'),
    stats
  };
}

/**
 * Prune old messages from session
 */
export function pruneSessionMessages(messages, maxCount = 50) {
  if (messages.length <= maxCount) return messages;
  
  // Keep summary of pruned messages
  const toPrune = messages.slice(0, messages.length - maxCount);
  const toKeep = messages.slice(-maxCount);
  
  // Add summary message at the beginning
  const summary = compressToSummary(toPrune);
  const summaryMessage = {
    id: `summary_${Date.now()}`,
    role: 'system',
    content: `[Tóm tắt ${toPrune.length} tin nhắn trước: ${summary}]`,
    contentType: 'text',
    timestamp: new Date().toISOString(),
    isSummary: true
  };
  
  return [summaryMessage, ...toKeep];
}

export default {
  compressHistory,
  buildOptimizedContext,
  pruneSessionMessages,
  estimateTokens,
  estimateMessagesTokens,
  COMPRESSOR_CONFIG
};