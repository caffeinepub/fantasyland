import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const ALL_NAMES = [
  "Someone",
  "Stranger",
  "Anonymous",
  "Ghost",
  "Shadow",
  "DarkAngel",
  "LostSoul",
  "Dreamer",
  "Rebel",
  "Neon",
  "Phantom",
  "Mystery",
  "NightOwl",
  "Wanderer",
  "SilentOne",
  "Forgotten",
  "Eclipse",
  "Mirage",
  "Raven",
  "Specter",
  "Cipher",
  "Nova",
  "Hollow",
  "Whisper",
];

function pickRandom(count: number): string[] {
  const shuffled = [...ALL_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

interface Props {
  onConfirm: (name: string) => void;
}

const PARTICLE_DATA = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  width: Math.random() * 4 + 2,
  height: Math.random() * 4 + 2,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  duration: 3 + Math.random() * 3,
  delay: Math.random() * 2,
  color:
    i % 3 === 0
      ? "oklch(0.65 0.28 305)"
      : i % 3 === 1
        ? "oklch(0.78 0.15 85)"
        : "oklch(0.72 0.2 200)",
}));

export default function UsernamePicker({ onConfirm }: Props) {
  const [suggestions, setSuggestions] = useState(() => pickRandom(12));
  const [selected, setSelected] = useState("");
  const [custom, setCustom] = useState("");

  const activeName = custom.trim() || selected;

  const handleShuffle = () => {
    setSuggestions(pickRandom(12));
    setSelected("");
  };

  const handleConfirm = () => {
    if (!activeName) return;
    onConfirm(activeName);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 40% 30%, oklch(0.12 0.06 280) 0%, oklch(0.06 0.02 260) 100%)",
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLE_DATA.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              width: p.width,
              height: p.height,
              left: p.left,
              top: p.top,
              background: p.color,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: p.duration,
              repeat: Number.POSITIVE_INFINITY,
              delay: p.delay,
            }}
          />
        ))}
      </div>

      <motion.div
        data-ocid="username_picker.modal"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative w-full max-w-lg mx-4 rounded-2xl p-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.12 0.04 275) 0%, oklch(0.1 0.03 280) 100%)",
          border: "1px solid oklch(0.65 0.28 305 / 0.4)",
          boxShadow:
            "0 0 60px oklch(0.65 0.28 305 / 0.15), 0 24px 48px oklch(0 0 0 / 0.5)",
        }}
      >
        <div className="text-center mb-8">
          <h2
            className="font-display text-3xl font-black mb-2"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.92 0.04 280), oklch(0.85 0.28 305))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Who are you today?
          </h2>
          <p
            className="text-xs tracking-widest uppercase mb-1"
            style={{ color: "oklch(0.78 0.15 85)" }}
          >
            Welcome the world of fantasy
          </p>
          <p className="text-sm" style={{ color: "oklch(0.55 0.06 280)" }}>
            Pick a name or craft your own identity
          </p>
        </div>

        {/* Suggestion grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <AnimatePresence mode="popLayout">
            {suggestions.map((name) => (
              <motion.button
                key={name}
                type="button"
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => {
                  setSelected(name);
                  setCustom("");
                }}
                className="py-2 px-3 rounded-xl text-sm font-medium text-center cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  background:
                    selected === name && !custom
                      ? "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.4), oklch(0.6 0.25 250 / 0.4))"
                      : "oklch(0.15 0.04 275)",
                  border:
                    selected === name && !custom
                      ? "1px solid oklch(0.65 0.28 305 / 0.8)"
                      : "1px solid oklch(0.22 0.06 280 / 0.5)",
                  color:
                    selected === name && !custom
                      ? "oklch(0.95 0.04 305)"
                      : "oklch(0.75 0.06 280)",
                  boxShadow:
                    selected === name && !custom
                      ? "0 0 12px oklch(0.65 0.28 305 / 0.3)"
                      : "none",
                }}
              >
                {name}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Shuffle button */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            data-ocid="username_picker.shuffle_button"
            onClick={handleShuffle}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: "oklch(0.16 0.05 280)",
              border: "1px solid oklch(0.45 0.15 280 / 0.5)",
              color: "oklch(0.7 0.12 280)",
            }}
          >
            <span>🔀</span> Shuffle names
          </button>
        </div>

        {/* Custom name input */}
        <div className="mb-6">
          <p className="text-xs mb-2" style={{ color: "oklch(0.5 0.05 280)" }}>
            ...or type your own
          </p>
          <Input
            data-ocid="username_picker.input"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Your custom name..."
            maxLength={24}
            className="rounded-xl border-0"
            style={{
              background: "oklch(0.14 0.04 275)",
              border: "1px solid oklch(0.28 0.08 280 / 0.6)",
              color: "oklch(0.9 0.03 280)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleConfirm();
            }}
          />
        </div>

        {/* Confirm button */}
        <Button
          type="button"
          data-ocid="username_picker.submit_button"
          onClick={handleConfirm}
          disabled={!activeName}
          className="w-full py-3 rounded-xl font-bold text-base transition-all duration-300"
          style={{
            background: activeName
              ? "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.6 0.25 250))"
              : "oklch(0.18 0.04 275)",
            color: "oklch(0.98 0.01 280)",
            border: "none",
            boxShadow: activeName
              ? "0 0 24px oklch(0.65 0.28 305 / 0.4)"
              : "none",
          }}
        >
          Enter FantasyLand ✨
        </Button>
      </motion.div>
    </div>
  );
}
