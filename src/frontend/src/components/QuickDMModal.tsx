import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquarePlus, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface Props {
  currentUsername: string;
  open: boolean;
  onClose: () => void;
  onStartDm: (roomId: string, targetUsername: string) => void;
}

export default function QuickDMModal({
  currentUsername,
  open,
  onClose,
  onStartDm,
}: Props) {
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const { tokens } = useTheme();

  const handleSubmit = () => {
    const trimmed = target.trim();
    if (!trimmed) {
      setError("Please enter a username or ID.");
      return;
    }
    if (trimmed.toLowerCase() === currentUsername.toLowerCase()) {
      setError("You can't message yourself!");
      return;
    }
    const roomId = [currentUsername, trimmed].sort().join("--dm--");
    onStartDm(roomId, trimmed);
    setTarget("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            data-ocid="quick_dm.modal"
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: tokens.surface,
              border: `1px solid ${tokens.border}`,
              boxShadow: `0 20px 60px ${tokens.isDark ? "oklch(0 0 0 / 0.6)" : "rgba(0,0,0,0.15)"}, 0 0 0 1px ${tokens.border}`,
            }}
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${tokens.accent}22`,
                    border: `1px solid ${tokens.accent}44`,
                  }}
                >
                  <MessageSquarePlus
                    size={18}
                    style={{ color: tokens.accent }}
                  />
                </div>
                <div>
                  <h3
                    className="font-bold text-base"
                    style={{ color: tokens.text }}
                  >
                    Quick Private Chat
                  </h3>
                  <p className="text-xs" style={{ color: tokens.textMuted }}>
                    Chat privately with anyone
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="quick_dm.close_button"
                onClick={onClose}
                className="p-1.5 rounded-lg transition-all hover:opacity-70"
                style={{
                  background: tokens.isDark
                    ? "oklch(0.18 0.04 275)"
                    : "#f1f5f9",
                  color: tokens.textMuted,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Input */}
            <div className="mb-4">
              <label
                htmlFor="quick-dm-input"
                className="block text-sm font-medium mb-1.5"
                style={{ color: tokens.textMuted }}
              >
                Username or ID
              </label>
              <Input
                id="quick-dm-input"
                data-ocid="quick_dm.input"
                value={target}
                onChange={(e) => {
                  setTarget(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="Enter username or ID (#12345678)"
                style={{
                  background: tokens.isDark
                    ? "oklch(0.15 0.04 275)"
                    : "#f8fafc",
                  borderColor: error ? "oklch(0.6 0.25 20)" : tokens.border,
                  color: tokens.text,
                }}
              />
              {error && (
                <p
                  data-ocid="quick_dm.error_state"
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.65 0.22 20)" }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                data-ocid="quick_dm.cancel_button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                style={{
                  borderColor: tokens.border,
                  color: tokens.textMuted,
                  background: "transparent",
                }}
              >
                Cancel
              </Button>
              <Button
                data-ocid="quick_dm.submit_button"
                onClick={handleSubmit}
                className="flex-1 font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.72 0.22 340))",
                  color: "white",
                  border: "none",
                }}
              >
                Start Chat
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
