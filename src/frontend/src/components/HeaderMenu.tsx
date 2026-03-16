import { Switch } from "@/components/ui/switch";
import {
  Check,
  Copy,
  LogOut,
  Menu,
  MessageSquarePlus,
  Palette,
  Pencil,
  Settings,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { THEMES, type ThemeName, useTheme } from "../contexts/ThemeContext";
import { getOrCreateUID } from "../utils/uid";

interface HeaderMenuProps {
  username: string;
  onStartDm: () => void;
  onRename: () => void;
  onLogout?: () => void;
  pendingRequests: Array<{ from: string; to: string; status: string }>;
  onAccept: (fromUser: string) => void;
  onDecline: (fromUser: string) => void;
}

export default function HeaderMenu({
  username,
  onStartDm,
  onRename,
  onLogout,
  pendingRequests,
  onAccept,
  onDecline,
}: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const { theme, tokens, setTheme } = useTheme();
  const [soundsEnabled, setSoundsEnabled] = useState(
    () => localStorage.getItem("fl_mute_sounds") !== "true",
  );
  const [privateProfile, setPrivateProfile] = useState(
    () => localStorage.getItem("fl_profile_private") === "true",
  );
  const [copied, setCopied] = useState(false);
  const uid = getOrCreateUID();

  const incomingRequests = pendingRequests.filter(
    (r) => r.to === username && r.status === ("pending" as any),
  );

  const toggleSounds = (val: boolean) => {
    setSoundsEnabled(val);
    localStorage.setItem("fl_mute_sounds", val ? "false" : "true");
  };

  const togglePrivate = (val: boolean) => {
    setPrivateProfile(val);
    localStorage.setItem("fl_profile_private", String(val));
  };

  const close = () => setOpen(false);

  const copyUID = () => {
    navigator.clipboard.writeText(`#${uid}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const themeEntries = Object.entries(THEMES) as [
    ThemeName,
    (typeof THEMES)[ThemeName],
  ][];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        data-ocid="header_menu.open_modal_button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
        style={{
          background: open
            ? "oklch(0.2 0.08 305 / 0.6)"
            : tokens.isDark
              ? "oklch(0.15 0.04 275)"
              : tokens.surface,
          border: `1px solid ${
            open ? "oklch(0.65 0.28 305 / 0.6)" : tokens.border
          }`,
          color: open ? "oklch(0.85 0.28 305)" : tokens.textMuted,
          boxShadow: open ? "0 0 16px oklch(0.65 0.28 305 / 0.2)" : "none",
        }}
        title="Menu"
      >
        <Menu size={18} />
        {incomingRequests.length > 0 && (
          <span
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: "oklch(0.6 0.28 20)", color: "white" }}
          >
            {incomingRequests.length > 9 ? "9+" : incomingRequests.length}
          </span>
        )}
      </button>

      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Backdrop — fixed, covers entire viewport */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0"
                style={{ zIndex: 9999 }}
                onClick={close}
              />

              {/* Panel — fixed so it floats above all page content */}
              <motion.div
                data-ocid="header_menu.panel"
                initial={{ opacity: 0, y: -12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="fixed left-3 rounded-2xl overflow-hidden w-[calc(100vw-24px)] max-w-[310px]"
                style={{
                  top: "64px",
                  zIndex: 10000,
                  maxHeight: "calc(100vh - 80px)",
                  background: tokens.isDark
                    ? "oklch(0.11 0.04 275)"
                    : tokens.surface,
                  border: `1px solid ${tokens.border}`,
                  boxShadow: tokens.isDark
                    ? "0 20px 60px oklch(0 0 0 / 0.6), 0 0 0 1px oklch(0.3 0.08 280 / 0.2)"
                    : "0 20px 60px rgba(0,0,0,0.15)",
                }}
              >
                {/* User Header */}
                <div
                  className="px-4 py-3 flex items-center gap-3 border-b"
                  style={{ borderColor: tokens.border }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.78 0.15 85))",
                      color: "white",
                    }}
                  >
                    {username[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{ color: tokens.text }}
                    >
                      {username}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className="text-xs font-mono"
                        style={{ color: tokens.textMuted }}
                      >
                        ID: #{uid}
                      </span>
                      <button
                        type="button"
                        data-ocid="header_menu.copy_uid.button"
                        onClick={copyUID}
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-all active:scale-90"
                        style={{
                          background: copied
                            ? "oklch(0.55 0.2 140 / 0.2)"
                            : "oklch(0.65 0.28 305 / 0.12)",
                          color: copied
                            ? "oklch(0.7 0.2 140)"
                            : "oklch(0.75 0.22 305)",
                          border: copied
                            ? "1px solid oklch(0.55 0.2 140 / 0.3)"
                            : "1px solid oklch(0.65 0.28 305 / 0.25)",
                        }}
                        title="Copy ID"
                      >
                        {copied ? (
                          <>
                            <Check size={9} /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={9} /> Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={close}
                    className="ml-auto p-1 rounded-lg"
                    style={{ color: tokens.textMuted }}
                  >
                    <X size={14} />
                  </button>
                </div>

                <div
                  className="py-2 overflow-y-auto"
                  style={{ maxHeight: "calc(100vh - 140px)" }}
                >
                  {/* Section: Private Message */}
                  <button
                    type="button"
                    data-ocid="header_menu.private_message.button"
                    onClick={() => {
                      onStartDm();
                      close();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5 active:scale-[0.98]"
                    style={{ color: tokens.text }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "oklch(0.65 0.28 305 / 0.15)",
                        border: "1px solid oklch(0.65 0.28 305 / 0.3)",
                      }}
                    >
                      <MessageSquarePlus
                        size={16}
                        color="oklch(0.78 0.22 340)"
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold">Private Message</p>
                      <p
                        className="text-xs"
                        style={{ color: tokens.textMuted }}
                      >
                        Chat privately with anyone
                      </p>
                    </div>
                  </button>

                  <div
                    className="mx-4 my-1 border-t"
                    style={{ borderColor: tokens.border }}
                  />

                  {/* Section: Change Theme */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "oklch(0.7 0.25 220 / 0.15)",
                          border: "1px solid oklch(0.7 0.25 220 / 0.3)",
                        }}
                      >
                        <Palette size={16} color="oklch(0.72 0.2 200)" />
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: tokens.text }}
                      >
                        Change Theme
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {themeEntries.map(([key, val], idx) => (
                        <button
                          type="button"
                          key={key}
                          data-ocid={`header_menu.theme.option.${idx + 1}`}
                          onClick={() => setTheme(key)}
                          className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all active:scale-90"
                          style={{
                            background:
                              theme === key
                                ? "oklch(0.65 0.28 305 / 0.15)"
                                : "transparent",
                            border:
                              theme === key
                                ? "1px solid oklch(0.65 0.28 305 / 0.4)"
                                : "1px solid transparent",
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center relative"
                            style={{ background: val.circle }}
                          >
                            {theme === key && (
                              <Check size={12} color="oklch(0.65 0.28 305)" />
                            )}
                          </div>
                          <span
                            className="text-[10px] font-medium leading-tight text-center"
                            style={{ color: tokens.textMuted }}
                          >
                            {val.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mx-4 my-1 border-t"
                    style={{ borderColor: tokens.border }}
                  />

                  {/* Section: Friend Requests */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "oklch(0.55 0.2 140 / 0.15)",
                          border: "1px solid oklch(0.55 0.2 140 / 0.3)",
                        }}
                      >
                        <UserPlus size={16} color="oklch(0.7 0.2 140)" />
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: tokens.text }}
                      >
                        Friend Requests
                      </p>
                      {incomingRequests.length > 0 && (
                        <span
                          className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: "oklch(0.6 0.28 20 / 0.2)",
                            color: "oklch(0.7 0.25 20)",
                            border: "1px solid oklch(0.6 0.28 20 / 0.3)",
                          }}
                        >
                          {incomingRequests.length}
                        </span>
                      )}
                    </div>
                    {incomingRequests.length === 0 ? (
                      <p
                        className="text-xs py-1"
                        style={{ color: tokens.textMuted }}
                      >
                        No pending requests
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {incomingRequests.slice(0, 5).map((req, i) => (
                          <div
                            key={req.from}
                            className="flex items-center gap-2 p-2 rounded-xl"
                            style={{
                              background: tokens.isDark
                                ? "oklch(0.15 0.04 275)"
                                : "oklch(0 0 0 / 0.04)",
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.78 0.15 85))",
                                color: "white",
                              }}
                            >
                              {req.from[0]?.toUpperCase()}
                            </div>
                            <span
                              className="flex-1 text-xs font-medium truncate"
                              style={{ color: tokens.text }}
                            >
                              {req.from}
                            </span>
                            <button
                              type="button"
                              data-ocid={`header_menu.accept_button.${i + 1}`}
                              onClick={() => onAccept(req.from)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{
                                background: "oklch(0.55 0.2 140 / 0.2)",
                                border: "1px solid oklch(0.55 0.2 140 / 0.4)",
                              }}
                              title="Accept"
                            >
                              <Check size={12} color="oklch(0.7 0.2 140)" />
                            </button>
                            <button
                              type="button"
                              data-ocid={`header_menu.decline_button.${i + 1}`}
                              onClick={() => onDecline(req.from)}
                              className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                              style={{
                                background: "oklch(0.4 0.15 20 / 0.2)",
                                border: "1px solid oklch(0.5 0.2 20 / 0.4)",
                              }}
                              title="Decline"
                            >
                              <X size={12} color="oklch(0.65 0.22 20)" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div
                    className="mx-4 my-1 border-t"
                    style={{ borderColor: tokens.border }}
                  />

                  {/* Section: Settings */}
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: "oklch(0.65 0.22 50 / 0.15)",
                          border: "1px solid oklch(0.65 0.22 50 / 0.3)",
                        }}
                      >
                        <Settings size={16} color="oklch(0.72 0.22 55)" />
                      </div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: tokens.text }}
                      >
                        Settings
                      </p>
                    </div>

                    {/* Notification Sounds */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        {soundsEnabled ? (
                          <Volume2 size={14} color={tokens.textMuted} />
                        ) : (
                          <VolumeX size={14} color={tokens.textMuted} />
                        )}
                        <span
                          className="text-xs font-medium"
                          style={{ color: tokens.text }}
                        >
                          Notification Sounds
                        </span>
                      </div>
                      <Switch
                        data-ocid="header_menu.sounds.switch"
                        checked={soundsEnabled}
                        onCheckedChange={toggleSounds}
                      />
                    </div>

                    {/* Private Profile */}
                    <div className="flex items-center justify-between py-2">
                      <span
                        className="text-xs font-medium"
                        style={{ color: tokens.text }}
                      >
                        Private Profile
                      </span>
                      <Switch
                        data-ocid="header_menu.privacy.switch"
                        checked={privateProfile}
                        onCheckedChange={togglePrivate}
                      />
                    </div>

                    {/* Rename */}
                    <button
                      type="button"
                      data-ocid="header_menu.rename.button"
                      onClick={() => {
                        onRename();
                        close();
                      }}
                      className="w-full flex items-center gap-2 py-2 transition-all active:scale-[0.98]"
                      style={{ color: tokens.textMuted }}
                    >
                      <Pencil size={14} />
                      <span className="text-xs font-medium">
                        Change Username
                      </span>
                    </button>
                  </div>

                  {/* Section: Logout */}
                  {onLogout && (
                    <>
                      <div
                        className="mx-4 my-1 border-t"
                        style={{ borderColor: tokens.border }}
                      />
                      <button
                        type="button"
                        data-ocid="header_menu.logout.button"
                        onClick={() => {
                          onLogout();
                          close();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:bg-red-500/5 active:scale-[0.98]"
                        style={{ color: "oklch(0.65 0.22 20)" }}
                      >
                        <LogOut size={16} />
                        <span className="text-sm font-semibold">Logout</span>
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
