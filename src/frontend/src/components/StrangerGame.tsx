import { useEffect, useRef, useState } from "react";
import {
  useCreateGameSession,
  useGetGameSession,
  useJoinGameSession,
  useSubmitRPSMove,
  useSubmitTTTMove,
} from "../hooks/useQueries";

interface Props {
  username: string;
  opponentName: string;
  matchId: string;
  onLeave: () => void;
}

const RPS_CHOICES = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

export default function StrangerGame({
  username,
  opponentName,
  matchId,
  onLeave,
}: Props) {
  const isPlayer1 = matchId === `game-${username}-${opponentName}`;
  const [gameType, setGameType] = useState<null | "rps" | "ttt">(null);
  const [sessionJoined, setSessionJoined] = useState(false);
  const [myRPSMove, setMyRPSMove] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);
  const sessionRef = useRef(false);

  const createSession = useCreateGameSession();
  const joinSession = useJoinGameSession();
  const submitRPS = useSubmitRPSMove();
  const submitTTT = useSubmitTTTMove();
  const isSessionActive = gameType !== null;
  const { data: session } = useGetGameSession(matchId, isSessionActive);

  // Player2: auto-pick game type from session and join
  // biome-ignore lint/correctness/useExhaustiveDependencies: joinSession mutation ref is stable
  useEffect(() => {
    if (
      !isPlayer1 &&
      session &&
      session.status === "waiting" &&
      !sessionJoined
    ) {
      setGameType(session.gameType as "rps" | "ttt");
      joinSession.mutate(
        { sessionId: matchId, player2: username },
        {
          onSuccess: () => setSessionJoined(true),
        },
      );
    }
  }, [session, isPlayer1, sessionJoined, matchId, username]);

  // Player1: create session when game type is chosen
  const handleChooseGame = async (type: "rps" | "ttt") => {
    if (sessionRef.current) return;
    sessionRef.current = true;
    setGameType(type);
    try {
      await createSession.mutateAsync({
        sessionId: matchId,
        player1: username,
        gameType: type,
      });
      setSessionJoined(true);
    } catch {
      sessionRef.current = false;
    }
  };

  // Confetti on win
  useEffect(() => {
    if (session?.status === "done" && session.result) {
      const iWin =
        (isPlayer1 && session.result === "X") ||
        (!isPlayer1 && session.result === "O") ||
        (isPlayer1 && session.result === "player1wins") ||
        (!isPlayer1 && session.result === "player2wins");
      if (iWin) setConfetti(true);
    }
  }, [session?.status, session?.result, isPlayer1]);

  const box = {
    background: "oklch(0.12 0.035 275)",
    border: "1px solid oklch(0.22 0.06 280 / 0.5)",
  } as const;

  // ── Game type picker (player1 only) ──
  if (!gameType) {
    if (!isPlayer1) {
      return (
        <div className="w-full rounded-2xl p-8 text-center" style={box}>
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p
            className="font-bold text-lg"
            style={{ color: "oklch(0.88 0.04 280)" }}
          >
            Waiting for {opponentName} to pick a game...
          </p>
          <button
            type="button"
            onClick={onLeave}
            className="mt-6 px-5 py-2 rounded-xl text-sm font-bold"
            style={{
              background: "oklch(0.18 0.04 280)",
              color: "oklch(0.6 0.06 280)",
            }}
          >
            ← Leave
          </button>
        </div>
      );
    }
    return (
      <div className="w-full rounded-2xl p-6" style={box}>
        <div className="flex items-center justify-between mb-6">
          <h3
            className="text-xl font-black"
            style={{ color: "oklch(0.88 0.04 280)" }}
          >
            Choose a game
          </h3>
          <button
            type="button"
            onClick={onLeave}
            className="text-xs px-3 py-1.5 rounded-lg font-bold"
            style={{
              background: "oklch(0.18 0.04 280)",
              color: "oklch(0.6 0.06 280)",
            }}
          >
            ← Leave
          </button>
        </div>
        <div
          className="flex items-center gap-3 p-3 rounded-xl mb-6"
          style={{
            background: "oklch(0.09 0.03 280)",
            border: "1px solid oklch(0.65 0.22 300 / 0.3)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-black"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.55 0.25 300), oklch(0.5 0.28 320))",
            }}
          >
            {opponentName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
              Playing against
            </p>
            <p className="font-bold" style={{ color: "oklch(0.88 0.04 280)" }}>
              {opponentName}
            </p>
          </div>
          <div
            className="ml-auto w-2 h-2 rounded-full"
            style={{
              background: "oklch(0.65 0.2 150)",
              boxShadow: "0 0 8px oklch(0.65 0.2 150)",
            }}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            data-ocid="strangergame.rps.button"
            onClick={() => handleChooseGame("rps")}
            className="p-5 rounded-2xl font-bold text-center transition-all hover:scale-105"
            style={{
              background: "oklch(0.55 0.25 300 / 0.15)",
              border: "2px solid oklch(0.55 0.25 300 / 0.4)",
              color: "oklch(0.8 0.2 300)",
            }}
          >
            <div className="text-3xl mb-2">✊</div>
            Rock Paper Scissors
          </button>
          <button
            type="button"
            data-ocid="strangergame.ttt.button"
            onClick={() => handleChooseGame("ttt")}
            className="p-5 rounded-2xl font-bold text-center transition-all hover:scale-105"
            style={{
              background: "oklch(0.65 0.22 50 / 0.15)",
              border: "2px solid oklch(0.65 0.22 50 / 0.4)",
              color: "oklch(0.78 0.2 55)",
            }}
          >
            <div className="text-3xl mb-2">⬜</div>
            Tic Tac Toe
          </button>
        </div>
      </div>
    );
  }

  // ── Loading/waiting for player2 to join ──
  if (!session || session.status === "waiting") {
    return (
      <div className="w-full rounded-2xl p-8 text-center" style={box}>
        <div
          className="w-10 h-10 rounded-full border-4 border-t-transparent mx-auto mb-4"
          style={{
            borderColor: "oklch(0.65 0.22 50 / 0.3)",
            borderTopColor: "oklch(0.65 0.22 50)",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p className="font-bold" style={{ color: "oklch(0.75 0.06 280)" }}>
          Waiting for {opponentName} to join...
        </p>
        <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
      </div>
    );
  }

  // ── Game done ──
  if (session.status === "done") {
    const r = session.result;
    const iWin =
      (isPlayer1 && (r === "X" || r === "player1wins")) ||
      (!isPlayer1 && (r === "O" || r === "player2wins"));
    const isDraw = r === "draw";
    const resultLabel = iWin
      ? "🏆 You Win!"
      : isDraw
        ? "🤝 Draw!"
        : "💀 You Lose!";
    const resultColor = iWin
      ? "oklch(0.78 0.2 55)"
      : isDraw
        ? "oklch(0.75 0.06 280)"
        : "oklch(0.75 0.2 25)";

    return (
      <div className="w-full rounded-2xl p-8 text-center" style={box}>
        {confetti && (
          <div className="fixed inset-0 pointer-events-none z-50">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: decorative
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 10 + 6}px`,
                  height: `${Math.random() * 10 + 6}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * -20}%`,
                  background: [
                    "oklch(0.65 0.22 50)",
                    "oklch(0.75 0.25 300)",
                    "oklch(0.7 0.25 150)",
                    "oklch(0.8 0.2 80)",
                    "oklch(0.6 0.3 20)",
                  ][i % 5],
                  animation: `fall ${Math.random() * 2 + 1}s linear forwards`,
                  animationDelay: `${Math.random() * 0.8}s`,
                }}
              />
            ))}
            <style>
              {
                "@keyframes fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }"
              }
            </style>
          </div>
        )}
        <div className="text-6xl mb-4">
          {iWin ? "🏆" : isDraw ? "🤝" : "💀"}
        </div>
        <h2 className="text-3xl font-black mb-2" style={{ color: resultColor }}>
          {resultLabel}
        </h2>
        {session.gameType === "rps" && (
          <div
            className="flex justify-center gap-8 mb-6 p-4 rounded-2xl"
            style={{ background: "oklch(0.09 0.03 280)" }}
          >
            <div className="text-center">
              <p
                className="text-xs mb-1"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                You
              </p>
              <p className="text-2xl">
                {RPS_CHOICES.find(
                  (c) =>
                    c.id === (isPlayer1 ? session.rpsMove1 : session.rpsMove2),
                )?.emoji ?? "❓"}
              </p>
            </div>
            <div
              className="text-xl font-black self-center"
              style={{ color: "oklch(0.4 0.06 280)" }}
            >
              VS
            </div>
            <div className="text-center">
              <p
                className="text-xs mb-1"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                {opponentName}
              </p>
              <p className="text-2xl">
                {RPS_CHOICES.find(
                  (c) =>
                    c.id === (!isPlayer1 ? session.rpsMove1 : session.rpsMove2),
                )?.emoji ?? "❓"}
              </p>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            data-ocid="strangergame.rematch.button"
            onClick={() => {
              setGameType(null);
              setSessionJoined(false);
              setMyRPSMove(null);
              setConfetti(false);
              sessionRef.current = false;
            }}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
              color: "white",
            }}
          >
            Play Again
          </button>
          <button
            type="button"
            data-ocid="strangergame.leave.button"
            onClick={onLeave}
            className="px-6 py-3 rounded-xl font-bold transition-all hover:scale-105"
            style={{
              background: "oklch(0.18 0.04 280)",
              color: "oklch(0.7 0.06 280)",
              border: "1px solid oklch(0.22 0.06 280 / 0.5)",
            }}
          >
            Leave
          </button>
        </div>
      </div>
    );
  }

  // ── RPS playing ──
  if (session.gameType === "rps") {
    const myMove = isPlayer1 ? session.rpsMove1 : session.rpsMove2;
    return (
      <div className="w-full rounded-2xl p-6" style={box}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 80))",
              }}
            >
              {username[0]?.toUpperCase()}
            </div>
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.78 0.2 55)" }}
            >
              You
            </span>
          </div>
          <span
            className="font-black text-lg"
            style={{ color: "oklch(0.5 0.06 280)" }}
          >
            VS
          </span>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.78 0.2 300)" }}
            >
              {opponentName}
            </span>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.55 0.25 300), oklch(0.5 0.28 320))",
              }}
            >
              {opponentName[0]?.toUpperCase()}
            </div>
          </div>
        </div>
        {myMove ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">
              {RPS_CHOICES.find((c) => c.id === myMove)?.emoji}
            </div>
            <p className="font-bold" style={{ color: "oklch(0.65 0.06 280)" }}>
              Waiting for {opponentName}...
            </p>
          </div>
        ) : (
          <>
            <p
              className="text-center text-sm font-bold mb-4"
              style={{ color: "oklch(0.7 0.06 280)" }}
            >
              Pick your move!
            </p>
            <div className="grid grid-cols-3 gap-3">
              {RPS_CHOICES.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  data-ocid={`strangergame.rps.move.${choice.id}`}
                  onClick={() => {
                    setMyRPSMove(choice.id);
                    submitRPS.mutate({
                      sessionId: matchId,
                      username,
                      move: choice.id,
                    });
                  }}
                  disabled={!!myRPSMove}
                  className="py-5 rounded-2xl font-bold flex flex-col items-center gap-1 transition-all hover:scale-110"
                  style={{
                    background: "oklch(0.16 0.04 280)",
                    border: "2px solid oklch(0.22 0.06 280 / 0.5)",
                    color: "oklch(0.82 0.06 280)",
                  }}
                >
                  <span className="text-3xl">{choice.emoji}</span>
                  <span className="text-xs">{choice.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <button
          type="button"
          onClick={onLeave}
          className="mt-4 w-full py-2 rounded-xl text-sm font-bold"
          style={{ background: "transparent", color: "oklch(0.45 0.06 280)" }}
        >
          ← Leave match
        </button>
      </div>
    );
  }

  // ── TTT playing ──
  if (session.gameType === "ttt") {
    // player mark: X for player1, O for player2 (used implicitly via submitTTT)
    const myTurn = Number(session.tttTurn) === (isPlayer1 ? 0 : 1);
    const cells = session.tttCells ?? Array(9).fill(null);

    const WINNING_LINES = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    let winLine: number[] = [];
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
        winLine = line;
        break;
      }
    }

    return (
      <div className="w-full rounded-2xl p-6" style={box}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="font-black text-lg"
              style={{ color: "oklch(0.85 0.28 305)" }}
            >
              X
            </span>
            <span
              className="text-sm font-bold"
              style={{
                color: isPlayer1 ? "oklch(0.78 0.2 55)" : "oklch(0.6 0.06 280)",
              }}
            >
              {isPlayer1 ? "You" : opponentName}
            </span>
          </div>
          <div
            className="px-3 py-1 rounded-lg text-xs font-bold"
            style={{
              background: myTurn
                ? "oklch(0.65 0.22 50 / 0.2)"
                : "oklch(0.16 0.04 280)",
              color: myTurn ? "oklch(0.78 0.2 55)" : "oklch(0.5 0.06 280)",
            }}
          >
            {myTurn ? "Your turn" : `${opponentName}'s turn`}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-sm font-bold"
              style={{
                color: !isPlayer1
                  ? "oklch(0.78 0.2 55)"
                  : "oklch(0.6 0.06 280)",
              }}
            >
              {!isPlayer1 ? "You" : opponentName}
            </span>
            <span
              className="font-black text-lg"
              style={{ color: "oklch(0.78 0.15 85)" }}
            >
              O
            </span>
          </div>
        </div>

        {/* Board */}
        <div
          className="grid gap-2 mx-auto mb-4"
          style={{ gridTemplateColumns: "repeat(3, 1fr)", width: "240px" }}
        >
          {cells.map((cell, i) => {
            const isWin = winLine.includes(i);
            return (
              <button
                // biome-ignore lint/suspicious/noArrayIndexKey: TTT fixed grid
                key={i}
                type="button"
                data-ocid={`strangergame.ttt.cell.${i}`}
                onClick={() => {
                  if (!myTurn || cell) return;
                  submitTTT.mutate({
                    sessionId: matchId,
                    username,
                    cellIndex: i,
                  });
                }}
                disabled={!myTurn || !!cell}
                className="h-[72px] rounded-2xl flex items-center justify-center text-3xl font-black transition-all"
                style={{
                  width: "72px",
                  background: isWin
                    ? "oklch(0.65 0.28 305 / 0.25)"
                    : "oklch(0.14 0.05 280)",
                  border: isWin
                    ? "2px solid oklch(0.65 0.28 305 / 0.8)"
                    : "1px solid oklch(0.22 0.06 280 / 0.6)",
                  color:
                    cell === "X"
                      ? "oklch(0.85 0.28 305)"
                      : "oklch(0.78 0.15 85)",
                  cursor: !myTurn || cell ? "default" : "pointer",
                }}
              >
                {cell}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onLeave}
          className="w-full py-2 rounded-xl text-sm font-bold"
          style={{ background: "transparent", color: "oklch(0.45 0.06 280)" }}
        >
          ← Leave match
        </button>
      </div>
    );
  }

  return null;
}
