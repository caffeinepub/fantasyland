import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

interface Props {
  show: boolean;
  variant: "trending" | "viral";
  postSnippet: string;
  authorName: string;
  likes: number;
  views?: number;
  onDismiss: () => void;
}

export default function TrendingPopup({
  show,
  variant,
  postSnippet,
  authorName,
  likes,
  views,
  onDismiss,
}: Props) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [show, onDismiss]);

  const isViral = variant === "viral";

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 max-w-xs w-full cursor-pointer"
          style={{ zIndex: 9998 }}
          initial={{ x: 120, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onClick={onDismiss}
        >
          <div
            className="rounded-2xl p-4"
            style={{
              background: isViral
                ? "linear-gradient(135deg, oklch(0.16 0.06 60), oklch(0.12 0.05 50))"
                : "linear-gradient(135deg, oklch(0.14 0.06 30), oklch(0.1 0.05 20))",
              border: isViral
                ? "1px solid oklch(0.82 0.2 80 / 0.6)"
                : "1px solid oklch(0.7 0.25 30 / 0.6)",
              boxShadow: isViral
                ? "0 8px 32px oklch(0.82 0.2 80 / 0.3)"
                : "0 8px 32px oklch(0.7 0.25 30 / 0.3)",
            }}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl animate-bounce">
                {isViral ? "🌟" : "🔥"}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-black tracking-wider mb-1"
                  style={{
                    background: isViral
                      ? "linear-gradient(135deg, oklch(0.92 0.2 80), oklch(0.82 0.22 55))"
                      : "linear-gradient(135deg, oklch(0.88 0.25 35), oklch(0.75 0.28 20))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {isViral ? "VIRAL POST! 🌟" : "TRENDING NOW! 🔥"}
                </p>
                <p
                  className="text-xs font-semibold mb-0.5 truncate"
                  style={{ color: "oklch(0.75 0.1 280)" }}
                >
                  @{authorName}
                </p>
                {postSnippet && (
                  <p
                    className="text-xs truncate"
                    style={{ color: "oklch(0.55 0.06 280)" }}
                  >
                    "{postSnippet.slice(0, 50)}
                    {postSnippet.length > 50 ? "…" : ""}"
                  </p>
                )}
                <p
                  className="text-xs mt-1 font-semibold"
                  style={{
                    color: isViral
                      ? "oklch(0.82 0.2 80)"
                      : "oklch(0.75 0.25 30)",
                  }}
                >
                  {isViral && views != null
                    ? `👁 ${views} views`
                    : `❤️ ${likes} likes`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
