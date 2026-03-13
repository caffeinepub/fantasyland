import { Sparkles } from "lucide-react";
import { useState } from "react";
import type { Room } from "../App";
import { useOnlineCount } from "../hooks/useQueries";
import PrivateRoomModal from "./PrivateRoomModal";
import RoleplayEntryModal from "./RoleplayEntryModal";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  username: string;
  onEnterRoom: (room: Room) => void;
  onRename: () => void;
}

function OnlineBadge({ roomId }: { roomId: string }) {
  const { data: count } = useOnlineCount(roomId);
  const n = count ? Number(count) : 0;
  if (!n) return null;
  return (
    <span
      className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        background: "oklch(0.18 0.06 140 / 0.5)",
        border: "1px solid oklch(0.55 0.2 140 / 0.5)",
        color: "oklch(0.75 0.2 140)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full animate-pulse"
        style={{ background: "oklch(0.7 0.25 140)" }}
      />
      {n} online
    </span>
  );
}

const rooms = [
  {
    id: "stranger" as const,
    countId: "matchmaking",
    title: "1v1 Stranger Chat",
    desc: "Get matched with a random wanderer",
    emoji: "👥",
    glow: "oklch(0.7 0.28 330)",
    border: "oklch(0.7 0.28 330 / 0.4)",
    iconColor: "oklch(0.78 0.22 340)",
    tag: "#1 LIVE MATCH",
  },
  {
    id: "world" as const,
    countId: "world",
    title: "World Chat",
    desc: "Chat with everyone in the fantasy world",
    emoji: "🌍",
    glow: "oklch(0.6 0.25 250)",
    border: "oklch(0.6 0.25 250 / 0.4)",
    iconColor: "oklch(0.72 0.2 200)",
    tag: "#2 PUBLIC",
  },
  {
    id: "social-media" as const,
    countId: "social-media",
    title: "Social Media",
    desc: "Post photos, videos, blogs and connect",
    emoji: "📱",
    glow: "oklch(0.7 0.28 330)",
    border: "oklch(0.7 0.28 330 / 0.4)",
    iconColor: "oklch(0.78 0.22 340)",
    tag: "#3 SOCIAL",
  },
  {
    id: "private" as const,
    countId: "private-meta",
    title: "Private Room",
    desc: "Create or join with a secret code",
    emoji: "🔒",
    glow: "oklch(0.65 0.28 305)",
    border: "oklch(0.65 0.28 305 / 0.4)",
    iconColor: "oklch(0.75 0.22 320)",
    tag: "CODED",
  },
  {
    id: "truth-dare" as const,
    countId: "truth-dare",
    title: "Truth or Dare",
    desc: "Spin the wheel of fate",
    emoji: "🔥",
    glow: "oklch(0.65 0.22 50)",
    border: "oklch(0.65 0.22 50 / 0.4)",
    iconColor: "oklch(0.72 0.22 55)",
    tag: "DARING",
  },
  {
    id: "roleplay" as const,
    countId: "roleplay",
    title: "Roleplay Room",
    desc: "Become someone else entirely",
    emoji: "🎭",
    glow: "oklch(0.78 0.15 85)",
    border: "oklch(0.78 0.15 85 / 0.4)",
    iconColor: "oklch(0.8 0.18 140)",
    tag: "PERSONA",
  },
  {
    id: "chill" as const,
    countId: "chill",
    title: "Chill Lounge",
    desc: "Relax and vibe with others",
    emoji: "☕",
    glow: "oklch(0.7 0.2 180)",
    border: "oklch(0.7 0.2 180 / 0.4)",
    iconColor: "oklch(0.72 0.18 185)",
    tag: "RELAXED",
  },
  {
    id: "game" as const,
    countId: "gamezone",
    title: "Game Zone",
    desc: "Play games solo or challenge others",
    emoji: "🎮",
    glow: "oklch(0.65 0.22 50)",
    border: "oklch(0.65 0.22 50 / 0.4)",
    iconColor: "oklch(0.78 0.2 55)",
    tag: "PLAY",
  },
];

const FANTASY_LETTERS = "FantasyLand".split("").map((char, i) => ({ char, i }));

