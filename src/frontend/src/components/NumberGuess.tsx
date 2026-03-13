import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface Props {
  onClose: () => void;
  inline?: boolean;
}

const CONFETTI_COLORS = [
  "oklch(0.85 0.28 305)",
  "oklch(0.78 0.15 85)",
  "oklch(0.72 0.2 200)",
  "oklch(0.75 0.22 320)",
  "oklch(0.7 0.2 180)",
];

function ConfettiPiece({ i }: { i: number }) {
  const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
  const left = (i * 37 + 11) % 100;
  const delay = (i * 0.07) % 1.5;
  const duration = 1.2 + (i % 5) * 0.3;
  const rotate = (i * 45) % 360;
  return (
    <motion.div
      initial={{ y: -20, opacity: 1, rotate: 0, x: 0 }}
      animate={{
        y: 300,
        opacity: 0,
        rotate: rotate + 360,
        x: ((i % 3) - 1) * 80,
      }}
      transition={{ duration, delay, ease: "easeIn" }}
      className="absolute w-3 h-3 rounded-sm pointer-events-none"
      style={{ left: `${left}%`, top: 0, background: color, zIndex: 60 }}
    />
  );
}

export default function NumberGuess({ onClose, inline = false }: Props) {
  const [target, setTarget] = useState(
    () => Math.floor(Math.random() * 100) + 1,
  );
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState<"high" | "low" | "won" | null>(null);
  const [history, setHistory] = useState<Array<{ n: number; label: string }>>(
    [],
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const won = hint === "won";

  const handleGuess = () => {
    const n = Number.parseInt(guess, 10);
    if (Number.isNaN(n) || n < 1 || n > 100) return;
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    let h: "high" | "low" | "won";
    if (n === target) h = "won";
    else if (n > target) h = "high";
    else h = "low";
    setHint(h);
    setHistory((prev) => [
      ...prev,
      {
        n,
        label: h === "won" ? "🎯" : h === "high" ? "📉 Too High" : "📈 Too Low",
      },
    ]);
    setGuess("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const reset = () => {
    setGuess("");
    setAttempts(0);
    setHint(null);
    setHistory([]);
    setTarget(Math.floor(Math.random() * 100) + 1);
  };

  const inner = (
    <motion.div
      data-ocid="numguess.modal"
      initial={inline ? undefined : { scale: 0.85, opacity: 0 }}
      animate={inline ? undefined : { scale: 1, opacity: 1 }}
      exit={inline ? undefined : { scale: 0.85, opacity: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="relative w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5 overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, oklch(0.13 0.06 285) 0%, oklch(0.09 0.04 270) 100%)",
        border: "1px solid oklch(0.78 0.15 85 / 0.4)",
        boxShadow:
          "0 0 60px oklch(0.78 0.15 85 / 0.15), 0 24px 48px oklch(0 0 0 / 0.5)",
      }}
    >
      {/* Confetti on win */}
      <AnimatePresence>
        {won &&
          Array.from({ length: 20 }, (_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: confetti positions
            <ConfettiPiece key={i} i={i} />
          ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2
          className="font-display text-2xl font-black"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.15 85), oklch(0.85 0.28 305))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Number Guess
        </h2>
        {!inline && (
          <button
            type="button"
            data-ocid="numguess.close_button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
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

      <p
        className="text-sm text-center"
        style={{ color: "oklch(0.6 0.06 280)" }}
      >
        Guess a number between <b style={{ color: "oklch(0.78 0.15 85)" }}>1</b>{" "}
        and <b style={{ color: "oklch(0.78 0.15 85)" }}>100</b>
      </p>

      {/* Win state */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-2"
          >
            <div className="text-5xl mb-2">🎉</div>
            <p
              className="font-display text-xl font-black"
              style={{ color: "oklch(0.78 0.15 85)" }}
            >
              Got it in {attempts} {attempts === 1 ? "try" : "tries"}!
            </p>
            <p
              className="text-sm mt-1"
              style={{ color: "oklch(0.55 0.06 280)" }}
            >
              The number was {target}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint */}
      {hint && hint !== "won" && (
        <motion.div
          key={hint + attempts}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="text-center text-lg font-bold"
          style={{
            color:
              hint === "high" ? "oklch(0.72 0.22 50)" : "oklch(0.72 0.2 200)",
          }}
        >
          {hint === "high" ? "📉 Too High!" : "📈 Too Low!"}
        </motion.div>
      )}

      <div
        className="text-center text-sm font-medium"
        style={{ color: "oklch(0.55 0.06 280)" }}
      >
        Attempts: <b style={{ color: "oklch(0.85 0.28 305)" }}>{attempts}</b>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-h-24 overflow-y-auto">
          {history.map((h, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: append-only list
              key={i}
              className="px-2 py-1 rounded-full text-xs font-semibold"
              style={{
                background:
                  h.label === "🎯"
                    ? "oklch(0.65 0.28 305 / 0.2)"
                    : "oklch(0.14 0.05 280)",
                border:
                  h.label === "🎯"
                    ? "1px solid oklch(0.65 0.28 305 / 0.5)"
                    : "1px solid oklch(0.22 0.06 280 / 0.4)",
                color: "oklch(0.75 0.06 280)",
              }}
            >
              {h.n} {h.label}
            </span>
          ))}
        </div>
      )}

      {!won ? (
        <div className="flex gap-2">
          <input
            ref={inputRef}
            data-ocid="numguess.input"
            type="number"
            min={1}
            max={100}
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGuess()}
            placeholder="Enter 1–100"
            // biome-ignore lint/a11y/noAutofocus: game input needs focus
            autoFocus
            className="flex-1 rounded-2xl px-4 py-3 text-center text-lg font-bold outline-none"
            style={{
              background: "oklch(0.14 0.05 280)",
              border: "1px solid oklch(0.28 0.08 280 / 0.6)",
              color: "oklch(0.92 0.04 280)",
            }}
          />
          <button
            type="button"
            data-ocid="numguess.submit_button"
            onClick={handleGuess}
            className="px-5 py-3 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.15 85), oklch(0.72 0.22 50))",
              color: "oklch(0.1 0.03 280)",
              boxShadow: "0 0 20px oklch(0.78 0.15 85 / 0.4)",
            }}
          >
            GO
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-ocid="numguess.primary_button"
          onClick={reset}
          className="w-full py-3 rounded-2xl font-bold text-sm tracking-wider transition-all hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.6 0.25 250))",
            color: "oklch(0.97 0.02 280)",
            boxShadow: "0 0 20px oklch(0.65 0.28 305 / 0.4)",
          }}
        >
          Play Again
        </button>
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
