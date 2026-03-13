import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Shuffle } from "lucide-react";
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
];

const DARES = [
  "Tell a joke right now in chat!",
  "Confess something you've never told anyone.",
  "Send the most bizarre message you can think of.",
  "Write a one-line poem about the person above you.",
  "Describe yourself as a fantasy character in 3 words.",
  "Give a compliment to every person in the room.",
  "Share your most unpopular opinion.",
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
    const msg = `🎲 [${isTruth ? "TRUTH" : "DARE"}] ${picked}`;
    await actor.sendMessage("truth-dare", username, msg);
    await qc.invalidateQueries({ queryKey: ["messages", "truth-dare"] });
    setSpinning(false);
  };

  const spinPanel = (
    <div className="flex items-center gap-4">
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
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background:
              lastResult.type === "truth"
                ? "oklch(0.6 0.25 250 / 0.15)"
                : "oklch(0.65 0.22 50 / 0.15)",
            border: `1px solid ${lastResult.type === "truth" ? "oklch(0.6 0.25 250 / 0.4)" : "oklch(0.65 0.22 50 / 0.4)"}`,
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
          <span className="text-xs line-clamp-1 max-w-48">
            {lastResult.text}
          </span>
        </div>
      )}
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
