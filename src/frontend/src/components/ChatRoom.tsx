import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ChevronRight,
  Paperclip,
  Pencil,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePresence } from "../hooks/usePresence";
import {
  useJoinRPSGame,
  useMessages,
  useOnlineUsers,
  useSendMessage,
} from "../hooks/useQueries";
import RPSGame from "./RPSGame";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  roomId: string;
  roomName: string;
  roomEmoji: string;
  username: string;
  onBack: () => void;
  onRename?: () => void;
  extraPanel?: React.ReactNode;
}

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const date = new Date(ms);
  const now = Date.now();
  const diff = now - ms;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const AVATAR_COLORS = [
  "oklch(0.65 0.28 305)",
  "oklch(0.72 0.2 200)",
  "oklch(0.78 0.15 85)",
  "oklch(0.6 0.25 250)",
  "oklch(0.65 0.22 50)",
  "oklch(0.75 0.22 320)",
  "oklch(0.7 0.28 330)",
  "oklch(0.7 0.2 180)",
];

function getUserColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ChatRoom({
  roomId,
  roomName,
  roomEmoji,
  username,
  onBack,
  onRename,
  extraPanel,
}: Props) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Reply/tag system
  const [replyTo, setReplyTo] = useState<{
    username: string;
    text: string;
  } | null>(null);

  // Edit system
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [localEdits, setLocalEdits] = useState<Record<string, string>>({});

  // File upload
  const [mediaPreview, setMediaPreview] = useState<{
    url: string;
    type: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Optimistic messages
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{ username: string; text: string; timestamp: bigint; key: string }>
  >([]);

  const { data: messages = [], isLoading } = useMessages(roomId);
  const sendMutation = useSendMessage(roomId);
  const joinRPS = useJoinRPSGame();
  const { data: onlineUsers = [] } = useOnlineUsers(roomId);
  const qc = useQueryClient();

  usePresence(roomId, username);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollRef is stable
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, optimisticMessages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview({ url, type: file.type });
    // reset file input
    e.target.value = "";
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (mediaPreview?.url) URL.revokeObjectURL(mediaPreview.url);
    };
  }, [mediaPreview]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed && !mediaPreview) return;
    if (isSending) return;

    // Intercept /joingame command
    const joinMatch = trimmed.match(/^\/joingame\s+(\S+)/);
    if (joinMatch) {
      setText("");
      const gameId = joinMatch[1];
      try {
        await joinRPS.mutateAsync({ gameId, username });
        await sendMutation.mutateAsync({
          username,
          text: `⚔️ ${username} joined the RPS game! (ID: ${gameId})`,
        });
      } catch {
        // silent
      }
      return;
    }

    let finalText = trimmed;

    // Prepend reply tag
    if (replyTo) {
      finalText = `↩ @${replyTo.username}: ${finalText}`;
      setReplyTo(null);
    }

    // Append media note
    if (mediaPreview) {
      finalText = finalText
        ? `${finalText}\n[📎 Media attached]`
        : "[📎 Media attached]";
    }

    const optimisticKey = `opt-${Date.now()}`;
    const optimisticEntry = {
      username,
      text: finalText,
      timestamp: BigInt(Date.now() * 1_000_000),
      key: optimisticKey,
    };

    setText("");
    setMediaPreview(null);
    setOptimisticMessages((prev) => [...prev, optimisticEntry]);
    setIsSending(true);

    try {
      await sendMutation.mutateAsync({ username, text: finalText });
      setOptimisticMessages((prev) =>
        prev.filter((m) => m.key !== optimisticKey),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendSystemMessage = async (msg: string) => {
    try {
      await sendMutation.mutateAsync({ username, text: msg });
      qc.invalidateQueries({ queryKey: ["messages", roomId] });
    } catch {
      // silent
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSaveEdit = (key: string) => {
    setLocalEdits((prev) => ({ ...prev, [key]: editText }));
    setEditingId(null);
    setEditText("");
  };

  return (
    <div
      className="relative flex h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 10%, oklch(0.13 0.05 280) 0%, oklch(0.08 0.025 260) 50%, oklch(0.06 0.02 280) 100%)",
      }}
    >
      {/* Background image overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(/assets/uploads/IMG_20260312_155116-1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
        }}
      />

      {onRename && <UsernameTopBar username={username} onRename={onRename} />}
      {/* Main chat area */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0 pt-10">
        <header
          className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{
            borderColor: "oklch(0.22 0.06 280 / 0.5)",
            background: "oklch(0.1 0.03 275 / 0.9)",
          }}
        >
          <button
            type="button"
            data-ocid="chat.back.button"
            onClick={onBack}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: "oklch(0.15 0.04 275)",
              border: "1px solid oklch(0.22 0.06 280 / 0.5)",
              color: "oklch(0.75 0.06 280)",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{roomEmoji}</span>
            <div>
              <h2
                className="font-display font-bold text-lg"
                style={{ color: "oklch(0.92 0.04 280)" }}
              >
                {roomName}
              </h2>
              <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
                {messages.length} messages
              </p>
            </div>
          </div>

          {/* Right side: online count + RPS + members toggle */}
          <div className="ml-auto flex items-center gap-3">
            <RPSGame
              roomId={roomId}
              username={username}
              onSendMessage={handleSendSystemMessage}
            />
            <button
              type="button"
              data-ocid="chat.members.toggle"
              onClick={() => setShowMembers((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 hover:scale-105"
              style={{
                background: showMembers
                  ? "oklch(0.65 0.28 305 / 0.2)"
                  : "oklch(0.16 0.04 275)",
                border: showMembers
                  ? "1px solid oklch(0.65 0.28 305 / 0.5)"
                  : "1px solid oklch(0.22 0.06 280 / 0.5)",
                color: showMembers
                  ? "oklch(0.85 0.15 305)"
                  : "oklch(0.65 0.06 280)",
              }}
            >
              <Users size={14} />
              <span>
                {onlineUsers.length > 0 ? onlineUsers.length : ""} online
              </span>
            </button>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: "oklch(0.78 0.15 85)" }}
            >
              <Sparkles size={14} />
              <span className="hidden sm:inline">{username}</span>
            </div>
          </div>
        </header>

        {extraPanel && (
          <div
            className="flex-shrink-0 px-4 py-3 border-b"
            style={{
              borderColor: "oklch(0.22 0.06 280 / 0.5)",
              background: "oklch(0.1 0.03 275 / 0.5)",
            }}
          >
            {extraPanel}
          </div>
        )}

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3 fantasy-scrollbar"
        >
          {isLoading && (
            <div className="text-center py-8" data-ocid="chat.loading_state">
              <div
                className="inline-flex items-center gap-2"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{
                      background: "oklch(0.65 0.28 305)",
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {!isLoading &&
            messages.length === 0 &&
            optimisticMessages.length === 0 && (
              <div className="text-center py-16" data-ocid="chat.empty_state">
                <div className="text-4xl mb-3">✨</div>
                <p style={{ color: "oklch(0.45 0.04 280)" }}>
                  No messages yet. Be the first to speak!
                </p>
              </div>
            )}
          {messages.map((msg, i) => {
            const msgKey = `${msg.username}-${String(msg.timestamp)}-${i}`;
            const isOwn = msg.username === username;
            const color = getUserColor(msg.username);
            const displayText = localEdits[msgKey] ?? msg.text;
            const isEditing = editingId === msgKey;

            return (
              <div
                key={msgKey}
                data-ocid={`chat.item.${i + 1}`}
                className={`group relative flex items-start gap-3 ${
                  isOwn ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: `${color}30`,
                    border: `1px solid ${color}60`,
                    color,
                  }}
                >
                  {msg.username.charAt(0).toUpperCase()}
                </div>
                <div
                  className={`max-w-xs sm:max-w-md ${
                    isOwn ? "items-end" : "items-start"
                  } flex flex-col gap-1`}
                >
                  <span
                    className="text-xs font-medium"
                    style={{
                      color: isOwn ? "oklch(0.78 0.15 85)" : color,
                    }}
                  >
                    {msg.username}
                  </span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="px-3 py-1.5 rounded-xl text-sm"
                        style={{
                          background: "oklch(0.16 0.05 275)",
                          border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                          color: "oklch(0.9 0.03 280)",
                          outline: "none",
                          minWidth: "160px",
                        }}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(msgKey);
                          if (e.key === "Escape") {
                            setEditingId(null);
                            setEditText("");
                          }
                        }}
                        // biome-ignore lint/a11y/noAutofocus: inline edit needs focus
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(msgKey)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: "oklch(0.65 0.28 305 / 0.3)",
                          color: "oklch(0.9 0.1 305)",
                          border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                        }}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{
                          background: "oklch(0.2 0.04 280)",
                          color: "oklch(0.6 0.05 280)",
                          border: "1px solid oklch(0.3 0.06 280 / 0.5)",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: isOwn
                          ? "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.3), oklch(0.6 0.25 250 / 0.3))"
                          : "oklch(0.14 0.04 275)",
                        border: `1px solid ${
                          isOwn
                            ? "oklch(0.65 0.28 305 / 0.4)"
                            : "oklch(0.22 0.06 280 / 0.5)"
                        }`,
                        color: "oklch(0.9 0.03 280)",
                        borderRadius: isOwn
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {displayText}
                    </div>
                  )}
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.4 0.04 280)" }}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>

                {/* Hover action buttons */}
                <div
                  className={`absolute top-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${
                    isOwn ? "left-10" : "right-0"
                  }`}
                >
                  {/* Reply button */}
                  <button
                    type="button"
                    onClick={() =>
                      setReplyTo({ username: msg.username, text: msg.text })
                    }
                    className="px-2 py-0.5 rounded-lg text-xs"
                    style={{
                      background: "oklch(0.16 0.04 275)",
                      border: "1px solid oklch(0.28 0.08 280 / 0.5)",
                      color: "oklch(0.65 0.12 280)",
                    }}
                    title="Reply"
                  >
                    ↩
                  </button>
                  {/* Edit button — own messages only */}
                  {isOwn && !isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(msgKey);
                        setEditText(displayText);
                      }}
                      className="px-2 py-0.5 rounded-lg text-xs flex items-center gap-1"
                      style={{
                        background: "oklch(0.16 0.04 275)",
                        border: "1px solid oklch(0.28 0.08 280 / 0.5)",
                        color: "oklch(0.65 0.12 280)",
                      }}
                      title="Edit"
                    >
                      <Pencil size={11} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Optimistic messages */}
          {optimisticMessages.map((msg) => {
            const color = getUserColor(msg.username);
            return (
              <div
                key={msg.key}
                className="flex items-start gap-3 flex-row-reverse"
                style={{ opacity: 0.7 }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: `${color}30`,
                    border: `1px solid ${color}60`,
                    color,
                  }}
                >
                  {msg.username.charAt(0).toUpperCase()}
                </div>
                <div className="items-end flex flex-col gap-1 max-w-xs sm:max-w-md">
                  <span
                    className="text-xs font-medium"
                    style={{ color: "oklch(0.78 0.15 85)" }}
                  >
                    {msg.username}
                  </span>
                  <div
                    className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.2), oklch(0.6 0.25 250 / 0.2))",
                      border: "1px solid oklch(0.65 0.28 305 / 0.3)",
                      color: "oklch(0.9 0.03 280)",
                      borderRadius: "18px 18px 4px 18px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}
                  </div>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.4 0.04 280)" }}
                  >
                    sending…
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="flex-shrink-0 px-4 py-4 border-t"
          style={{
            borderColor: "oklch(0.22 0.06 280 / 0.5)",
            background: "oklch(0.1 0.03 275 / 0.9)",
          }}
        >
          {/* Reply preview bar */}
          {replyTo && (
            <div
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs"
              style={{
                background: "oklch(0.14 0.04 275)",
                border: "1px solid oklch(0.65 0.28 305 / 0.3)",
                color: "oklch(0.75 0.06 280)",
              }}
            >
              <span style={{ color: "oklch(0.65 0.28 305)" }}>↩</span>
              <span>
                Replying to{" "}
                <b style={{ color: "oklch(0.85 0.15 305)" }}>
                  {replyTo.username}
                </b>
                : {replyTo.text.slice(0, 50)}
                {replyTo.text.length > 50 ? "…" : ""}
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                style={{ marginLeft: "auto", color: "oklch(0.5 0.05 280)" }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Media preview */}
          {mediaPreview && (
            <div
              className="flex items-center gap-2 mb-2 p-2 rounded-lg"
              style={{
                background: "oklch(0.14 0.04 275)",
                border: "1px solid oklch(0.65 0.28 305 / 0.3)",
              }}
            >
              {mediaPreview.type.startsWith("video/") ? (
                // biome-ignore lint/a11y/useMediaCaption: preview only
                <video
                  src={mediaPreview.url}
                  className="h-16 rounded-lg object-cover"
                  style={{ maxWidth: "120px" }}
                />
              ) : (
                <img
                  src={mediaPreview.url}
                  alt="preview"
                  className="h-16 rounded-lg object-cover"
                  style={{ maxWidth: "120px" }}
                />
              )}
              <span
                className="text-xs flex-1"
                style={{ color: "oklch(0.65 0.08 280)" }}
              >
                Media ready to send
              </span>
              <button
                type="button"
                onClick={() => setMediaPreview(null)}
                className="p-1 rounded-lg"
                style={{ color: "oklch(0.5 0.05 280)" }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex gap-2 items-center">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            {/* Paperclip / media upload button */}
            <button
              type="button"
              data-ocid="chat.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0"
              style={{
                background: mediaPreview
                  ? "oklch(0.65 0.28 305 / 0.2)"
                  : "oklch(0.15 0.04 275)",
                border: mediaPreview
                  ? "1px solid oklch(0.65 0.28 305 / 0.5)"
                  : "1px solid oklch(0.28 0.08 280 / 0.6)",
                color: mediaPreview
                  ? "oklch(0.85 0.15 305)"
                  : "oklch(0.55 0.06 280)",
              }}
              title="Attach photo or video"
            >
              <Paperclip size={16} />
            </button>

            <Input
              data-ocid="chat.input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cast your message..."
              className="flex-1 rounded-xl border-0 focus-visible:ring-1"
              style={{
                background: "oklch(0.14 0.04 275)",
                border: "1px solid oklch(0.28 0.08 280 / 0.6)",
                color: "oklch(0.9 0.03 280)",
                outline: "none",
              }}
              disabled={isSending}
            />
            <Button
              type="button"
              data-ocid="chat.submit_button"
              onClick={handleSend}
              disabled={(!text.trim() && !mediaPreview) || isSending}
              className="rounded-xl px-4 py-2 font-medium transition-all duration-200"
              style={{
                background:
                  text.trim() || mediaPreview
                    ? "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.6 0.25 250))"
                    : "oklch(0.18 0.04 275)",
                color: "oklch(0.95 0.02 280)",
                border: "none",
                boxShadow:
                  text.trim() || mediaPreview
                    ? "0 0 16px oklch(0.65 0.28 305 / 0.4)"
                    : "none",
              }}
            >
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      {/* Online Members Panel */}
      <AnimatePresence>
        {showMembers && (
          <motion.aside
            data-ocid="chat.members.panel"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            className="relative z-10 w-64 flex-shrink-0 flex flex-col border-l"
            style={{
              borderColor: "oklch(0.22 0.06 280 / 0.5)",
              background:
                "linear-gradient(180deg, oklch(0.11 0.04 280 / 0.97) 0%, oklch(0.09 0.03 270 / 0.97) 100%)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "oklch(0.22 0.06 280 / 0.4)" }}
            >
              <div className="flex items-center gap-2">
                <Users size={14} style={{ color: "oklch(0.65 0.28 305)" }} />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.85 0.06 280)" }}
                >
                  Online Members
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowMembers(false)}
                className="p-1 rounded-lg transition-colors hover:opacity-70"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                <X size={14} />
              </button>
            </div>

            <div
              className="flex items-center gap-2 px-4 py-2 border-b"
              style={{ borderColor: "oklch(0.18 0.05 280 / 0.4)" }}
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.7 0.25 140)" }}
              />
              <span className="text-xs" style={{ color: "oklch(0.6 0.1 140)" }}>
                {onlineUsers.length} online now
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="px-3 py-3 space-y-1">
                {onlineUsers.length === 0 && (
                  <p
                    className="text-xs text-center py-6"
                    style={{ color: "oklch(0.45 0.04 280)" }}
                  >
                    No one online yet
                  </p>
                )}
                {onlineUsers.map((user, i) => {
                  const color = getUserColor(user);
                  const isMe = user === username;
                  return (
                    <motion.div
                      key={user}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg"
                      style={{
                        background: isMe
                          ? "oklch(0.65 0.28 305 / 0.1)"
                          : "oklch(0.14 0.04 275 / 0.5)",
                        border: isMe
                          ? "1px solid oklch(0.65 0.28 305 / 0.3)"
                          : "1px solid transparent",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 relative"
                        style={{
                          background: `${color}25`,
                          border: `1px solid ${color}60`,
                          color,
                        }}
                      >
                        {user.charAt(0).toUpperCase()}
                        <span
                          className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                          style={{
                            background: "oklch(0.7 0.25 140)",
                            borderColor: "oklch(0.11 0.04 280)",
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{
                            color: isMe
                              ? "oklch(0.85 0.15 305)"
                              : "oklch(0.82 0.05 280)",
                          }}
                        >
                          {user}
                          {isMe && (
                            <span
                              className="ml-1.5 text-xs"
                              style={{ color: "oklch(0.6 0.1 305)" }}
                            >
                              (you)
                            </span>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
