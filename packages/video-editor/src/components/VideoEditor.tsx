import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Upload, Play, Pause, Download, Scissors, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ffmpegService } from '@/services/ffmpeg';

// Helper component để render icons với proper typing
const Icon = ({ Icon: IconComponent, className }: { Icon: any; className?: string }) => {
  return <IconComponent className={className} />;
};

interface VideoSegment {
  start: number;
  end: number;
  id: string;
}

const VideoEditor: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFile = useRef<File | null>(null);
  
  const [videoSrc, setVideoSrc] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegReady, setFFmpegReady] = useState(false);
  const [ffmpegError, setFFmpegError] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [exportMode, setExportMode] = useState<'individual' | 'merged'>('merged');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize FFmpeg on component mount
  useEffect(() => {
    const initFFmpeg = async () => {
      try {
        console.log('Initializing FFmpeg...');
        console.log('Cross-origin isolated:', crossOriginIsolated);
        console.log('SharedArrayBuffer available:', typeof SharedArrayBuffer !== 'undefined');
        
        await ffmpegService.initialize();
        setFFmpegReady(true);
        console.log('FFmpeg initialized successfully');
        
        // Set up progress and log listeners
        ffmpegService.onProgress((progress) => {
          setProcessingProgress(progress);
        });
        
        ffmpegService.onLog((message) => {
          console.log('FFmpeg:', message);
        });
        
      } catch (error) {
        console.error('Failed to initialize FFmpeg:', error);
        setFallbackMode(true);
        
        // More specific error message based on the error
        if (error instanceof Error && error.message.includes('Cross-origin isolation')) {
          setFFmpegError('Video editing requires running the app standalone. Click "Open Standalone" to use full features.');
        } else if (error instanceof Error && error.message.includes('SharedArrayBuffer')) {
          setFFmpegError('Your browser doesn\'t support advanced video editing. Please use a modern browser like Chrome or Firefox.');
        } else {
          setFFmpegError('Video engine failed to load. Using fallback mode (screenshot export only).');
        }
      }
    };
    
    initFFmpeg();
    
    // Cleanup on unmount
    return () => {
      ffmpegService.terminate();
    };
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setSegments([]);
      setTrimStart(0);
      setTrimEnd(0);
      currentFile.current = file; // Store reference to original file
    }
  }, []);

  const handleVideoLoad = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setTrimEnd(videoDuration);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleTimelineClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    
    // Clamp between 0 and duration
    const clampedTime = Math.max(0, Math.min(duration, newTime));
    seekTo(clampedTime);
  }, [duration, seekTo]);

  const handleTimelineDragStart = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleTimelineDrag = useCallback((event: MouseEvent) => {
    if (!isDragging) return;
    
    const timelineElement = document.querySelector('[data-timeline]') as HTMLElement;
    if (!timelineElement) return;
    
    const rect = timelineElement.getBoundingClientRect();
    const dragX = event.clientX - rect.left;
    console.log('rect', rect, 'event.clientX',event.clientX,'dragX',Math.max(0, Math.min(1, dragX / rect.width)))
    const percentage = Math.max(0, Math.min(1, dragX / rect.width));
    const newTime = percentage * duration;
    
    seekTo(newTime);
  }, [isDragging, duration, seekTo]);

  const handleTimelineDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleTimelineDrag);
      document.addEventListener('mouseup', handleTimelineDragEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleTimelineDrag);
        document.removeEventListener('mouseup', handleTimelineDragEnd);
      };
    }
  }, [isDragging, handleTimelineDrag, handleTimelineDragEnd]);

  const addSegment = useCallback(() => {
    if (trimStart < trimEnd) {
      const newSegment: VideoSegment = {
        start: trimStart,
        end: trimEnd,
        id: Date.now().toString()
      };
      setSegments(prev => [...prev, newSegment]);
    }
  }, [trimStart, trimEnd]);

  const removeSegment = useCallback((id: string) => {
    setSegments(prev => prev.filter(segment => segment.id !== id));
  }, []);

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const exportVideoFallback = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || segments.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Fallback mode: Export screenshots of segments
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        
        // Seek to segment start
        video.currentTime = segment.start;
        await new Promise(resolve => {
          video.onseeked = resolve;
        });
        
        // Draw current frame
        ctx?.drawImage(video, 0, 0);
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `segment-${i + 1}-frame-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          }
        });
        
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error('Fallback export failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [segments]);

  const exportVideo = useCallback(async () => {
    if (fallbackMode) {
      return exportVideoFallback();
    }
    
    // Double-check FFmpeg readiness
    console.log('Export video called. Checking FFmpeg readiness...');
    if (!currentFile.current || segments.length === 0) {
      console.warn('Missing file or segments');
      return;
    }
    
    if (!ffmpegService.isReady()) {
      console.error('FFmpeg service not ready');
      setFFmpegError('Video engine not ready. Please wait or refresh.');
      return;
    }
    
    console.log('FFmpeg is ready, proceeding with export...');
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      if (exportMode === 'merged') {
        // Export as single merged video
        const mergedBlob = await ffmpegService.mergeSegments(currentFile.current, segments);
        
        // Download the merged video
        const url = URL.createObjectURL(mergedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `edited-video-merged-${Date.now()}.mp4`;
        a.click();
        URL.revokeObjectURL(url);
        
      } else {
        // Export individual segments
        const segmentBlobs = await ffmpegService.cutVideo(currentFile.current, segments);
        
        // Download each segment
        segmentBlobs.forEach((blob, index) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `segment-${index + 1}-${Date.now()}.mp4`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }
      
    } catch (error) {
      console.error('Export failed:', error);
      setFFmpegError('Export failed. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  }, [segments, ffmpegReady, exportMode, fallbackMode, exportVideoFallback]);

  return (
    <div className="videoeditor:min-h-screen videoeditor:bg-background videoeditor:text-foreground videoeditor:p-6">
      <div className="videoeditor:max-w-6xl videoeditor:mx-auto videoeditor:space-y-6">
        <div className="videoeditor:text-center">
          <h1 className="videoeditor:text-4xl videoeditor:font-bold videoeditor:mb-2">Video Editor</h1>
          <p className="videoeditor:text-muted-foreground">Professional video editing in your browser</p>
          
          {/* FFmpeg Status */}
          <div className="videoeditor:mt-4 videoeditor:flex videoeditor:items-center videoeditor:justify-center videoeditor:gap-2">
            {!ffmpegReady && !ffmpegError && (
              <>
                <Icon Icon={Loader2} className="videoeditor:h-4 videoeditor:w-4 videoeditor:animate-spin" />
                <span className="videoeditor:text-sm videoeditor:text-muted-foreground">Loading video engine...</span>
              </>
            )}
            {ffmpegReady && (
              <span className="videoeditor:text-sm videoeditor:text-green-600">✅ Video engine ready</span>
            )}
            {fallbackMode && (
              <span className="videoeditor:text-sm videoeditor:text-yellow-600">⚠️ Fallback mode (screenshots only)</span>
            )}
            {ffmpegError && !fallbackMode && (
              <>
                <Icon Icon={AlertCircle} className="videoeditor:h-4 videoeditor:w-4 videoeditor:text-red-500" />
                <span className="videoeditor:text-sm videoeditor:text-red-500">{ffmpegError}</span>
              </>
            )}
          </div>
        </div>
        
        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Video</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="videoeditor:hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="videoeditor:w-full videoeditor:h-16"
              variant="outline"
            >
              <Icon Icon={Upload} className="videoeditor:mr-2 videoeditor:h-6 videoeditor:w-6" />
              Choose Video File
            </Button>
          </CardContent>
        </Card>

        {videoSrc && (
          <>
            {/* Video Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="videoeditor:relative videoeditor:bg-black videoeditor:rounded-lg videoeditor:overflow-hidden videoeditor:mb-4">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    onLoadedMetadata={handleVideoLoad}
                    onTimeUpdate={handleTimeUpdate}
                    className="videoeditor:w-full videoeditor:max-h-96 videoeditor:object-contain"
                    crossOrigin="anonymous"
                  />
                  <canvas ref={canvasRef} className="videoeditor:hidden" />
                </div>
                
                {/* Controls */}
                <div className="videoeditor:flex videoeditor:items-center videoeditor:gap-4">
                  <Button
                    onClick={togglePlayPause}
                    size="lg"
                    variant={isPlaying ? "secondary" : "default"}
                  >
                    {isPlaying ? (
                      <Icon Icon={Pause} className="videoeditor:mr-2 videoeditor:h-5 videoeditor:w-5" />
                    ) : (
                      <Icon Icon={Play} className="videoeditor:mr-2 videoeditor:h-5 videoeditor:w-5" />
                    )}
                    {isPlaying ? 'Pause' : 'Play'}
                  </Button>
                  
                  <div className="videoeditor:text-sm videoeditor:text-muted-foreground">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline & Trimming</CardTitle>
              </CardHeader>
              <CardContent className="videoeditor:space-y-6">
                {/* Progress Bar */}
                <div className="videoeditor:space-y-2">
                  <div className="videoeditor:text-sm videoeditor:font-medium">Playback Progress (Click or drag to seek)</div>
                  <div 
                    className="videoeditor:relative videoeditor:cursor-pointer videoeditor:select-none"
                    onClick={handleTimelineClick}
                    data-timeline
                  >
                    <div className="videoeditor:w-full videoeditor:h-4 videoeditor:bg-secondary videoeditor:rounded-full videoeditor:flex videoeditor:items-center videoeditor:relative">
                      {/* Background track */}
                      <div className="videoeditor:w-full videoeditor:h-2 videoeditor:bg-secondary videoeditor:rounded-full videoeditor:mx-1" />
                      
                      {/* Trim range indicator */}
                      {duration > 0 && (
                        <div
                          className="videoeditor:absolute videoeditor:h-2 videoeditor:bg-orange-200 videoeditor:rounded-full videoeditor:mx-1"
                          style={{ 
                            left: `${(trimStart / duration) * 100}%`,
                            width: `${((trimEnd - trimStart) / duration) * 100}%`
                          }}
                        />
                      )}
                      
                      {/* Progress fill */}
                      <div
                        className="videoeditor:absolute videoeditor:h-2 videoeditor:bg-primary videoeditor:rounded-full videoeditor:mx-1"
                        style={{ width: `${Math.max(0, Math.min(100, (currentTime / duration) * 100))}%` }}
                      />
                    </div>
                    
                    {/* Trim start marker */}
                    {duration > 0 && (
                      <div
                        className="videoeditor:absolute videoeditor:top-1/2 videoeditor:transform videoeditor:-translate-y-1/2 videoeditor:w-3 videoeditor:h-6 videoeditor:bg-orange-500 videoeditor:rounded-sm videoeditor:border videoeditor:border-white"
                        style={{ left: `calc(${(trimStart / duration) * 100}% - 6px)` }}
                        title={`Trim Start: ${formatTime(trimStart)}`}
                      />
                    )}
                    
                    {/* Trim end marker */}
                    {duration > 0 && (
                      <div
                        className="videoeditor:absolute videoeditor:top-1/2 videoeditor:transform videoeditor:-translate-y-1/2 videoeditor:w-3 videoeditor:h-6 videoeditor:bg-orange-500 videoeditor:rounded-sm videoeditor:border videoeditor:border-white"
                        style={{ left: `calc(${(trimEnd / duration) * 100}% - 6px)` }}
                        title={`Trim End: ${formatTime(trimEnd)}`}
                      />
                    )}
                    
                    {/* Current time handle */}
                    <div
                      className={`videoeditor:absolute videoeditor:top-1/2 videoeditor:transform videoeditor:-translate-y-1/2 videoeditor:w-4 videoeditor:h-4 videoeditor:bg-primary videoeditor:rounded-full videoeditor:border-2 videoeditor:border-white videoeditor:shadow-md videoeditor:transition-all videoeditor:cursor-grab videoeditor:z-10 ${isDragging ? 'videoeditor:cursor-grabbing videoeditor:scale-110' : 'hover:videoeditor:scale-110'}`}
                      style={{ left: `calc(${Math.max(0, Math.min(100, (currentTime / duration) * 100))}% - 8px)` }}
                      onMouseDown={handleTimelineDragStart}
                      title={`Current time: ${formatTime(currentTime)}`}
                    />
                  </div>
                  <div className="videoeditor:flex videoeditor:justify-between videoeditor:text-xs videoeditor:text-muted-foreground">
                    <span>0:00</span>
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
                
                {/* Trim Controls */}
                <div className="videoeditor:space-y-4">
                  <div className="videoeditor:space-y-2">
                    <label className="videoeditor:text-sm videoeditor:font-medium">
                      Trim Start: {formatTime(trimStart)}
                    </label>
                    <Slider
                      value={[trimStart]}
                      max={duration}
                      step={0.1}
                      onValueChange={(value) => setTrimStart(value[0])}
                      className="videoeditor:w-full"
                    />
                  </div>
                  
                  <div className="videoeditor:space-y-2">
                    <label className="videoeditor:text-sm videoeditor:font-medium">
                      Trim End: {formatTime(trimEnd)}
                    </label>
                    <Slider
                      value={[trimEnd]}
                      max={duration}
                      step={0.1}
                      onValueChange={(value) => setTrimEnd(value[0])}
                      className="videoeditor:w-full"
                    />
                  </div>
                  
                  <div className="videoeditor:flex videoeditor:gap-2 videoeditor:flex-wrap">
                    <Button
                      onClick={() => seekTo(trimStart)}
                      variant="outline"
                      size="sm"
                    >
                      Go to Start
                    </Button>
                    <Button
                      onClick={() => seekTo(trimEnd)}
                      variant="outline"
                      size="sm"
                    >
                      Go to End
                    </Button>
                    <Button
                      onClick={addSegment}
                      size="sm"
                      className="videoeditor:bg-orange-600 hover:videoeditor:bg-orange-700"
                    >
                      <Icon Icon={Scissors} className="videoeditor:mr-2 videoeditor:h-4 videoeditor:w-4" />
                      Add Cut
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Segments List */}
            {segments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Segments ({segments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="videoeditor:space-y-3">
                    {segments.map((segment, index) => (
                      <div
                        key={segment.id}
                        className="videoeditor:flex videoeditor:items-center videoeditor:justify-between videoeditor:p-4 videoeditor:bg-secondary/50 videoeditor:rounded-lg"
                      >
                        <div className="videoeditor:space-y-1">
                          <div className="videoeditor:font-medium">
                            Segment {index + 1}
                          </div>
                          <div className="videoeditor:text-sm videoeditor:text-muted-foreground">
                            {formatTime(segment.start)} - {formatTime(segment.end)} 
                            <span className="videoeditor:ml-2">
                              (Duration: {formatTime(segment.end - segment.start)})
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => removeSegment(segment.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Export */}
            <Card>
              <CardHeader>
                <CardTitle>Export Video</CardTitle>
              </CardHeader>
              <CardContent className="videoeditor:space-y-4">
                {/* Export Mode Selection */}
                {!fallbackMode && (
                  <div className="videoeditor:space-y-3">
                    <label className="videoeditor:text-sm videoeditor:font-medium">Export Mode</label>
                    <div className="videoeditor:flex videoeditor:gap-2">
                      <Button
                        onClick={() => setExportMode('merged')}
                        variant={exportMode === 'merged' ? 'default' : 'outline'}
                        size="sm"
                      >
                        Merged Video
                      </Button>
                      <Button
                        onClick={() => setExportMode('individual')}
                        variant={exportMode === 'individual' ? 'default' : 'outline'}
                        size="sm"
                      >
                        Individual Segments
                      </Button>
                    </div>
                    <p className="videoeditor:text-xs videoeditor:text-muted-foreground">
                      {exportMode === 'merged' 
                        ? 'Combine all segments into a single video file'
                        : 'Download each segment as a separate video file'
                      }
                    </p>
                  </div>
                )}

                {fallbackMode && (
                  <div className="videoeditor:p-4 videoeditor:bg-yellow-50 videoeditor:border videoeditor:border-yellow-200 videoeditor:rounded-lg videoeditor:space-y-3">
                    <div className="videoeditor:flex videoeditor:items-start videoeditor:gap-2">
                      <Icon Icon={AlertCircle} className="videoeditor:h-5 videoeditor:w-5 videoeditor:text-yellow-600 videoeditor:mt-0.5 videoeditor:flex-shrink-0" />
                      <div className="videoeditor:space-y-2">
                        <p className="videoeditor:text-sm videoeditor:text-yellow-800 videoeditor:font-medium">
                          Video Engine Unavailable
                        </p>
                        <p className="videoeditor:text-sm videoeditor:text-yellow-700">
                          {ffmpegError}
                        </p>
                        {ffmpegError.includes('standalone') && (
                          <Button
                            onClick={() => window.open('http://localhost:5005', '_blank')}
                            size="sm"
                            className="videoeditor:bg-yellow-600 hover:videoeditor:bg-yellow-700"
                          >
                            Open Standalone Video Editor
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="videoeditor:space-y-2">
                    <div className="videoeditor:flex videoeditor:items-center videoeditor:gap-2">
                      <Icon Icon={Loader2} className="videoeditor:h-4 videoeditor:w-4 videoeditor:animate-spin" />
                      <span className="videoeditor:text-sm">Processing video... {Math.round(processingProgress * 100)}%</span>
                    </div>
                    <div className="videoeditor:w-full videoeditor:bg-secondary videoeditor:rounded-full videoeditor:h-2">
                      <div
                        className="videoeditor:bg-primary videoeditor:h-2 videoeditor:rounded-full videoeditor:transition-all"
                        style={{ width: `${processingProgress * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={exportVideo}
                  disabled={segments.length === 0 || isProcessing || (!ffmpegReady && !fallbackMode) || (!fallbackMode && !ffmpegService.isReady())}
                  size="lg"
                  className="videoeditor:w-full"
                >
                  <Icon Icon={Download} className="videoeditor:mr-2 videoeditor:h-5 videoeditor:w-5" />
                  {isProcessing 
                    ? 'Processing...' 
                    : fallbackMode 
                      ? 'Export Screenshots'
                      : `Export ${exportMode === 'merged' ? 'Merged' : 'Individual'} Video${exportMode === 'individual' ? 's' : ''}`
                  }
                </Button>
                
                {segments.length === 0 && (
                  <p className="videoeditor:text-sm videoeditor:text-muted-foreground videoeditor:mt-2 videoeditor:text-center">
                    Add at least one segment to enable export
                  </p>
                )}
                
                {!ffmpegReady && !fallbackMode && (
                  <p className="videoeditor:text-sm videoeditor:text-muted-foreground videoeditor:mt-2 videoeditor:text-center">
                    Waiting for video engine to load...
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;