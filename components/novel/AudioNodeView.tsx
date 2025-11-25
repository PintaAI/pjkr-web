"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";
import { Music, Download, Play, Pause, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const AudioNodeView = ({ node, selected }: NodeViewProps) => {
  const { src, filename, size, duration, autoplay, loop } = node.attrs;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return "";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = filename || "audio.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleError = () => {
    setError("Failed to load audio file");
    setIsLoading(false);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  return (
    <NodeViewWrapper className={cn("my-4", selected && "ring-2 ring-primary ring-offset-2")}>
      <div className="border rounded-lg overflow-hidden bg-card">
        {/* Audio Header */}
        <div className="bg-muted/50 px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{filename || "Audio File"}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {size && <span>{formatFileSize(size)}</span>}
                {audioDuration && <span>• {formatDuration(audioDuration)}</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              title="Download Audio"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
        
        {/* Audio Player */}
        <div className="p-4">
          {error ? (
            <div className="flex items-center gap-2 text-sm text-destructive p-4 bg-destructive/10 rounded-md">
              <Volume2 className="h-4 w-4" />
              {error}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Custom Audio Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayPause}
                  disabled={isLoading}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
                
                {/* Progress Bar */}
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {formatDuration(currentTime)}
                  </span>
                  <div className="flex-1 relative">
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-100"
                        style={{ width: `${audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={audioDuration || 0}
                      value={currentTime}
                      onChange={(e) => {
                        const newTime = parseFloat(e.target.value);
                        if (audioRef.current) {
                          audioRef.current.currentTime = newTime;
                          setCurrentTime(newTime);
                        }
                      }}
                      className="absolute inset-0 w-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                    {formatDuration(audioDuration)}
                  </span>
                </div>
              </div>
              
              {/* HTML5 Audio Element (hidden) */}
              <audio
                ref={audioRef}
                src={src}
                autoPlay={autoplay}
                loop={loop}
                preload="metadata"
                className="hidden"
              />
            </div>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default AudioNodeView;