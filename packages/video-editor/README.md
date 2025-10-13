# Video Editor MVP

A basic video editor with video trimming capabilities built with React and TypeScript.

## Features

- Upload video files
- Video playback controls
- Timeline scrubbing
- Video trimming (set start/end points)
- Multiple segment cuts
- Basic export functionality (MVP: exports screenshot)

## Development

```bash
pnpm dev
```

Runs on port 5005.

## Technology Stack

- React 19 + TypeScript
- Vite for bundling
- TailwindCSS for styling
- Module Federation for micro-frontend architecture
- Canvas API for video frame extraction

## Future Enhancements

- FFmpeg.wasm integration for real video cutting
- Web Workers for background processing
- Real-time video effects
- Audio track support
- Professional timeline interface