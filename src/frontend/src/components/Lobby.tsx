import { Home, Play, Search, Send, Sparkles, User } from "lucide-react";
import { useState } from "react";
import type { Room } from "../App";
import { useTheme } from "../contexts/ThemeContext";
import {
  useOnlineCount,
  usePendingFriendRequests,
  useRespondToFriendRequest,
} from "../hooks/useQueries";
import HeaderMenu from "./HeaderMenu";
import PrivateRoomModal from "./PrivateRoomModal";
import QuickDMModal from "./QuickDMModal";
import RoleplayEntryModal from "./RoleplayEntryModal";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  username: string;
  onEnterRoom: (room: Room) => void;
  onRename: () => void;
  onLogout?: () => void;
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
    countId: "",
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

export default function Lobby({
  username,
  onEnterRoom,
  onRename,
  onLogout,
}: Props) {
  const [showPrivate, setShowPrivate] = useState(false);
  const [showRoleplay, setShowRoleplay] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const { tokens } = useTheme();
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [activeNavTab, setActiveNavTab] = useState<
    "home" | "reels" | "direct" | "search" | "profile"
  >("home");

  const { data: pendingFriendReqs = [] } = usePendingFriendRequests(username);
  const respondMutation = useRespondToFriendRequest();
  const pendingIncoming = pendingFriendReqs.filter(
    (r) => r.to === username && r.status === ("pending" as any),
  );

  const handleAccept = (fromUser: string) => {
    respondMutation.mutateAsync({ fromUser, toUser: username, accept: true });
  };

  const handleDecline = (fromUser: string) => {
    respondMutation.mutateAsync({ fromUser, toUser: username, accept: false });
  };

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
        background: tokens.isDark
          ? "radial-gradient(ellipse at 30% 20%, oklch(0.14 0.06 280) 0%, oklch(0.09 0.03 260) 40%, oklch(0.07 0.02 280) 100%)"
          : tokens.bg,
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
        className="relative z-10 flex items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: tokens.border, background: tokens.headerBg }}
      >
        {/* Left: HeaderMenu (unified menu button) */}
        <HeaderMenu
          username={username}
          onStartDm={() => setShowDM(true)}
          onRename={onRename}
          onLogout={onLogout}
          pendingRequests={pendingFriendReqs}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />

        {/* Center: FantasyLand title */}
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

        {/* Right: Username badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: tokens.isDark ? "oklch(0.15 0.04 275)" : tokens.surface,
            border: "1px solid oklch(0.65 0.28 305 / 0.3)",
            color: "oklch(0.78 0.15 85)",
            boxShadow: "0 0 12px oklch(0.65 0.28 305 / 0.15)",
          }}
        >
          <Sparkles size={12} />
          <span className="max-w-[80px] truncate">{username}</span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Tagline at top - Visual Flair Banner */}
          <div
            className="relative text-center mb-10 py-4"
            style={{ isolation: "isolate" }}
          >
            <style>{`
              @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
              @keyframes floatSparkle {
                0% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.8; }
                50% { transform: translateY(-18px) scale(1.2) rotate(15deg); opacity: 1; }
                100% { transform: translateY(0px) scale(1) rotate(0deg); opacity: 0.8; }
              }
              @keyframes glowPulse {
                0%, 100% { opacity: 0.45; transform: scale(0.95); }
                50% { opacity: 0.85; transform: scale(1.08); }
              }
              @keyframes shimmerSweep {
                0% { left: -120%; }
                100% { left: 120%; }
              }
              @keyframes floatUp {
                0% { transform: translateY(0) scale(0.8); opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 0.7; }
                100% { transform: translateY(-55px) scale(0.4); opacity: 0; }
              }
              @keyframes orbitStar {
                0% { transform: rotate(var(--start-angle)) translateX(var(--orbit-r)) rotate(calc(-1 * var(--start-angle))); }
                100% { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(var(--orbit-r)) rotate(calc(-1 * (var(--start-angle) + 360deg))); }
              }
            `}</style>

            {/* Pulsing glow ring behind text */}
            <div
              className="absolute inset-x-0 pointer-events-none"
              style={{
                top: "50%",
                transform: "translateY(-50%)",
                height: "140px",
                background:
                  "radial-gradient(ellipse 65% 60% at 50% 50%, oklch(0.65 0.28 305 / 0.35) 0%, oklch(0.75 0.25 55 / 0.2) 40%, transparent 70%)",
                animation: "glowPulse 2.8s ease-in-out infinite",
                filter: "blur(8px)",
                zIndex: 0,
              }}
            />

            {/* Floating emoji sparkles orbiting the banner */}
            {[
              { emoji: "✨", delay: "0s", dur: "4s", x: "-110px", y: "-10px" },
              { emoji: "⭐", delay: "0.7s", dur: "5s", x: "105px", y: "-15px" },
              {
                emoji: "💫",
                delay: "1.4s",
                dur: "4.5s",
                x: "-80px",
                y: "28px",
              },
              { emoji: "✨", delay: "2s", dur: "3.8s", x: "90px", y: "25px" },
              {
                emoji: "⭐",
                delay: "0.3s",
                dur: "5.5s",
                x: "-130px",
                y: "10px",
              },
              { emoji: "💫", delay: "1.1s", dur: "4.2s", x: "130px", y: "5px" },
              { emoji: "✨", delay: "2.5s", dur: "4.8s", x: "0px", y: "-40px" },
            ].map(({ emoji, delay, dur, x, y }) => (
              <span
                key={`sparkle-${delay}`}
                className="absolute pointer-events-none select-none"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}), calc(-50% + ${y}))`,
                  fontSize: delay < "1s" ? "1.1rem" : "0.85rem",
                  animation: `floatSparkle ${dur} ${delay} ease-in-out infinite`,
                  zIndex: 1,
                  filter: "drop-shadow(0 0 6px oklch(0.85 0.25 85))",
                }}
              >
                {emoji}
              </span>
            ))}

            {/* Rising particle sparkles */}
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={`particle-${i}`}
                className="absolute pointer-events-none select-none"
                style={{
                  left: `${18 + i * 16}%`,
                  bottom: "0",
                  fontSize: "0.75rem",
                  opacity: 0,
                  animation: `floatUp ${2 + i * 0.5}s ${i * 0.7}s ease-out infinite`,
                  zIndex: 1,
                }}
              >
                ✦
              </span>
            ))}

            {/* Subtitle text */}
            <p
              className="relative text-base font-semibold mb-1 tracking-wider"
              style={{
                color: tokens.isDark ? "oklch(0.78 0.15 85)" : tokens.textMuted,
                zIndex: 2,
                textShadow: tokens.isDark
                  ? "0 0 20px oklch(0.78 0.15 85 / 0.5)"
                  : "none",
              }}
            >
              Welcome the new world of
            </p>

            {/* Main FANTASY text with shimmer */}
            <div className="relative inline-block" style={{ zIndex: 2 }}>
              {/* Shimmer sweep overlay */}
              <div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{ borderRadius: "8px", zIndex: 3 }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    width: "40%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent 0%, oklch(0.98 0.02 85 / 0.5) 50%, transparent 100%)",
                    animation: "shimmerSweep 3s 1s ease-in-out infinite",
                    transform: "skewX(-15deg)",
                  }}
                />
              </div>

              <h1
                className="font-display text-5xl sm:text-6xl font-black tracking-widest uppercase relative"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.92 0.04 280) 0%, oklch(0.88 0.22 85) 25%, oklch(0.85 0.28 305) 50%, oklch(0.82 0.22 55) 75%, oklch(0.92 0.04 280) 100%)",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "gradientShift 5s ease infinite",
                  filter: "drop-shadow(0 0 30px oklch(0.75 0.25 305 / 0.6))",
                  letterSpacing: "0.18em",
                }}
              >
                FANTASY
              </h1>
            </div>

            {/* Decorative line accents */}
            <div
              className="relative flex items-center justify-center gap-3 mt-2"
              style={{ zIndex: 2 }}
            >
              <div
                style={{
                  height: "1px",
                  width: "40px",
                  background:
                    "linear-gradient(90deg, transparent, oklch(0.75 0.22 85 / 0.7))",
                }}
              />
              <span
                style={{
                  fontSize: "0.6rem",
                  color: "oklch(0.78 0.18 305 / 0.8)",
                  letterSpacing: "0.3em",
                }}
              >
                ✦ LAND ✦
              </span>
              <div
                style={{
                  height: "1px",
                  width: "40px",
                  background:
                    "linear-gradient(90deg, oklch(0.75 0.22 85 / 0.7), transparent)",
                }}
              />
            </div>
          </div>

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
                      ? tokens.isDark
                        ? `radial-gradient(ellipse at 30% 30%, ${room.glow}18 0%, oklch(0.12 0.035 275) 60%)`
                        : tokens.surface
                      : tokens.isDark
                        ? "oklch(0.12 0.035 275)"
                        : tokens.surface,
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
                    style={{ color: tokens.text }}
                  >
                    {room.title}
                  </h3>
                  <p className="text-sm" style={{ color: tokens.textMuted }}>
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
        </div>
      </main>

      <footer
        className="relative z-10 text-center py-6 text-xs"
        style={{ color: tokens.textMuted }}
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

      {/* Instagram-style Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-3 pb-safe"
        style={{
          background: "rgba(5,5,10,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {[
          { id: "home" as const, icon: <Home size={22} />, label: "Home" },
          { id: "reels" as const, icon: <Play size={22} />, label: "Reels" },
          { id: "direct" as const, icon: <Send size={22} />, label: "Direct" },
          {
            id: "search" as const,
            icon: <Search size={22} />,
            label: "Search",
          },
          {
            id: "profile" as const,
            icon: <User size={22} />,
            label: "Profile",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-ocid={`lobby.nav.${tab.id}_tab`}
            onClick={() => {
              setActiveNavTab(tab.id);
              if (tab.id === "reels") onEnterRoom({ type: "social-media" });
              if (tab.id === "profile") onEnterRoom({ type: "profile" });
              if (tab.id === "direct") onEnterRoom({ type: "direct" });
            }}
            className="flex flex-col items-center gap-0.5 transition-all active:scale-90"
            style={{
              color:
                activeNavTab === tab.id ? "white" : "rgba(255,255,255,0.4)",
              filter:
                activeNavTab === tab.id
                  ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
                  : "none",
            }}
          >
            {tab.id === "profile" ? (
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background:
                    activeNavTab === tab.id
                      ? "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.78 0.15 85))"
                      : "rgba(255,255,255,0.2)",
                  color: "white",
                  border:
                    activeNavTab === tab.id
                      ? "2px solid white"
                      : "2px solid transparent",
                }}
              >
                {username[0]?.toUpperCase()}
              </div>
            ) : tab.id === "direct" ? (
              <div className="relative">
                {tab.icon}
                {pendingIncoming.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
                    style={{ background: "oklch(0.6 0.28 20)", color: "white" }}
                  >
                    {pendingIncoming.length > 9 ? "9+" : pendingIncoming.length}
                  </span>
                )}
              </div>
            ) : (
              tab.icon
            )}
          </button>
        ))}
      </nav>

      <QuickDMModal
        currentUsername={username}
        open={showDM}
        onClose={() => setShowDM(false)}
        onStartDm={(roomId, targetUsername) => {
          setShowDM(false);
          onEnterRoom({ type: "dm", roomId, friendName: targetUsername });
        }}
      />
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
