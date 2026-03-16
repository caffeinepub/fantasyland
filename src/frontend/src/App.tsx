import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AuthScreen from "./components/AuthScreen";
import ChatRoom from "./components/ChatRoom";
import DirectPanel from "./components/DirectPanel";
import GameRoom from "./components/GameRoom";
import Lobby from "./components/Lobby";
import MatchmakingScreen from "./components/MatchmakingScreen";
import ProfilePage from "./components/ProfilePage";
import RoleplayRoom from "./components/RoleplayRoom";
import SocialMediaRoom from "./components/SocialMediaRoom";
import SplashScreen from "./components/SplashScreen";
import TruthOrDareRoom from "./components/TruthOrDareRoom";
import UsernamePicker from "./components/UsernamePicker";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useActor } from "./hooks/useActor";
import { getOrCreateUID } from "./utils/uid";

const queryClient = new QueryClient();

export type Room =
  | { type: "lobby" }
  | { type: "world" }
  | { type: "private"; roomId: string }
  | { type: "truth-dare" }
  | { type: "roleplay"; persona: string }
  | { type: "stranger"; roomId: string }
  | { type: "chill" }
  | { type: "game" }
  | { type: "ai-bot" }
  | { type: "social-media" }
  | { type: "profile" }
  | { type: "direct" }
  | { type: "dm"; roomId: string; friendName: string };

function isAlreadyAuthed(): boolean {
  return (
    !!localStorage.getItem("fl_auth_user") ||
    localStorage.getItem("fl_guest") === "1"
  );
}

