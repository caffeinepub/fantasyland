import { ArrowLeft, Gamepad2 } from "lucide-react";
import { useState } from "react";
import NumberGuess from "./NumberGuess";
import RPSGame from "./RPSGame";
import TicTacToe from "./TicTacToe";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  username: string;
  onRename: () => void;
  onBack: () => void;
}

type GameTab = "rps" | "ttt" | "ng";

const TABS: { id: GameTab; label: string; emoji: string }[] = [
  { id: "rps", label: "Rock Paper Scissors", emoji: "✊" },
  { id: "ttt", label: "Tic Tac Toe", emoji: "⬜" },
  { id: "ng", label: "Number Guess", emoji: "🔢" },
];

export default function GameRoom({ username, onRename, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<GameTab>("rps");

  return (
    <div
      className="min-h-screen relative overflow-hidden pt-10"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.14 0.07 285) 0%, oklch(0.09 0.03 260) 40%, oklch(0.07 0.02 280) 100%)",
      }}
    >
      <UsernameTopBar username={username} onRename={onRename} />

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, oklch(0.65 0.22 50 / 0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      <header
        className="relative z-10 flex items-center gap-4 px-6 py-4 border-b"
        style={{ borderColor: "oklch(0.22 0.06 280 / 0.5)" }}
      >
        <button
          type="button"
          data-ocid="gamezone.back.button"
          onClick={onBack}
          className="p-2 rounded-lg transition-all hover:scale-105"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
            color: "oklch(0.75 0.06 280)",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.65 0.22 50 / 0.15)",
              border: "1px solid oklch(0.65 0.22 50 / 0.4)",
              boxShadow: "0 0 20px oklch(0.65 0.22 50 / 0.3)",
            }}
          >
            <Gamepad2 size={20} style={{ color: "oklch(0.78 0.2 55)" }} />
          </div>
          <div>
            <h1
              className="font-display text-xl font-black"
              style={{ color: "oklch(0.92 0.04 280)" }}
            >
              Game Zone
            </h1>
            <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
              Play solo or challenge friends
            </p>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div
          className="flex rounded-2xl p-1.5 gap-1.5 mb-8"
          style={{ background: "oklch(0.11 0.04 280)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              data-ocid={`gamezone.${tab.id}.tab`}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background:
                  activeTab === tab.id
                    ? "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))"
                    : "transparent",
                color:
                  activeTab === tab.id
                    ? "oklch(0.97 0.02 280)"
                    : "oklch(0.55 0.06 280)",
                boxShadow:
                  activeTab === tab.id
                    ? "0 0 20px oklch(0.65 0.22 50 / 0.4)"
                    : "none",
              }}
            >
              <span>{tab.emoji}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Game area */}
        <div className="flex justify-center">
          {activeTab === "rps" && (
            <div
              className="w-full rounded-2xl p-4"
              style={{
                background: "oklch(0.12 0.035 275)",
                border: "1px solid oklch(0.22 0.06 280 / 0.5)",
              }}
            >
              <RPSGame
                roomId="gamezone"
                username={username}
                onSendMessage={() => {}}
              />
            </div>
          )}
          {activeTab === "ttt" && <TicTacToe onClose={() => {}} inline />}
          {activeTab === "ng" && <NumberGuess onClose={() => {}} inline />}
        </div>
      </div>
    </div>
  );
}
