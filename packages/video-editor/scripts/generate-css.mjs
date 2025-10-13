import { generatePrefixedCSSVariables, darkTheme, spacing } from '@microservice-research/design-tokens';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Generate CSS variables for video-editor
const themeCSS = generatePrefixedCSSVariables(darkTheme, 'videoeditor', true);

// Add spacing variables
const spacingVars = Object.entries(spacing)
  .map(([key, value]) => `  --videoeditor-spacing-${key}: ${value};`)
  .join('\n');

const fullCSS = `@import "tailwindcss" prefix(videoeditor);

/* Design tokens from @microservice-research/design-tokens */
:root {
${Object.entries(darkTheme)
  .map(([key, value]) => `  --videoeditor-${key}: ${value};`)
  .join('\n')}
  --videoeditor-radius: 0.5rem;
  
  /* Spacing tokens */
${spacingVars}
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

#root {
  height: 100vh;
  width: 100vw;
}`;

// Write to index.css
const outputPath = join(process.cwd(), 'src', 'index.css');
writeFileSync(outputPath, fullCSS, 'utf8');

console.log('✅ Generated CSS variables from design tokens');
console.log(`📁 Output: ${outputPath}`);
console.log(`🎨 Generated ${Object.keys(darkTheme).length} color variables`);
console.log(`📏 Generated ${Object.keys(spacing).length} spacing variables`);