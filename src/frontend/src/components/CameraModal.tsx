import {
  Camera,
  Check,
  ChevronDown,
  FlipHorizontal,
  Image,
  Infinity as InfinityIcon,
  RefreshCw,
  Settings,
  Sparkles,
  Type,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const FILTERS: { name: string; css: string }[] = [
  { name: "Normal", css: "none" },
  {
    name: "Neon",
    css: "saturate(2) hue-rotate(90deg) brightness(1.2) contrast(1.3)",
  },
  {
    name: "Vintage",
    css: "sepia(0.6) contrast(1.1) brightness(0.9) saturate(0.8)",
  },
  {
    name: "Beauty",
    css: "brightness(1.15) contrast(0.9) saturate(1.2) blur(0.3px)",
  },
  { name: "Warm", css: "sepia(0.3) saturate(1.4) brightness(1.1)" },
  { name: "Cool", css: "hue-rotate(180deg) saturate(0.8) brightness(1.05)" },
  { name: "B&W", css: "grayscale(1) contrast(1.2)" },
  { name: "Rainbow", css: "hue-rotate(45deg) saturate(2) brightness(1.1)" },
  {
    name: "Glitch",
    css: "hue-rotate(30deg) saturate(3) contrast(1.5) brightness(0.9)",
  },
];

type Mode = "POST" | "STORY" | "REEL";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendPhoto: (dataUrl: string, caption?: string) => void;
  onAddStory?: (dataUrl: string, caption?: string) => void;
  onSendReel?: (videoBlob: Blob) => void;
}

function getSupportedMimeType(): string | null {
  const types = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4",
  ];
  if (typeof MediaRecorder === "undefined") return null;
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return null;
}

