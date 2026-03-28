import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useGameSounds } from "../hooks/useGameSounds";

interface Props {
  onClose: () => void;
  inline?: boolean;
}

type Cell = "X" | "O" | null;
type RoundPhase = "select" | "playing" | "round_result" | "series_over";

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

function calcWinner(cells: Cell[]): { winner: Cell; line: number[] } | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
      return { winner: cells[a], line };
    }
  }
  return null;
}

export default function TicTacToe({ onClose, inline = false }: Props) {
  const { playCorrect, playWin, playLose } = useGameSounds();
  // Round system state
  const [roundPhase, setRoundPhase] = useState<RoundPhase>("select");
  const [totalRounds, setTotalRounds] = useState<3 | 5>(3);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerWins, setPlayerWins] = useState(0);
  const [opponentWins, setOpponentWins] = useState(0);
  const [lastResult, setLastResult] = useState<"win" | "lose" | "draw" | null>(
    null,
  );

  // Game state
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsAI, setVsAI] = useState(true);
  const [roundResultHandled, setRoundResultHandled] = useState(false);

  const winsNeeded = Math.ceil(totalRounds / 2);
  const result = calcWinner(cells);
  const isDraw = !result && cells.every((c) => c !== null);
  const gameOver = !!(result || isDraw);

  // Detect round end
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!gameOver || roundPhase !== "playing" || roundResultHandled) return;
    setRoundResultHandled(true);

    let rResult: "win" | "lose" | "draw";
    if (isDraw) {
      rResult = "draw";
    } else if (result?.winner === "X") {
      rResult = "win";
    } else {
      rResult = "lose";
    }

    const newPlayerWins = rResult === "win" ? playerWins + 1 : playerWins;
    const newOpponentWins =
      rResult === "lose" ? opponentWins + 1 : opponentWins;

    setLastResult(rResult);
    setPlayerWins(newPlayerWins);
    setOpponentWins(newOpponentWins);
    setRoundPhase("round_result");
    if (rResult === "win") playWin();
    else if (rResult === "lose") playLose();

    const seriesOver =
      newPlayerWins >= winsNeeded ||
      newOpponentWins >= winsNeeded ||
      currentRound >= totalRounds;

    setTimeout(() => {
      if (seriesOver) {
        setRoundPhase("series_over");
      } else {
        setCurrentRound((r) => r + 1);
        setCells(Array(9).fill(null));
        setXIsNext(true);
        setRoundResultHandled(false);
        setRoundPhase("playing");
      }
    }, 1400);
  }, [gameOver]);

  const handleClick = (idx: number) => {
    if (cells[idx] || result || isDraw) return;
    const next = cells.slice();
    next[idx] = xIsNext ? "X" : "O";
    setCells(next);
    setXIsNext(!xIsNext);
    playCorrect();

    if (vsAI && xIsNext) {
      const empty = next
        .map((v, i) => (v === null ? i : -1))
        .filter((i) => i !== -1);
      if (empty.length > 0 && !calcWinner(next)) {
        const aiIdx = empty[Math.floor(Math.random() * empty.length)];
        setTimeout(() => {
          setCells((prev) => {
            const a = prev.slice();
            a[aiIdx] = "O";
            return a;
          });
          setXIsNext(true);
        }, 350);
      }
    }
  };

  const resetGame = () => {
    setCells(Array(9).fill(null));
    setXIsNext(true);
    setRoundResultHandled(false);
  };

  const resetAll = () => {
    setRoundPhase("select");
    setCurrentRound(1);
    setPlayerWins(0);
    setOpponentWins(0);
    setLastResult(null);
    resetGame();
  };

  const startSeries = (rounds: 3 | 5) => {
    setTotalRounds(rounds);
    setCurrentRound(1);
    setPlayerWins(0);
    setOpponentWins(0);
    setLastResult(null);
    resetGame();
    setRoundPhase("playing");
  };

  const winLine = result?.line ?? [];
  const statusText = result
    ? `🎉 ${result.winner} wins!`
    : isDraw
      ? "🤝 It's a draw!"
      : `${xIsNext ? "X" : "O"}'s turn`;

  const inner = (
    <motion.div
      data-ocid="tictactoe.modal"
      initial={inline ? undefined : { scale: 0.85, opacity: 0 }}
      animate={inline ? undefined : { scale: 1, opacity: 1 }}
      exit={inline ? undefined : { scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="relative w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-6"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.13 0.06 285) 0%, oklch(0.09 0.04 270) 100%)",
        border: "1px solid oklch(0.65 0.28 305 / 0.4)",
        boxShadow:
          "0 0 60px oklch(0.65 0.28 305 / 0.2), 0 24px 48px oklch(0 0 0 / 0.5)",
      }}
    >
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <h2
          className="font-display text-2xl font-black"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.92 0.04 280), oklch(0.78 0.15 85) 50%, oklch(0.85 0.28 305))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Tic Tac Toe
        </h2>
        {!inline && (
          <button
            type="button"
            data-ocid="tictactoe.close_button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all hover:scale-110"
            style={{
              background: "oklch(0.16 0.05 280)",
              border: "1px solid oklch(0.28 0.08 280 / 0.6)",
              color: "oklch(0.7 0.06 280)",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Round Selector ── */}
      {roundPhase === "select" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full flex flex-col items-center gap-5"
        >
          <p
            className="text-sm font-bold"
            style={{ color: "oklch(0.65 0.06 280)" }}
          >
            Choose Series Length
          </p>
          <div className="grid grid-cols-2 gap-3 w-full">
            {([3, 5] as const).map((n) => (
              <button
                key={n}
                type="button"
                data-ocid={`tictactoe.bo${n}.button`}
                onClick={() => startSeries(n)}
                className="py-5 rounded-2xl font-black text-lg transition-all hover:scale-105"
                style={{
                  background:
                    n === 3
                      ? "oklch(0.65 0.28 305 / 0.15)"
                      : "oklch(0.65 0.22 50 / 0.15)",
                  border:
                    n === 3
                      ? "2px solid oklch(0.65 0.28 305 / 0.5)"
                      : "2px solid oklch(0.65 0.22 50 / 0.5)",
                  color:
                    n === 3 ? "oklch(0.82 0.22 305)" : "oklch(0.82 0.22 55)",
                  boxShadow:
                    n === 3
                      ? "0 0 20px oklch(0.65 0.28 305 / 0.2)"
                      : "0 0 20px oklch(0.65 0.22 50 / 0.2)",
                }}
              >
                Best of {n}
                <div className="text-xs font-medium mt-1 opacity-60">
                  First to {Math.ceil(n / 2)} wins
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Series Over ── */}
      {roundPhase === "series_over" && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full flex flex-col items-center gap-4 py-4"
        >
          <div className="text-6xl">
            {playerWins > opponentWins
              ? "🏆"
              : playerWins < opponentWins
                ? "💀"
                : "🤝"}
          </div>
          <h3
            className="text-2xl font-black"
            style={{
              color:
                playerWins > opponentWins
                  ? "oklch(0.82 0.22 55)"
                  : playerWins < opponentWins
                    ? "oklch(0.72 0.22 20)"
                    : "oklch(0.75 0.06 280)",
            }}
          >
            {playerWins > opponentWins
              ? "You Win the Series!"
              : playerWins < opponentWins
                ? "You Lost the Series!"
                : "It's a Tie!"}
          </h3>
          <div
            className="flex items-center gap-4 px-6 py-3 rounded-2xl"
            style={{ background: "oklch(0.09 0.03 280)" }}
          >
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{ color: "oklch(0.82 0.22 55)" }}
              >
                {playerWins}
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                You
              </div>
            </div>
            <div style={{ color: "oklch(0.4 0.06 280)" }} className="text-xl">
              —
            </div>
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{ color: "oklch(0.72 0.22 300)" }}
              >
                {opponentWins}
              </div>
              <div
                className="text-xs"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                AI
              </div>
            </div>
          </div>
          <p className="text-sm" style={{ color: "oklch(0.5 0.06 280)" }}>
            Best of {totalRounds} · {currentRound} rounds played
          </p>
          <button
            type="button"
            data-ocid="tictactoe.primary_button"
            onClick={resetAll}
            className="px-8 py-3 rounded-2xl font-bold text-sm tracking-wider transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.6 0.25 250))",
              color: "oklch(0.97 0.02 280)",
              boxShadow: "0 0 20px oklch(0.65 0.28 305 / 0.4)",
            }}
          >
            Play Again
          </button>
        </motion.div>
      )}

      {/* ── Round Flash Overlay ── */}
      <AnimatePresence>
        {roundPhase === "round_result" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl"
            style={{
              background:
                lastResult === "win"
                  ? "oklch(0.4 0.18 145 / 0.85)"
                  : lastResult === "lose"
                    ? "oklch(0.35 0.2 20 / 0.85)"
                    : "oklch(0.25 0.08 280 / 0.85)",
            }}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1.2, rotate: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="text-7xl mb-3"
            >
              {lastResult === "win"
                ? "🎉"
                : lastResult === "lose"
                  ? "💀"
                  : "🤝"}
            </motion.div>
            <p
              className="text-2xl font-black"
              style={{
                color:
                  lastResult === "win"
                    ? "oklch(0.9 0.2 145)"
                    : lastResult === "lose"
                      ? "oklch(0.85 0.18 20)"
                      : "oklch(0.88 0.04 280)",
              }}
            >
              {lastResult === "win"
                ? "Round Win!"
                : lastResult === "lose"
                  ? "Round Loss!"
                  : "Draw!"}
            </p>
            <p className="text-sm mt-2" style={{ color: "white" }}>
              {playerWins} — {opponentWins}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Playing Phase ── */}
      {(roundPhase === "playing" || roundPhase === "round_result") && (
        <>
          {/* Round counter */}
          <div className="flex items-center gap-3 w-full">
            <div
              className="flex-1 text-center px-3 py-1.5 rounded-xl text-sm font-bold"
              style={{
                background: "oklch(0.65 0.28 305 / 0.12)",
                border: "1px solid oklch(0.65 0.28 305 / 0.3)",
                color: "oklch(0.82 0.18 305)",
              }}
            >
              Round {currentRound} of {totalRounds}
            </div>
            <div
              className="px-4 py-1.5 rounded-xl text-sm font-black"
              style={{
                background: "oklch(0.09 0.03 280)",
                border: "1px solid oklch(0.22 0.06 280 / 0.4)",
                color: "oklch(0.88 0.04 280)",
              }}
            >
              <span style={{ color: "oklch(0.82 0.22 55)" }}>{playerWins}</span>
              {" — "}
              <span style={{ color: "oklch(0.72 0.22 300)" }}>
                {opponentWins}
              </span>
            </div>
          </div>

          {/* Mode toggle */}
          <div
            className="flex rounded-full p-1 gap-1"
            style={{ background: "oklch(0.1 0.03 275)" }}
          >
            <button
              type="button"
              data-ocid="tictactoe.toggle"
              onClick={() => {
                setVsAI(false);
                resetGame();
              }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: !vsAI ? "oklch(0.65 0.28 305)" : "transparent",
                color: !vsAI ? "oklch(0.97 0.02 280)" : "oklch(0.55 0.06 280)",
              }}
            >
              2 Players
            </button>
            <button
              type="button"
              data-ocid="tictactoe.toggle"
              onClick={() => {
                setVsAI(true);
                resetGame();
              }}
              className="px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: vsAI ? "oklch(0.65 0.28 305)" : "transparent",
                color: vsAI ? "oklch(0.97 0.02 280)" : "oklch(0.55 0.06 280)",
              }}
            >
              vs AI
            </button>
          </div>

          {/* Status */}
          <motion.div
            key={statusText}
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-lg font-bold tracking-wide"
            style={{
              color: result
                ? "oklch(0.78 0.15 85)"
                : isDraw
                  ? "oklch(0.7 0.2 180)"
                  : "oklch(0.75 0.06 280)",
            }}
          >
            {statusText}
          </motion.div>

          {/* Board */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: "repeat(3, 1fr)", width: "240px" }}
          >
            {cells.map((cell, i) => {
              const isWin = winLine.includes(i);
              return (
                <motion.button
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed 3x3 board positions
                  key={i}
                  type="button"
                  data-ocid={`tictactoe.item.${i + 1}`}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleClick(i)}
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-3xl font-black transition-all"
                  style={{
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
                    boxShadow: isWin
                      ? "0 0 20px oklch(0.65 0.28 305 / 0.4)"
                      : "none",
                    cursor: cell || result ? "default" : "pointer",
                  }}
                >
                  <AnimatePresence>
                    {cell && (
                      <motion.span
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 20,
                        }}
                      >
                        {cell}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </motion.div>
  );

  if (inline) return inner;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.75)", backdropFilter: "blur(8px)" }}
    >
      {inner}
    </div>
  );
}