export default function Lobby({ username, onEnterRoom, onRename }: Props) {
  const [showPrivate, setShowPrivate] = useState(false);
  const [showRoleplay, setShowRoleplay] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);

  const handleRoomClick = (id: string) => {
    if (id === "private") setShowPrivate(true);
    else if (id === "roleplay") setShowRoleplay(true);
    else if (id === "world") onEnterRoom({ type: "world" });
    else if (id === "truth-dare") onEnterRoom({ type: "truth-dare" });
    else if (id === "stranger") onEnterRoom({ type: "stranger", roomId: "" });
    else if (id === "chill") onEnterRoom({ type: "chill" });
    else if (id === "game") onEnterRoom({ type: "game" });
    else if (id === "social-media") onEnterRoom({ type: "social-media" });
  };

  return (
    <div
      className="min-h-screen stars-bg relative overflow-hidden pb-20"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.14 0.06 280) 0%, oklch(0.09 0.03 260) 40%, oklch(0.07 0.02 280) 100%)",
      }}
    >
      <UsernameTopBar username={username} onRename={onRename} />
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            top: "-200px",
            left: "-100px",
            background:
              "radial-gradient(circle, oklch(0.65 0.28 305 / 0.08) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            bottom: "-150px",
            right: "-100px",
            background:
              "radial-gradient(circle, oklch(0.7 0.28 330 / 0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "400px",
            height: "400px",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle, oklch(0.7 0.2 180 / 0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "oklch(0.22 0.06 280 / 0.5)" }}
      >
        <div className="flex items-center gap-0">
          {FANTASY_LETTERS.map(({ char, i }) => (
            <span
              key={`header-${i}`}
              className="font-display text-sm font-black"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.04 280) 0%, oklch(0.78 0.15 85) 40%, oklch(0.85 0.28 305) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                display: "inline-block",
              }}
            >
              {char}
            </span>
          ))}
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.65 0.28 305 / 0.3)",
            color: "oklch(0.78 0.15 85)",
            boxShadow: "0 0 12px oklch(0.65 0.28 305 / 0.15)",
          }}
        >
          <Sparkles size={14} />
          <span>{username}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room, idx) => {
              const isHovered = hoveredRoom === room.id;
              const isGameZone = room.id === "game";
              return (
                <button
                  type="button"
                  key={room.id}
                  data-ocid={
                    isGameZone ? "gamezone.card" : `lobby.room.${idx + 1}`
                  }
                  className="group relative rounded-xl p-6 text-left cursor-pointer transition-all duration-300 overflow-hidden"
                  style={{
                    background: isHovered
                      ? `radial-gradient(ellipse at 30% 30%, ${room.glow}18 0%, oklch(0.12 0.035 275) 60%)`
                      : "oklch(0.12 0.035 275)",
                    border: `1px solid ${
                      isHovered ? room.border : "oklch(0.22 0.06 280 / 0.5)"
                    }`,
                    boxShadow: isHovered
                      ? `0 0 30px ${room.glow}30, 0 8px 32px oklch(0 0 0 / 0.4)`
                      : "0 4px 16px oklch(0 0 0 / 0.3)",
                    transform: isHovered
                      ? "translateY(-4px) scale(1.01)"
                      : "translateY(0) scale(1)",
                  }}
                  onMouseEnter={() => setHoveredRoom(room.id)}
                  onMouseLeave={() => setHoveredRoom(null)}
                  onClick={() => handleRoomClick(room.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="text-xs font-bold tracking-widest px-2 py-1 rounded-full"
                      style={{
                        background: `${room.glow}20`,
                        color: room.iconColor,
                        border: `1px solid ${room.border}`,
                      }}
                    >
                      {room.tag}
                    </span>
                    <OnlineBadge roomId={room.countId} />
                  </div>
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-3xl"
                    style={{
                      background: `${room.glow}15`,
                      border: `1px solid ${room.border}`,
                      boxShadow: isHovered ? `0 0 20px ${room.glow}40` : "none",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    {room.emoji}
                  </div>
                  <h3
                    className="font-display text-xl font-bold mb-1"
                    style={{ color: "oklch(0.92 0.04 280)" }}
                  >
                    {room.title}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: "oklch(0.6 0.06 280)" }}
                  >
                    {room.desc}
                  </p>
                  {isHovered && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background: `linear-gradient(135deg, ${room.glow}08 0%, transparent 50%)`,
                        borderRadius: "inherit",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tagline at bottom */}
          <div className="text-center mt-16 mb-4">
            <p
              className="text-lg font-medium mb-1"
              style={{ color: "oklch(0.78 0.15 85)" }}
            >
              Welcome the new world of
            </p>
            <h1
              className="font-display text-4xl sm:text-5xl font-black tracking-widest uppercase"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.04 280) 0%, oklch(0.78 0.15 85) 40%, oklch(0.85 0.28 305) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FANTASY
            </h1>
          </div>
        </div>
      </main>

      <footer
        className="relative z-10 text-center py-6 text-xs"
        style={{ color: "oklch(0.45 0.04 280)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      {showPrivate && (
        <PrivateRoomModal
          onClose={() => setShowPrivate(false)}
          onEnter={(code) => {
            setShowPrivate(false);
            onEnterRoom({ type: "private", roomId: code });
          }}
        />
      )}
      {showRoleplay && (
        <RoleplayEntryModal
          onClose={() => setShowRoleplay(false)}
          onEnter={(persona) => {
            setShowRoleplay(false);
            onEnterRoom({ type: "roleplay", persona });
          }}
        />
      )}
    </div>
  );
}
