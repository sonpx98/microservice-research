---
slug: micro-frontend-part-3-monorepo-setup
title: "Micro-Frontends Series: Part 3 - Monorepo Setup with Lerna & PNPM"
date: 2025-11-17
excerpt: >-
  Learn how to set up a professional monorepo for micro-frontends using Lerna and PNPM workspaces. Master package management, dependency sharing, and efficient development workflows.
tags:
  - micro-frontend
  - monorepo
  - lerna
  - pnpm
  - series
published: true
locale: en
---

In [Part 2](/en/blog/micro-frontend-part-2-module-federation), we learned how Module Federation enables runtime code sharing. Now let's build the foundation - a well-organized **monorepo** that makes developing multiple micro-frontends a breeze!

## 🎯 Why Monorepo for Micro-Frontends?

When building micro-frontends, you have two main options:

### Option 1: Multi-Repo (Separate Repositories)

```
GitHub Repos:
├── cv-generator/          (Separate repo)
├── tarot/                 (Separate repo)
├── video-editor/          (Separate repo)
└── portfolio-home/        (Separate repo)
```

**Pros:**
- ✅ Complete independence
- ✅ Different access controls per repo
- ✅ Truly isolated

**Cons:**
- ❌ Hard to share code
- ❌ Version management nightmare
- ❌ Difficult to test integration
- ❌ More CI/CD complexity

### Option 2: Monorepo (Single Repository)

```
microservice-research/
└── packages/
    ├── cv-generator/
    ├── tarot/
    ├── video-editor/
    ├── portfolio-home/
    ├── design-tokens/    (Shared package)
    └── shared/           (Shared utilities)
```

**Pros:**
- ✅ Easy code sharing
- ✅ Atomic commits across projects
- ✅ Simplified dependency management
- ✅ Better developer experience

**Cons:**
- ❌ Single access control (can be solved with CODEOWNERS)
- ❌ Larger repository size

**For micro-frontends, monorepo is usually the better choice!**

## 🏗️ Monorepo Tools Comparison

| Tool | Best For | Learning Curve | Speed |
|------|----------|----------------|-------|
| **Lerna** | Simple setups, npm/pnpm | Easy | Good |
| **Nx** | Large teams, advanced features | Steep | Excellent |
| **Turborepo** | Speed-focused, caching | Medium | Excellent |
| **Rush** | Large enterprises | Steep | Good |

**We'll use Lerna + PNPM** for simplicity and efficiency!

## 📦 Project Structure

Here's our target structure:

```
microservice-research/
├── packages/
│   ├── portfolio-home/        # Shell/Host (Port 5004)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── cv-generator/          # Remote (Port 5002)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── tarot/                 # Remote (Port 5003)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── video-editor/          # Remote (Port 5005)
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── design-tokens/         # Shared design system
│   │   ├── src/
│   │   └── package.json
│   └── shared/                # Shared utilities
│       ├── babel-plugins/
│       └── csp-config.ts
├── lerna.json                 # Lerna configuration
├── pnpm-workspace.yaml        # PNPM workspaces
├── package.json               # Root package.json
└── .gitignore
```

## 🚀 Step-by-Step Setup

### Step 1: Initialize Root Project

```bash
# Create project directory
mkdir microservice-research
cd microservice-research

# Initialize git
git init

# Initialize root package.json
npm init -y
```

### Step 2: Configure PNPM Workspaces

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - 'packages/*'
```

This tells PNPM to treat all folders in `packages/` as workspace packages.

### Step 3: Install Lerna

```bash
# Install Lerna
pnpm add -D lerna

# Initialize Lerna
npx lerna init
```

### Step 4: Configure Lerna

Edit `lerna.json`:

```json
{
  "version": "1.0.0",
  "npmClient": "pnpm",
  "useWorkspaces": true,
  "packages": [
    "packages/*"
  ]
}
```

**Key settings:**
- `npmClient: "pnpm"` - Use PNPM instead of npm
- `useWorkspaces: true` - Use PNPM workspaces
- `packages: ["packages/*"]` - Location of packages

### Step 5: Root Package.json

```json
{
  "name": "microservice-research",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "lerna run dev --parallel",
    "build": "lerna run build",
    "build:remotes": "lerna run build --scope '@microservice-research/{cv-generator,tarot,video-editor}'",
    "clean": "lerna clean -y && rm -rf node_modules",
    "bootstrap": "lerna bootstrap",
    "start:dev": "lerna run dev --parallel --scope '@microservice-research/{cv-generator,tarot,video-editor,portfolio-home}'"
  },
  "devDependencies": {
    "lerna": "^8.0.0"
  }
}
```

## 📂 Creating Packages

### Step 6: Create Package Structure

```bash
# Create packages directory
mkdir -p packages

