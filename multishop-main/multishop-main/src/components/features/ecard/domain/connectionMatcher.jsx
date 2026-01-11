/**
 * Connection Matcher - Domain logic for matching profiles
 * Domain Layer - Pure business logic, no API calls
 * 
 * @module features/ecard/domain
 */

/**
 * Match reason types with weights
 */
const MATCH_WEIGHTS = {
  same_company: 30,
  same_industry: 20,
  mutual_connections: 25,
  same_location: 15,
  common_tags: 10,
  similar_profile: 5
};

/**
 * Calculate match score between two profiles
 * @param {Object} profile1 - User's profile
 * @param {Object} profile2 - Candidate profile
 * @param {Array} mutualConnectionIds - IDs of mutual connections
 * @returns {number} Score 0-100
 */
export function calculateMatchScore(profile1, profile2, mutualConnectionIds = []) {
  let score = 0;
  
  // Same company (highest weight)
  if (profile1.company_name && profile2.company_name) {
    if (normalizeString(profile1.company_name) === normalizeString(profile2.company_name)) {
      score += MATCH_WEIGHTS.same_company;
    }
  }
  
  // Similar industry/profession
  if (profile1.title_profession && profile2.title_profession) {
    const similarity = calculateTitleSimilarity(profile1.title_profession, profile2.title_profession);
    score += Math.round(MATCH_WEIGHTS.same_industry * similarity);
  }
  
  // Mutual connections (0.25 per mutual, max 25)
  const mutualCount = mutualConnectionIds.length;
  score += Math.min(mutualCount * 5, MATCH_WEIGHTS.mutual_connections);
  
  // Same location
  if (profile1.address && profile2.address) {
    if (extractCity(profile1.address) === extractCity(profile2.address)) {
      score += MATCH_WEIGHTS.same_location;
    }
  }
  
  // Common tags (from custom_fields or social_links)
  const commonTags = findCommonTags(profile1, profile2);
  score += Math.min(commonTags.length * 2, MATCH_WEIGHTS.common_tags);
  
  // Similar profile completeness
  const completeness1 = calculateProfileCompleteness(profile1);
  const completeness2 = calculateProfileCompleteness(profile2);
  if (Math.abs(completeness1 - completeness2) < 20) {
    score += MATCH_WEIGHTS.similar_profile;
  }
  
  return Math.min(score, 100);
}

/**
 * Generate match reasons for display
 * @param {Object} profile1 - User's profile
 * @param {Object} profile2 - Candidate profile
 * @param {Array} mutualConnectionIds - IDs of mutual connections
 * @returns {Array} Array of match reasons
 */
export function generateMatchReasons(profile1, profile2, mutualConnectionIds = []) {
  const reasons = [];
  
  // Same company
  if (profile1.company_name && profile2.company_name) {
    if (normalizeString(profile1.company_name) === normalizeString(profile2.company_name)) {
      reasons.push({
        type: 'same_company',
        label: 'Cùng công ty',
        value: profile2.company_name
      });
    }
  }
  
  // Similar profession
  if (profile1.title_profession && profile2.title_profession) {
    const similarity = calculateTitleSimilarity(profile1.title_profession, profile2.title_profession);
    if (similarity > 0.5) {
      reasons.push({
        type: 'same_industry',
        label: 'Cùng lĩnh vực',
        value: profile2.title_profession
      });
    }
  }
  
  // Mutual connections
  if (mutualConnectionIds.length > 0) {
    reasons.push({
      type: 'mutual_connections',
      label: 'Bạn chung',
      value: `${mutualConnectionIds.length} người`
    });
  }
  
  // Same location
  if (profile1.address && profile2.address) {
    const city1 = extractCity(profile1.address);
    const city2 = extractCity(profile2.address);
    if (city1 && city2 && city1 === city2) {
      reasons.push({
        type: 'same_location',
        label: 'Cùng địa phương',
        value: city1
      });
    }
  }
  
  // Common tags
  const commonTags = findCommonTags(profile1, profile2);
  if (commonTags.length > 0) {
    reasons.push({
      type: 'common_tags',
      label: 'Điểm chung',
      value: commonTags.slice(0, 3).join(', ')
    });
  }
  
  return reasons;
}

/**
 * Find common fields/tags between profiles
 */
export function findCommonTags(profile1, profile2) {
  const tags1 = extractTags(profile1);
  const tags2 = extractTags(profile2);
  
  return tags1.filter(tag => tags2.includes(tag));
}

// ========== HELPER FUNCTIONS ==========

function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function calculateTitleSimilarity(title1, title2) {
  const keywords1 = extractKeywords(title1);
  const keywords2 = extractKeywords(title2);
  
  if (keywords1.length === 0 || keywords2.length === 0) return 0;
  
  const common = keywords1.filter(k => keywords2.includes(k));
  return common.length / Math.max(keywords1.length, keywords2.length);
}

function extractKeywords(text) {
  if (!text) return [];
  
  const stopwords = ['và', 'của', 'tại', 'the', 'and', 'of', 'at'];
  return normalizeString(text)
    .split(/[\s,./]+/)
    .filter(word => word.length > 2 && !stopwords.includes(word));
}

function extractCity(address) {
  if (!address) return null;
  
  // Vietnamese cities
  const cities = [
    'hà nội', 'hồ chí minh', 'đà nẵng', 'hải phòng', 'cần thơ',
    'nha trang', 'huế', 'đà lạt', 'vũng tàu', 'biên hòa'
  ];
  
  const normalized = normalizeString(address);
  for (const city of cities) {
    if (normalized.includes(city)) {
      return city.charAt(0).toUpperCase() + city.slice(1);
    }
  }
  
  return null;
}

function extractTags(profile) {
  const tags = [];
  
  // From social links platforms
  if (profile.social_links) {
    profile.social_links.forEach(link => {
      if (link.platform) {
        tags.push(normalizeString(link.platform));
      }
    });
  }
  
  // From custom fields
  if (profile.custom_fields) {
    profile.custom_fields.forEach(field => {
      if (field.label) {
        tags.push(normalizeString(field.label));
      }
    });
  }
  
  return tags;
}

function calculateProfileCompleteness(profile) {
  const fields = [
    'display_name', 'profile_image_url', 'title_profession',
    'company_name', 'bio', 'phone', 'email', 'website', 'address'
  ];
  
  const filled = fields.filter(field => profile[field] && profile[field].trim()).length;
  return Math.round((filled / fields.length) * 100);
}

export default {
  calculateMatchScore,
  generateMatchReasons,
  findCommonTags,
  MATCH_WEIGHTS
};