import { Palette } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { THEMES, type ThemeName, useTheme } from "../contexts/ThemeContext";

export default function ThemeToggle({ ocidPrefix }: { ocidPrefix: string }) {
  const { theme, setTheme, tokens } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const themeEntries = Object.entries(THEMES) as [
    ThemeName,
    (typeof THEMES)[ThemeName],
  ][];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-ocid={`${ocidPrefix}.theme.toggle`}
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
        style={{
          background: tokens.isDark ? "oklch(0.15 0.04 275)" : "#f1f5f9",
          border: `1px solid ${tokens.border}`,
          color: tokens.textMuted,
          boxShadow: open ? `0 0 12px ${tokens.accent}44` : "none",
        }}
        title="Change theme"
      >
        <Palette size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              onClick={() => setOpen(false)}
              aria-label="Close theme picker"
            />
            <motion.div
              className="absolute left-0 top-full mt-2 z-50 rounded-xl p-2 shadow-2xl min-w-[160px]"
              style={{
                background: tokens.surface,
                border: `1px solid ${tokens.border}`,
                boxShadow: `0 12px 40px ${tokens.isDark ? "oklch(0 0 0 / 0.5)" : "rgba(0,0,0,0.15)"}`,
              }}
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {themeEntries.map(([name, t], idx) => (
                <button
                  key={name}
                  type="button"
                  data-ocid={`theme.option.${idx + 1}`}
                  onClick={() => {
                    setTheme(name);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all hover:opacity-80"
                  style={{
                    background:
                      theme === name ? `${tokens.accent}22` : "transparent",
                    color: tokens.text,
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0"
                    style={{
                      background: t.circle,
                      borderColor:
                        theme === name ? tokens.accent : tokens.border,
                    }}
                  />
                  <span className="text-sm font-medium">{t.label}</span>
                  {theme === name && (
                    <span
                      className="ml-auto text-xs"
                      style={{ color: tokens.accent }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
