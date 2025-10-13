/**
 * Design System Colors
 * HSL values for better color manipulation
 */

export const colors = {
  // Primary colors
  primary: {
    50: 'hsl(214, 100%, 97%)',
    100: 'hsl(214, 95%, 93%)',
    200: 'hsl(213, 97%, 87%)',
    300: 'hsl(212, 96%, 78%)',
    400: 'hsl(213, 94%, 68%)',
    500: 'hsl(217, 91%, 60%)', // Main primary
    600: 'hsl(221, 83%, 53%)',
    700: 'hsl(224, 76%, 48%)',
    800: 'hsl(226, 71%, 40%)',
    900: 'hsl(224, 64%, 33%)',
    950: 'hsl(226, 55%, 21%)',
  },

  // Gray scale (slate)
  gray: {
    50: 'hsl(210, 40%, 98%)',
    100: 'hsl(210, 40%, 96%)',
    200: 'hsl(214, 32%, 91%)',
    300: 'hsl(213, 27%, 84%)',
    400: 'hsl(215, 20%, 65%)',
    500: 'hsl(215, 16%, 47%)',
    600: 'hsl(215, 19%, 35%)',
    700: 'hsl(215, 25%, 27%)',
    800: 'hsl(217, 33%, 17%)',
    900: 'hsl(222, 84%, 5%)',
    950: 'hsl(229, 84%, 5%)',
  },

  // Semantic colors
  success: {
    light: 'hsl(142, 76%, 36%)',
    DEFAULT: 'hsl(142, 71%, 45%)',
    dark: 'hsl(142, 76%, 36%)',
  },

  warning: {
    light: 'hsl(48, 96%, 53%)',
    DEFAULT: 'hsl(45, 93%, 47%)',
    dark: 'hsl(43, 96%, 56%)',
  },

  error: {
    light: 'hsl(0, 84%, 60%)',
    DEFAULT: 'hsl(0, 72%, 51%)',
    dark: 'hsl(0, 63%, 31%)',
  },

  // Special colors
  orange: {
    500: 'hsl(25, 95%, 53%)',
    600: 'hsl(21, 90%, 48%)',
    700: 'hsl(17, 88%, 40%)',
  },
} as const;

/**
 * Dark theme color mappings
 */
export const darkTheme = {
  background: colors.gray[900],
  foreground: colors.gray[50],
  card: colors.gray[900],
  'card-foreground': colors.gray[50],
  popover: colors.gray[900],
  'popover-foreground': colors.gray[50],
  primary: colors.primary[500],
  'primary-foreground': colors.gray[900],
  secondary: colors.gray[800],
  'secondary-foreground': colors.gray[50],
  muted: colors.gray[800],
  'muted-foreground': colors.gray[400],
  accent: colors.gray[800],
  'accent-foreground': colors.gray[50],
  destructive: colors.error.DEFAULT,
  'destructive-foreground': colors.gray[50],
  border: colors.gray[800],
  input: colors.gray[800],
  ring: colors.primary[300],
} as const;

/**
 * Light theme color mappings
 */
export const lightTheme = {
  background: colors.gray[50],
  foreground: colors.gray[900],
  card: colors.gray[50],
  'card-foreground': colors.gray[900],
  popover: colors.gray[50],
  'popover-foreground': colors.gray[900],
  primary: colors.primary[500],
  'primary-foreground': colors.gray[50],
  secondary: colors.gray[100],
  'secondary-foreground': colors.gray[900],
  muted: colors.gray[100],
  'muted-foreground': colors.gray[500],
  accent: colors.gray[100],
  'accent-foreground': colors.gray[900],
  destructive: colors.error.DEFAULT,
  'destructive-foreground': colors.gray[50],
  border: colors.gray[200],
  input: colors.gray[200],
  ring: colors.primary[950],
} as const;

export type ColorPalette = typeof colors;
export type ThemeColors = typeof darkTheme | typeof lightTheme;