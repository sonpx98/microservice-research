# Video Editor - Local FFmpeg Setup

This micro-frontend uses FFmpeg.wasm for video processing with local assets instead of CDN.

## Setup

The FFmpeg core files are automatically copied to `public/ffmpeg/` when you run:

```bash
pnpm install
```

Or manually run:

```bash
pnpm run setup-ffmpeg
```

## Local Assets

The following files are served locally:
- `public/ffmpeg/ffmpeg-core.js` - FFmpeg core JavaScript
- `public/ffmpeg/ffmpeg-core.wasm` - FFmpeg WebAssembly binary

## Browser Requirements

FFmpeg.wasm requires:
- Cross-Origin isolation (COOP/COEP headers)
- SharedArrayBuffer support
- Modern browser with WebAssembly support

## Security Benefits

Using local assets instead of CDN:
- ✅ No external dependencies during runtime
- ✅ No CSP issues with script-src
- ✅ No CORS issues with external domains
- ✅ Faster loading (no network requests)
- ✅ Works in micro-frontend architecture
- ✅ No CDN availability issues

## Development vs Production

- **Development**: Local assets + fallback to node_modules
- **Production**: Local assets only

## Troubleshooting

If FFmpeg fails to load:

1. Check browser console for errors
2. Verify COOP/COEP headers are set
3. Ensure SharedArrayBuffer is available
4. Run `pnpm run setup-ffmpeg` to refresh assets