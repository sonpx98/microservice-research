# Contentlayer Cache Optimization

## 📊 Performance Improvement

This optimization reduces build time by caching file hashes and only re-parsing changed markdown files.

### Results

| Scenario | Cached Files | Parsed Files | Improvement |
|----------|--------------|--------------|-------------|
| Initial build | 0 | 9 | Baseline |
| Rebuild (no changes) | 9 | 0 | ⚡ **100% cached** |
| 1 file changed | 8 | 1 | ⚡ **89% cached** |

## 🔧 How It Works

1. **Hash Generation**: Each markdown file gets an MD5 hash
2. **Cache Storage**: Hashes stored in `.contentlayer/.file-cache.json`
3. **Comparison**: On next build, compare current hash vs cached hash
4. **Selective Parse**: Only parse files with changed hashes

## 📁 Files Modified

- `contentlayer.config.ts` - Added hash caching logic
- `.gitignore` - Include cache file in git

## 🚀 Usage

```bash
# Normal build - cache is automatically used
pnpm build

# Or run contentlayer directly
pnpm contentlayer2 build
```

## 📈 Expected Gains

As your blog grows:

| Posts Count | Time Saved (estimate) |
|-------------|----------------------|
| 10 posts | ~20-30% |
| 50 posts | ~50-70% |
| 100+ posts | ~70-85% |

## 🔍 Monitoring

Build output shows cache stats:

```
📊 Cache Stats:
   ✅ Cached files: 8
   🔄 Parsed files: 1
   📁 Total files: 9
   💾 Cache saved to: .contentlayer/.file-cache.json
```

## ⚙️ Configuration

Cache file location: `.contentlayer/.file-cache.json`

This file is:
- ✅ Committed to git
- ✅ Shared across team members
- ✅ Used by Vercel deployments

## 🐛 Troubleshooting

If cache seems wrong, delete and rebuild:

```bash
rm .contentlayer/.file-cache.json
pnpm contentlayer2 build
```

## 🎯 Future Improvements

Potential enhancements:
- Content-based chunking for large files
- Parallel parsing for changed files
- Integration with git diff for smarter detection
