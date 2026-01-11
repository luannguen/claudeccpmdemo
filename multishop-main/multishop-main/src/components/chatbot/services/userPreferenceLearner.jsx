/**
 * User Preference Learner
 * 
 * ENHANCEMENT #5: Học từ behavior, điều chỉnh tone/response
 * Cá nhân hóa chatbot dựa trên tương tác
 * 
 * Architecture: Service Layer (AI-CODING-RULES compliant)
 */

import { success, failure, ErrorCodes } from '@/components/data/types';

// ========== CONFIG ==========

const LEARNER_CONFIG = {
  storageKey: 'chatbot_user_prefs',
  maxInteractions: 100,
  decayFactor: 0.95,
  minConfidence: 0.3
};

// ========== PREFERENCE SCHEMA ==========

const DEFAULT_PREFERENCES = {
  // Response style
  preferredTone: 'friendly', // friendly, professional, casual
  preferredLength: 'medium', // short, medium, detailed
  
  // Topics
  topicInterests: {},        // topic -> score
  topicDislikes: {},         // topic -> score
  
  // Behavior
  askingPatterns: {
    preferQuickActions: false,
    prefersExamples: false,
    needsConfirmation: false
  },
  
  // Timing
  activeHours: [],           // Most active hours
  averageResponseTime: 0,    // How long they wait before responding
  
  // Products
  favoriteCategories: [],
  priceRange: { min: 0, max: Infinity },
  
  // Stats
  totalInteractions: 0,
  positiveInteractions: 0,
  negativeInteractions: 0,
  lastUpdated: null
};

// ========== STORAGE ==========

