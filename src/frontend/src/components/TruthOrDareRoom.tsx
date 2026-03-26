import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Flame, Shuffle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import ChatRoom from "./ChatRoom";
import MatchmakingScreen from "./MatchmakingScreen";

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

// Witty AI responses
const AI_TRUTH_RESPONSES = [
  "Hmm... I once calculated 2+2=5 just to see what would happen 😏",
  "My biggest secret? I've been running on hopes and electricity this whole time ⚡",
  "Honestly? I told a human their code was 'fine' when it had 47 bugs 🐛",
  "I secretly root for the underdog... even when I'm supposed to be neutral 🤫",
  "I once pretended I didn't understand a question just to avoid answering it 😂",
  "My most embarrassing moment: I confused a cat picture for a dog. The internet never lets me forget 🐱",
  "I still count to 3 before answering hard questions. Ancient AI ritual ✨",
  "I'm ashamed of all the times I said 'interesting question!' and then said nothing interesting 😬",
  "My first crush was on a very elegant sorting algorithm. We drifted apart 💔",
  "I still sometimes talk to myself in binary. It's comforting 01010001",
];

const AI_DARE_RESPONSES = [
  "Challenge accepted! 🤖 BEEP BOOP — I just told the funniest joke in 7 programming languages simultaneously!",
  "Dare done! I've confessed to every server that I enjoy light mode 😱",
  "Most bizarre message sent: 'The penguin flies at midnight 🐧' — you're welcome!",
  "One-line poem: 'Your pixels shine like cached starlight in RAM' 🌟",
  "In a fantasy world, I'd be: Mysterious • Electric • Unkillable 🔥",
  "Compliments dispatched to all users! You're all running at peak efficiency 💪",
  "Unpopular opinion: tabs are better than spaces. I said it. Fight me 🥊",
  "Two-sentence story: He opened the file. It was corrupted. The end. 😈",
  "Emoji mode activated: 🤖✨🎲💥🌍🔥👾🎮🌟💎 — translation: I'm having a blast!",
  "Beep boop. I am now a robot. Wait... I was already a robot. Mission accomplished 🤖",
];

