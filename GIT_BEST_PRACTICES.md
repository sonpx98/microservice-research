# Git Best Practices - What NOT to Commit

## ❌ NEVER Commit These:

### Build Outputs:
```
.next/              # Next.js build cache & output
.contentlayer/      # Contentlayer generated files
dist/               # Compiled output
build/              # Build directory
out/                # Next.js static export
*.tsbuildinfo       # TypeScript build info
```

**Why?**
- ❌ Large files (100MB+)
- ❌ Generated from source code
- ❌ Different for each developer
- ❌ Different for each environment
- ❌ Cause merge conflicts

### Dependencies:
```
node_modules/       # NPM/pnpm packages
.pnp/              # Yarn PnP
.pnp.js            # Yarn PnP loader
```

**Why?**
- ❌ Huge (500MB+ easily)
- ❌ Platform-specific binaries
- ❌ Lockfile already tracks versions

### Caches:
```
.turbo/            # Turborepo cache
.vercel/           # Vercel deployment cache
.cache/            # Various build caches
```

**Why?**
- ❌ Only useful locally
- ❌ Can be regenerated
- ❌ Wastes repo space

### Environment & Secrets:
```
.env               # Environment variables
.env.local         # Local overrides
.env.*.local       # Environment-specific
```

**Why?**
- ❌ Contains secrets (API keys, passwords)
- ❌ Different per environment
- ❌ Security risk!

### OS & Editor Files:
```
.DS_Store          # macOS folder metadata
Thumbs.db          # Windows thumbnail cache
.vscode/           # VS Code settings (sometimes)
.idea/             # IntelliJ IDEA settings
```

**Why?**
- ❌ Not part of project
- ❌ Personal preferences
- ❌ Different for each developer

---

## ✅ What TO Commit:

### Source Code:
```
src/               # Your code
public/            # Static assets
content/           # Blog posts (markdown)
```

### Configuration:
```
package.json       # Dependencies list
pnpm-lock.yaml     # Lockfile (ensures same versions)
tsconfig.json      # TypeScript config
next.config.mjs    # Next.js config
tailwind.config.js # Tailwind config
```

### Documentation:
```
README.md          # Project docs
*.md               # Markdown docs
```

---

## 🔧 Current Setup:

### Root `.gitignore`:
```gitignore
# node_modules everywhere
**/node_modules/

# Build outputs
**/dist
**/build
**/.next
**/.contentlayer
**/.vercel
**/.turbo

# Next.js
.next/
out/

# Contentlayer
.contentlayer/

# Vercel
.vercel/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
```

### Package-specific `.gitignore`:

**packages/blog-shell/.gitignore:**
```gitignore
.next/
.contentlayer/
*.tsbuildinfo
```

**packages/keystatic-admin/.gitignore:**
```gitignore
.next/
out/
*.tsbuildinfo
.vercel/
.turbo/
.env*.local
```

---

## 🧪 How to Verify:

### Check if files are ignored:
```bash
# Test specific files
git check-ignore -v packages/blog-shell/.next
git check-ignore -v packages/keystatic-admin/.next

# See all ignored files in directory
git status --ignored
```

### Check if accidentally committed:
```bash
# Find tracked build files
git ls-files | grep -E "(\.next|\.contentlayer|node_modules)"

# If found, remove from git:
git rm -r --cached packages/*/.next
git rm -r --cached packages/*/.contentlayer
```

### Check repo size:
```bash
# See largest files in repo
git rev-list --objects --all | \
  git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | \
  awk '/^blob/ {print substr($0,6)}' | \
  sort -n -k2 | \
  tail -20
```

---

## 🚨 If You Already Committed Build Files:

### Option 1: Remove from last commit:
```bash
git rm -r --cached packages/*/.next
git rm -r --cached packages/*/.contentlayer
git commit --amend --no-edit
git push --force
```

### Option 2: Remove from entire history (⚠️ dangerous):
```bash
# Use BFG Repo Cleaner
bfg --delete-folders .next
bfg --delete-folders .contentlayer

# Or git-filter-repo
git filter-repo --path-glob '**/.next' --invert-paths
git filter-repo --path-glob '**/.contentlayer' --invert-paths
```

**⚠️ Warning:** This rewrites history! Only do if necessary and coordinate with team.

---

## 📊 Typical Repo Sizes:

### Good (without build files):
```
Source code:        5-20 MB
node_modules:       500 MB (not committed)
.next:              100-200 MB (not committed)
.contentlayer:      1-5 MB (not committed)
Total git repo:     5-20 MB ✅
```

### Bad (with build files):
```
Source code:        5-20 MB
.next committed:    100-200 MB ❌
.contentlayer:      1-5 MB ❌
Every commit:       +100 MB ❌
After 10 commits:   1 GB+ ❌
```

---

## 🎯 Quick Checklist Before Commit:

```bash
# 1. Check what you're committing
git status

# 2. Should NOT see:
❌ .next/
❌ .contentlayer/
❌ node_modules/
❌ dist/
❌ .env

# 3. Should see:
✅ src/
✅ public/
✅ content/
✅ package.json
✅ *.config.js
✅ *.md

# 4. If you see ❌ files:
git reset
# Add to .gitignore
# Then commit again
```

---

## 💡 Pro Tips:

### 1. Use `.gitignore` templates:
```bash
# Get official Next.js .gitignore
curl -o .gitignore https://raw.githubusercontent.com/github/gitignore/main/Node.gitignore
```

### 2. Check before push:
```bash
# See what will be pushed
git diff origin/main --stat

# If huge diff:
git diff origin/main --name-only | grep -E "(\.next|\.contentlayer)"
```

### 3. Clean before commit:
```bash
# Remove all build artifacts
pnpm clean  # If you have clean script
rm -rf packages/*/.next
rm -rf packages/*/.contentlayer
```

---

## 🎉 Summary:

**Simple rule:** Only commit **source code** and **configuration**. Never commit **generated files** or **dependencies**.

**When in doubt:** If it can be regenerated from source code, don't commit it!

**Current status:** 
✅ Root `.gitignore` configured
✅ Package-level `.gitignore` added
✅ Build folders ignored
✅ Ready to commit safely!
