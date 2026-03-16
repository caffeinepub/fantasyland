import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Shuffle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import ChatRoom from "./ChatRoom";

const TRUTHS = [
  "What's your biggest secret that you've never told anyone?",
  "Have you ever lied to your best friend?",
  "What's your most embarrassing moment?",
  "Who here do you find most mysterious?",
  "What's a habit you're ashamed of?",
  "Have you ever cheated on a game or test?",
  "What's the strangest dream you've ever had?",
  "What's something you've done that you're not proud of?",
  "Who was your first crush and what were they like?",
  "What's the most childish thing you still do?",
];

const DARES = [
  "Tell a joke right now in chat!",
  "Confess something you've never told anyone.",
  "Send the most bizarre message you can think of.",
  "Write a one-line poem about the person above you.",
  "Describe yourself as a fantasy character in 3 words.",
  "Give a compliment to every person in the room.",
  "Share your most unpopular opinion.",
  "Make up a short story in 2 sentences right now.",
  "Type your message using only emojis.",
  "Send a message pretending you're a robot.",
];

interface Props {
  username: string;
  onBack: () => void;
}

export default function TruthOrDareRoom({ username, onBack }: Props) {
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    type: "truth" | "dare";
    text: string;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const { actor } = useActor();
  const qc = useQueryClient();

  const spin = async () => {
    if (spinning || !actor) return;
    setSpinning(true);
    const isTruth = Math.random() < 0.5;
    const list = isTruth ? TRUTHS : DARES;
    const picked = list[Math.floor(Math.random() * list.length)];
    const result = {
      type: (isTruth ? "truth" : "dare") as "truth" | "dare",
      text: picked,
    };
    setLastResult(result);
    setShowResultModal(true);
    const msg = `🎲 [${isTruth ? "TRUTH" : "DARE"}] ${picked}`;
    await actor.sendMessage("truth-dare", username, msg, null);
    await qc.invalidateQueries({ queryKey: ["messages", "truth-dare"] });
    setSpinning(false);
  };

  const spinPanel = (
    <div className="flex items-center gap-4 flex-wrap">
      <Button
        type="button"
        data-ocid="truthdare.spin.button"
        onClick={spin}
        disabled={spinning || !actor}
        className="flex items-center gap-2 px-5 py-2 rounded-xl font-bold transition-all duration-200"
        style={{
          background: spinning
            ? "oklch(0.18 0.04 275)"
            : "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 25))",
          color: "oklch(0.95 0.02 280)",
          border: "none",
          boxShadow: spinning ? "none" : "0 0 20px oklch(0.65 0.22 50 / 0.4)",
        }}
      >
        <Shuffle size={16} className={spinning ? "animate-spin" : ""} />
        {spinning ? "Spinning..." : "Spin the Wheel"}
      </Button>
      {lastResult && (
        <button
          type="button"
          data-ocid="truthdare.result.button"
          onClick={() => setShowResultModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
          style={{
            background:
              lastResult.type === "truth"
                ? "oklch(0.6 0.25 250 / 0.15)"
                : "oklch(0.65 0.22 50 / 0.15)",
            border: `1px solid ${
              lastResult.type === "truth"
                ? "oklch(0.6 0.25 250 / 0.4)"
                : "oklch(0.65 0.22 50 / 0.4)"
            }`,
            color:
              lastResult.type === "truth"
                ? "oklch(0.72 0.2 200)"
                : "oklch(0.72 0.22 55)",
          }}
        >
          <Flame size={14} />
          <span className="font-bold">
            {lastResult.type === "truth" ? "TRUTH" : "DARE"}:
          </span>
          <span className="text-xs truncate max-w-[120px] sm:max-w-xs">
            {lastResult.text}
          </span>
          <span className="text-xs opacity-60 ml-1">(tap to read)</span>
        </button>
      )}

      {/* Full result modal */}
      <AnimatePresence>
        {showResultModal && lastResult && (
          <motion.div
            data-ocid="truthdare.result.modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              background: "oklch(0 0 0 / 0.75)",
              backdropFilter: "blur(8px)",
            }}
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm rounded-3xl p-6 flex flex-col gap-5"
              style={{
                background:
                  lastResult.type === "truth"
                    ? "linear-gradient(145deg, oklch(0.13 0.06 250), oklch(0.09 0.04 240))"
                    : "linear-gradient(145deg, oklch(0.14 0.06 50), oklch(0.09 0.04 30))",
                border: `1px solid ${
                  lastResult.type === "truth"
                    ? "oklch(0.6 0.25 250 / 0.5)"
                    : "oklch(0.65 0.22 50 / 0.5)"
                }`,
                boxShadow: `0 0 60px ${
                  lastResult.type === "truth"
                    ? "oklch(0.6 0.25 250 / 0.25)"
                    : "oklch(0.65 0.22 50 / 0.25)"
                }`,
              }}
            >
              {/* Close button */}
              <button
                type="button"
                data-ocid="truthdare.result.close_button"
                onClick={() => setShowResultModal(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  border: "1px solid oklch(0.28 0.08 280 / 0.6)",
                  color: "oklch(0.7 0.06 280)",
                }}
              >
                <X size={14} />
              </button>

              {/* Type badge */}
              <div className="flex items-center gap-3">
                <div className="text-4xl">
                  {lastResult.type === "truth" ? "🔵" : "🔥"}
                </div>
                <div>
                  <p
                    className="text-xs font-black tracking-widest uppercase"
                    style={{
                      color:
                        lastResult.type === "truth"
                          ? "oklch(0.6 0.2 250)"
                          : "oklch(0.65 0.22 50)",
                    }}
                  >
                    {lastResult.type === "truth" ? "Truth" : "Dare"}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.5 0.05 280)" }}
                  >
                    Spin result for {username}
                  </p>
                </div>
              </div>

              {/* Full text */}
              <p
                className="text-base leading-relaxed font-medium"
                style={{ color: "oklch(0.92 0.04 280)" }}
              >
                {lastResult.text}
              </p>

              {/* Spin again button */}
              <button
                type="button"
                data-ocid="truthdare.spinagain.button"
                onClick={() => {
                  setShowResultModal(false);
                  spin();
                }}
                disabled={spinning}
                className="py-2.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  background:
                    lastResult.type === "truth"
                      ? "linear-gradient(135deg, oklch(0.55 0.25 250), oklch(0.5 0.22 240))"
                      : "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 25))",
                  color: "oklch(0.97 0.02 280)",
                }}
              >
                🎲 Spin Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <ChatRoom
      roomId="truth-dare"
      roomName="Truth or Dare"
      roomEmoji="🎲"
      username={username}
      onBack={onBack}
      extraPanel={spinPanel}
    />
  );
}