# Create individual packages
cd packages
mkdir cv-generator tarot video-editor portfolio-home design-tokens shared
```

### Step 7: Package Naming Convention

Each package should have a scoped name:

```json
// packages/cv-generator/package.json
{
  "name": "@microservice-research/cv-generator",
  "version": "1.0.0",
  "private": true
}
```

**Benefits:**
- Avoids npm naming conflicts
- Clear package ownership
- Better organization

## 🔗 Dependency Management

### Three Types of Dependencies

1. **External Dependencies** (npm packages)
   ```bash
   # Install in specific package
   cd packages/cv-generator
   pnpm add react react-dom
   ```

2. **Internal Dependencies** (other workspace packages)
   ```json
   {
     "dependencies": {
       "@microservice-research/design-tokens": "workspace:*"
     }
   }
   ```

3. **Root Dependencies** (shared across all)
   ```bash
   # Install at root
   pnpm add -D -w typescript
   ```

### Shared Dependencies Configuration

For Module Federation, some packages should be shared:

```typescript
// vite.config.ts
federation({
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^19.0.0'
    },
    'react-dom': {
      singleton: true,
      requiredVersion: '^19.0.0'
    }
  }
})
```

## 🛠️ Development Workflows

### Running All Packages in Parallel

```bash
# Start all micro-frontends + shell
pnpm start:dev

# This runs:
# cv-generator on port 5002
# tarot on port 5003
# video-editor on port 5005
# portfolio-home on port 5004
```

### Running Individual Packages

```bash
# Run single package
cd packages/cv-generator
pnpm dev

# Or from root
pnpm --filter @microservice-research/cv-generator dev
```

### Building Packages

```bash
# Build all packages
pnpm build

# Build only remotes (exclude shell)
pnpm build:remotes

# Build specific package
pnpm --filter @microservice-research/cv-generator build
```

## 📋 Useful Lerna Commands

### Listing Packages

```bash
# List all packages
npx lerna list

# List with details
npx lerna list --long
```

### Running Commands

```bash
# Run script in all packages
npx lerna run test

# Run in parallel (faster)
npx lerna run build --parallel

# Run in specific scope
npx lerna run build --scope '@microservice-research/cv-*'
```

### Version Management

```bash
# Bump versions
npx lerna version

# Create git tags
npx lerna version --create-release github
```

### Cleaning

```bash
# Clean node_modules in all packages
npx lerna clean

# Clean and reinstall
pnpm run clean && pnpm install
```

## 🔧 PNPM Workspace Features

### Workspace Protocol

Link internal packages:

```json
{
  "dependencies": {
    "@microservice-research/design-tokens": "workspace:*"
  }
}
```

**`workspace:*`** means:
- Use the local version
- Create a symlink
- No version conflicts

### Filter Commands

```bash
# Run in specific package
pnpm --filter cv-generator dev

# Run in packages matching pattern
pnpm --filter "*generator" build

# Run in package and its dependencies
pnpm --filter cv-generator... build
```

### Shared Node Modules

PNPM uses a content-addressable store:

```
node_modules/
└── .pnpm/
    ├── react@19.0.0/
    ├── react-dom@19.0.0/
    └── ...

packages/cv-generator/node_modules/
└── react → ../../node_modules/.pnpm/react@19.0.0
```

**Benefits:**
- No duplicate packages
- Fast installs
- Strict dependency resolution

## 📝 Real-World Example: Our Portfolio Project

### Root Scripts

```json
{
  "scripts": {
    "dev": "lerna run dev --parallel",
    "build": "lerna run build",
    "build:remotes": "lerna run build --scope '@microservice-research/{cv-generator,tarot,video-editor}'",
    "start:dev": "lerna run dev --parallel --scope '@microservice-research/{cv-generator,tarot,video-editor,portfolio-home}'",
    "clean": "lerna clean -y && rm -rf node_modules",
    "type-check": "lerna run type-check --parallel"
  }
}
```

### Package Scripts (CV Generator)

```json
{
  "scripts": {
    "dev": "vite --port 5002",
    "build": "vite build",
    "preview": "vite preview --port 5002",
    "type-check": "tsc --noEmit"
  }
}
```

### Dependency Flow

```
portfolio-home (Shell)
├── Depends on remotes at runtime (Module Federation)
└── Shares: react, react-dom, react-router-dom

