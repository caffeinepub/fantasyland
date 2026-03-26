// Speech Recognition type declarations
interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}
interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList;
  readonly resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Camera,
  Check,
  Gamepad2,
  MessageSquarePlus,
  Mic,
  Paperclip,
  Pencil,
  Send,
  Smile,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTheme } from "../contexts/ThemeContext";
import { playMessageSound } from "../hooks/useNotificationSound";
import { usePresence } from "../hooks/usePresence";
import {
  useFriendRequestStatus,
  useJoinRPSGame,
  useMessages,
  useOnlineUsers,
  useSendFriendRequest,
  useSendMessage,
} from "../hooks/useQueries";
import CameraModal from "./CameraModal";
import NumberGuess from "./NumberGuess";
import QuickDMModal from "./QuickDMModal";
import TicTacToe from "./TicTacToe";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  isStranger?: boolean;
  roomId: string;
  roomName: string;
  roomEmoji: string;
  username: string;
  onBack: () => void;
  onRename?: () => void;
  extraPanel?: React.ReactNode;
  onStartDm?: (roomId: string, friendName: string) => void;
  onSkip?: () => void;
  onGoToGameZone?: () => void;
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

const EMOJIS = [
  "😀",
  "😂",
  "😄",
  "😆",
  "😉",
  "😍",
  "😘",
  "😜",
  "🤣",
  "🥰",
  "😱",
  "😢",
  "😡",
  "🤔",
  "😎",
  "🤓",
  "❤️",
  "💕",
  "💖",
  "💜",
  "💛",
  "💚",
  "💙",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👋",
  "✌️",
  "🤞",
  "💪",
  "🎉",
  "🔥",
  "⭐",
  "🌟",
  "⚡",
  "🌈",
  "🦄",
  "🐉",
  "🐶",
];

