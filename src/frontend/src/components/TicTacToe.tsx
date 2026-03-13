import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface Props {
  onClose: () => void;
  inline?: boolean;
}

type Cell = "X" | "O" | null;

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
  const [cells, setCells] = useState<Cell[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [vsAI, setVsAI] = useState(false);

  const result = calcWinner(cells);
  const isDraw = !result && cells.every((c) => c !== null);

  const handleClick = (idx: number) => {
    if (cells[idx] || result || isDraw) return;
    const next = cells.slice();
    next[idx] = xIsNext ? "X" : "O";
    setCells(next);
    setXIsNext(!xIsNext);

    // AI move
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

  const reset = () => {
    setCells(Array(9).fill(null));
    setXIsNext(true);
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
      className={`relative w-full max-w-sm rounded-3xl p-6 flex flex-col items-center gap-6 ${inline ? "" : ""}`}
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
            reset();
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
            reset();
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
                  cell === "X" ? "oklch(0.85 0.28 305)" : "oklch(0.78 0.15 85)",
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

      {/* Play again */}
      <button
        type="button"
        data-ocid="tictactoe.primary_button"
        onClick={reset}
        className="px-8 py-3 rounded-2xl font-bold text-sm tracking-wider transition-all hover:scale-105 active:scale-95"
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
