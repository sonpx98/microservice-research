import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

class FFmpegService {
  private ffmpeg: FFmpeg | null = null;
  private isLoaded = false;

  // Helper method to validate URL availability
  private async validateURL(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (this.isLoaded) return;

    // Check browser compatibility first
    if (!crossOriginIsolated) {
      console.warn('Browser is not cross-origin isolated. FFmpeg.wasm requires COOP/COEP headers.');
    }

    if (typeof SharedArrayBuffer === 'undefined') {
      console.warn('SharedArrayBuffer not available. FFmpeg.wasm may not work properly.');
    }

    try {
      this.ffmpeg = new FFmpeg();
      
      // Try multiple CDN sources for FFmpeg core files  
      const cdnUrls = [
        // Working URLs with correct paths
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/umd', 
        'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd',
        // Alternative approach: try different distribution paths
        'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm',
        'https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm'
      ];

      let loadSuccess = false;
      let lastError: Error | null = null;

      for (const baseURL of cdnUrls) {
        try {
          console.log(`Trying to load FFmpeg from: ${baseURL}`);
          
          // Validate URLs first
          const coreJSURL = `${baseURL}/ffmpeg-core.js`;
          const wasmURL = `${baseURL}/ffmpeg-core.wasm`;
          
          console.log(`Checking availability of: ${coreJSURL}`);
          const coreAvailable = await this.validateURL(coreJSURL);
          
          if (!coreAvailable) {
            console.warn(`❌ Core JS not available at: ${coreJSURL}`);
            throw new Error('Core JS file not available');
          }
          
          console.log(`Checking availability of: ${wasmURL}`);
          const wasmAvailable = await this.validateURL(wasmURL);
          
          if (!wasmAvailable) {
            console.warn(`❌ WASM not available at: ${wasmURL}`);
            throw new Error('WASM file not available');
          }
          
          // Convert to blob URLs
          const coreURL = await toBlobURL(coreJSURL, 'text/javascript');
          const wasmBlobURL = await toBlobURL(wasmURL, 'application/wasm');
          
          // Add timeout for loading
          const loadPromise = this.ffmpeg.load({
            coreURL,
            wasmURL: wasmBlobURL,
          });

          // 20 second timeout
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Load timeout after 20s')), 20000)
          );

          await Promise.race([loadPromise, timeoutPromise]);
          
          loadSuccess = true;
          console.log(`✅ FFmpeg loaded successfully from: ${baseURL}`);
          break;
          
        } catch (error) {
          console.warn(`❌ Failed to load from ${baseURL}:`, error);
          lastError = error as Error;
          continue;
        }
      }

      if (!loadSuccess) {
        throw lastError || new Error('All CDN sources failed');
      }

      this.isLoaded = true;
      
    } catch (error) {
      console.error('FFmpeg initialization failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize FFmpeg: ${errorMessage}`);
    }
  }

  // Helper method to check if FFmpeg is ready
  isReady(): boolean {
    const ready = this.ffmpeg !== null && this.isLoaded;
    console.log('FFmpeg readiness check:', { 
      ffmpegExists: !!this.ffmpeg, 
      isLoaded: this.isLoaded, 
      ready 
    });
    return ready;
  }

