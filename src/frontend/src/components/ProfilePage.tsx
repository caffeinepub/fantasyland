import {
  ArrowLeft,
  Check,
  Copy,
  Lock,
  MessageSquarePlus,
  Pencil,
  Unlock,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { getOrCreateUID } from "../utils/uid";

interface ProfilePageProps {
  username: string;
  onBack: () => void;
  onStartDm?: () => void;
}

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.78 0.15 85))",
  "linear-gradient(135deg, oklch(0.6 0.25 250), oklch(0.72 0.2 200))",
  "linear-gradient(135deg, oklch(0.65 0.22 50), oklch(0.78 0.2 55))",
  "linear-gradient(135deg, oklch(0.7 0.2 180), oklch(0.72 0.18 185))",
  "linear-gradient(135deg, oklch(0.55 0.28 280), oklch(0.65 0.22 310))",
  "linear-gradient(135deg, oklch(0.72 0.22 340), oklch(0.85 0.15 60))",
];

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function getDefaultStats() {
  const storedFollowers = localStorage.getItem("fl_followers");
  const storedLikes = localStorage.getItem("fl_likes");
  const followers = storedFollowers
    ? Number(storedFollowers)
    : Math.floor(Math.random() * 50);
  const likes = storedLikes
    ? Number(storedLikes)
    : Math.floor(Math.random() * 50);
  if (!storedFollowers) localStorage.setItem("fl_followers", String(followers));
  if (!storedLikes) localStorage.setItem("fl_likes", String(likes));
  return { followers, likes };
}

