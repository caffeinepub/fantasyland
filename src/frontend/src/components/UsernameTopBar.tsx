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
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 py-3 pointer-events-none"
      style={{
        background:
          "linear-gradient(0deg, oklch(0.07 0.03 270 / 0.95) 0%, transparent 100%)",
        backdropFilter: "blur(12px) saturate(1.4)",
      }}
    >
      <button
        type="button"
        data-ocid="topbar.edit_button"
        className="flex items-center gap-3 px-6 py-3 rounded-2xl pointer-events-auto transition-all duration-300"
        style={{
          background: hovered
            ? "oklch(0.18 0.07 280 / 0.95)"
            : "oklch(0.13 0.05 280 / 0.85)",
          border: "1.5px solid oklch(0.65 0.28 305 / 0.5)",
          boxShadow: hovered
            ? "0 0 28px oklch(0.65 0.28 305 / 0.5), 0 0 10px oklch(0.78 0.15 85 / 0.3)"
            : "0 0 14px oklch(0.65 0.28 305 / 0.2)",
          cursor: "pointer",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onRename}
        title="Change your name"
      >
        <Sparkles
          size={18}
          style={{ color: "oklch(0.78 0.15 85)", flexShrink: 0 }}
        />
        <span
          className="text-lg font-black tracking-wide truncate max-w-[260px]"
          style={{
            background:
              "linear-gradient(90deg, oklch(0.96 0.04 280) 0%, oklch(0.78 0.15 85) 45%, oklch(0.85 0.28 305) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Welcome, {username}
        </span>
        <Pencil
          size={15}
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            color: "oklch(0.65 0.22 305)",
            transform: hovered ? "rotate(-15deg) scale(1.25)" : "none",
          }}
        />
      </button>
    </div>
  );
}
