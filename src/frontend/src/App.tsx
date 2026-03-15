import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import AuthScreen from "./components/AuthScreen";
import ChatRoom from "./components/ChatRoom";
import GameRoom from "./components/GameRoom";
import Lobby from "./components/Lobby";
import MatchmakingScreen from "./components/MatchmakingScreen";
import ProfilePage from "./components/ProfilePage";
import RoleplayRoom from "./components/RoleplayRoom";
import SocialMediaRoom from "./components/SocialMediaRoom";
import SplashScreen from "./components/SplashScreen";
import TruthOrDareRoom from "./components/TruthOrDareRoom";
import UsernamePicker from "./components/UsernamePicker";

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
  | { type: "profile" };

function isAlreadyAuthed(): boolean {
  return (
    !!localStorage.getItem("fl_auth_user") ||
    localStorage.getItem("fl_guest") === "1"
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const [isAuthed, setIsAuthed] = useState<boolean>(isAlreadyAuthed);
  const [room, setRoom] = useState<Room>({ type: "lobby" });
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("fl_username") || "";
  });
  const [matchmaking, setMatchmaking] = useState(false);

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

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background font-body">
        {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}
        {splashDone && !isAuthed && (
          <AuthScreen onAuthed={handleAuthed} onGuest={handleGuest} />
        )}
        {splashDone && isAuthed && !hasUsername && (
          <UsernamePicker onConfirm={handlePickUsername} />
        )}
        {splashDone && isAuthed && hasUsername && (
          <>
            {room.type === "lobby" && !matchmaking && (
              <Lobby
                username={username}
                onRename={handleRename}
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
                onRename={handleRename}
                onBack={() => setRoom({ type: "lobby" })}
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
              />
            )}
          </>
        )}
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
