import { useEffect, useRef, useState } from "react";
import Logo3D from "./Logo3D";

interface Props {
  onDone: () => void;
}

const LETTERS_WITH_KEYS = "FantasyLand".split("").map((char, pos) => ({
  char,
  key: `pos-${pos}`,
}));

const PARTICLE_COUNT = 60;

interface Particle {
  id: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  left: number;
}

function generateParticles(): Particle[] {
  const colors = [
    "oklch(0.65 0.28 305)",
    "oklch(0.78 0.15 85)",
    "oklch(0.6 0.25 250)",
    "oklch(0.75 0.22 320)",
    "oklch(0.8 0.18 200)",
  ];
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 6 + 4,
    delay: Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    left: Math.random() * 100,
  }));
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<"enter" | "show" | "exit">("enter");
  const [visibleLetters, setVisibleLetters] = useState(0);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [particles] = useState(generateParticles);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const letterInterval = setInterval(() => {
      setVisibleLetters((prev) => {
        if (prev >= LETTERS_WITH_KEYS.length) {
          clearInterval(letterInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 120);

    const subtitleTimeout = setTimeout(
      () => setShowSubtitle(true),
      LETTERS_WITH_KEYS.length * 120 + 400,
    );
    const exitTimeout = setTimeout(() => setPhase("exit"), 3500);
    const doneTimeout = setTimeout(() => onDone(), 4300);

    return () => {
      clearInterval(letterInterval);
      clearTimeout(subtitleTimeout);
      clearTimeout(exitTimeout);
      clearTimeout(doneTimeout);
    };
  }, [onDone]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const sparkles: Array<{
      x: number;
      y: number;
      size: number;
      opacity: number;
      speed: number;
      hue: number;
    }> = [];
    for (let i = 0; i < 80; i++) {
      sparkles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random(),
        speed: Math.random() * 0.02 + 0.005,
        hue: Math.random() * 60 + 270,
      });
    }

    let running = true;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of sparkles) {
        s.opacity += s.speed;
        if (s.opacity > 1) {
          s.opacity = 0;
          s.x = Math.random() * canvas.width;
          s.y = Math.random() * canvas.height;
        }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, 70%, ${s.opacity})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, oklch(0.15 0.08 280) 0%, oklch(0.07 0.04 260) 50%, oklch(0.05 0.02 280) 100%)",
        transition: phase === "exit" ? "opacity 0.8s ease-out" : undefined,
        opacity: phase === "exit" ? 0 : 1,
        pointerEvents: phase === "exit" ? "none" : "auto",
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full animate-float-up"
            style={{
              left: `${p.left}%`,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      <div
        className="absolute animate-spin-rune pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          border: "1px solid oklch(0.65 0.28 305 / 0.15)",
          borderRadius: "50%",
          boxShadow: "0 0 30px oklch(0.65 0.28 305 / 0.1) inset",
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: "320px",
          height: "320px",
          border: "1px solid oklch(0.78 0.15 85 / 0.12)",
          borderRadius: "50%",
          animation: "spin-rune 12s linear infinite reverse",
        }}
      />

      <div
        className="mb-6 relative z-10"
        style={{
          opacity: visibleLetters > 0 ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        <Logo3D size={96} />
      </div>

      <div className="relative z-10 flex items-end gap-0">
        {LETTERS_WITH_KEYS.map(({ char, key }, i) => (
          <span
            key={key}
            className="font-display text-6xl sm:text-7xl md:text-8xl font-black tracking-wide"
            style={{
              opacity: visibleLetters > i ? 1 : 0,
              transform:
                visibleLetters > i
                  ? "translateY(0) rotateX(0deg)"
                  : "translateY(20px) rotateX(90deg)",
              filter: visibleLetters > i ? "blur(0)" : "blur(8px)",
              transition: `opacity 0.4s ease ${i * 0.03}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 0.03}s, filter 0.4s ease ${i * 0.03}s`,
              background:
                char === " "
                  ? undefined
                  : "linear-gradient(135deg, oklch(0.92 0.04 280) 0%, oklch(0.78 0.15 85) 40%, oklch(0.85 0.28 305) 70%, oklch(0.78 0.15 85) 100%)",
              WebkitBackgroundClip: char === " " ? undefined : "text",
              WebkitTextFillColor: char === " " ? undefined : "transparent",
              backgroundClip: char === " " ? undefined : "text",
              display: char === " " ? "inline" : "inline-block",
              lineHeight: 1.1,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      <div
        className="relative z-10 mt-4 font-body text-lg sm:text-xl tracking-[0.4em] uppercase"
        style={{
          color: "oklch(0.78 0.15 85)",
          opacity: showSubtitle ? 1 : 0,
          transform: showSubtitle ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.8s ease, transform 0.8s ease",
          textShadow: "0 0 20px oklch(0.78 0.15 85 / 0.6)",
        }}
      >
        Welcome the world of fantasy
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.65 0.28 305 / 0.5), oklch(0.78 0.15 85 / 0.5), transparent)",
          boxShadow: "0 0 20px oklch(0.65 0.28 305 / 0.3)",
        }}
      />
    </div>
  );
}
