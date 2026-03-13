import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface Props {
  size?: number;
  className?: string;
}

export default function Logo3D({ size = 96, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      // Normalize to -1..1 based on distance from center
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      setTilt({ x: dy * -18, y: dx * 18 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const glowSize = size * 1.4;

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        perspective: "800px",
      }}
    >
      {/* Glow reflection that moves with tilt */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: glowSize,
          height: glowSize,
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translateX(${tilt.y * 0.5}px) translateY(${-tilt.x * 0.5}px)`,
          background:
            "radial-gradient(ellipse, oklch(0.65 0.28 305 / 0.35) 0%, oklch(0.78 0.15 85 / 0.15) 40%, transparent 70%)",
          filter: `blur(${size * 0.18}px)`,
          transition: "transform 0.1s ease-out",
        }}
      />

      {/* 3D logo wrapper */}
      <motion.div
        className="relative"
        style={{
          transformStyle: "preserve-3d",
          width: size,
          height: size,
        }}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          y: isHovered ? -6 : 0,
        }}
        transition={{ type: "spring", stiffness: 120, damping: 18, mass: 0.6 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Continuous float + slow spin */}
        <motion.div
          style={{ transformStyle: "preserve-3d", width: size, height: size }}
          animate={{
            y: [0, -8, 0],
            rotateY: [0, 360],
          }}
          transition={{
            y: {
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            },
            rotateY: {
              duration: 14,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            },
          }}
        >
          <img
            src="/assets/uploads/1773309582834-1-1.png"
            alt="FantasyLand"
            width={size}
            height={size}
            style={{
              width: size,
              height: size,
              objectFit: "contain",
              filter: `drop-shadow(0 0 ${size * 0.22}px oklch(0.65 0.28 305 / 0.85)) drop-shadow(0 0 ${size * 0.45}px oklch(0.78 0.15 85 / 0.45)) drop-shadow(0 ${size * 0.06}px ${size * 0.15}px oklch(0 0 0 / 0.6))`,
              transition: "filter 0.3s ease",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Shadow beneath */}
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: "-12px",
          left: "50%",
          transform: `translateX(-50%) translateX(${tilt.y * 0.8}px)`,
          width: size * 0.7,
          height: size * 0.12,
          background:
            "radial-gradient(ellipse, oklch(0.65 0.28 305 / 0.3) 0%, transparent 70%)",
          filter: "blur(8px)",
          transition: "transform 0.1s ease-out",
        }}
      />
    </div>
  );
}
