// Re-export all design tokens
export * from './colors.js';
export * from './spacing.js';
export * from './typography.js';
export * from './css-variables.js';

// Main design system object
export { colors, darkTheme, lightTheme } from './colors.js';
export { spacing, borderRadius, componentSpacing } from './spacing.js';
export { fontFamily, fontSize, fontWeight, typography } from './typography.js';
export { generateCSSVariables, generateAllCSSVariables, cssVar } from './css-variables.js';

/**
 * Complete design system tokens
 */
export const designSystem = {
  colors: {
    palette: () => import('./colors.js').then(m => m.colors),
    dark: () => import('./colors.js').then(m => m.darkTheme),
    light: () => import('./colors.js').then(m => m.lightTheme),
  },
  spacing: () => import('./spacing.js').then(m => m.spacing),
  typography: () => import('./typography.js').then(m => m.typography),
  utils: {
    cssVar: () => import('./css-variables.js').then(m => m.cssVar),
    generateCSS: () => import('./css-variables.js').then(m => m.generateCSSVariables),
  },
} as const;