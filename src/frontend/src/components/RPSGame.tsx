import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  useCreateRPSChallenge,
  usePlayRPS,
  useRPSGame,
} from "../hooks/useQueries";

interface Props {
  roomId: string;
  username: string;
  onSendMessage: (text: string) => void;
}

type GameState = "idle" | "waiting" | "playing" | "done";

const MOVES = [
  { id: "rock", emoji: "🪨", label: "Rock", ocid: "rps.rock_button" },
  { id: "paper", emoji: "📄", label: "Paper", ocid: "rps.paper_button" },
  {
    id: "scissors",
    emoji: "✂️",
    label: "Scissors",
    ocid: "rps.scissors_button",
  },
];

export default function RPSGame({ roomId, username, onSendMessage }: Props) {
  const [state, setState] = useState<GameState>("idle");
  const [gameId, setGameId] = useState<string | null>(null);
  const [myMove, setMyMove] = useState<string | null>(null);

  const createChallenge = useCreateRPSChallenge();
  const playRPS = usePlayRPS();
  const { data: game } = useRPSGame(
    gameId,
    state === "waiting" || state === "playing",
  );

  useEffect(() => {
    if (!game) return;
    if (game.status === "playing" && state === "waiting") {
      setState("playing");
    }
    if (game.status === "done" || game.result) {
      setState("done");
    }
  }, [game, state]);

  const handleChallenge = async () => {
    try {
      const id = await createChallenge.mutateAsync({
        roomId,
        challenger: username,
      });
      setGameId(id);
      setState("waiting");
      onSendMessage(
        `🎮 ${username} has started a Rock Paper Scissors game! Game ID: ${id} — type /joingame ${id} to join!`,
      );
    } catch {
      // silent
    }
  };

  const handleMove = async (move: string) => {
    if (!gameId || myMove) return;
    setMyMove(move);
    try {
      await playRPS.mutateAsync({ gameId, username, move });
    } catch {
      setMyMove(null);
    }
  };

  const handleReset = () => {
    setState("idle");
    setGameId(null);
    setMyMove(null);
  };

  const getResult = () => {
    if (!game?.result) return null;
    if (game.result === "draw")
      return { label: "It's a Draw! 🤝", color: "oklch(0.78 0.15 85)" };
    if (game.result === username)
      return { label: "You Won! 🎉", color: "oklch(0.7 0.25 140)" };
    return { label: `${game.result} Wins! 😈`, color: "oklch(0.65 0.22 50)" };
  };

  if (state === "idle") {
    return (
      <button
        type="button"
        data-ocid="rps.challenge_button"
        onClick={handleChallenge}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105"
        style={{
          background: "oklch(0.18 0.06 305 / 0.6)",
          border: "1px solid oklch(0.65 0.28 305 / 0.4)",
          color: "oklch(0.8 0.15 305)",
        }}
      >
        🎮 Challenge RPS
      </button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={state}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-xl p-4"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.14 0.06 305 / 0.5), oklch(0.12 0.04 280 / 0.5))",
          border: "1px solid oklch(0.65 0.28 305 / 0.3)",
        }}
      >
        {state === "waiting" && (
          <div className="text-center">
            <p
              className="text-sm font-medium mb-2"
              style={{ color: "oklch(0.78 0.15 85)" }}
            >
              ⏳ Waiting for opponent to join...
            </p>
            <p className="text-xs" style={{ color: "oklch(0.5 0.05 280)" }}>
              Game ID:{" "}
              <span style={{ color: "oklch(0.7 0.28 305)" }}>{gameId}</span>
            </p>
          </div>
        )}

        {state === "playing" && (
          <div>
            <p
              className="text-sm font-bold text-center mb-3"
              style={{ color: "oklch(0.92 0.04 280)" }}
            >
              {myMove ? "Waiting for opponent..." : "Make your move!"}
            </p>
            <div className="flex justify-center gap-3">
              {MOVES.map((m) => (
                <motion.button
                  key={m.id}
                  type="button"
                  data-ocid={m.ocid}
                  onClick={() => handleMove(m.id)}
                  disabled={!!myMove}
                  whileHover={!myMove ? { scale: 1.15, y: -4 } : {}}
                  whileTap={!myMove ? { scale: 0.95 } : {}}
                  className="flex flex-col items-center gap-1 p-3 rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    background:
                      myMove === m.id
                        ? "oklch(0.65 0.28 305 / 0.3)"
                        : "oklch(0.16 0.05 275)",
                    border:
                      myMove === m.id
                        ? "2px solid oklch(0.65 0.28 305)"
                        : "1px solid oklch(0.25 0.07 280 / 0.6)",
                    opacity: myMove && myMove !== m.id ? 0.4 : 1,
                    boxShadow:
                      myMove === m.id
                        ? "0 0 20px oklch(0.65 0.28 305 / 0.4)"
                        : "none",
                  }}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.06 280)" }}
                  >
                    {m.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {state === "done" &&
          (() => {
            const result = getResult();
            return (
              <div className="text-center">
                <motion.p
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  className="text-2xl font-black mb-2 font-display"
                  style={{ color: result?.color ?? "oklch(0.92 0.04 280)" }}
                >
                  {result?.label}
                </motion.p>
                {game && (
                  <p
                    className="text-xs mb-3"
                    style={{ color: "oklch(0.55 0.06 280)" }}
                  >
                    {game.player1}: {game.move1 ?? "?"} vs {game.player2 ?? "?"}
                    : {game.move2 ?? "?"}
                  </p>
                )}
                <Button
                  type="button"
                  onClick={handleReset}
                  className="text-xs px-4 py-1.5 rounded-lg"
                  style={{
                    background: "oklch(0.65 0.28 305 / 0.2)",
                    border: "1px solid oklch(0.65 0.28 305 / 0.4)",
                    color: "oklch(0.85 0.15 305)",
                  }}
                >
                  Play Again 🎮
                </Button>
              </div>
            );
          })()}
      </motion.div>
    </AnimatePresence>
  );
}
