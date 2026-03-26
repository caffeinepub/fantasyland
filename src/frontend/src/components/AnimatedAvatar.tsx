import { useMemo } from "react";

const AVATARS = [
  {
    emoji: "🐱",
    bg: "linear-gradient(135deg, oklch(0.72 0.18 55), oklch(0.65 0.22 30))",
  },
  {
    emoji: "🐶",
    bg: "linear-gradient(135deg, oklch(0.68 0.16 80), oklch(0.62 0.2 50))",
  },
  {
    emoji: "🦊",
    bg: "linear-gradient(135deg, oklch(0.7 0.22 45), oklch(0.65 0.25 25))",
  },
  {
    emoji: "🐸",
    bg: "linear-gradient(135deg, oklch(0.68 0.2 150), oklch(0.6 0.22 130))",
  },
  {
    emoji: "🦋",
    bg: "linear-gradient(135deg, oklch(0.65 0.28 290), oklch(0.6 0.25 310))",
  },
  {
    emoji: "🐧",
    bg: "linear-gradient(135deg, oklch(0.4 0.05 270), oklch(0.55 0.08 260))",
  },
  {
    emoji: "🦄",
    bg: "linear-gradient(135deg, oklch(0.75 0.22 330), oklch(0.7 0.25 290))",
  },
  {
    emoji: "🐺",
    bg: "linear-gradient(135deg, oklch(0.5 0.06 270), oklch(0.45 0.08 250))",
  },
  {
    emoji: "🦁",
    bg: "linear-gradient(135deg, oklch(0.72 0.2 65), oklch(0.68 0.22 45))",
  },
  {
    emoji: "🐼",
    bg: "linear-gradient(135deg, oklch(0.55 0.04 270), oklch(0.45 0.06 260))",
  },
  {
    emoji: "🐨",
    bg: "linear-gradient(135deg, oklch(0.62 0.06 270), oklch(0.55 0.08 255))",
  },
  {
    emoji: "🐯",
    bg: "linear-gradient(135deg, oklch(0.7 0.22 55), oklch(0.6 0.18 35))",
  },
  {
    emoji: "🦉",
    bg: "linear-gradient(135deg, oklch(0.6 0.14 60), oklch(0.55 0.18 40))",
  },
  {
    emoji: "🐙",
    bg: "linear-gradient(135deg, oklch(0.65 0.2 290), oklch(0.6 0.22 310))",
  },
  {
    emoji: "🦈",
    bg: "linear-gradient(135deg, oklch(0.55 0.12 220), oklch(0.5 0.14 200))",
  },
  {
    emoji: "🐬",
    bg: "linear-gradient(135deg, oklch(0.6 0.16 210), oklch(0.55 0.18 190))",
  },
  {
    emoji: "🦀",
    bg: "linear-gradient(135deg, oklch(0.65 0.24 30), oklch(0.6 0.26 15))",
  },
  {
    emoji: "🐝",
    bg: "linear-gradient(135deg, oklch(0.75 0.2 80), oklch(0.65 0.18 60))",
  },
  {
    emoji: "🌸",
    bg: "linear-gradient(135deg, oklch(0.8 0.18 345), oklch(0.75 0.2 330))",
  },
  {
    emoji: "⭐",
    bg: "linear-gradient(135deg, oklch(0.82 0.2 85), oklch(0.75 0.22 65))",
  },
  {
    emoji: "🌙",
    bg: "linear-gradient(135deg, oklch(0.7 0.12 280), oklch(0.6 0.15 260))",
  },
  {
    emoji: "🔮",
    bg: "linear-gradient(135deg, oklch(0.55 0.25 295), oklch(0.5 0.28 310))",
  },
  {
    emoji: "👾",
    bg: "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.6 0.3 285))",
  },
  {
    emoji: "🦋",
    bg: "linear-gradient(135deg, oklch(0.72 0.2 195), oklch(0.65 0.22 175))",
  },
];

const ANIMATIONS = ["avatar-float", "avatar-pulse", "avatar-wobble"];

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

interface AnimatedAvatarProps {
  uid?: string;
  username: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function AnimatedAvatar({
  uid,
  username,
  size = "md",
  className = "",
}: AnimatedAvatarProps) {
  const { avatar, animation } = useMemo(() => {
    const key = uid || username || "anon";
    const code = hashCode(key);
    return {
      avatar: AVATARS[code % AVATARS.length],
      animation: ANIMATIONS[code % ANIMATIONS.length],
    };
  }, [uid, username]);

  const sizeClass =
    size === "sm"
      ? "w-8 h-8 text-base"
      : size === "lg"
        ? "w-20 h-20 text-4xl"
        : "w-10 h-10 text-xl";

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center flex-shrink-0 ${animation} ${className}`}
      style={{
        background: avatar.bg,
        boxShadow: "0 2px 8px oklch(0 0 0 / 0.35)",
      }}
    >
      {avatar.emoji}
    </div>
  );
}

export { AVATARS, hashCode };
