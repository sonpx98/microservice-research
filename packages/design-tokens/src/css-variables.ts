import { darkTheme, lightTheme, type ThemeColors } from './colors.js';

/**
 * Generate CSS custom properties for a given theme
 */
export function generateCSSVariables(theme: ThemeColors, isDark = true) {
  const cssVars = Object.entries(theme)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join('\n');

  return `/* ${isDark ? 'Dark' : 'Light'} theme CSS variables */
:root {
${cssVars}
  --radius: 0.5rem;
}`;
}

/**
 * Generate CSS variables for both themes
 */
export function generateAllCSSVariables() {
  const lightCSS = generateCSSVariables(lightTheme, false);
  const darkCSS = generateCSSVariables(darkTheme, true);

  return `${lightCSS}

/* Dark theme overrides */
[data-theme="dark"], .dark {
${Object.entries(darkTheme)
  .map(([key, value]) => `  --${key}: ${value};`)
  .join('\n')}
}`;
}

/**
 * Generate CSS variables with custom prefix
 */
export function generatePrefixedCSSVariables(
  theme: ThemeColors, 
  prefix: string,
  isDark = true
) {
  const cssVars = Object.entries(theme)
    .map(([key, value]) => `  --${prefix}-${key}: ${value};`)
    .join('\n');

  return `/* ${isDark ? 'Dark' : 'Light'} theme CSS variables with ${prefix} prefix */
:root {
${cssVars}
  --${prefix}-radius: 0.5rem;
}`;
}

/**
 * CSS variables as JavaScript object for runtime usage
 */
export const cssVariables = {
  light: Object.fromEntries(
    Object.entries(lightTheme).map(([key, value]) => [`--${key}`, value])
  ),
  dark: Object.fromEntries(
    Object.entries(darkTheme).map(([key, value]) => [`--${key}`, value])
  ),
} as const;

/**
 * Utility to create CSS variable references
 */
export function cssVar(name: string, fallback?: string) {
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
}

/**
 * Utility to create prefixed CSS variable references
 */
export function prefixedCssVar(prefix: string, name: string, fallback?: string) {
  return fallback ? `var(--${prefix}-${name}, ${fallback})` : `var(--${prefix}-${name})`;
}