  async cutVideo(
    inputFile: File, 
    segments: Array<{ start: number; end: number; id: string }>
  ): Promise<Blob[]> {
    console.log('cutVideo called with:', { segmentsCount: segments.length, fileName: inputFile.name });
    
    if (!this.isReady()) {
      throw new Error('FFmpeg not initialized - use isReady() to check status');
    }

    const results: Blob[] = [];

    // Write input file to FFmpeg file system
    await this.ffmpeg!.writeFile('input.mp4', await fetchFile(inputFile));

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const outputName = `output_${i + 1}.mp4`;
      
      // Calculate duration
      const duration = segment.end - segment.start;
      
      // Run FFmpeg command to cut video
      await this.ffmpeg!.exec([
        '-i', 'input.mp4',
        '-ss', segment.start.toString(),
        '-t', duration.toString(),
        '-c', 'copy', // Copy streams without re-encoding for speed
        '-avoid_negative_ts', 'make_zero',
        outputName
      ]);

      // Read the output file
      const data = await this.ffmpeg!.readFile(outputName);
      const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });
      results.push(blob);

      // Clean up
      await this.ffmpeg!.deleteFile(outputName);
    }

    // Clean up input file
    await this.ffmpeg!.deleteFile('input.mp4');

    return results;
  }

  async mergeSegments(
    inputFile: File,
    segments: Array<{ start: number; end: number; id: string }>
  ): Promise<Blob> {
    console.log('mergeSegments called with:', { segmentsCount: segments.length, fileName: inputFile.name });
    
    if (!this.isReady()) {
      throw new Error('FFmpeg not initialized - use isReady() to check status');
    }

    // Write input file
    await this.ffmpeg!.writeFile('input.mp4', await fetchFile(inputFile));

    // Create filter complex for concatenation
    let filterComplex = '';
    let inputs = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const duration = segment.end - segment.start;
      
      // Extract each segment first
      const segmentName = `segment_${i}.mp4`;
      await this.ffmpeg!.exec([
        '-i', 'input.mp4',
        '-ss', segment.start.toString(),
        '-t', duration.toString(),
        '-c', 'copy',
        '-avoid_negative_ts', 'make_zero',
        segmentName
      ]);

      inputs += `-i ${segmentName} `;
      filterComplex += `[${i}:v:0][${i}:a:0]`;
    }

    filterComplex += `concat=n=${segments.length}:v=1:a=1[outv][outa]`;

    // Merge all segments
    const args = [
      ...inputs.trim().split(' '),
      '-filter_complex', filterComplex,
      '-map', '[outv]',
      '-map', '[outa]',
      '-c:v', 'libx264',
      '-c:a', 'aac',
      'merged_output.mp4'
    ];

    await this.ffmpeg!.exec(args);

    // Read merged file
    const data = await this.ffmpeg!.readFile('merged_output.mp4');
    const blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/mp4' });

    // Clean up all files
    await this.ffmpeg!.deleteFile('input.mp4');
    await this.ffmpeg!.deleteFile('merged_output.mp4');
    
    for (let i = 0; i < segments.length; i++) {
      try {
        await this.ffmpeg!.deleteFile(`segment_${i}.mp4`);
      } catch (e) {
        // File might not exist, ignore
      }
    }

    return blob;
  }

  async getVideoInfo(file: File): Promise<{
    duration: number;
    width: number;
    height: number;
    format: string;
  }> {
    if (!this.ffmpeg || !this.isLoaded) {
      throw new Error('FFmpeg not initialized');
    }

    await this.ffmpeg.writeFile('probe.mp4', await fetchFile(file));
    
    // Use ffprobe-like functionality
    await this.ffmpeg.exec([
      '-i', 'probe.mp4',
      '-f', 'null', '-'
    ]);

    // For now, return basic info (FFmpeg.wasm doesn't have built-in probe)
    // In real implementation, you'd parse the output logs
    await this.ffmpeg.deleteFile('probe.mp4');
    
    return {
      duration: 0, // Will be set from video element
      width: 1920,
      height: 1080,
      format: 'mp4'
    };
  }

  onProgress(callback: (progress: number) => void): void {
    if (this.ffmpeg) {
      this.ffmpeg.on('progress', ({ progress }) => {
        callback(progress);
      });
    }
  }

  onLog(callback: (message: string) => void): void {
    if (this.ffmpeg) {
      this.ffmpeg.on('log', ({ message }) => {
        callback(message);
      });
    }
  }

  terminate(): void {
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.ffmpeg = null;
      this.isLoaded = false;
    }
  }
}

// Singleton instance
export const ffmpegService = new FFmpegService();