# Portfolio Home

Portfolio landing page micro-frontend showcasing projects with interactive previews.

## Features

- **Interactive Project Cards**: Click on project cards to see live micro-frontend previews
- **Hero Section**: Introduction with gradient design
- **Skills Overview**: Cards showing technical skills and expertise areas
- **Project Showcase**: Preview of featured projects across other micro-frontends
- **Contact Section**: Call-to-action for getting in touch
- **Graceful Fallbacks**: Shows helpful messages when remote services are unavailable

## Tech Stack

- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS v4 for styling
- Lucide React for icons
- Module Federation for micro-frontend architecture

## Development

### Start Portfolio Home Only
```bash
# Install dependencies
pnpm install

# Start development server
pnpm start
```

### Start with Remote Previews
To see interactive project previews, you need to start all micro-frontends:

```bash
# From project root
pnpm start:all
```

This starts:
- Shell (host): http://localhost:5000
- Flash Card App: http://localhost:5001
- CV Generator: http://localhost:5002
- Tarot Reader: http://localhost:5003
- Portfolio Home: http://localhost:5004

### Production Build
```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Port Configuration

- Development: http://localhost:5004
- Preview: http://localhost:5004

## Architecture

This package consumes other micro-frontends as remote modules:
- `cv-generator/app`: Resume/CV builder
- `tarot/app`: Digital tarot reading experience
- `snake-game/app`: Classic snake game
- `video-editor/app`: Web-based video editing tool

When remotes are unavailable (not running), graceful fallback components are shown with instructions.

This micro-frontend is consumed by the shell application and integrated into the main portfolio navigation.