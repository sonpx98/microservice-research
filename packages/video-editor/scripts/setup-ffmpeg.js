#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '../node_modules/@ffmpeg/core/dist/umd');
const targetDir = path.join(__dirname, '../public/ffmpeg');

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Files to copy
const filesToCopy = [
  'ffmpeg-core.js',
  'ffmpeg-core.wasm'
];

filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✅ Copied ${file} to public/ffmpeg/`);
  } else {
    console.error(`❌ Source file not found: ${sourcePath}`);
  }
});

console.log('🎬 FFmpeg assets setup complete!');