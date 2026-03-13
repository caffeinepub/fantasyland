import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, X } from "lucide-react";
import { useState } from "react";

interface Props {
  onClose: () => void;
  onEnter: (persona: string) => void;
}

const SAMPLE_PERSONAS = [
  "Sir Dragonheart",
  "Lady Moonwhisper",
  "The Void Mage",
  "Ember the Rogue",
  "Crystal Oracle",
];

export default function RoleplayEntryModal({ onClose, onEnter }: Props) {
  const [persona, setPersona] = useState("");

  const handleEnter = () => {
    const trimmed = persona.trim();
    if (!trimmed) return;
    onEnter(trimmed);
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
        data-ocid="roleplay.dialog"
        className="relative w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "oklch(0.11 0.035 275)",
          border: "1px solid oklch(0.78 0.15 85 / 0.4)",
          boxShadow:
            "0 0 40px oklch(0.78 0.15 85 / 0.15), 0 24px 64px oklch(0 0 0 / 0.6)",
        }}
      >
        <button
          type="button"
          data-ocid="roleplay.close_button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg"
          style={{
            color: "oklch(0.55 0.04 280)",
            background: "oklch(0.15 0.04 275)",
          }}
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.78 0.15 85 / 0.15)",
              border: "1px solid oklch(0.78 0.15 85 / 0.4)",
            }}
          >
            <Wand2 size={20} style={{ color: "oklch(0.8 0.18 140)" }} />
          </div>
          <h2
            className="font-display text-xl font-bold"
            style={{ color: "oklch(0.92 0.04 280)" }}
          >
            Choose Your Persona
          </h2>
        </div>
        <p className="text-sm mb-5" style={{ color: "oklch(0.55 0.04 280)" }}>
          Who will you be in this realm?
        </p>

        <Input
          data-ocid="roleplay.persona.input"
          value={persona}
          onChange={(e) => setPersona(e.target.value)}
          placeholder="Enter your character name..."
          className="mb-3"
          style={{
            background: "oklch(0.14 0.04 275)",
            border: "1px solid oklch(0.28 0.08 280 / 0.6)",
            color: "oklch(0.9 0.03 280)",
          }}
          onKeyDown={(e) => e.key === "Enter" && handleEnter()}
          autoFocus
        />

        <div className="flex flex-wrap gap-2 mb-5">
          {SAMPLE_PERSONAS.map((p) => (
            <button
              type="button"
              key={p}
              className="text-xs px-3 py-1 rounded-full transition-all duration-150"
              style={{
                background: "oklch(0.15 0.05 275)",
                border: "1px solid oklch(0.78 0.15 85 / 0.25)",
                color: "oklch(0.78 0.15 85)",
              }}
              onClick={() => setPersona(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <Button
          type="button"
          data-ocid="roleplay.enter.primary_button"
          onClick={handleEnter}
          disabled={!persona.trim()}
          className="w-full rounded-xl py-2.5 font-semibold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.78 0.15 85 / 0.8), oklch(0.8 0.18 140 / 0.8))",
            color: "oklch(0.1 0.02 280)",
            border: "none",
            boxShadow: "0 0 16px oklch(0.78 0.15 85 / 0.3)",
            opacity: !persona.trim() ? 0.5 : 1,
          }}
        >
          <Wand2 size={16} className="inline mr-2" />
          Enter as {persona.trim() || "Your Persona"}
        </Button>
      </div>
    </div>
  );
}
