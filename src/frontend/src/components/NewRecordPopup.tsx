import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface Props {
  show: boolean;
  score: number;
  gameName: string;
  onDismiss: () => void;
}

export default function NewRecordPopup({
  show,
  score,
  gameName,
  onDismiss,
}: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 9999 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          {/* Confetti particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[..."0123456789abcdefghijklmno"].map((char) => (
              <div
                key={char}
                className="confetti-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  background: [
                    "oklch(0.82 0.2 85)",
                    "oklch(0.7 0.28 330)",
                    "oklch(0.65 0.28 305)",
                    "oklch(0.7 0.22 50)",
                    "oklch(0.72 0.2 195)",
                  ]["0123456789abcdefghijklmno".indexOf(char) % 5],
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative rounded-3xl p-8 text-center mx-4 max-w-sm w-full"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.14 0.07 280), oklch(0.1 0.05 260))",
              border: "2px solid oklch(0.82 0.2 80 / 0.8)",
              boxShadow:
                "0 0 60px oklch(0.82 0.2 80 / 0.5), 0 20px 60px oklch(0 0 0 / 0.6)",
            }}
          >
            <div className="text-6xl mb-3">🏆</div>
            <h2
              className="text-3xl font-black mb-1 tracking-wide"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.95 0.18 85), oklch(0.82 0.22 55))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NEW RECORD!
            </h2>
            <p
              className="text-sm mb-3"
              style={{ color: "oklch(0.65 0.1 280)" }}
            >
              {gameName}
            </p>
            <div
              className="text-5xl font-black"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.2 80), oklch(0.75 0.22 55))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {score}
            </div>
            <p
              className="text-xs mt-2"
              style={{ color: "oklch(0.5 0.06 280)" }}
            >
              points
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
