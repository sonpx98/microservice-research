import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

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
      throw new Error('Cross-origin isolation required for FFmpeg. Please ensure COOP/COEP headers are set.');
    }

    if (typeof SharedArrayBuffer === 'undefined') {
      console.warn('SharedArrayBuffer not available. FFmpeg.wasm may not work properly.');
      throw new Error('SharedArrayBuffer not available. FFmpeg requires this feature.');
    }

    try {
      this.ffmpeg = new FFmpeg();
      
      // Try local assets first
      const baseURL = window.location.origin;
      const coreURL = `${baseURL}/ffmpeg/ffmpeg-core.js`;
      const wasmURL = `${baseURL}/ffmpeg/ffmpeg-core.wasm`;
      
      console.log(`Loading FFmpeg from local assets:`);
      console.log(`Core JS: ${coreURL}`);
      console.log(`WASM: ${wasmURL}`);
      
      try {
        // Validate that local assets are available
        const coreAvailable = await this.validateURL(coreURL);
        const wasmAvailable = await this.validateURL(wasmURL);
        
        if (!coreAvailable || !wasmAvailable) {
          throw new Error('Local FFmpeg assets not available');
        }
        
        // Load FFmpeg with local assets
        console.log('🔄 Starting FFmpeg load with local assets...');
        await this.ffmpeg.load({
          coreURL,
          wasmURL,
        });
        
        console.log('✅ FFmpeg loaded successfully from local assets');
        
      } catch (localError) {
        console.warn('❌ Failed to load from local assets, trying CDN fallback:', localError);
        
        // Fallback to CDN 
        try {
          await this.ffmpeg.load();
          console.log('✅ FFmpeg loaded successfully from CDN');
        } catch (cdnError) {
          console.error('❌ CDN fallback also failed:', cdnError);
          throw new Error(`Failed to load FFmpeg from both local assets and CDN. Local error: ${localError instanceof Error ? localError.message : localError}. CDN error: ${cdnError instanceof Error ? cdnError.message : cdnError}`);
        }
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