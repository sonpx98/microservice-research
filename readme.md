# Module Federation Portfolio

A micro-frontend portfolio showcasing interactive project previews using Module Federation.

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
pnpm start:full
```

### Option 2: Manual Setup
```bash
# 1. Build remote micro-frontends
pnpm build:remotes

# 2. Start remotes in preview mode (in background)
pnpm preview:remotes

# 3. Start portfolio-home (in new terminal)
pnpm start:portfolio
```

## 📍 Services

When running, you'll have access to:

- **Portfolio Home**: http://localhost:5005 (main entry point with interactive previews)
- **Flash Card App**: http://localhost:5001 (remote micro-frontend)
- **CV Generator**: http://localhost:5002 (remote micro-frontend)  
- **Tarot Reader**: http://localhost:5003 (remote micro-frontend)

## 🏗️ Architecture

- **Portfolio Home** (`packages/portfolio-home`): Main landing page that consumes other micro-frontends
- **Remote Apps**: Independent applications that expose themselves via Module Federation
  - `cv-generator`: Resume/CV builder
  - `flash-card-fav`: Interactive flashcard app
  - `tarot`: Digital tarot reading experience

## 🔧 Development Scripts

- `pnpm start:full` - Complete automated startup
- `pnpm build:remotes` - Build only remote apps
- `pnpm preview:remotes` - Serve built remotes (generates remoteEntry.js)
- `pnpm start:portfolio` - Start portfolio-home in dev mode
- `pnpm start:dev` - Start all apps in dev mode (no Module Federation)

## ⚡ Module Federation Workflow

1. **Remote apps must be built first** to generate `remoteEntry.js` files
2. **Remotes run in preview mode** to serve the federation assets
3. **Portfolio-home runs in dev mode** to consume the remotes dynamically

## 🎯 Interactive Features

- **Project Cards**: Click on any project card to see live previews
- **Dynamic Loading**: Micro-frontends load on-demand when selected
- **Graceful Fallbacks**: Helpful messages when remotes are unavailable

## 🛠️ Tech Stack

- **Build System**: Vite + Lerna + pnpm workspaces
- **Module Federation**: `@originjs/vite-plugin-federation`
- **Frontend**: React 19 + TypeScript + TailwindCSS v4
- **Icons**: Lucide React

## 📝 Notes

- Module Federation requires remotes to be **built and served** (not just in dev mode)
- The `start:full` script automates the correct startup sequence
- Each micro-frontend can also run independently during development
