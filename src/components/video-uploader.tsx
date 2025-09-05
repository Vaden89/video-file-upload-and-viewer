import {
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Trash2,
  AlertCircle,
  FileVideo,
} from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { cn, generateId } from "@/lib/utils";
import type { VideoFile } from "@/types/video";
import type { UploadError } from "@/types/errors";
import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function VideoUploader() {
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [uploadErrors, setUploadErrors] = useState<UploadError[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});

  const processFiles = useCallback((files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.size > 100 * 1024 * 1024) {
        const errorId = generateId();
        setUploadErrors((prev) => [
          ...prev,
          {
            id: errorId,
            message: `${file.name} is too large. Maximum file size is 100MB.`,
          },
        ]);
        return;
      }

      if (!file.type.startsWith("video/")) {
        const errorId = generateId();
        setUploadErrors((prev) => [
          ...prev,
          {
            id: errorId,
            message: `${file.name} is not a valid video file.`,
          },
        ]);
        return;
      }

      const videoId = generateId();
      const url = URL.createObjectURL(file);

      // Simulate upload progress
      setUploadProgress((prev) => ({ ...prev, [videoId]: 0 }));

      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[videoId] || 0;
          const newProgress = currentProgress + Math.random() * 20;

          if (newProgress >= 100) {
            clearInterval(interval);
            // Add video to list when upload is complete
            const newVideo: VideoFile = {
              id: videoId,
              name: file.name,
              url,
              file,
            };

            const videoUploadedBefore = videos.find(
              (video) => video.id === videoId,
            );

            if (!videoUploadedBefore) {
              setVideos((prev) => [...prev, newVideo]);
            }

            setUploadProgress((prev) => {
              const updated = { ...prev };
              delete updated[videoId];
              return updated;
            });

            return { ...prev, [videoId]: 100 };
          }

          return { ...prev, [videoId]: newProgress };
        });
      }, 200);
    });
  }, []);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      processFiles(files);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        processFiles(files);
      }
    },
    [processFiles],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const dismissError = useCallback((errorId: string) => {
    setUploadErrors((prev) => prev.filter((error) => error.id !== errorId));
  }, []);

  const handleVideoSelect = useCallback((video: VideoFile) => {
    setSelectedVideo(video);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handlePlayPause = useCallback(() => {
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

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (videoRef.current && duration) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        const newTime = percentage * duration;
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [duration],
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      setVolume(newVolume);
      if (videoRef.current) {
        videoRef.current.volume = newVolume;
      }
    },
    [],
  );

  const handleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleSkip = useCallback(
    (seconds: number) => {
      if (videoRef.current) {
        const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [currentTime, duration],
  );

  const handleDeleteVideo = useCallback(
    (videoId: string) => {
      setVideos((prev) => {
        const updated = prev.filter((v) => v.id !== videoId);
        // If the deleted video was selected, clear selection
        if (selectedVideo?.id === videoId) {
          setSelectedVideo(null);
          setIsPlaying(false);
        }
        return updated;
      });

      // Clean up object URL to prevent memory leaks
      const video = videos.find((v) => v.id === videoId);
      if (video) {
        URL.revokeObjectURL(video.url);
      }
    },
    [videos, selectedVideo],
  );

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Byte";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }, []);

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Video Uploader
            <Upload className="w-6 h-6 text-[#6420ff]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  isDragging
                    ? "border-[#6420ff] bg-blue-50"
                    : "border-[#6420ff40] hover:border-[#6420ff]",
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FileVideo className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">
                  {isDragging ? "Drop videos here" : "Drag & drop videos here"}
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse (max 100MB per file)
                </p>
                <Button
                  className="bg-[#6420ff] hover:bg-[#6420ff] active:bg-[#6420ff]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select Videos
                </Button>
              </div>

              {/* Upload Errors */}
              {uploadErrors.length > 0 && (
                <div className="space-y-2">
                  {uploadErrors.map((error) => (
                    <div
                      key={error.id}
                      className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md"
                    >
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-700 flex-1">
                        {error.message}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissError(error.id)}
                        className="h-auto p-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {Object.entries(uploadProgress).map(([videoId, progress]) => (
                <div key={videoId} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              ))}

              <div className="space-y-2">
                <h3 className="font-medium">Uploaded Videos</h3>
                {videos.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No videos uploaded yet
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className={cn(
                          "flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50 transition-colors",
                          selectedVideo?.id === video.id &&
                            "bg-blue-50 border-blue-200",
                        )}
                        onClick={() => handleVideoSelect(video)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {video.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(video.file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteVideo(video.id);
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {selectedVideo ? (
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      src={selectedVideo.url}
                      className="w-full h-64 object-contain"
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                      onError={(e) => {
                        console.error("Video playback error:", e);
                        setUploadErrors((prev) => [
                          ...prev,
                          {
                            id: generateId(),
                            message: `Error playing ${selectedVideo.name}. The file may be corrupted.`,
                          },
                        ]);
                      }}
                    />
                    {!isPlaying && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handlePlayPause}
                          className="w-16 h-16 bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium truncate">
                        {selectedVideo.name}
                      </h4>
                      <span className="text-sm text-gray-500">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
                      onClick={handleSeek}
                    >
                      <div
                        className="absolute h-full bg-[#6420ff] rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSkip(-10)}
                          disabled={!selectedVideo}
                        >
                          <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePlayPause}
                          disabled={!selectedVideo}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleSkip(10)}
                          disabled={!selectedVideo}
                        >
                          <SkipForward className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleMute}
                        >
                          {isMuted ? (
                            <VolumeX className="w-4 h-4" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </Button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={volume}
                          onChange={handleVolumeChange}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <FileVideo className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">Select a video to play</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Videos will appear here after uploading
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