function getPostCount(): number {
  try {
    const raw = localStorage.getItem("fl_social_posts");
    if (!raw) return 0;
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

export default function ProfilePage({
  username,
  onBack,
  onStartDm,
}: ProfilePageProps) {
  const [bio, setBio] = useState(() => localStorage.getItem("fl_bio") || "");
  const [editingBio, setEditingBio] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [isPrivate, setIsPrivate] = useState(
    () => localStorage.getItem("fl_profile_private") === "true",
  );
  const [avatarGradientIdx, setAvatarGradientIdx] = useState(() =>
    Number(localStorage.getItem("fl_avatar_color") || "0"),
  );
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [stats, setStats] = useState({ followers: 0, likes: 0 });
  const [uidCopied, setUidCopied] = useState(false);
  const uid = getOrCreateUID();

  const copyUID = () => {
    navigator.clipboard.writeText(`#${uid}`).then(() => {
      setUidCopied(true);
      setTimeout(() => setUidCopied(false), 2000);
    });
  };

  useEffect(() => {
    setPostCount(getPostCount());
    setStats(getDefaultStats());
  }, []);

  const saveBio = () => {
    setBio(draftBio);
    localStorage.setItem("fl_bio", draftBio);
    setEditingBio(false);
  };

  const cancelBio = () => {
    setEditingBio(false);
    setDraftBio("");
  };

  const startEditBio = () => {
    setDraftBio(bio);
    setEditingBio(true);
  };

  const togglePrivate = () => {
    const next = !isPrivate;
    setIsPrivate(next);
    localStorage.setItem("fl_profile_private", String(next));
  };

  const selectColor = (idx: number) => {
    setAvatarGradientIdx(idx);
    localStorage.setItem("fl_avatar_color", String(idx));
    setShowColorPicker(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.14 0.06 280) 0%, oklch(0.09 0.03 260) 40%, oklch(0.07 0.02 280) 100%)",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-4 border-b"
        style={{ borderColor: "oklch(0.22 0.06 280 / 0.4)" }}
      >
        <button
          type="button"
          data-ocid="profile.back_button"
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.3 0.06 280 / 0.4)",
          }}
        >
          <ArrowLeft size={18} color="white" />
        </button>
        <h2
          className="font-display text-lg font-bold"
          style={{ color: "oklch(0.92 0.04 280)" }}
        >
          Profile
        </h2>
        {/* Privacy toggle */}
        <button
          type="button"
          data-ocid="profile.privacy_toggle"
          onClick={togglePrivate}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: isPrivate
              ? "oklch(0.25 0.1 280 / 0.5)"
              : "oklch(0.15 0.04 275)",
            border: isPrivate
              ? "1px solid oklch(0.65 0.28 305 / 0.5)"
              : "1px solid oklch(0.3 0.06 280 / 0.4)",
          }}
        >
          {isPrivate ? (
            <Lock size={16} color="oklch(0.78 0.22 340)" />
          ) : (
            <Unlock size={16} color="oklch(0.55 0.06 280)" />
          )}
        </button>
      </header>

      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        {/* Avatar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative mb-4">
            <button
              type="button"
              data-ocid="profile.avatar_button"
              onClick={() => setShowColorPicker((v) => !v)}
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black transition-all active:scale-95"
              style={{
                background: AVATAR_GRADIENTS[avatarGradientIdx],
                boxShadow:
                  "0 0 30px oklch(0.65 0.28 305 / 0.35), 0 8px 24px oklch(0 0 0 / 0.5)",
                border: "3px solid oklch(0.65 0.28 305 / 0.5)",
                color: "white",
              }}
            >
              {getInitials(username)}
            </button>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(0.65 0.28 305)",
                border: "2px solid oklch(0.09 0.03 260)",
              }}
            >
              <Pencil size={10} color="white" />
            </div>
          </div>

          {showColorPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex gap-3 mb-4"
            >
              {AVATAR_GRADIENTS.map((g, i) => (
                <button
                  key={g.slice(0, 20)}
                  type="button"
                  data-ocid={`profile.avatar_color.${i + 1}`}
                  onClick={() => selectColor(i)}
                  className="w-8 h-8 rounded-full transition-all active:scale-90"
                  style={{
                    background: g,
                    border:
                      avatarGradientIdx === i
                        ? "2px solid white"
                        : "2px solid transparent",
                    boxShadow:
                      avatarGradientIdx === i
                        ? "0 0 12px rgba(255,255,255,0.4)"
                        : "none",
                  }}
                />
              ))}
            </motion.div>
          )}

          <h1
            className="font-display text-2xl font-black mb-1"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.92 0.04 280) 0%, oklch(0.78 0.15 85) 40%, oklch(0.85 0.28 305) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {username}
          </h1>

          <span
            className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1"
            style={{
              background: isPrivate
                ? "oklch(0.2 0.08 280 / 0.5)"
                : "oklch(0.18 0.05 140 / 0.5)",
              color: isPrivate ? "oklch(0.78 0.22 340)" : "oklch(0.72 0.2 140)",
              border: isPrivate
                ? "1px solid oklch(0.65 0.28 305 / 0.3)"
                : "1px solid oklch(0.55 0.2 140 / 0.3)",
            }}
          >
            {isPrivate ? <Lock size={10} /> : <Unlock size={10} />}
            {isPrivate ? "Private Profile" : "Public Profile"}
          </span>

          {/* UID Badge */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs font-mono px-3 py-1 rounded-full"
              style={{
                background: "oklch(0.15 0.06 305 / 0.4)",
                color: "oklch(0.75 0.18 305)",
                border: "1px solid oklch(0.65 0.28 305 / 0.25)",
              }}
            >
              Your ID: #{uid}
            </span>
            <button
              type="button"
              data-ocid="profile.copy_uid.button"
              onClick={copyUID}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all active:scale-90"
              style={{
                background: uidCopied
                  ? "oklch(0.55 0.2 140 / 0.2)"
                  : "oklch(0.65 0.28 305 / 0.12)",
                color: uidCopied
                  ? "oklch(0.7 0.2 140)"
                  : "oklch(0.75 0.22 305)",
                border: uidCopied
                  ? "1px solid oklch(0.55 0.2 140 / 0.3)"
                  : "1px solid oklch(0.65 0.28 305 / 0.25)",
              }}
            >
              {uidCopied ? (
                <>
                  <Check size={10} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={10} /> Copy
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          data-ocid="profile.stats.row"
          className="flex rounded-2xl overflow-hidden mb-8"
          style={{
            background: "oklch(0.12 0.035 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
          }}
        >
          {[
            { label: "Posts", value: postCount },
            { label: "Followers", value: stats.followers },
            { label: "Likes", value: stats.likes },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="flex-1 flex flex-col items-center py-5"
              style={{
                borderRight:
                  i < 2 ? "1px solid oklch(0.22 0.06 280 / 0.4)" : "none",
              }}
            >
              <span
                className="text-2xl font-black mb-1"
                style={{ color: "oklch(0.92 0.04 280)" }}
              >
                {stat.value}
              </span>
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.55 0.06 280)" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl p-5 mb-6"
          style={{
            background: "oklch(0.12 0.035 275)",
            border: "1px solid oklch(0.22 0.06 280 / 0.5)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-sm font-bold tracking-wider uppercase"
              style={{ color: "oklch(0.65 0.28 305)" }}
            >
              Bio
            </span>
            {!editingBio && (
              <button
                type="button"
                data-ocid="profile.bio.edit_button"
                onClick={startEditBio}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{
                  background: "oklch(0.18 0.05 275)",
                  border: "1px solid oklch(0.3 0.06 280 / 0.4)",
                }}
              >
                <Pencil size={12} color="oklch(0.78 0.15 85)" />
              </button>
            )}
          </div>

          {editingBio ? (
            <div className="flex flex-col gap-3">
              <textarea
                data-ocid="profile.bio.textarea"
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                placeholder="Write something about yourself..."
                rows={4}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none"
                style={{
                  background: "oklch(0.09 0.03 260)",
                  border: "1px solid oklch(0.65 0.28 305 / 0.4)",
                  color: "oklch(0.92 0.04 280)",
                  lineHeight: "1.6",
                }}
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  data-ocid="profile.bio.save_button"
                  onClick={saveBio}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.78 0.15 85))",
                    color: "white",
                  }}
                >
                  <Check size={14} /> Save
                </button>
                <button
                  type="button"
                  data-ocid="profile.bio.cancel_button"
                  onClick={cancelBio}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: "oklch(0.18 0.05 275)",
                    border: "1px solid oklch(0.3 0.06 280 / 0.4)",
                    color: "oklch(0.6 0.06 280)",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <p
              className="text-sm leading-relaxed"
              style={{
                color: bio ? "oklch(0.78 0.06 280)" : "oklch(0.4 0.04 280)",
                fontStyle: bio ? "normal" : "italic",
              }}
            >
              {bio || "Add a bio..."}
            </p>
          )}
        </motion.div>

        {/* Edit Profile button */}
        <motion.button
          type="button"
          data-ocid="profile.edit_button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          onClick={startEditBio}
          className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98] mb-3"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.65 0.28 305 / 0.4)",
            color: "oklch(0.85 0.28 305)",
            boxShadow: "0 0 20px oklch(0.65 0.28 305 / 0.08)",
          }}
        >
          <Pencil size={15} />
          Edit Profile
        </motion.button>

        {/* Send Private Message button */}
        {onStartDm && (
          <motion.button
            type="button"
            data-ocid="profile.send_dm.button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            onClick={onStartDm}
            className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.28 305 / 0.2), oklch(0.78 0.15 85 / 0.2))",
              border: "1px solid oklch(0.65 0.28 305 / 0.5)",
              color: "oklch(0.88 0.2 330)",
              boxShadow: "0 0 20px oklch(0.65 0.28 305 / 0.12)",
            }}
          >
            <MessageSquarePlus size={15} />
            Send Private Message
          </motion.button>
        )}
      </main>

      <footer
        className="text-center py-4 text-xs"
        style={{ color: "oklch(0.35 0.04 280)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
