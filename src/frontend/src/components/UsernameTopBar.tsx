import { Pencil, Sparkles } from "lucide-react";
import { useState } from "react";

interface Props {
  username: string;
  onRename: () => void;
}

export default function UsernameTopBar({ username, onRename }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end px-4 py-2 pointer-events-none"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.07 0.03 270 / 0.85) 0%, transparent 100%)",
        backdropFilter: "blur(8px) saturate(1.4)",
      }}
    >
      <button
        type="button"
        data-ocid="topbar.edit_button"
        className="flex items-center gap-2 px-3 py-1.5 rounded-full pointer-events-auto transition-all duration-200"
        style={{
          background: hovered
            ? "oklch(0.18 0.07 280 / 0.9)"
            : "oklch(0.13 0.05 280 / 0.7)",
          border: "1px solid oklch(0.65 0.28 305 / 0.45)",
          boxShadow: hovered
            ? "0 0 16px oklch(0.65 0.28 305 / 0.35), 0 0 6px oklch(0.78 0.15 85 / 0.2)"
            : "0 0 8px oklch(0.65 0.28 305 / 0.15)",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onRename}
        title="Change your name"
      >
        <Sparkles
          size={12}
          style={{ color: "oklch(0.78 0.15 85)", flexShrink: 0 }}
        />
        <span
          className="text-xs font-semibold tracking-wide max-w-[160px] truncate"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.92 0.04 280) 0%, oklch(0.78 0.15 85) 50%, oklch(0.82 0.28 305) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            textShadow: "none",
          }}
        >
          Welcome, {username}
        </span>
        <Pencil
          size={10}
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: "oklch(0.6 0.18 305)",
            transform: hovered ? "rotate(-15deg) scale(1.2)" : "none",
          }}
        />
      </button>
    </div>
  );
}
