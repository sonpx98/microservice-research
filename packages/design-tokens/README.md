# Design Tokens

Shared design system tokens for the micro-frontend portfolio project.

## Features

- 🎨 **Color System**: Semantic color palette with light/dark themes
- 📏 **Spacing**: Consistent spacing scale based on 4px grid
- 📝 **Typography**: Font families, sizes, weights, and presets
- 🔧 **CSS Variables**: Generate CSS custom properties with prefixes
- 🎯 **TypeScript**: Fully typed for better DX

## Installation

```bash
pnpm add @microservice-research/design-tokens
```

## Usage

### Import Design Tokens

```typescript
import { colors, spacing, typography } from '@microservice-research/design-tokens';

// Use colors
const primaryColor = colors.primary[500]; // 'hsl(217, 91%, 60%)'

// Use spacing
const cardPadding = spacing[6]; // '1.5rem'

// Use typography
const buttonFont = typography.button.fontSize; // '0.875rem'
```

### Generate CSS Variables

```typescript
import { generateCSSVariables, darkTheme } from '@microservice-research/design-tokens';

// Generate CSS variables
const css = generateCSSVariables(darkTheme, true);

// Or generate with prefix
import { generatePrefixedCSSVariables } from '@microservice-research/design-tokens';
const prefixedCSS = generatePrefixedCSSVariables(darkTheme, 'videoeditor', true);
```

### Use in Components

```tsx
import { cssVar } from '@microservice-research/design-tokens';

const Button = ({ children }) => (
  <button
    style={{
      backgroundColor: cssVar('primary'),
      color: cssVar('primary-foreground'),
      padding: `${cssVar('spacing-2')} ${cssVar('spacing-4')}`,
    }}
  >
    {children}
  </button>
);
```

## Micro-Frontend Integration

Each micro-frontend can use design tokens while maintaining independence:

### 1. Install in each package
```bash
cd packages/video-editor
pnpm add @microservice-research/design-tokens
```

### 2. Generate CSS with prefix
```typescript
// In each micro-frontend's build process
import { generatePrefixedCSSVariables, darkTheme } from '@microservice-research/design-tokens';

const css = generatePrefixedCSSVariables(darkTheme, 'videoeditor', true);
// Outputs: --videoeditor-primary: hsl(217, 91%, 60%);
```

### 3. Use prefixed variables
```css
.videoeditor\:button {
  background-color: var(--videoeditor-primary);
  color: var(--videoeditor-primary-foreground);
}
```

## Benefits

- ✅ **Design Consistency**: Shared tokens ensure visual consistency
- ✅ **Independence**: No runtime coupling between micro-frontends  
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Flexibility**: Use tokens à la carte
- ✅ **Build-time**: Tokens resolved at build time, not runtime