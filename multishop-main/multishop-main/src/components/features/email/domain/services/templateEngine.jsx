/**
 * 📧 Template Engine - Email Template Rendering
 * 
 * Handles variable replacement and template rendering.
 * Domain service - không phụ thuộc infrastructure.
 * 
 * Supports:
 * - {{variable}} syntax (Mustache-like)
 * - Conditional blocks: {{#if condition}}...{{/if}}
 * - Loops: {{#each items}}...{{/each}}
 * - Filters: {{variable|uppercase}}, {{variable|lowercase}}, {{variable|number}}
 */

/**
 * Available filters for template variables
 */
export const TEMPLATE_FILTERS = {
  uppercase: (value) => String(value || '').toUpperCase(),
  lowercase: (value) => String(value || '').toLowerCase(),
  capitalize: (value) => {
    const str = String(value || '');
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  number: (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString('vi-VN');
  },
  currency: (value) => {
    const num = Number(value) || 0;
    return num.toLocaleString('vi-VN') + 'đ';
  },
  date: (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return String(value);
    }
  },
  datetime: (value) => {
    if (!value) return '';
    try {
      return new Date(value).toLocaleString('vi-VN');
    } catch {
      return String(value);
    }
  },
  trim: (value) => String(value || '').trim(),
  escape: (value) => {
    const str = String(value || '');
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};

/**
 * Apply a filter to a value
 * 
 * @param {any} value - Value to filter
 * @param {string} filterName - Name of filter
 * @returns {string} Filtered value
 */
export function applyFilter(value, filterName) {
  const filter = TEMPLATE_FILTERS[filterName];
  if (filter) {
    return filter(value);
  }
  console.warn(`Unknown filter: ${filterName}`);
  return String(value || '');
}

/**
 * Get nested value from object using dot notation
 * 
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., "order.customer.name")
 * @returns {any} Value at path, or undefined
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Replace simple {{variable}} patterns
 * 
 * @param {string} template - Template string
 * @param {Object} data - Data object with variables
 * @returns {string} Rendered template
 */
export function replaceVariables(template, data) {
  if (!template || typeof template !== 'string') {
    return template || '';
  }
  
  // Match {{variable}} or {{variable|filter}}
  const variableRegex = /\{\{([^{}|]+)(?:\|([^{}]+))?\}\}/g;
  
  return template.replace(variableRegex, (match, variablePath, filterName) => {
    const path = variablePath.trim();
    let value = getNestedValue(data, path);
    
    // Handle undefined/null
    if (value === undefined || value === null) {
      console.warn(`Template variable not found: ${path}`);
      return '';
    }
    
    // Apply filter if specified
    if (filterName) {
      value = applyFilter(value, filterName.trim());
    }
    
    return String(value);
  });
}

/**
 * Process conditional blocks: {{#if condition}}...{{/if}}
 * 
 * @param {string} template - Template string
 * @param {Object} data - Data object
 * @returns {string} Processed template
 */
export function processConditionals(template, data) {
  if (!template) return '';
  
  // Match {{#if condition}}content{{/if}}
  const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  
  return template.replace(ifRegex, (match, condition, content) => {
    const conditionPath = condition.trim();
    const value = getNestedValue(data, conditionPath);
    
    // Check if condition is truthy
    if (value && value !== 'false' && value !== '0') {
      return processConditionals(content, data); // Recursive for nested conditionals
    }
    return '';
  });
}

/**
 * Process loop blocks: {{#each items}}...{{/each}}
 * 
 * @param {string} template - Template string
 * @param {Object} data - Data object
 * @returns {string} Processed template
 */
export function processLoops(template, data) {
  if (!template) return '';
  
  // Match {{#each items}}content{{/each}}
  const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  
  return template.replace(eachRegex, (match, arrayPath, content) => {
    const path = arrayPath.trim();
    const items = getNestedValue(data, path);
    
    if (!Array.isArray(items)) {
      console.warn(`Template each: ${path} is not an array`);
      return '';
    }
    
    return items.map((item, index) => {
      // Create context with @index and @first/@last
      const itemContext = {
        ...data,
        this: item,
        '@index': index,
        '@first': index === 0,
        '@last': index === items.length - 1,
        // Spread item properties for easy access
        ...(typeof item === 'object' ? item : { value: item })
      };
      
      return replaceVariables(content, itemContext);
    }).join('');
  });
}

/**
 * Render a template with data
 * 
 * Main entry point for template rendering.
 * Processes: loops → conditionals → variables
 * 
 * @param {string} template - Template string with {{variables}}
 * @param {Object} data - Data object for variable replacement
 * @returns {string} Rendered template
 */
export function renderTemplate(template, data) {
  if (!template) return '';
  if (!data) return template;
  
  let result = template;
  
  // Process in order: loops, conditionals, then simple variables
  result = processLoops(result, data);
  result = processConditionals(result, data);
  result = replaceVariables(result, data);
  
  return result;
}

/**
 * Render both subject and body from a template
 * 
 * @param {Object} template - Template with subject and html_content
 * @param {Object} data - Data for variable replacement
 * @returns {{subject: string, htmlBody: string}}
 */
export function renderEmailTemplate(template, data) {
  if (!template) {
    return { subject: '', htmlBody: '' };
  }
  
  return {
    subject: renderTemplate(template.subject, data),
    htmlBody: renderTemplate(template.html_content, data)
  };
}

/**
 * Extract variable names from a template
 * 
 * @param {string} template - Template string
 * @returns {string[]} Array of variable names found
 */
export function extractVariables(template) {
  if (!template) return [];
  
  const variables = new Set();
  const regex = /\{\{([^{}|#/]+)(?:\|[^{}]+)?\}\}/g;
  
  let match;
  while ((match = regex.exec(template)) !== null) {
    const varName = match[1].trim();
    if (!varName.startsWith('@')) { // Skip @index, @first, etc.
      variables.add(varName);
    }
  }
  
  return Array.from(variables);
}

/**
 * Validate template syntax
 * 
 * @param {string} template - Template string to validate
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateTemplate(template) {
  const errors = [];
  
  if (!template) {
    return { valid: true, errors: [] };
  }
  
  // Check for unclosed tags
  const openIf = (template.match(/\{\{#if/g) || []).length;
  const closeIf = (template.match(/\{\{\/if\}\}/g) || []).length;
  if (openIf !== closeIf) {
    errors.push(`Unclosed #if blocks: ${openIf} opens, ${closeIf} closes`);
  }
  
  const openEach = (template.match(/\{\{#each/g) || []).length;
  const closeEach = (template.match(/\{\{\/each\}\}/g) || []).length;
  if (openEach !== closeEach) {
    errors.push(`Unclosed #each blocks: ${openEach} opens, ${closeEach} closes`);
  }
  
  // Check for malformed variables
  const malformed = template.match(/\{\{[^{}]*\{|\}[^{}]*\}\}/g);
  if (malformed) {
    errors.push(`Malformed template syntax: ${malformed.join(', ')}`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create template engine instance with custom filters
 */
export function createTemplateEngine(customFilters = {}) {
  const filters = { ...TEMPLATE_FILTERS, ...customFilters };
  
  return {
    render: renderTemplate,
    renderEmail: renderEmailTemplate,
    extractVariables,
    validate: validateTemplate,
    filters,
    addFilter: (name, fn) => { filters[name] = fn; }
  };
}

/**
 * Default template engine instance
 */
export const templateEngine = createTemplateEngine();

export default {
  TEMPLATE_FILTERS,
  applyFilter,
  getNestedValue,
  replaceVariables,
  processConditionals,
  processLoops,
  renderTemplate,
  renderEmailTemplate,
  extractVariables,
  validateTemplate,
  createTemplateEngine,
  templateEngine
};