export default function CameraModal({
  isOpen,
  onClose,
  onSendPhoto,
  onAddStory,
  onSendReel,
}: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const facingModeRef = useRef<"user" | "environment">("user");

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("POST");
  const [activeFilter, setActiveFilter] = useState(0);
  const [flashOn, setFlashOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [reelSupported, setReelSupported] = useState(true);

  // Preview state
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<Mode | null>(null);
  const [caption, setCaption] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef<number>(0);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setIsLoading(false);
  }, []);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setCameraError(null);
    // Stop any existing stream first
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) track.stop();
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingModeRef.current },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsActive(true);
      setIsLoading(false);
    } catch {
      // Try fallback facing mode
      const fallback =
        facingModeRef.current === "user" ? "environment" : "user";
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: fallback },
          audio: true,
        });
        facingModeRef.current = fallback;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setIsActive(true);
        setIsLoading(false);
      } catch (err2) {
        const msg = err2 instanceof Error ? err2.message : "Camera unavailable";
        setCameraError(msg);
        setIsLoading(false);
      }
    }
  }, []);

  const switchCamera = useCallback(async () => {
    facingModeRef.current =
      facingModeRef.current === "user" ? "environment" : "user";
    await startCamera();
  }, [startCamera]);

  // Start/stop camera when modal opens/closes
  // biome-ignore lint/correctness/useExhaustiveDependencies: startCamera and stopCamera are stable useCallback refs; including them would cause infinite loops
  useEffect(() => {
    if (isOpen) {
      // Check reel support
      setReelSupported(getSupportedMimeType() !== null);
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => clearTimeout(timer);
    }
    // Cleanup on close
    stopRecordingClean();
    stopCamera();
    setPreviewDataUrl(null);
    setPreviewMode(null);
    setCaption("");
    setCameraError(null);
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const stopRecordingClean = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    setRecordProgress(0);
  };

  const currentFilter = FILTERS[activeFilter].css;

  const capturePhoto = (): string | null => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    // Apply CSS filter to canvas capture
    ctx.filter = currentFilter === "none" ? "" : currentFilter;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.filter = "";
    return canvas.toDataURL("image/jpeg", 0.9);
  };

  const handleShutterPress = () => {
    if (mode === "POST" || mode === "STORY") {
      const dataUrl = capturePhoto();
      if (dataUrl) {
        setPreviewDataUrl(dataUrl);
        setPreviewMode(mode);
        stopCamera();
      }
    } else if (mode === "REEL") {
      startReel();
    }
  };

  const handleShutterRelease = () => {
    if (mode === "REEL" && isRecording) {
      stopReel();
    }
  };

  const handleUsePhoto = () => {
    if (!previewDataUrl || !previewMode) return;
    const captionValue = caption.trim() || undefined;
    if (previewMode === "STORY") {
      if (onAddStory) onAddStory(previewDataUrl, captionValue);
      else onSendPhoto(previewDataUrl, captionValue);
    } else {
      onSendPhoto(previewDataUrl, captionValue);
    }
    setPreviewDataUrl(null);
    setPreviewMode(null);
    setCaption("");
    onClose();
  };

  const handleRetake = () => {
    setPreviewDataUrl(null);
    setPreviewMode(null);
    setCaption("");
    setTimeout(() => startCamera(), 150);
  };

  const startReel = () => {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = getSupportedMimeType();
    if (!mimeType) return;
    recordedChunksRef.current = [];
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(stream, { mimeType });
    } catch {
      try {
        mr = new MediaRecorder(stream);
      } catch {
        return;
      }
    }
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: mimeType });
      if (onSendReel) onSendReel(blob);
      stopCamera();
      onClose();
    };
    mr.start(100);
    mediaRecorderRef.current = mr;
    setIsRecording(true);
    setRecordProgress(0);
    recordStartRef.current = Date.now();
    recordTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - recordStartRef.current;
      const pct = Math.min((elapsed / 30000) * 100, 100);
      setRecordProgress(pct);
      if (pct >= 100) stopReel();
    }, 100);
  };

  const stopReel = () => {
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
    setRecordProgress(0);
  };

  const handleClose = () => {
    stopRecordingClean();
    stopCamera();
    setPreviewDataUrl(null);
    setPreviewMode(null);
    setCaption("");
    onClose();
  };

  const RADIUS = 38;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset =
    CIRCUMFERENCE - (recordProgress / 100) * CIRCUMFERENCE;

  const availableModes: Mode[] = reelSupported
    ? ["POST", "STORY", "REEL"]
    : ["POST", "STORY"];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-ocid="camera.modal"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] bg-black flex flex-col"
        >
          {/* PREVIEW SCREEN */}
          <AnimatePresence>
            {previewDataUrl && (
              <motion.div
                data-ocid="camera.preview.panel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 z-20 flex flex-col bg-black"
              >
                {/* Preview image */}
                <div className="flex-1 relative">
                  <img
                    src={previewDataUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Mode badge */}
                  <div
                    className="absolute top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest"
                    style={{
                      background: "rgba(0,0,0,0.55)",
                      color: "white",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {previewMode === "STORY" ? "ADD TO STORY" : "POST PHOTO"}
                  </div>

                  {/* Caption input overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
                    <input
                      type="text"
                      data-ocid="camera.preview.input"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Add a caption..."
                      maxLength={200}
                      className="w-full rounded-xl px-4 py-3 text-sm text-white text-center outline-none"
                      style={{
                        background: "rgba(0,0,0,0.45)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.5)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(255,255,255,0.2)";
                      }}
                    />
                  </div>
                </div>

                {/* Action row */}
                <div className="flex items-center justify-between px-10 py-8">
                  {/* Retake */}
                  <button
                    type="button"
                    data-ocid="camera.preview.retake_button"
                    onClick={handleRetake}
                    className="flex flex-col items-center gap-2 transition-all active:scale-90"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "2px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <RefreshCw size={22} color="white" />
                    </div>
                    <span className="text-white/70 text-xs font-semibold tracking-wide">
                      Retake
                    </span>
                  </button>

                  {/* Use photo */}
                  <button
                    type="button"
                    data-ocid="camera.preview.save_button"
                    onClick={handleUsePhoto}
                    className="flex flex-col items-center gap-2 transition-all active:scale-90"
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
                        boxShadow: "0 0 24px rgba(168,85,247,0.6)",
                      }}
                    >
                      <Check size={28} color="white" strokeWidth={3} />
                    </div>
                    <span className="text-white text-xs font-bold tracking-wide">
                      {previewMode === "STORY" ? "Add to Story" : "Use Photo"}
                    </span>
                  </button>

                  {/* Discard / close */}
                  <button
                    type="button"
                    data-ocid="camera.preview.close_button"
                    onClick={handleClose}
                    className="flex flex-col items-center gap-2 transition-all active:scale-90"
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "2px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      <X size={22} color="white" />
                    </div>
                    <span className="text-white/70 text-xs font-semibold tracking-wide">
                      Discard
                    </span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pt-safe pt-5 pb-3">
            <button
              type="button"
              data-ocid="camera.close_button"
              onClick={handleClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <X size={20} color="white" />
            </button>

            <button
              type="button"
              data-ocid="camera.flash_toggle"
              onClick={() => setFlashOn((v) => !v)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: flashOn
                  ? "rgba(255,220,0,0.25)"
                  : "rgba(0,0,0,0.4)",
              }}
            >
              {flashOn ? (
                <Zap size={20} color="#FFD700" />
              ) : (
                <ZapOff size={20} color="white" />
              )}
            </button>

            <button
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.4)" }}
            >
              <Settings size={18} color="white" />
            </button>
          </div>

          {/* Main area with video + left tools */}
          <div className="flex-1 relative">
            {/* Video feed */}
            <div className="absolute inset-0">
              {isActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ filter: currentFilter }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {isLoading ? (
                    <div
                      className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "rgba(255,255,255,0.4)" }}
                    />
                  ) : cameraError ? (
                    <div className="text-center px-8">
                      <p className="text-white/60 text-sm">{cameraError}</p>
                      <button
                        type="button"
                        onClick={startCamera}
                        className="mt-3 px-5 py-2 rounded-full text-sm font-semibold"
                        style={{
                          background: "rgba(255,255,255,0.15)",
                          color: "white",
                        }}
                      >
                        Enable Camera
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex flex-col items-center gap-3"
                    >
                      <Camera size={48} color="rgba(255,255,255,0.4)" />
                      <span className="text-white/60 text-sm">
                        Tap to start camera
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Left tools column */}
            <div
              className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-5"
              style={{ zIndex: 10 }}
            >
              {[
                { icon: <Type size={18} color="white" />, label: "Aa" },
                {
                  icon: <InfinityIcon size={18} color="white" />,
                  label: "inf",
                },
                {
                  icon: <Sparkles size={18} color="white" />,
                  label: "sparkles",
                },
                {
                  icon: <ChevronDown size={18} color="white" />,
                  label: "down",
                },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
                  style={{ background: "rgba(0,0,0,0.45)" }}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Filter strip */}
          <div className="px-4 py-2">
            <div
              className="flex gap-2 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {FILTERS.map((f, i) => (
                <button
                  key={f.name}
                  type="button"
                  data-ocid={`camera.filter.item.${i + 1}`}
                  onClick={() => setActiveFilter(i)}
                  className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background:
                      activeFilter === i ? "white" : "rgba(255,255,255,0.15)",
                    color: activeFilter === i ? "black" : "white",
                    border:
                      activeFilter === i
                        ? "none"
                        : "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Shutter row */}
          <div className="flex items-center justify-between px-10 py-4">
            {/* Gallery */}
            <button
              type="button"
              data-ocid="camera.gallery_button"
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
              onClick={() => galleryInputRef.current?.click()}
            >
              <Image size={20} color="white" />
            </button>
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result as string;
                  if (!dataUrl) return;
                  setPreviewDataUrl(dataUrl);
                  setPreviewMode(mode);
                  stopCamera();
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />

            {/* Shutter */}
            <div className="relative">
              {isRecording && (
                <svg
                  className="absolute inset-0 -m-1 rotate-[-90deg]"
                  width="90"
                  height="90"
                  viewBox="0 0 90 90"
                  style={{ left: "-7px", top: "-7px" }}
                  aria-hidden="true"
                >
                  <circle
                    cx="45"
                    cy="45"
                    r={RADIUS}
                    fill="none"
                    stroke="red"
                    strokeWidth="3"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.1s linear" }}
                  />
                </svg>
              )}
              <button
                type="button"
                data-ocid="camera.shutter_button"
                onPointerDown={handleShutterPress}
                onPointerUp={handleShutterRelease}
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{
                  background: isRecording ? "red" : "white",
                  border: "4px solid rgba(255,255,255,0.5)",
                  boxShadow: isRecording
                    ? "0 0 20px rgba(255,0,0,0.5)"
                    : "0 0 20px rgba(255,255,255,0.3)",
                }}
              >
                {mode === "REEL" && !isRecording && (
                  <div
                    className="w-7 h-7 rounded-full"
                    style={{ background: "red" }}
                  />
                )}
              </button>
            </div>

            {/* Flip camera */}
            <button
              type="button"
              data-ocid="camera.flip_button"
              onClick={switchCamera}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <FlipHorizontal size={20} color="white" />
            </button>
          </div>

          {/* Mode tabs */}
          <div className="flex items-center justify-center gap-8 pb-safe pb-6">
            {availableModes.map((m) => (
              <button
                key={m}
                type="button"
                data-ocid={`camera.mode.${m.toLowerCase()}_tab`}
                onClick={() => setMode(m)}
                className="text-sm font-bold tracking-widest transition-all"
                style={{
                  color: mode === m ? "white" : "rgba(255,255,255,0.45)",
                  textShadow:
                    mode === m ? "0 0 12px rgba(255,255,255,0.6)" : "none",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
