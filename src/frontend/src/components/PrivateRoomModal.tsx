import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, LogIn, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreatePrivateRoom, useRoomExists } from "../hooks/useQueries";

interface Props {
  onClose: () => void;
  onEnter: (code: string) => void;
}

export default function PrivateRoomModal({ onClose, onEnter }: Props) {
  const [tab, setTab] = useState<"create" | "join">("create");
  const [code, setCode] = useState("");

  const createRoom = useCreatePrivateRoom();
  const checkRoom = useRoomExists();
  const loading = createRoom.isPending || checkRoom.isPending;

  const handleCreate = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast.error("Code must be exactly 6 characters");
      return;
    }
    try {
      await createRoom.mutateAsync(trimmed);
      onEnter(trimmed);
    } catch {
      toast.error("Failed to create room");
    }
  };

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 6) {
      toast.error("Code must be exactly 6 characters");
      return;
    }
    try {
      const exists = await checkRoom.mutateAsync(trimmed);
      if (exists) onEnter(trimmed);
      else toast.error("Room not found. Check the code and try again.");
    } catch {
      toast.error("Failed to find room");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "oklch(0 0 0 / 0.7)" }}
      role="presentation"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        data-ocid="private.dialog"
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "oklch(0.11 0.035 275)",
          border: "1px solid oklch(0.65 0.28 305 / 0.4)",
          boxShadow:
            "0 0 40px oklch(0.65 0.28 305 / 0.2), 0 24px 64px oklch(0 0 0 / 0.6)",
        }}
      >
        <button
          type="button"
          data-ocid="private.close_button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors"
          style={{
            color: "oklch(0.55 0.04 280)",
            background: "oklch(0.15 0.04 275)",
          }}
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.65 0.28 305 / 0.15)",
              border: "1px solid oklch(0.65 0.28 305 / 0.4)",
            }}
          >
            <Lock size={20} style={{ color: "oklch(0.75 0.22 320)" }} />
          </div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(0.92 0.04 280)" }}
          >
            Private Room
          </h2>
        </div>

        <div
          className="flex gap-1 p-1 rounded-xl mb-6"
          style={{ background: "oklch(0.14 0.04 275)" }}
        >
          {(["create", "join"] as const).map((t) => (
            <button
              type="button"
              key={t}
              data-ocid={`private.${t}.tab`}
              className="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 capitalize"
              style={{
                background:
                  tab === t ? "oklch(0.65 0.28 305 / 0.25)" : "transparent",
                color:
                  tab === t ? "oklch(0.85 0.28 305)" : "oklch(0.55 0.04 280)",
                border:
                  tab === t
                    ? "1px solid oklch(0.65 0.28 305 / 0.3)"
                    : "1px solid transparent",
              }}
              onClick={() => setTab(t)}
            >
              {t === "create" ? "Create Room" : "Join Room"}
            </button>
          ))}
        </div>

        <p className="text-sm mb-3" style={{ color: "oklch(0.55 0.04 280)" }}>
          {tab === "create"
            ? "Choose a 6-character code for your private realm"
            : "Enter the secret code to enter a private realm"}
        </p>

        <Input
          data-ocid="private.room_code.input"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="e.g. REALM1"
          maxLength={6}
          className="mb-4 text-center tracking-widest font-bold text-lg"
          style={{
            background: "oklch(0.14 0.04 275)",
            border: "1px solid oklch(0.28 0.08 280 / 0.6)",
            color: "oklch(0.9 0.03 280)",
          }}
          onKeyDown={(e) =>
            e.key === "Enter" &&
            (tab === "create" ? handleCreate() : handleJoin())
          }
        />

        <Button
          type="button"
          data-ocid={
            tab === "create"
              ? "private.create.primary_button"
              : "private.join.primary_button"
          }
          onClick={tab === "create" ? handleCreate : handleJoin}
          disabled={loading || code.trim().length !== 6}
          className="w-full rounded-xl py-2.5 font-semibold transition-all duration-200"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.6 0.25 250))",
            color: "oklch(0.95 0.02 280)",
            border: "none",
            boxShadow: "0 0 16px oklch(0.65 0.28 305 / 0.3)",
            opacity: loading || code.trim().length !== 6 ? 0.5 : 1,
          }}
        >
          {tab === "create" ? (
            <Plus size={16} className="inline mr-2" />
          ) : (
            <LogIn size={16} className="inline mr-2" />
          )}
          {loading
            ? "Loading..."
            : tab === "create"
              ? "Create Room"
              : "Join Room"}
        </Button>
      </div>
    </div>
  );
}
