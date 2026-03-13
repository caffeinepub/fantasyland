import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import {
  useGetMatchResult,
  useJoinMatchmaking,
  useLeaveMatchmaking,
} from "../hooks/useQueries";

interface Props {
  username: string;
  onMatched: (roomId: string) => void;
  onCancel: () => void;
  onBotChat?: () => void;
}

export default function MatchmakingScreen({
  username,
  onMatched,
  onCancel,
  onBotChat,
}: Props) {
  const joinMutation = useJoinMatchmaking();
  const leaveMutation = useLeaveMatchmaking();
  const { data: matchResult } = useGetMatchResult(username, true);
  const joined = useRef(false);
  const joinMutateRef = useRef(joinMutation.mutate);
  joinMutateRef.current = joinMutation.mutate;

  useEffect(() => {
    if (joined.current) return;
    joined.current = true;
    joinMutateRef.current(username);
  }, [username]);

  useEffect(() => {
    if (matchResult && typeof matchResult === "string") {
      onMatched(matchResult);
    } else if (
      matchResult &&
      Array.isArray(matchResult) &&
      matchResult.length > 0
    ) {
      onMatched(matchResult[0]);
    }
  }, [matchResult, onMatched]);

  const handleCancel = async () => {
    await leaveMutation.mutateAsync(username);
    onCancel();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, oklch(0.13 0.06 330) 0%, oklch(0.08 0.025 300) 50%, oklch(0.06 0.02 280) 100%)",
      }}
    >
      {/* Orbiting particles */}
      <div className="relative w-48 h-48 mb-10">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background:
                i % 2 === 0 ? "oklch(0.7 0.28 330)" : "oklch(0.72 0.2 200)",
              top: "50%",
              left: "50%",
              marginTop: "-6px",
              marginLeft: "-6px",
              boxShadow:
                i % 2 === 0
                  ? "0 0 12px oklch(0.7 0.28 330)"
                  : "0 0 12px oklch(0.72 0.2 200)",
            }}
            animate={{
              rotate: [0, 360],
              x: [0, Math.cos((i * Math.PI) / 2) * 70],
              y: [0, Math.sin((i * Math.PI) / 2) * 70],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
              delay: i * 0.6,
            }}
          />
        ))}

        {/* Center icon */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
            style={{
              background:
                "radial-gradient(circle, oklch(0.18 0.08 330) 0%, oklch(0.12 0.05 310) 100%)",
              border: "2px solid oklch(0.7 0.28 330 / 0.5)",
              boxShadow: "0 0 40px oklch(0.7 0.28 330 / 0.3)",
            }}
          >
            👥
          </div>
        </motion.div>
      </div>

      <motion.h2
        className="font-display text-3xl font-black mb-3 text-center"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.92 0.04 280), oklch(0.7 0.28 330))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
      >
        Searching for a Stranger...
      </motion.h2>

      {/* Pulsing dots */}
      <div
        data-ocid="matchmaking.loading_state"
        className="flex items-center gap-2 mb-10"
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 rounded-full"
            style={{ background: "oklch(0.7 0.28 330)" }}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.2,
              repeat: Number.POSITIVE_INFINITY,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      <p
        className="text-sm mb-8 text-center max-w-xs"
        style={{ color: "oklch(0.55 0.06 280)" }}
      >
        You'll be anonymously matched with another wanderer in the realm
      </p>

      <Button
        type="button"
        data-ocid="matchmaking.cancel_button"
        onClick={handleCancel}
        className="px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
        style={{
          background: "oklch(0.18 0.04 275)",
          border: "1px solid oklch(0.35 0.1 280 / 0.5)",
          color: "oklch(0.65 0.08 280)",
        }}
      >
        Cancel
      </Button>

      {onBotChat && (
        <button
          type="button"
          data-ocid="matchmaking.secondary_button"
          onClick={() => {
            handleCancel();
            onBotChat();
          }}
          className="mt-3 px-8 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.18 175), oklch(0.5 0.2 200))",
            border: "1px solid oklch(0.6 0.2 175 / 0.5)",
            color: "oklch(0.95 0.03 160)",
            cursor: "pointer",
            boxShadow: "0 0 20px oklch(0.45 0.18 175 / 0.3)",
          }}
        >
          🤖 Chat with AI Bot
        </button>
      )}
    </div>
  );
}