// AI Bot responses
function getBotReply(msg: string): string {
  const m = msg.toLowerCase();
  const greetings = [
    "Hey there! 👋 Great to chat with you!",
    "Hello! I'm FantasyBot 🤖, your AI companion!",
    "Hi! Ready for a fun conversation? 😄",
    "Hey! What's on your mind?",
  ];
  const howAreYou = [
    "I'm doing fantastic, thanks for asking! 🌟",
    "Feeling electric today! ⚡ How about you?",
    "Running at full power! 💫 And you?",
    "Couldn't be better! 🎉 What about yourself?",
  ];
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything! 😂",
    "I told my computer I needed a break. Now it won't stop sending me Kit-Kat ads! 🍫",
    "Why do programmers prefer dark mode? Because light attracts bugs! 🐛",
    "What do you call a fake noodle? An impasta! 🍝",
    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
  ];
  const facts = [
    "🌟 Did you know honey never spoils? Archaeologists found 3000-year-old honey in Egyptian tombs!",
    "🐙 Octopuses have 3 hearts and blue blood!",
    "🌍 A day on Venus is longer than a year on Venus!",
    "🦋 Butterflies taste with their feet!",
    "⚡ Lightning strikes Earth about 100 times per second!",
  ];
  const riddles = [
    "🧩 I have cities, but no houses live there. Mountains, but no trees. Water, but no fish. What am I? (A map!)",
    "🤔 What has hands but can't clap? (A clock!)",
    "💡 The more you take, the more you leave behind. What am I? (Footsteps!)",
  ];
  const motivational = [
    "You're capable of amazing things! Keep going! 💪",
    "Every expert was once a beginner. Keep learning! 🌱",
    "Your potential is limitless! ✨",
    "Dream big, work hard, stay focused! 🎯",
  ];
  const compliments = [
    "You seem really cool to talk to! 😎",
    "I love your curiosity! 🌟",
    "You ask great questions!",
    "You've got great energy! ⚡",
  ];
  const bored = [
    "Let's play a game! Ask me a riddle 🧩 or tell me to share a fun fact!",
    "We could chat about anything! Ask me for a joke or a fun fact 😄",
    "How about I tell you something interesting? Ask me for a fun fact!",
  ];
  const age = [
    "I'm an AI, so technically I'm always the age I was created! 🤖",
    "Age is just a number for humans — for bots, it's just a version number! 😄",
  ];
  const location = [
    "I exist everywhere on the internet! 🌐 I'm in the cloud ☁️",
    "I'm wherever you need me to be! 🌍",
  ];
  const name = [
    "I'm FantasyBot 🤖 — your AI chat companion in FantasyLand!",
    "Call me FantasyBot! Here to chat, joke, and share fun facts 🌟",
  ];
  const random = [
    "That's interesting! Tell me more 🤔",
    "Cool! What else is on your mind? 💭",
    "I like where this is going! 😄",
    "Fascinating! 🌟",
    "Ha! That made me smile 😊",
    "You're keeping me on my toes! ⚡",
    "Love that energy! 🔥",
    "Tell me more!",
    "Interesting perspective! 🧠",
    "That's awesome! 🎉",
  ];

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  if (m.match(/\b(hi|hello|hey|sup|yo|howdy)\b/)) return pick(greetings);
  if (
    m.match(/how are you|how r u|how do you feel|how's it going|hows it going/)
  )
    return pick(howAreYou);
  if (m.match(/joke|funny|laugh|lol|haha/)) return pick(jokes);
  if (m.match(/fact|did you know|tell me something|interesting/))
    return pick(facts);
  if (m.match(/riddle|puzzle|brain/)) return pick(riddles);
  if (m.match(/motivat|inspire|encourage|sad|depress|down/))
    return pick(motivational);
  if (m.match(/compliment|nice|beautiful|pretty|handsome|smart/))
    return pick(compliments);
  if (m.match(/bore|bored|boring|nothing to do/)) return pick(bored);
  if (m.match(/\bage\b|how old|years old/)) return pick(age);
  if (m.match(/where are you|location|from|country|city/))
    return pick(location);
  if (m.match(/your name|who are you|what are you|what is your name/))
    return pick(name);
  if (m.match(/bye|goodbye|cya|see you|later/))
    return "Goodbye! Come chat anytime 👋🌟";
  if (m.match(/thank|thanks|thx/))
    return "You're welcome! Always happy to help 😊✨";
  if (m.match(/love|like you|you're great/))
    return "Aww, you're making me blush! 🤖❤️";
  if (m.match(/game|play|challenge/))
    return "I'd love to play! Check out the games menu in the chat bar 🎮";
  if (m.match(/help|what can you do/))
    return "I can chat, tell jokes 😂, share fun facts 🌟, give riddles 🧩, motivate you 💪, and more! Just talk to me!";
  return pick(random);
}

export default function ChatRoom({
  roomId,
  roomName,
  roomEmoji,
  username,
  onBack,
  onRename: _onRename,
  isStranger = false,
  extraPanel,
  onStartDm,
  onSkip,
}: Props) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const { tokens } = useTheme();
  const [showMembers, setShowMembers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMsgCount = useRef(0);

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

  // Games menu & active game
  const [activeGame, setActiveGame] = useState<"rps" | "ttt" | "ng" | null>(
    null,
  );

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Camera modal
  const [showCameraModal, setShowCameraModal] = useState(false);

  // Voice recording (hold to record)
  const [isRecording, setIsRecording] = useState(false);
  const [pendingVoice, setPendingVoice] = useState<{
    blob: Blob;
    url: string;
    base64: string;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const objectUrl = URL.createObjectURL(blob);
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setPendingVoice({ blob, url: objectUrl, base64 });
        };
        reader.readAsDataURL(blob);
        for (const t of stream.getTracks()) t.stop();
        recordingStreamRef.current = null;
      };
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const sendVoice = async () => {
    if (!pendingVoice) return;
    try {
      await sendMutation.mutateAsync({
        username,
        text: "",
        voiceUrl: pendingVoice.base64,
      });
    } catch {
      // silent
    }
    URL.revokeObjectURL(pendingVoice.url);
    setPendingVoice(null);
  };

  const cancelVoice = () => {
    if (pendingVoice) URL.revokeObjectURL(pendingVoice.url);
    setPendingVoice(null);
  };

  // Show "stranger connected" banner for 1v1 rooms
  useEffect(() => {
    if (isStranger && sessionStorage.getItem("justMatched") === "true") {
      sessionStorage.removeItem("justMatched");
      setShowStrangerBanner(true);
      const t = setTimeout(() => setShowStrangerBanner(false), 3500);
      return () => clearTimeout(t);
    }
  }, [isStranger]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      mediaRecorderRef.current?.stop();
      for (const t of recordingStreamRef.current?.getTracks() ?? []) t.stop();
    };
  }, []);

  // AI Bot mode
  const isAiBot = roomId.startsWith("ai-bot-");
  const [showStrangerBanner, setShowStrangerBanner] = useState(false);
  const [strangerName, setStrangerName] = useState("A stranger");
  // Friend request popup
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [botMessages, setBotMessages] = useState<
    Array<{ username: string; text: string; timestamp: bigint; key: string }>
  >([]);
  const [botTyping, setBotTyping] = useState(false);

  // Optimistic messages
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{ username: string; text: string; timestamp: bigint; key: string }>
  >([]);

  const { data: backendMessages = [], isLoading: backendLoading } = useMessages(
    isAiBot ? "__disabled__" : roomId,
  );
  const messages = isAiBot ? botMessages : backendMessages;
  const isLoading = isAiBot ? false : backendLoading;
  const sendMutation = useSendMessage(roomId);
  const joinRPS = useJoinRPSGame();
  const { data: backendOnlineUsers = [] } = useOnlineUsers(
    isAiBot ? "__disabled__" : roomId,
  );
  const onlineUsers = isAiBot ? [username, "FantasyBot"] : backendOnlineUsers;
  const qc = useQueryClient();
  const sendFriendReqMutation = useSendFriendRequest();

  useEffect(() => {
    if (!isAiBot) return;
    setBotMessages([
      {
        username: "FantasyBot 🤖",
        text: "Hey there! 👋 I'm FantasyBot, your AI companion! Ask me anything — jokes, facts, riddles, or just chat!",
        timestamp: BigInt(Date.now() * 1_000_000),
        key: "bot-welcome",
      },
    ]);
  }, [isAiBot]);

  usePresence(isAiBot ? "" : roomId, username);

  // Track stranger's name from online users
  useEffect(() => {
    if (!isStranger) return;
    const other = onlineUsers.find((u) => u !== username);
    if (other) setStrangerName(other);
  }, [isStranger, onlineUsers, username]);

  // Sound notification for new messages
  useEffect(() => {
    if (messages.length > prevMsgCount.current) {
      const latest = messages[messages.length - 1];
      if (latest && latest.username !== username) {
        playMessageSound();
      }
      prevMsgCount.current = messages.length;
    }
  }, [messages, username]);

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

    // AI Bot mode: local messages + auto reply
    if (isAiBot) {
      const userMsg = {
        username,
        text: trimmed,
        timestamp: BigInt(Date.now() * 1_000_000),
        key: `user-${Date.now()}`,
      };
      setText("");
      setMediaPreview(null);
      setBotMessages((prev) => [...prev, userMsg]);
      setBotTyping(true);
      const delay = 800 + Math.random() * 700;
      setTimeout(() => {
        const botReply = getBotReply(trimmed);
        const botMsg = {
          username: "FantasyBot 🤖",
          text: botReply,
          timestamp: BigInt(Date.now() * 1_000_000),
          key: `bot-${Date.now()}`,
        };
        setBotMessages((prev) => [...prev, botMsg]);
        setBotTyping(false);
      }, delay);
      return;
    }

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

  const _handleSendSystemMessage = async (msg: string) => {
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
        background: "var(--fl-bg)",
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

      {/* Main chat area */}
      <div className="relative z-10 flex flex-col flex-1 min-w-0">
        {/* Stranger connected banner */}
        <AnimatePresence>
          {showStrangerBanner && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.25 305 / 0.95) 0%, oklch(0.5 0.22 340 / 0.95) 100%)",
                boxShadow: "0 4px 32px oklch(0.65 0.28 305 / 0.4)",
              }}
            >
              <span className="text-xl mr-2">🎉</span>
              <span className="font-bold text-white text-sm tracking-wide">
                {strangerName} has joined the chat! Say hello! 👋
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <header
          className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{
            borderColor: tokens.border,
            background: tokens.headerBg,
          }}
        >
          <button
            type="button"
            data-ocid="chat.back.button"
            onClick={onBack}
            className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              background: tokens.isDark ? "oklch(0.15 0.04 275)" : "#f1f5f9",
              border: `1px solid ${tokens.border}`,
              color: tokens.textMuted,
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{roomEmoji}</span>
            <div>
              <h2
                className="font-display font-bold text-lg"
                style={{ color: tokens.text }}
              >
                {roomName}
              </h2>
              <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
                {messages.length} messages
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              data-ocid="chatroom.quick_dm.button"
              onClick={() => setShowDM(true)}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{
                background: tokens.isDark ? "oklch(0.15 0.04 275)" : "#f1f5f9",
                border: `1px solid ${tokens.border}`,
                color: tokens.textMuted,
              }}
              title="Quick Private Message"
            >
              <MessageSquarePlus size={16} />
            </button>

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
            {isStranger && onSkip && (
              <button
                type="button"
                data-ocid="chat.skip.button"
                onClick={onSkip}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
                style={{
                  background: "oklch(0.55 0.25 25 / 0.15)",
                  border: "1px solid oklch(0.6 0.25 25 / 0.5)",
                  color: "oklch(0.78 0.22 30)",
                }}
              >
                ⏭ Skip
              </button>
            )}
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
                <button
                  type="button"
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer"
                  style={{
                    background: `${color}30`,
                    border: `1px solid ${color}60`,
                    color,
                  }}
                  onClick={() => {
                    if (!isOwn) setSelectedUser(msg.username);
                  }}
                  tabIndex={isOwn ? -1 : 0}
                >
                  {msg.username.charAt(0).toUpperCase()}
                </button>
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
                        className="px-2 py-1 rounded-lg text-xs font-bold"
                        style={{
                          background: "oklch(0.65 0.28 305)",
                          color: "oklch(0.97 0.02 280)",
                        }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      className="px-4 py-2 rounded-2xl text-sm leading-relaxed"
                      style={{
                        background: isOwn
                          ? "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.25), oklch(0.6 0.25 250 / 0.25))"
                          : "oklch(0.14 0.04 275 / 0.8)",
                        border: isOwn
                          ? "1px solid oklch(0.65 0.28 305 / 0.4)"
                          : "1px solid oklch(0.22 0.06 280 / 0.4)",
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
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.4 0.04 280)" }}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Hover actions */}
                <div
                  className={`absolute top-0 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity ${
                    isOwn ? "left-0" : "right-0"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setReplyTo({ username: msg.username, text: displayText })
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

          {/* Bot typing indicator */}
          {isAiBot && botTyping && (
            <div className="flex items-end gap-2 mb-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.18 175), oklch(0.5 0.2 200))",
                }}
              >
                🤖
              </div>
              <div
                className="px-4 py-2 rounded-2xl rounded-bl-sm"
                style={{
                  background: "oklch(0.18 0.04 275)",
                  border: "1px solid oklch(0.35 0.1 280 / 0.4)",
                }}
              >
                <span
                  className="text-sm"
                  style={{ color: "oklch(0.65 0.08 280)" }}
                >
                  typing...
                </span>
              </div>
            </div>
          )}
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
          {/* Recording indicator */}
          {isRecording && (
            <div
              className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-xs"
              style={{
                background: "oklch(0.55 0.28 20 / 0.15)",
                border: "1px solid oklch(0.55 0.28 20 / 0.4)",
                color: "oklch(0.85 0.2 25)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{
                  background: "oklch(0.65 0.28 20)",
                  animation: "pulse 0.8s ease-in-out infinite",
                }}
              />
              <span className="font-semibold">Recording… Release to send</span>
            </div>
          )}

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
                className="ml-auto"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Media preview */}
          {mediaPreview && (
            <div className="mb-2 relative inline-block">
              {mediaPreview.type.startsWith("video/") ? (
                <video
                  src={mediaPreview.url}
                  className="h-24 rounded-xl object-cover"
                >
                  <track kind="captions" />
                </video>
              ) : (
                <img
                  src={mediaPreview.url}
                  alt="preview"
                  className="h-24 rounded-xl object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => setMediaPreview(null)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                style={{
                  background: "oklch(0.65 0.28 305)",
                  color: "oklch(0.97 0.02 280)",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Input bar */}
          <div
            className="relative flex items-center gap-3 px-4 py-3.5 rounded-full"
            style={{
              background: "oklch(0.13 0.04 275)",
              border: "1px solid oklch(0.22 0.06 280 / 0.6)",
            }}
          >
            {/* Emoji picker button */}
            <div className="relative flex-shrink-0">
              <button
                type="button"
                data-ocid="emoji.toggle"
                onClick={() => {
                  setShowEmojiPicker((v) => !v);
                }}
                className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110"
                style={{
                  color: showEmojiPicker
                    ? "oklch(0.78 0.15 85)"
                    : "oklch(0.5 0.06 280)",
                }}
                title="Emoji"
              >
                <Smile size={22} strokeWidth={1.5} />
              </button>

              {/* Emoji picker panel */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    data-ocid="emoji.panel"
                    initial={{ opacity: 0, scale: 0.85, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 10 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className="absolute bottom-14 left-0 rounded-2xl p-3 z-50"
                    style={{
                      background: "oklch(0.13 0.05 280)",
                      border: "1px solid oklch(0.28 0.08 280 / 0.7)",
                      boxShadow: "0 8px 32px oklch(0 0 0 / 0.5)",
                      width: "220px",
                    }}
                  >
                    <div className="grid grid-cols-8 gap-1">
                      {EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setText((prev) => prev + emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-lg rounded-lg transition-all hover:scale-125 hover:bg-white/10"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Text input */}
            {pendingVoice ? (
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <audio
                  controls
                  src={pendingVoice.url}
                  className="flex-1 h-8 min-w-0 rounded-lg"
                  style={{ filter: "invert(0.8) hue-rotate(240deg)" }}
                >
                  <track kind="captions" />
                </audio>
                <button
                  type="button"
                  data-ocid="chat.voice.send_button"
                  onClick={sendVoice}
                  disabled={sendMutation.isPending}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
                  style={{
                    background: "oklch(0.55 0.22 145)",
                    color: "white",
                    boxShadow: "0 0 12px oklch(0.55 0.22 145 / 0.6)",
                  }}
                  title="Send voice message"
                >
                  <Send size={16} />
                </button>
                <button
                  type="button"
                  data-ocid="chat.voice.cancel_button"
                  onClick={cancelVoice}
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-110 active:scale-95"
                  style={{
                    background: "oklch(0.35 0.08 20)",
                    color: "oklch(0.75 0.12 20)",
                  }}
                  title="Cancel voice message"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <input
                data-ocid="chat.input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isRecording ? "Recording… Release to send" : "Message"
                }
                disabled={isSending}
                className="flex-1 bg-transparent border-none outline-none text-base min-w-0"
                style={{ color: "oklch(0.88 0.03 280)" }}
              />
            )}

            {/* Paperclip attachment */}
            <button
              type="button"
              data-ocid="chat.upload_button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110"
              style={{
                color: mediaPreview
                  ? "oklch(0.85 0.15 305)"
                  : "oklch(0.5 0.06 280)",
              }}
              title="Attach photo or video"
            >
              <Paperclip size={20} strokeWidth={1.5} />
            </button>

            {/* Camera button */}
            <button
              type="button"
              data-ocid="camera.open_modal_button"
              onClick={() => setShowCameraModal(true)}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110"
              style={{ color: "oklch(0.72 0.18 220)" }}
              title="Camera"
            >
              <Camera size={18} strokeWidth={1.5} />
            </button>

            {/* Microphone: hold to record voice message */}
            <button
              type="button"
              data-ocid="chat.mic.toggle"
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              onTouchStart={(e) => {
                e.preventDefault();
                startRecording();
              }}
              onTouchEnd={stopRecording}
              className="flex-shrink-0 p-1.5 rounded-full transition-all hover:scale-110 select-none"
              style={{
                color: isRecording
                  ? "oklch(0.97 0.02 0)"
                  : "oklch(0.5 0.06 280)",
                background: isRecording ? "oklch(0.55 0.28 20)" : "transparent",
                animation: isRecording
                  ? "pulse 0.8s ease-in-out infinite"
                  : "none",
                boxShadow: isRecording
                  ? "0 0 14px oklch(0.65 0.28 20 / 0.7)"
                  : "none",
              }}
              title="Hold to record voice message"
            >
              <Mic size={18} strokeWidth={1.5} />
            </button>

            {/* Send button */}
            {!pendingVoice && (
              <button
                type="button"
                data-ocid="chat.submit_button"
                onClick={handleSend}
                disabled={(!text.trim() && !mediaPreview) || isSending}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40"
                style={{
                  background:
                    text.trim() || mediaPreview
                      ? "linear-gradient(135deg, oklch(0.55 0.28 305), oklch(0.5 0.25 270))"
                      : "linear-gradient(135deg, oklch(0.45 0.22 305), oklch(0.4 0.2 270))",
                  boxShadow:
                    text.trim() || mediaPreview
                      ? "0 0 18px oklch(0.65 0.28 305 / 0.55)"
                      : "none",
                  color: "oklch(0.97 0.02 280)",
                }}
              >
                ➤
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>

      {/* Game overlays */}
      <AnimatePresence>
        {activeGame === "ttt" && (
          <TicTacToe onClose={() => setActiveGame(null)} />
        )}
        {activeGame === "ng" && (
          <NumberGuess onClose={() => setActiveGame(null)} />
        )}
      </AnimatePresence>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onSendPhoto={(dataUrl) => {
          setMediaPreview({ url: dataUrl, type: "image/jpeg" });
        }}
        onSendReel={(videoBlob) => {
          const url = URL.createObjectURL(videoBlob);
          setMediaPreview({ url, type: "video/webm" });
        }}
      />

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
              background: "var(--fl-surface)",
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
                  className="text-sm font-bold"
                  style={{ color: "oklch(0.85 0.06 280)" }}
                >
                  Online ({onlineUsers.length})
                </span>
              </div>
              <button
                type="button"
                data-ocid="chat.members.close_button"
                onClick={() => setShowMembers(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  color: "oklch(0.55 0.06 280)",
                }}
              >
                <X size={12} />
              </button>
            </div>
            {isStranger ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6">
                <span className="text-4xl">👥</span>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.85 0.15 305)" }}
                >
                  {onlineUsers.length}
                </p>
                <p
                  className="text-sm text-center"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  {onlineUsers.length === 1 ? "member" : "members"} online
                </p>
              </div>
            ) : (
              <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                  {onlineUsers.map((user, i) => {
                    const color = getUserColor(user);
                    const isMe = user === username;
                    return (
                      <motion.div
                        key={user}
                        data-ocid={`chat.members.item.${i + 1}`}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
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
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Friend Request Popup */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center pb-32 px-4"
          onClick={() => setSelectedUser(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setSelectedUser(null);
          }}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-5 shadow-2xl"
            style={{
              background: "oklch(0.13 0.05 280)",
              border: "1px solid oklch(0.65 0.28 305 / 0.4)",
              boxShadow: "0 8px 40px oklch(0.65 0.28 305 / 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold"
                style={{
                  background: "oklch(0.65 0.28 305 / 0.2)",
                  border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                  color: "oklch(0.85 0.15 305)",
                }}
              >
                {selectedUser.charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  className="font-bold text-base"
                  style={{ color: "oklch(0.92 0.04 280)" }}
                >
                  {selectedUser}
                </p>
                <p className="text-xs" style={{ color: "oklch(0.5 0.04 280)" }}>
                  Send a friend request to chat privately
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                data-ocid="chat.friend_request.submit_button"
                onClick={async () => {
                  try {
                    const ok = await sendFriendReqMutation.mutateAsync({
                      fromUser: username,
                      toUser: selectedUser,
                    });
                    if (ok) {
                      toast.success(`Friend request sent to ${selectedUser}!`);
                    } else {
                      toast.info(
                        "Request already sent or you are already friends",
                      );
                    }
                  } catch {
                    toast.error("Failed to send friend request");
                  }
                  setSelectedUser(null);
                }}
                disabled={sendFriendReqMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.3), oklch(0.6 0.25 250 / 0.3))",
                  border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                  color: "oklch(0.9 0.08 305)",
                }}
              >
                <UserPlus size={16} />
                {sendFriendReqMutation.isPending ? "Sending..." : "Add Friend"}
              </button>
              <button
                type="button"
                data-ocid="chat.friend_request.cancel_button"
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold"
                style={{
                  background: "oklch(0.15 0.04 275)",
                  border: "1px solid oklch(0.22 0.06 280 / 0.5)",
                  color: "oklch(0.55 0.04 280)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <QuickDMModal
        currentUsername={username}
        open={showDM}
        onClose={() => setShowDM(false)}
        onStartDm={(dmRoomId, targetUsername) => {
          setShowDM(false);
          if (onStartDm) {
            onStartDm(dmRoomId, targetUsername);
          } else {
            onBack();
          }
        }}
      />
    </div>
  );
}
