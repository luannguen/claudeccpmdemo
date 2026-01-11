/**
 * Live Edit Configuration
 * 
 * Centralized config for Live Edit System V3
 */

// Available fonts for rich text editing
export const AVAILABLE_FONTS = [
  { label: 'Hệ thống', value: 'inherit', family: 'inherit' },
  { label: 'Sans Serif', value: 'system-ui', family: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'serif', family: 'Georgia, Cambria, "Times New Roman", Times, serif' },
  { label: 'Mono', value: 'mono', family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' },
  { label: 'Playfair', value: 'playfair', family: '"Playfair Display", Georgia, serif' },
  { label: 'Roboto', value: 'roboto', family: '"Roboto", "Helvetica Neue", Arial, sans-serif' },
  { label: 'Open Sans', value: 'opensans', family: '"Open Sans", "Helvetica Neue", Arial, sans-serif' },
  { label: 'Lato', value: 'lato', family: '"Lato", "Helvetica Neue", Arial, sans-serif' },
  { label: 'Montserrat', value: 'montserrat', family: '"Montserrat", "Helvetica Neue", Arial, sans-serif' },
];

// Preset colors for color picker
export const PRESET_COLORS = [
  '#0F0F0F', '#374151', '#6B7280', '#9CA3AF', '#FFFFFF',
  '#7CB342', '#558B2F', '#33691E',
  '#FF9800', '#F57C00', '#E65100',
  '#2196F3', '#1976D2', '#0D47A1',
  '#E91E63', '#C2185B', '#880E4F',
  '#9C27B0', '#7B1FA2', '#4A148C',
];

// Font sizes
export const FONT_SIZES = [
  { label: 'XS', value: '0.75rem' },
  { label: 'S', value: '0.875rem' },
  { label: 'M', value: '1rem' },
  { label: 'L', value: '1.125rem' },
  { label: 'XL', value: '1.25rem' },
  { label: '2XL', value: '1.5rem' },
  { label: '3XL', value: '1.875rem' },
  { label: '4XL', value: '2.25rem' },
  { label: '5XL', value: '3rem' },
];

// Toolbar position config
export const TOOLBAR_POSITION = {
  // Main toolbar position - left bottom to avoid chatbot
  main: { bottom: 24, left: 24 },
  // Hover zone for activation
  hoverZone: { bottom: 0, left: 0, width: 96, height: 96 }
};

// CSS classes for edit mode
export const EDIT_MODE_CLASSES = {
  active: 'live-edit-mode-active',
  ready: 'live-edit-mode-ready',
  editable: 'live-edit-editable',
  editing: 'live-edit-editing'
};