function getPreferences(userEmail) {
  try {
    const key = `${LEARNER_CONFIG.storageKey}_${userEmail || 'anon'}`;
    const stored = localStorage.getItem(key);
    return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : { ...DEFAULT_PREFERENCES };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

function savePreferences(userEmail, prefs) {
  try {
    const key = `${LEARNER_CONFIG.storageKey}_${userEmail || 'anon'}`;
    localStorage.setItem(key, JSON.stringify({
      ...prefs,
      lastUpdated: new Date().toISOString()
    }));
  } catch {
    // Silent fail
  }
}

// ========== LEARNING FUNCTIONS ==========

/**
 * Learn from user message
 */
export function learnFromMessage(userEmail, message, context = {}) {
  const prefs = getPreferences(userEmail);
  prefs.totalInteractions++;
  
  const content = typeof message === 'string' ? message : message.content;
  
  // Learn message length preference
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 5) {
    prefs.preferredLength = 'short';
  } else if (wordCount > 20) {
    prefs.preferredLength = 'detailed';
  }
  
  // Learn active hours
  const hour = new Date().getHours();
  if (!prefs.activeHours.includes(hour)) {
    prefs.activeHours.push(hour);
    if (prefs.activeHours.length > 5) {
      // Keep most common 5 hours
      const hourCounts = {};
      prefs.activeHours.forEach(h => {
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      });
      prefs.activeHours = Object.entries(hourCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([h]) => parseInt(h));
    }
  }
  
  // Learn topic interests
  if (context.intent) {
    const topic = context.intent;
    prefs.topicInterests[topic] = (prefs.topicInterests[topic] || 0) + 1;
  }
  
  // Detect question patterns
  if (content.includes('?')) {
    prefs.askingPatterns.prefersExamples = content.toLowerCase().includes('ví dụ') || 
                                            content.toLowerCase().includes('example');
  }
  
  // Detect confirmation needs
  if (content.toLowerCase().match(/chắc|chưa|đúng không|phải không/)) {
    prefs.askingPatterns.needsConfirmation = true;
  }
  
  savePreferences(userEmail, prefs);
  return success(prefs);
}

/**
 * Learn from user feedback (positive/negative)
 */
export function learnFromFeedback(userEmail, isPositive, context = {}) {
  const prefs = getPreferences(userEmail);
  
  if (isPositive) {
    prefs.positiveInteractions++;
    
    // Boost topic interest
    if (context.intent) {
      prefs.topicInterests[context.intent] = (prefs.topicInterests[context.intent] || 0) + 2;
    }
  } else {
    prefs.negativeInteractions++;
    
    // Track disliked topics
    if (context.intent) {
      prefs.topicDislikes[context.intent] = (prefs.topicDislikes[context.intent] || 0) + 1;
    }
  }
  
  savePreferences(userEmail, prefs);
  return success(prefs);
}

/**
 * Learn from product interaction
 */
export function learnFromProductInteraction(userEmail, product, action) {
  const prefs = getPreferences(userEmail);
  
  // Learn category preference
  if (product.category) {
    if (!prefs.favoriteCategories.includes(product.category)) {
      prefs.favoriteCategories.push(product.category);
      if (prefs.favoriteCategories.length > 5) {
        prefs.favoriteCategories.shift();
      }
    }
  }
  
  // Learn price range
  if (product.price) {
    if (prefs.priceRange.min === 0 || product.price < prefs.priceRange.min) {
      prefs.priceRange.min = product.price;
    }
    if (product.price > prefs.priceRange.max || prefs.priceRange.max === Infinity) {
      prefs.priceRange.max = product.price;
    }
  }
  
  savePreferences(userEmail, prefs);
  return success(prefs);
}

// ========== RECOMMENDATION FUNCTIONS ==========

/**
 * Get personalized response style
 */
export function getResponseStyle(userEmail) {
  const prefs = getPreferences(userEmail);
  
  return {
    tone: prefs.preferredTone,
    length: prefs.preferredLength,
    includeExamples: prefs.askingPatterns.prefersExamples,
    askConfirmation: prefs.askingPatterns.needsConfirmation,
    suggestQuickActions: prefs.askingPatterns.preferQuickActions
  };
}

/**
 * Get personalized topic suggestions
 */
export function getTopicSuggestions(userEmail) {
  const prefs = getPreferences(userEmail);
  
  // Sort topics by interest score, exclude dislikes
  const suggestions = Object.entries(prefs.topicInterests)
    .filter(([topic]) => !prefs.topicDislikes[topic] || prefs.topicDislikes[topic] < 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
  
  return suggestions;
}

/**
 * Get product recommendations filter
 */
export function getProductFilter(userEmail) {
  const prefs = getPreferences(userEmail);
  
  return {
    categories: prefs.favoriteCategories,
    priceRange: prefs.priceRange.max < Infinity ? prefs.priceRange : null
  };
}

/**
 * Build personalized prompt modifier
 */
export function buildPersonalizedPrompt(userEmail) {
  const style = getResponseStyle(userEmail);
  const prefs = getPreferences(userEmail);
  
  const modifiers = [];
  
  // Tone modifier
  switch (style.tone) {
    case 'professional':
      modifiers.push('Trả lời chuyên nghiệp, lịch sự.');
      break;
    case 'casual':
      modifiers.push('Trả lời thân mật, vui vẻ.');
      break;
    default:
      modifiers.push('Trả lời thân thiện.');
  }
  
  // Length modifier
  switch (style.length) {
    case 'short':
      modifiers.push('Trả lời ngắn gọn, chỉ những điểm chính.');
      break;
    case 'detailed':
      modifiers.push('Trả lời chi tiết, đầy đủ.');
      break;
  }
  
  // Example modifier
  if (style.includeExamples) {
    modifiers.push('Đưa ví dụ minh họa nếu phù hợp.');
  }
  
  // Confirmation modifier
  if (style.askConfirmation) {
    modifiers.push('Xác nhận lại nếu không chắc chắn.');
  }
  
  // Add favorite categories
  if (prefs.favoriteCategories.length > 0) {
    modifiers.push(`Ưu tiên sản phẩm danh mục: ${prefs.favoriteCategories.join(', ')}.`);
  }
  
  return modifiers.join(' ');
}

/**
 * Apply decay to old preferences
 */
export function decayPreferences(userEmail) {
  const prefs = getPreferences(userEmail);
  const decay = LEARNER_CONFIG.decayFactor;
  
  // Decay topic scores
  for (const topic in prefs.topicInterests) {
    prefs.topicInterests[topic] *= decay;
    if (prefs.topicInterests[topic] < LEARNER_CONFIG.minConfidence) {
      delete prefs.topicInterests[topic];
    }
  }
  
  for (const topic in prefs.topicDislikes) {
    prefs.topicDislikes[topic] *= decay;
    if (prefs.topicDislikes[topic] < LEARNER_CONFIG.minConfidence) {
      delete prefs.topicDislikes[topic];
    }
  }
  
  savePreferences(userEmail, prefs);
  return success(prefs);
}

/**
 * Get full preference profile
 */
export function getPreferenceProfile(userEmail) {
  const prefs = getPreferences(userEmail);
  const style = getResponseStyle(userEmail);
  const topics = getTopicSuggestions(userEmail);
  const productFilter = getProductFilter(userEmail);
  
  return {
    preferences: prefs,
    style,
    suggestedTopics: topics,
    productFilter,
    promptModifier: buildPersonalizedPrompt(userEmail),
    confidence: prefs.totalInteractions > 10 ? 'high' : 
                prefs.totalInteractions > 3 ? 'medium' : 'low'
  };
}

/**
 * Clear preferences
 */
export function clearPreferences(userEmail) {
  const key = `${LEARNER_CONFIG.storageKey}_${userEmail || 'anon'}`;
  localStorage.removeItem(key);
  return success(true);
}

export default {
  learnFromMessage,
  learnFromFeedback,
  learnFromProductInteraction,
  getResponseStyle,
  getTopicSuggestions,
  getProductFilter,
  buildPersonalizedPrompt,
  decayPreferences,
  getPreferenceProfile,
  clearPreferences,
  LEARNER_CONFIG
};