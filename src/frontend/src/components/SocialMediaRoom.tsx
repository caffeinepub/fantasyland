import {
  ArrowLeft,
  Camera,
  Heart,
  Home,
  Image,
  MessageCircle,
  Play,
  Plus,
  Search,
  Send,
  User,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import AnimatedAvatar from "./AnimatedAvatar";
import CameraModal from "./CameraModal";
import TrendingPopup from "./TrendingPopup";
import UsernameTopBar from "./UsernameTopBar";

interface Comment {
  id: number;
  username: string;
  text: string;
  timestamp: Date;
}

interface Post {
  id: number;
  username: string;
  timestamp: Date;
  text: string;
  mediaUrl?: string;
  mediaType?: "image" | "video";
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments: boolean;
}

interface Story {
  id: number;
  username: string;
  mediaUrl?: string;
  text?: string;
  timestamp: Date;
  color: string;
  viewed: boolean;
}

interface Props {
  username: string;
  onBack: () => void;
}

const SAMPLE_POSTS: Post[] = [
  {
    id: 1,
    username: "Phantom",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    text: "Just entered the FantasyLand portal for the first time. The energy here is unreal ✨ Can't believe I waited this long!",
    likes: 12,
    liked: false,
    comments: [
      {
        id: 1,
        username: "Neon",
        text: "Welcome to the madness! 🔥",
        timestamp: new Date(Date.now() - 1000 * 60 * 10),
      },
    ],
    showComments: false,
  },
  {
    id: 2,
    username: "Neon",
    timestamp: new Date(Date.now() - 1000 * 60 * 42),
    text: "Writing my first blog post from the Chill Lounge. The vibes here are immaculate. Who else loves late night fantasy chats? 🌙",
    likes: 27,
    liked: false,
    comments: [],
    showComments: false,
  },
  {
    id: 3,
    username: "Ghost",
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    text: "Just beat someone at Truth or Dare. They had to confess their deepest secret. I'll never tell 🤫",
    likes: 45,
    liked: false,
    comments: [
      {
        id: 1,
        username: "Phantom",
        text: "You're evil 😂",
        timestamp: new Date(Date.now() - 1000 * 60 * 80),
      },
      {
        id: 2,
        username: "someone",
        text: "Tell us!! 👀",
        timestamp: new Date(Date.now() - 1000 * 60 * 70),
      },
    ],
    showComments: false,
  },
];

const SAMPLE_STORIES: Story[] = [
  {
    id: 1,
    username: "Phantom",
    text: "Living my best fantasy life ✨ The energy tonight is immaculate!",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    color: "oklch(0.65 0.28 305)",
    viewed: false,
  },
  {
    id: 2,
    username: "Neon",
    text: "Late night chats in the Chill Lounge 🌙 Who's up?",
    timestamp: new Date(Date.now() - 1000 * 60 * 75),
    color: "oklch(0.7 0.28 330)",
    viewed: false,
  },
  {
    id: 3,
    username: "Ghost",
    text: "Just won 5 games in a row at Game Zone 🎮 I'm unstoppable!",
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    color: "oklch(0.6 0.25 250)",
    viewed: false,
  },
  {
    id: 4,
    username: "stranger",
    text: "First time in FantasyLand. This place is wild 👀",
    timestamp: new Date(Date.now() - 1000 * 60 * 200),
    color: "oklch(0.65 0.22 50)",
    viewed: false,
  },
];

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function getAvatarColor(name: string): string {
  const colors = [
    "oklch(0.65 0.28 305)",
    "oklch(0.7 0.28 330)",
    "oklch(0.6 0.25 250)",
    "oklch(0.65 0.22 50)",
    "oklch(0.7 0.2 180)",
  ];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % colors.length;
  return colors[hash];
}

export default function SocialMediaRoom({ username, onBack }: Props) {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [text, setText] = useState("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>(
    {},
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(100);
  const nextCommentId = useRef(200);
  const [activeTab, setActiveTab] = useState<
    "home" | "reels" | "direct" | "search" | "profile"
  >("home");
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [trendingPopup, setTrendingPopup] = useState<{
    show: boolean;
    variant: "trending" | "viral";
    postSnippet: string;
    authorName: string;
    likes: number;
  }>({
    show: false,
    variant: "trending",
    postSnippet: "",
    authorName: "",
    likes: 0,
  });
  const shownTrending = useRef<Set<string>>(new Set());

  // Stories state
  const [stories, setStories] = useState<Story[]>(SAMPLE_STORIES);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [showAddStory, setShowAddStory] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyMedia, setStoryMedia] = useState<string | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const storyFileRef = useRef<HTMLInputElement>(null);
  const nextStoryId = useRef(200);
  const storyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Story viewer auto-dismiss
  useEffect(() => {
    if (!viewingStory) {
      setStoryProgress(0);
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
      return;
    }
    setStoryProgress(0);
    const start = Date.now();
    const duration = 5000;
    storyTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setStoryProgress(pct);
      if (pct >= 100) {
        clearInterval(storyTimerRef.current!);
        closeStory();
      }
    }, 50);
    return () => {
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    };
  }, [viewingStory]);

  const openStory = (story: Story) => {
    setStories((prev) =>
      prev.map((s) => (s.id === story.id ? { ...s, viewed: true } : s)),
    );
    setViewingStory({ ...story, viewed: true });
  };

  const closeStory = () => {
    setViewingStory(null);
  };

  const handleAddStory = () => {
    if (!storyText.trim() && !storyMedia) return;
    const newStory: Story = {
      id: nextStoryId.current++,
      username,
      text: storyText.trim() || undefined,
      mediaUrl: storyMedia || undefined,
      timestamp: new Date(),
      color: getAvatarColor(username),
      viewed: false,
    };
    setStories((prev) => [newStory, ...prev]);
    setStoryText("");
    setStoryMedia(null);
    setShowAddStory(false);
    if (storyFileRef.current) storyFileRef.current.value = "";
  };

  const handleStoryFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStoryMedia(URL.createObjectURL(file));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
    setMediaType(file.type.startsWith("video") ? "video" : "image");
  };

  const handlePublish = () => {
    if (!text.trim() && !mediaPreview) return;
    const newPost: Post = {
      id: nextId.current++,
      username,
      timestamp: new Date(),
      text: text.trim(),
      mediaUrl: mediaPreview ?? undefined,
      mediaType: mediaType ?? undefined,
      likes: 0,
      liked: false,
      comments: [],
      showComments: false,
    };
    setPosts((prev) => [newPost, ...prev]);
    setText("");
    setMediaPreview(null);
    setMediaType(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleLike = (id: number) => {
    setPosts((prev) => {
      const updated = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      );
      const post = updated.find((p) => p.id === id);
      if (post && !post.liked === false) {
        const key = `post-${id}`;
        if (post.likes >= 20 && !shownTrending.current.has(`viral-${key}`)) {
          shownTrending.current.add(`viral-${key}`);
          setTimeout(
            () =>
              setTrendingPopup({
                show: true,
                variant: "viral",
                postSnippet: post.text,
                authorName: post.username,
                likes: post.likes,
              }),
            50,
          );
        } else if (
          post.likes >= 10 &&
          !shownTrending.current.has(`trending-${key}`)
        ) {
          shownTrending.current.add(`trending-${key}`);
          setTimeout(
            () =>
              setTrendingPopup({
                show: true,
                variant: "trending",
                postSnippet: post.text,
                authorName: post.username,
                likes: post.likes,
              }),
            50,
          );
        }
      }
      return updated;
    });
  };

  const handleToggleComments = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, showComments: !p.showComments } : p,
      ),
    );
  };

  const handleAddComment = (postId: number) => {
    const commentText = (commentInputs[postId] ?? "").trim();
    if (!commentText) return;
    const newComment: Comment = {
      id: nextCommentId.current++,
      username,
      text: commentText,
      timestamp: new Date(),
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p,
      ),
    );
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-20"
      style={{
        background: "var(--fl-bg)",
      }}
    >
      <TrendingPopup
        show={trendingPopup.show}
        variant={trendingPopup.variant}
        postSnippet={trendingPopup.postSnippet}
        authorName={trendingPopup.authorName}
        likes={trendingPopup.likes}
        onDismiss={() => setTrendingPopup((p) => ({ ...p, show: false }))}
      />
      <UsernameTopBar username={username} onRename={onBack} />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            top: "-150px",
            left: "-100px",
            background:
              "radial-gradient(circle, oklch(0.7 0.28 330 / 0.07) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "400px",
            height: "400px",
            bottom: "-100px",
            right: "-100px",
            background:
              "radial-gradient(circle, oklch(0.65 0.28 305 / 0.06) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Header */}
      <header
        className="relative z-10 flex items-center gap-4 px-6 py-4 border-b"
        style={{ borderColor: "var(--fl-border)" }}
      >
        <button
          type="button"
          data-ocid="social.button"
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            background: "oklch(0.15 0.04 275)",
            border: "1px solid oklch(0.65 0.28 305 / 0.3)",
            color: "oklch(0.78 0.15 85)",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          <div>
            <h2
              className="font-display text-lg font-bold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.92 0.04 280), oklch(0.78 0.15 85) 50%, oklch(0.85 0.28 305))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Social Media
            </h2>
            <p className="text-xs" style={{ color: "oklch(0.55 0.08 280)" }}>
              Share your world with FantasyLand
            </p>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-6">
        {/* Stories */}
        <div
          className="mb-6 rounded-2xl p-4"
          style={{
            background: "var(--fl-surface)",
            border: "1px solid oklch(0.65 0.28 305 / 0.2)",
            boxShadow: "0 0 20px oklch(0.65 0.28 305 / 0.06)",
          }}
        >
          <p
            className="text-xs font-semibold mb-3"
            style={{ color: "oklch(0.55 0.08 280)" }}
          >
            Stories
          </p>
          <div
            className="flex gap-4 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Your Story bubble */}
            <button
              type="button"
              data-ocid="story.open_modal_button"
              onClick={() => setShowAddStory(true)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center relative"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.55 0.28 270))",
                  padding: "2px",
                  boxShadow: "0 0 14px oklch(0.65 0.28 305 / 0.45)",
                }}
              >
                <div
                  className="w-full h-full rounded-full flex items-center justify-center"
                  style={{ background: "oklch(0.1 0.03 275)" }}
                >
                  <span
                    className="text-base font-bold"
                    style={{ color: getAvatarColor(username) }}
                  >
                    {username[0]?.toUpperCase()}
                  </span>
                </div>
                <div
                  className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.28 330))",
                    border: "2px solid oklch(0.1 0.03 275)",
                  }}
                >
                  <Plus size={10} style={{ color: "oklch(0.98 0 0)" }} />
                </div>
              </div>
              <span
                className="text-xs"
                style={{ color: "oklch(0.62 0.08 280)" }}
              >
                Your Story
              </span>
            </button>

            {/* Other stories */}
            {stories.map((story, idx) => (
              <button
                key={story.id}
                type="button"
                data-ocid={`story.item.${idx + 1}`}
                onClick={() => openStory(story)}
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <div
                  className="w-14 h-14 rounded-full"
                  style={{
                    padding: "2px",
                    background: story.viewed
                      ? "oklch(0.28 0.04 280)"
                      : "linear-gradient(135deg, oklch(0.85 0.22 350), oklch(0.65 0.28 305) 50%, oklch(0.55 0.3 270))",
                    boxShadow: story.viewed
                      ? "none"
                      : "0 0 12px oklch(0.7 0.28 330 / 0.4)",
                  }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center"
                    style={{ background: story.color }}
                  >
                    <span
                      className="text-base font-bold"
                      style={{ color: "oklch(0.98 0 0)" }}
                    >
                      {story.username[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <span
                  className="text-xs max-w-14 truncate"
                  style={{
                    color: story.viewed
                      ? "oklch(0.45 0.05 280)"
                      : "oklch(0.78 0.08 280)",
                  }}
                >
                  {story.username}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Composer */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: "var(--fl-surface)",
            border: "1px solid oklch(0.65 0.28 305 / 0.25)",
            boxShadow: "0 0 24px oklch(0.65 0.28 305 / 0.08)",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <AnimatedAvatar username={username} size="md" />
            <textarea
              data-ocid="social.textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share a thought, story, or blog post..."
              rows={3}
              className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:opacity-40"
              style={{
                color: "var(--fl-text)",
                caretColor: "oklch(0.78 0.15 85)",
              }}
            />
          </div>

          {mediaPreview && (
            <div
              className="mb-4 rounded-xl overflow-hidden"
              style={{ border: "1px solid oklch(0.22 0.06 280 / 0.5)" }}
            >
              {mediaType === "video" ? (
                // biome-ignore lint/a11y/useMediaCaption: user-uploaded content
                <video
                  src={mediaPreview}
                  controls
                  className="w-full max-h-64 object-contain"
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="preview"
                  className="w-full max-h-64 object-contain"
                />
              )}
            </div>
          )}

          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: "1px solid oklch(0.22 0.06 280 / 0.3)" }}
          >
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFile}
                id="social-media-upload"
              />
              <label
                htmlFor="social-media-upload"
                data-ocid="social.upload_button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  border: "1px solid oklch(0.55 0.15 250 / 0.4)",
                  color: "oklch(0.72 0.2 200)",
                }}
              >
                <Image size={13} /> Photo
              </label>
              <label
                htmlFor="social-media-upload"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  border: "1px solid oklch(0.55 0.15 50 / 0.4)",
                  color: "oklch(0.72 0.22 55)",
                }}
              >
                <Video size={13} /> Video
              </label>
              <button
                type="button"
                data-ocid="social.camera_button"
                onClick={() => setShowCameraModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  border: "1px solid oklch(0.55 0.15 305 / 0.4)",
                  color: "oklch(0.72 0.22 305)",
                }}
              >
                <Camera size={13} /> Camera
              </button>
            </div>
            <button
              type="button"
              data-ocid="social.submit_button"
              onClick={handlePublish}
              disabled={!text.trim() && !mediaPreview}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-40"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.28 330))",
                color: "oklch(0.98 0 0)",
                boxShadow: "0 0 16px oklch(0.65 0.28 305 / 0.4)",
              }}
            >
              <Send size={14} /> Publish
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-5">
          {posts.length === 0 && (
            <div
              data-ocid="social.empty_state"
              className="text-center py-16"
              style={{ color: "oklch(0.5 0.06 280)" }}
            >
              <MessageCircle size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No posts yet. Be the first to share!</p>
            </div>
          )}
          {posts.map((post, idx) => (
            <article
              key={post.id}
              data-ocid={`social.item.${idx + 1}`}
              className="rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: "var(--fl-surface)",
                border: "1px solid var(--fl-border)",
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.25)",
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <AnimatedAvatar username={post.username} size="sm" />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "var(--fl-text)" }}
                    >
                      {post.username}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.5 0.06 280)" }}
                    >
                      {timeAgo(post.timestamp)}
                    </p>
                  </div>
                </div>

                {post.text && (
                  <p
                    className="text-sm leading-relaxed mb-4"
                    style={{ color: "var(--fl-text-muted)" }}
                  >
                    {post.text}
                  </p>
                )}

                {post.mediaUrl && (
                  <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{ border: "1px solid oklch(0.22 0.06 280 / 0.4)" }}
                  >
                    {post.mediaType === "video" ? (
                      // biome-ignore lint/a11y/useMediaCaption: user-uploaded content
                      <video
                        src={post.mediaUrl}
                        controls
                        className="w-full max-h-80 object-contain"
                      />
                    ) : (
                      <img
                        src={post.mediaUrl}
                        alt="post media"
                        className="w-full max-h-80 object-cover"
                      />
                    )}
                  </div>
                )}

                <div
                  className="flex items-center gap-4 pt-2"
                  style={{ borderTop: "1px solid oklch(0.18 0.04 280 / 0.5)" }}
                >
                  <button
                    type="button"
                    data-ocid={`social.like_button.${idx + 1}`}
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 text-sm font-medium transition-all duration-200"
                    style={{
                      color: post.liked
                        ? "oklch(0.7 0.28 330)"
                        : "oklch(0.5 0.06 280)",
                    }}
                  >
                    <Heart
                      size={16}
                      fill={post.liked ? "currentColor" : "none"}
                      style={{ transition: "transform 0.15s ease" }}
                    />
                    {post.likes}
                  </button>
                  <button
                    type="button"
                    data-ocid={`social.comment_button.${idx + 1}`}
                    onClick={() => handleToggleComments(post.id)}
                    className="flex items-center gap-1.5 text-sm font-medium transition-all duration-200"
                    style={{
                      color: post.showComments
                        ? "oklch(0.72 0.2 200)"
                        : "oklch(0.5 0.06 280)",
                    }}
                  >
                    <MessageCircle
                      size={16}
                      fill={post.showComments ? "currentColor" : "none"}
                    />
                    {post.comments.length > 0 ? post.comments.length : ""}{" "}
                    Comment{post.comments.length !== 1 ? "s" : ""}
                  </button>
                </div>
              </div>

              {/* Comments section */}
              {post.showComments && (
                <div
                  className="px-5 pb-5"
                  style={{ borderTop: "1px solid oklch(0.16 0.04 280 / 0.6)" }}
                >
                  {/* Comment list */}
                  {post.comments.length > 0 && (
                    <div className="pt-4 space-y-3 mb-4">
                      {post.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex items-start gap-2"
                        >
                          <AnimatedAvatar
                            username={comment.username}
                            size="sm"
                          />
                          <div
                            className="flex-1 rounded-xl px-3 py-2"
                            style={{
                              background: "var(--fl-bg)",
                              border: "1px solid var(--fl-border)",
                            }}
                          >
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span
                                className="text-xs font-semibold"
                                style={{ color: "oklch(0.78 0.15 85)" }}
                              >
                                {comment.username}
                              </span>
                              <span
                                className="text-xs"
                                style={{ color: "oklch(0.45 0.05 280)" }}
                              >
                                {timeAgo(comment.timestamp)}
                              </span>
                            </div>
                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: "oklch(0.75 0.05 280)" }}
                            >
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {post.comments.length === 0 && (
                    <p
                      className="text-xs text-center py-3"
                      style={{ color: "oklch(0.45 0.05 280)" }}
                    >
                      No comments yet. Be the first!
                    </p>
                  )}

                  {/* Comment input */}
                  <div className="flex items-center gap-2 mt-2">
                    <AnimatedAvatar username={username} size="sm" />
                    <input
                      type="text"
                      data-ocid={`social.comment_input.${idx + 1}`}
                      value={commentInputs[post.id] ?? ""}
                      onChange={(e) =>
                        setCommentInputs((prev) => ({
                          ...prev,
                          [post.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddComment(post.id);
                      }}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent outline-none text-xs px-3 py-2 rounded-full"
                      style={{
                        background: "var(--fl-bg)",
                        border: "1px solid var(--fl-border)",
                        color: "var(--fl-text)",
                        caretColor: "oklch(0.72 0.2 200)",
                      }}
                    />
                    <button
                      type="button"
                      data-ocid={`social.comment_submit.${idx + 1}`}
                      onClick={() => handleAddComment(post.id)}
                      disabled={!(commentInputs[post.id] ?? "").trim()}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.28 330))",
                        color: "oklch(0.98 0 0)",
                        boxShadow: "0 0 10px oklch(0.65 0.28 305 / 0.35)",
                      }}
                    >
                      <Send size={13} />
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>

      <footer
        className="relative z-10 text-center py-6 text-xs"
        style={{ color: "oklch(0.45 0.04 280)" }}
      >
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      {/* Story Viewer Modal */}
      {viewingStory && (
        <div
          data-ocid="story.modal"
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "oklch(0 0 0 / 0.92)" }}
          onClick={closeStory}
          onKeyDown={(e) => e.key === "Escape" && closeStory()}
        >
          <div
            className="relative w-full max-w-sm mx-4 rounded-3xl overflow-hidden"
            style={{ aspectRatio: "9/16", maxHeight: "85vh" }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 z-10 px-3 pt-3">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: "oklch(0.98 0 0 / 0.25)" }}
              >
                <div
                  className="h-full rounded-full transition-none"
                  style={{
                    width: `${storyProgress}%`,
                    background:
                      "linear-gradient(90deg, oklch(0.85 0.22 350), oklch(0.78 0.15 85))",
                  }}
                />
              </div>
            </div>

            {/* Story background */}
            {viewingStory.mediaUrl ? (
              <img
                src={viewingStory.mediaUrl}
                alt="story"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse at 40% 30%, ${viewingStory.color} 0%, oklch(0.08 0.04 280) 70%)`,
                }}
              />
            )}

            {/* Dark overlay for text legibility */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, oklch(0 0 0 / 0.4) 0%, transparent 30%, transparent 60%, oklch(0 0 0 / 0.6) 100%)",
              }}
            />

            {/* Top info */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-8">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: viewingStory.color,
                    color: "oklch(0.98 0 0)",
                  }}
                >
                  {viewingStory.username[0]?.toUpperCase()}
                </div>
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "oklch(0.98 0 0)" }}
                  >
                    {viewingStory.username}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.8 0 0 / 0.7)" }}
                  >
                    {timeAgo(viewingStory.timestamp)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="story.close_button"
                onClick={closeStory}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  background: "oklch(0 0 0 / 0.4)",
                  color: "oklch(0.98 0 0)",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Story text */}
            {viewingStory.text && (
              <div className="absolute bottom-0 left-0 right-0 z-10 px-5 pb-8">
                <p
                  className="text-base leading-relaxed font-medium text-center"
                  style={{
                    color: "oklch(0.97 0 0)",
                    textShadow: "0 2px 12px oklch(0 0 0 / 0.6)",
                  }}
                >
                  {viewingStory.text}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Story Modal */}
      {showAddStory && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          style={{ background: "oklch(0 0 0 / 0.7)" }}
          onClick={() => setShowAddStory(false)}
          onKeyDown={(e) => e.key === "Escape" && setShowAddStory(false)}
        >
          <div
            data-ocid="story.dialog"
            className="w-full max-w-sm mx-4 mb-4 sm:mb-0 rounded-3xl p-6"
            style={{
              background: "var(--fl-surface)",
              border: "1px solid oklch(0.65 0.28 305 / 0.3)",
              boxShadow: "0 0 40px oklch(0.65 0.28 305 / 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3
                className="font-bold text-base"
                style={{ color: "oklch(0.88 0.06 280)" }}
              >
                Add Your Story
              </h3>
              <button
                type="button"
                data-ocid="story.close_button"
                onClick={() => setShowAddStory(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: "oklch(0.18 0.04 275)",
                  color: "oklch(0.6 0.06 280)",
                }}
              >
                <X size={15} />
              </button>
            </div>

            <textarea
              data-ocid="story.textarea"
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="What's on your mind? Share a moment..."
              rows={4}
              className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none mb-4"
              style={{
                background: "var(--fl-bg)",
                border: "1px solid var(--fl-border)",
                color: "var(--fl-text)",
                caretColor: "oklch(0.78 0.15 85)",
              }}
            />

            {storyMedia && (
              <div
                className="mb-4 rounded-xl overflow-hidden"
                style={{ border: "1px solid oklch(0.22 0.06 280 / 0.4)" }}
              >
                <img
                  src={storyMedia}
                  alt="story preview"
                  className="w-full max-h-40 object-cover"
                />
              </div>
            )}

            <div className="flex items-center gap-3">
              <input
                ref={storyFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleStoryFile}
                id="story-upload"
              />
              <label
                htmlFor="story-upload"
                data-ocid="story.upload_button"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium cursor-pointer transition-all duration-200"
                style={{
                  background: "oklch(0.16 0.05 280)",
                  border: "1px solid oklch(0.55 0.15 250 / 0.4)",
                  color: "oklch(0.72 0.2 200)",
                }}
              >
                <Camera size={13} /> Add Photo
              </label>

              <button
                type="button"
                data-ocid="story.submit_button"
                onClick={handleAddStory}
                disabled={!storyText.trim() && !storyMedia}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-bold transition-all duration-200 disabled:opacity-40"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.7 0.28 330))",
                  color: "oklch(0.98 0 0)",
                  boxShadow: "0 0 16px oklch(0.65 0.28 305 / 0.4)",
                }}
              >
                Post Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram-style Bottom Nav */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around py-3 pb-safe"
        style={{
          background: "rgba(5,5,10,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}
      >
        {[
          { id: "home" as const, icon: <Home size={22} />, label: "Home" },
          { id: "reels" as const, icon: <Play size={22} />, label: "Reels" },
          { id: "direct" as const, icon: <Send size={22} />, label: "Direct" },
          {
            id: "search" as const,
            icon: <Search size={22} />,
            label: "Search",
          },
          {
            id: "profile" as const,
            icon: <User size={22} />,
            label: "Profile",
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-ocid={`social.nav.${tab.id}_tab`}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-col items-center gap-0.5 transition-all"
            style={{
              color: activeTab === tab.id ? "white" : "rgba(255,255,255,0.4)",
              filter:
                activeTab === tab.id
                  ? "drop-shadow(0 0 8px rgba(255,255,255,0.5))"
                  : "none",
            }}
          >
            {tab.id === "profile" ? (
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, oklch(0.65 0.28 305), oklch(0.78 0.15 85))"
                      : "rgba(255,255,255,0.2)",
                  color: "white",
                  border:
                    activeTab === tab.id
                      ? "2px solid white"
                      : "2px solid transparent",
                }}
              >
                {username[0]?.toUpperCase()}
              </div>
            ) : (
              tab.icon
            )}
          </button>
        ))}
      </nav>

      {/* Camera Modal (for story/post capture) */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onSendPhoto={(dataUrl) => {
          setMediaPreview(dataUrl);
          setMediaType("image");
        }}
        onAddStory={(dataUrl) => {
          const newStory: Story = {
            id: nextStoryId.current++,
            username,
            text: undefined,
            mediaUrl: dataUrl,
            timestamp: new Date(),
            color: getAvatarColor(username),
            viewed: false,
          };
          setStories((prev) => [newStory, ...prev]);
        }}
      />
    </div>
  );
}