function AppInner() {
  // Ensure every user (including guests) gets a UID on first load
  getOrCreateUID();
  const [splashDone, setSplashDone] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [room, setRoom] = useState<Room>({ type: "lobby" });
  const [username, setUsername] = useState<string>("");
  const [matchmaking, setMatchmaking] = useState(false);
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;

    const token = localStorage.getItem("fl_session_token");
    const storedUsername = localStorage.getItem("fl_username");

    if (token) {
      actor
        .validateSession(token)
        .then((validUsername) => {
          if (validUsername) {
            const name = validUsername || storedUsername || "";
            setUsername(name);
            if (name) localStorage.setItem("fl_username", name);
            setIsAuthed(true);
          } else if (isAlreadyAuthed()) {
            setUsername(storedUsername || "");
            setIsAuthed(true);
          }
          setSessionChecked(true);
        })
        .catch(() => {
          if (isAlreadyAuthed()) {
            setUsername(storedUsername || "");
            setIsAuthed(true);
          }
          setSessionChecked(true);
        });
    } else if (isAlreadyAuthed()) {
      setUsername(storedUsername || "");
      setIsAuthed(true);
      setSessionChecked(true);
    } else {
      setSessionChecked(true);
    }
  }, [actor, isFetching]);

  const hasUsername = username.length > 0;

  const handlePickUsername = (name: string) => {
    localStorage.setItem("fl_username", name);
    setUsername(name);
  };

  const handleRename = () => {
    localStorage.removeItem("fl_username");
    setUsername("");
    setRoom({ type: "lobby" });
  };

  const handleAuthed = (name: string) => {
    setUsername(name);
    setIsAuthed(true);
  };

  const handleGuest = () => {
    setIsAuthed(true);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("fl_session_token");
    if (token && actor) {
      try {
        await actor.logout(token);
      } catch {
        // silent
      }
    }
    localStorage.removeItem("fl_session_token");
    localStorage.removeItem("fl_auth_user");
    localStorage.removeItem("fl_auth_pass");
    localStorage.removeItem("fl_username");
    localStorage.removeItem("fl_guest");
    setUsername("");
    setIsAuthed(false);
    setRoom({ type: "lobby" });
  };

  const showAuth = splashDone && sessionChecked && !isAuthed;
  const showUsernamePicker =
    splashDone && sessionChecked && isAuthed && !hasUsername;
  const showApp = splashDone && sessionChecked && isAuthed && hasUsername;

  return (
    <div className="min-h-screen bg-background font-body">
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
      {splashDone && !sessionChecked && (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "oklch(0.08 0.025 260)" }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
        </div>
      )}
      {showAuth && <AuthScreen onAuthed={handleAuthed} onGuest={handleGuest} />}
      {showUsernamePicker && <UsernamePicker onConfirm={handlePickUsername} />}
      {showApp && (
        <>
          {room.type === "lobby" && !matchmaking && (
            <Lobby
              username={username}
              onRename={handleRename}
              onLogout={handleLogout}
              onEnterRoom={(r) => {
                if (r.type === "stranger") {
                  setMatchmaking(true);
                  setRoom(r);
                } else {
                  setRoom(r);
                }
              }}
            />
          )}
          {matchmaking && (
            <MatchmakingScreen
              username={username}
              onMatched={(roomId) => {
                setMatchmaking(false);
                setRoom({ type: "stranger", roomId });
              }}
              onCancel={() => {
                setMatchmaking(false);
                setRoom({ type: "lobby" });
              }}
              onBotChat={() => {
                setMatchmaking(false);
                setRoom({ type: "ai-bot" });
              }}
            />
          )}
          {room.type === "world" && (
            <ChatRoom
              roomId="world"
              roomName="World Chat"
              roomEmoji="🌍"
              username={username}
              onRename={handleRename}
              onBack={() => setRoom({ type: "lobby" })}
              onStartDm={(r, f) =>
                setRoom({ type: "dm", roomId: r, friendName: f })
              }
            />
          )}
          {room.type === "private" && (
            <ChatRoom
              roomId={room.roomId}
              roomName={`Private Room #${room.roomId}`}
              roomEmoji="🔒"
              username={username}
              onRename={handleRename}
              onBack={() => setRoom({ type: "lobby" })}
              onStartDm={(r, f) =>
                setRoom({ type: "dm", roomId: r, friendName: f })
              }
            />
          )}
          {room.type === "truth-dare" && (
            <TruthOrDareRoom
              username={username}
              onBack={() => setRoom({ type: "lobby" })}
            />
          )}
          {room.type === "roleplay" && (
            <RoleplayRoom
              persona={room.persona}
              onBack={() => setRoom({ type: "lobby" })}
            />
          )}
          {room.type === "stranger" && !matchmaking && (
            <ChatRoom
              roomId={room.roomId}
              roomName="1v1 Stranger Chat"
              roomEmoji="👥"
              username={username}
              isStranger
              onRename={handleRename}
              onBack={() => setRoom({ type: "lobby" })}
              onStartDm={(r, f) =>
                setRoom({ type: "dm", roomId: r, friendName: f })
              }
            />
          )}
          {room.type === "chill" && (
            <ChatRoom
              roomId="chill"
              roomName="Chill Lounge"
              roomEmoji="☕"
              username={username}
              onRename={handleRename}
              onBack={() => setRoom({ type: "lobby" })}
              onStartDm={(r, f) =>
                setRoom({ type: "dm", roomId: r, friendName: f })
              }
            />
          )}
          {room.type === "ai-bot" && (
            <ChatRoom
              roomId={`ai-bot-${username}`}
              roomName="AI Bot"
              roomEmoji="🤖"
              username={username}
              onRename={handleRename}
              onBack={() => setRoom({ type: "lobby" })}
              onStartDm={(r, f) =>
                setRoom({ type: "dm", roomId: r, friendName: f })
              }
            />
          )}
          {room.type === "game" && (
            <GameRoom
              username={username}
              onRename={handleRename}
              onBack={() => setRoom({ type: "lobby" })}
            />
          )}
          {room.type === "social-media" && (
            <SocialMediaRoom
              username={username}
              onBack={() => setRoom({ type: "lobby" })}
            />
          )}
          {room.type === "profile" && (
            <ProfilePage
              username={username}
              onBack={() => setRoom({ type: "lobby" })}
              onStartDm={() => setRoom({ type: "direct" })}
            />
          )}
          {room.type === "direct" && (
            <DirectPanel
              username={username}
              onBack={() => setRoom({ type: "lobby" })}
              onOpenDm={(roomId, friendName) =>
                setRoom({ type: "dm", roomId, friendName })
              }
            />
          )}
          {room.type === "dm" && (
            <ChatRoom
              roomId={room.roomId}
              roomName={room.friendName}
              roomEmoji="💬"
              username={username}
              onRename={handleRename}
              onBack={() => setRoom({ type: "direct" })}
              onStartDm={(r, f) =>
                setRoom({ type: "dm", roomId: r, friendName: f })
              }
            />
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AppInner />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
