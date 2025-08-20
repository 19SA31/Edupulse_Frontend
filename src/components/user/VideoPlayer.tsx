import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Lock,
  Minimize,
} from "lucide-react";
import { VideoPlayerProps } from "../../interfaces/courseInterface";

interface ExtendedVideoPlayerProps extends VideoPlayerProps {
  isEnrolled?: boolean;
}

const VideoPlayer: React.FC<ExtendedVideoPlayerProps> = ({
  video,
  onPaywallTrigger,
  freeWatchTime = 30,
  isEnrolled = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [hasTriggeredPaywall, setHasTriggeredPaywall] =
    useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const effectiveFreeWatchTime = isEnrolled ? Infinity : freeWatchTime;
  const freeProgress =
    duration > 0 && !isEnrolled
      ? Math.min((freeWatchTime / duration) * 100, 100)
      : 100;
  const currentProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = (): void =>
      setCurrentTime(videoElement.currentTime || 0);
    const updateDuration = (): void => setDuration(videoElement.duration || 0);

    videoElement.addEventListener("timeupdate", updateTime);
    videoElement.addEventListener("loadedmetadata", updateDuration);

    return () => {
      videoElement.removeEventListener("timeupdate", updateTime);
      videoElement.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [video]);

  useEffect(() => {
    if (
      !isEnrolled &&
      currentTime >= effectiveFreeWatchTime &&
      !hasTriggeredPaywall
    ) {
      setShowPaywall(true);
      setHasTriggeredPaywall(true);
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (onPaywallTrigger) {
        onPaywallTrigger();
      }
    }
  }, [
    currentTime,
    effectiveFreeWatchTime,
    hasTriggeredPaywall,
    onPaywallTrigger,
    isEnrolled,
  ]);

  useEffect(() => {
    if (showPaywall && videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [showPaywall]);

  useEffect(() => {
    if (isEnrolled) {
      setShowPaywall(false);
      setHasTriggeredPaywall(false);
    }
  }, [isEnrolled]);

  const togglePlay = (): void => {
    if (showPaywall && !isEnrolled) {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      return;
    }
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video
        .play()
        .catch((error: Error) => console.log("Video play error:", error));
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (showPaywall && !isEnrolled) return;
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;

    if (
      !isEnrolled &&
      newTime > effectiveFreeWatchTime &&
      !hasTriggeredPaywall
    ) {
      return;
    }

    video.currentTime = newTime;
  };

  const toggleMute = (): void => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;

    if (!document.fullscreenElement) {
      videoRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        if (showPaywall && !isEnrolled) {
          videoRef.current?.pause();
        }
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const formatTime = (time: number): string => {
    if (isNaN(time) || time === null || time === undefined) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!video || !video.signedUrl) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-white">No video available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden">
      <div
        className={`w-full ${
          isEnrolled
            ? "aspect-video max-h-[calc(100vh-150px)]"
            : "h-64 md:h-80 lg:h-96"
        }`}
      >
        <video
          ref={videoRef}
          src={video.signedUrl}
          autoPlay
          controlsList="nodownload"
          className="w-full h-full object-contain"
          onContextMenu={(e) => e.preventDefault()}
          onError={(e: React.SyntheticEvent<HTMLVideoElement, Event>) =>
            console.log("Video error:", e)
          }
        />
      </div>

      {showPaywall && !isEnrolled && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-20">
          <div className="text-center text-white p-8 max-w-md">
            <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold mb-4">Continue Watching</h3>
            <p className="text-gray-300 mb-6">
              You've watched the free preview. Enroll now to access the full
              course content and continue your learning journey.
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <div className="relative mb-4">
          <div
            className="w-full h-2 bg-gray-600 rounded cursor-pointer"
            onClick={handleSeek}
          >
            {!isEnrolled && (
              <div
                className="absolute top-0 left-0 h-2 bg-yellow-500 opacity-50 rounded"
                style={{ width: `${freeProgress}%` }}
              />
            )}
            <div
              className="absolute top-0 left-0 h-2 bg-white rounded"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
          {!isEnrolled && (
            <div
              className="absolute -top-1 w-1 h-4 bg-yellow-500"
              style={{ left: `${freeProgress}%` }}
            />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={togglePlay}
              className="text-white hover:text-gray-300 transition-colors"
              disabled={showPaywall && !isEnrolled}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>

            <button
              onClick={toggleMute}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isEnrolled && (
              <span className="text-yellow-500 text-xs">
                Free: {formatTime(freeWatchTime)}
              </span>
            )}
            {isEnrolled && (
              <span className="text-green-500 text-xs">Full Access</span>
            )}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-gray-300 transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