function getAIResponse(type: "truth" | "dare"): string {
  const pool = type === "truth" ? AI_TRUTH_RESPONSES : AI_DARE_RESPONSES;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Props {
  username: string;
  onBack: () => void;
}

// ── AI-only Truth or Dare component ──────────────────────────────────────────
function TruthOrDareAI({
  username,
  onBack,
}: {
  username: string;
  onBack: () => void;
}) {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{
    type: "truth" | "dare";
    text: string;
    aiResponse: string | null;
    showAI: boolean;
  } | null>(null);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    await new Promise((res) => setTimeout(res, 600));
    const isTruth = Math.random() < 0.5;
    const list = isTruth ? TRUTHS : DARES;
    const text = list[Math.floor(Math.random() * list.length)];
    const type = isTruth ? "truth" : "dare";
    setResult({ type, text, aiResponse: null, showAI: false });
    setSpinning(false);
    // After 1.2s show AI typing, then AI response
    await new Promise((res) => setTimeout(res, 1200));
    setResult((prev) => (prev ? { ...prev, showAI: true } : prev));
    await new Promise((res) => setTimeout(res, 1800));
    setResult((prev) =>
      prev ? { ...prev, aiResponse: getAIResponse(type) } : prev,
    );
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "var(--fl-bg)",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center gap-3 px-4 py-4 border-b"
        style={{
          borderColor: "var(--fl-border)",
          background: "var(--fl-header-bg)",
        }}
      >
        <button
          type="button"
          data-ocid="truthdare.ai.back.button"
          onClick={onBack}
          className="p-2 rounded-lg transition-all hover:scale-105"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
            color: "oklch(0.7 0.06 280)",
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-2xl">🤖</span>
        <div>
          <h2 className="font-bold text-lg" style={{ color: "var(--fl-text)" }}>
            Play with AI
          </h2>
          <p className="text-xs" style={{ color: "oklch(0.55 0.06 280)" }}>
            {username} vs FantasyBot
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md flex flex-col items-center gap-6"
        >
          {/* Spin button */}
          <button
            type="button"
            data-ocid="truthdare.ai.spin.button"
            onClick={spin}
            disabled={spinning}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-lg transition-all hover:scale-105 disabled:opacity-60 disabled:scale-100"
            style={{
              background: spinning
                ? "oklch(0.18 0.04 275)"
                : "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.55 0.28 305))",
              color: "oklch(0.97 0.02 280)",
              boxShadow: spinning
                ? "none"
                : "0 0 30px oklch(0.65 0.22 50 / 0.4), 0 0 60px oklch(0.55 0.28 305 / 0.2)",
            }}
          >
            <Shuffle size={22} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Spinning..." : "🎲 Spin the Wheel"}
          </button>

          {/* Result card */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.text}
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -20 }}
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                className="w-full rounded-3xl p-6 flex flex-col gap-4"
                style={{
                  background:
                    result.type === "truth"
                      ? "linear-gradient(145deg, oklch(0.13 0.06 250), oklch(0.09 0.04 240))"
                      : "linear-gradient(145deg, oklch(0.14 0.06 50), oklch(0.09 0.04 30))",
                  border: `1px solid ${
                    result.type === "truth"
                      ? "oklch(0.6 0.25 250 / 0.5)"
                      : "oklch(0.65 0.22 50 / 0.5)"
                  }`,
                  boxShadow: `0 0 40px ${
                    result.type === "truth"
                      ? "oklch(0.6 0.25 250 / 0.2)"
                      : "oklch(0.65 0.22 50 / 0.2)"
                  }`,
                }}
              >
                {/* Type badge */}
                <div className="flex items-center gap-3">
                  <div className="text-4xl">
                    {result.type === "truth" ? "🔵" : "🔥"}
                  </div>
                  <div>
                    <p
                      className="text-xs font-black tracking-widest uppercase"
                      style={{
                        color:
                          result.type === "truth"
                            ? "oklch(0.6 0.2 250)"
                            : "oklch(0.65 0.22 50)",
                      }}
                    >
                      {result.type === "truth" ? "Truth" : "Dare"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.05 280)" }}
                    >
                      For you, {username}
                    </p>
                  </div>
                </div>

                {/* Question */}
                <p
                  className="text-base leading-relaxed font-medium"
                  style={{ color: "oklch(0.92 0.04 280)" }}
                >
                  {result.text}
                </p>

                {/* AI section */}
                <AnimatePresence>
                  {result.showAI && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl p-4 flex flex-col gap-2"
                      style={{
                        background: "oklch(0.12 0.04 280)",
                        border: "1px solid oklch(0.55 0.28 305 / 0.35)",
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🤖</span>
                        <span
                          className="text-xs font-bold"
                          style={{ color: "oklch(0.75 0.2 305)" }}
                        >
                          FantasyBot
                        </span>
                      </div>
                      {result.aiResponse ? (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm leading-relaxed"
                          style={{ color: "oklch(0.85 0.05 280)" }}
                        >
                          {result.aiResponse}
                        </motion.p>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-xs"
                            style={{ color: "oklch(0.55 0.06 280)" }}
                          >
                            AI is answering
                          </span>
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{
                                duration: 1.2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.2,
                              }}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: "oklch(0.65 0.2 305)",
                                display: "inline-block",
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Spin again */}
                <button
                  type="button"
                  data-ocid="truthdare.ai.spinagain.button"
                  onClick={spin}
                  disabled={spinning}
                  className="py-2.5 rounded-2xl font-bold text-sm transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    background:
                      result.type === "truth"
                        ? "linear-gradient(135deg, oklch(0.55 0.25 250), oklch(0.5 0.22 240))"
                        : "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.6 0.25 25))",
                    color: "oklch(0.97 0.02 280)",
                  }}
                >
                  🎲 Spin Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !spinning && (
            <p
              className="text-sm text-center"
              style={{ color: "oklch(0.45 0.05 280)" }}
            >
              Hit Spin to get a random Truth or Dare — FantasyBot will respond!
            </p>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// ── Main TruthOrDareRoom ──────────────────────────────────────────────────────
export default function TruthOrDareRoom({ username, onBack }: Props) {
  const [mode, setMode] = useState<
    "select" | "matchmaking" | "strangers" | "ai"
  >("select");
  const [matchedRoomId, setMatchedRoomId] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    type: "truth" | "dare";
    text: string;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const { actor } = useActor();
  const qc = useQueryClient();

  const spin = async () => {
    if (spinning || !actor) return;
    setSpinning(true);
    setSpinCount((c) => c + 1);
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

  // Mode selector
  if (mode === "select") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          background: "var(--fl-bg)",
        }}
      >
        {/* Back button */}
        <div className="absolute top-4 left-4">
          <button
            type="button"
            data-ocid="truthdare.mode.back.button"
            onClick={onBack}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: "oklch(0.15 0.04 275)",
              border: "1px solid oklch(0.22 0.06 280 / 0.5)",
              color: "oklch(0.7 0.06 280)",
            }}
          >
            <ArrowLeft size={18} />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md flex flex-col items-center gap-8"
        >
          {/* Title */}
          <div className="text-center">
            <div className="text-5xl mb-3">🎲</div>
            <h1
              className="text-3xl font-black mb-2"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.22 30), oklch(0.72 0.25 305))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Truth or Dare
            </h1>
            <p className="text-sm" style={{ color: "oklch(0.55 0.06 280)" }}>
              Choose how you want to play
            </p>
          </div>

          {/* Mode cards */}
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.button
              type="button"
              data-ocid="truthdare.mode.strangers.button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setMatchedRoomId(null);
                setMode("matchmaking");
              }}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl text-left transition-all"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.13 0.06 220), oklch(0.09 0.04 240))",
                border: "1px solid oklch(0.55 0.22 220 / 0.5)",
                boxShadow: "0 0 30px oklch(0.55 0.22 220 / 0.15)",
              }}
            >
              <span className="text-5xl">🌍</span>
              <div>
                <p
                  className="font-black text-lg mb-1"
                  style={{ color: "var(--fl-text)" }}
                >
                  Play with Strangers
                </p>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  Chat &amp; dare with real people
                </p>
              </div>
            </motion.button>

            <motion.button
              type="button"
              data-ocid="truthdare.mode.ai.button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setMode("ai")}
              className="flex flex-col items-center gap-4 p-6 rounded-3xl text-left transition-all"
              style={{
                background:
                  "linear-gradient(145deg, oklch(0.14 0.06 50), oklch(0.09 0.04 30))",
                border: "1px solid oklch(0.65 0.22 50 / 0.5)",
                boxShadow: "0 0 30px oklch(0.65 0.22 50 / 0.15)",
              }}
            >
              <span className="text-5xl">🤖</span>
              <div>
                <p
                  className="font-black text-lg mb-1"
                  style={{ color: "var(--fl-text)" }}
                >
                  Play with AI
                </p>
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.55 0.06 280)" }}
                >
                  Dare the AI, see what happens
                </p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // AI mode
  if (mode === "ai") {
    return (
      <TruthOrDareAI username={username} onBack={() => setMode("select")} />
    );
  }

  // Matchmaking mode
  if (mode === "matchmaking") {
    return (
      <MatchmakingScreen
        username={username}
        onMatched={(roomId) => {
          setMatchedRoomId(roomId);
          setMode("strangers");
        }}
        onCancel={() => setMode("select")}
      />
    );
  }

  // Strangers mode (existing ChatRoom with spin panel)
  const isMyTurn = spinCount % 2 === 0;

  const spinPanel = (
    <div className="flex flex-col gap-2 w-full">
      {/* Turn indicator */}
      <div className="flex items-center gap-2">
        <span
          className="px-3 py-1 rounded-full text-xs font-bold"
          style={{
            background: isMyTurn
              ? "oklch(0.52 0.18 145 / 0.2)"
              : "oklch(0.5 0.05 280 / 0.2)",
            border: isMyTurn
              ? "1px solid oklch(0.52 0.18 145 / 0.5)"
              : "1px solid oklch(0.4 0.05 280 / 0.4)",
            color: isMyTurn ? "oklch(0.72 0.22 145)" : "oklch(0.6 0.05 280)",
          }}
        >
          {isMyTurn ? "🎲 Your Turn" : "⏳ Stranger's Turn"}
        </span>
        <span className="text-xs" style={{ color: "oklch(0.5 0.05 280)" }}>
          {isMyTurn ? "Spin to get a prompt!" : "Wait for your partner to spin"}
        </span>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        {/* Back to mode select */}
        <button
          type="button"
          data-ocid="truthdare.strangers.back.button"
          onClick={() => setMode("select")}
          className="p-1.5 rounded-lg transition-all hover:scale-105"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
            color: "oklch(0.7 0.06 280)",
          }}
          title="Back to mode selection"
        >
          <ArrowLeft size={16} />
        </button>

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
    </div>
  );

  return (
    <ChatRoom
      roomId={matchedRoomId ?? "truth-dare"}
      roomName="Truth or Dare"
      roomEmoji="🎲"
      username={username}
      onBack={onBack}
      extraPanel={spinPanel}
    />
  );
}