cv-generator (Remote)
├── Depends on: @microservice-research/design-tokens
└── Shares: react, react-dom

design-tokens (Shared)
└── No dependencies (pure CSS variables)
```

## 🎯 Best Practices

### 1. **Package Naming**

```bash
# ✅ Good - Scoped names
@microservice-research/cv-generator
@microservice-research/design-tokens

# ❌ Bad - Generic names
cv-generator
design-tokens
```

### 2. **Dependency Management**

```bash
# ✅ Good - Install where needed
cd packages/cv-generator
pnpm add lodash

# ❌ Bad - Install everything at root
pnpm add -w lodash
```

### 3. **Version Synchronization**

Keep shared dependencies in sync:

```json
// All packages use same React version
"react": "^19.0.0"
"react-dom": "^19.0.0"
```

### 4. **Build Order**

Build shared packages first:

```bash
# Build design-tokens first
pnpm --filter design-tokens build

# Then build apps
pnpm --filter cv-generator build
```

### 5. **Use TypeScript Project References**

```json
// tsconfig.json
{
  "references": [
    { "path": "./packages/design-tokens" },
    { "path": "./packages/cv-generator" }
  ]
}
```

## 🚨 Common Pitfalls

### 1. **Version Mismatches**

```bash
# ❌ Problem: Different React versions
cv-generator: react@19.0.0
tarot: react@18.2.0

# ✅ Solution: Use workspace constraints
```

### 2. **Circular Dependencies**

```bash
# ❌ Bad
package-a depends on package-b
package-b depends on package-a

# ✅ Good: Extract shared code
package-a depends on shared
package-b depends on shared
```

### 3. **Hoisting Issues**

```bash
# If packages can't find dependencies
# Check PNPM hoisting settings

# .npmrc
shamefully-hoist=true
```

## 📊 Performance Benefits

Our monorepo setup results:

```
Without Monorepo:
- Clone 5 repos: ~2 minutes
- Install deps 5 times: ~10 minutes
- Build separately: ~5 minutes
Total: ~17 minutes

With Monorepo:
- Clone 1 repo: ~30 seconds
- Install deps once (PNPM): ~2 minutes
- Build with Lerna: ~3 minutes
Total: ~5.5 minutes

Time saved: 67% faster! 🚀
```

## 📝 Summary

Monorepo setup with Lerna + PNPM provides:

- ✅ **Easy code sharing** via workspace protocol
- ✅ **Efficient dependency management** with PNPM store
- ✅ **Simplified workflows** with Lerna commands
- ✅ **Better DX** - single clone, single install
- ✅ **Atomic commits** - change multiple packages together

**Key Concepts:**
- **Workspaces**: Logical grouping of packages
- **Lerna**: Task orchestration (build, test, publish)
- **PNPM**: Fast, disk-efficient package manager
- **Scoped names**: `@org/package-name` convention

## 🎓 Coming Up Next

In **Part 4: Building Independent Micro-Frontends**, we'll cover:
- Creating your first remote (CV Generator)
- Vite configuration for Module Federation
- Exposing components
- Running standalone vs embedded
- Port management strategies

## 💡 Try It Yourself

Create your own monorepo:

```bash
# 1. Initialize
mkdir my-micro-frontends && cd my-micro-frontends
npm init -y

# 2. Setup workspaces
echo "packages:\n  - 'packages/*'" > pnpm-workspace.yaml

# 3. Install Lerna
pnpm add -D lerna

# 4. Create packages
mkdir -p packages/{app-shell,remote-1,shared}

# 5. Start building!
```

---

**Previous:** [Part 2 - Module Federation Deep Dive](/en/blog/micro-frontend-part-2-module-federation)  
**Next:** [Part 4 - Building Independent Micro-Frontends](#) (Coming soon)

---

*This is Part 3 of the Micro-Frontends Series. Check out the [complete series outline](#) for all topics.*
