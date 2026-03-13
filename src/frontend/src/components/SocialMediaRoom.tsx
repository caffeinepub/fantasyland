import {
  ArrowLeft,
  Heart,
  Image,
  MessageCircle,
  Send,
  Video,
} from "lucide-react";
import { useRef, useState } from "react";
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
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              liked: !p.liked,
              likes: p.liked ? p.likes - 1 : p.likes + 1,
            }
          : p,
      ),
    );
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
        background:
          "radial-gradient(ellipse at 30% 20%, oklch(0.14 0.06 280) 0%, oklch(0.09 0.03 260) 40%, oklch(0.07 0.02 280) 100%)",
      }}
    >
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
        style={{ borderColor: "oklch(0.22 0.06 280 / 0.5)" }}
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

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Composer */}
        <div
          className="rounded-2xl p-5 mb-8"
          style={{
            background: "oklch(0.12 0.035 275)",
            border: "1px solid oklch(0.65 0.28 305 / 0.25)",
            boxShadow: "0 0 24px oklch(0.65 0.28 305 / 0.08)",
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: getAvatarColor(username),
                color: "oklch(0.98 0 0)",
              }}
            >
              {username[0]?.toUpperCase()}
            </div>
            <textarea
              data-ocid="social.textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share a thought, story, or blog post..."
              rows={3}
              className="flex-1 resize-none bg-transparent outline-none text-sm leading-relaxed placeholder:opacity-40"
              style={{
                color: "oklch(0.88 0.04 280)",
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
                background: "oklch(0.12 0.035 275)",
                border: "1px solid oklch(0.22 0.06 280 / 0.5)",
                boxShadow: "0 4px 16px oklch(0 0 0 / 0.25)",
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{
                      background: getAvatarColor(post.username),
                      color: "oklch(0.98 0 0)",
                    }}
                  >
                    {post.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.88 0.04 280)" }}
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
                    style={{ color: "oklch(0.78 0.05 280)" }}
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
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              background: getAvatarColor(comment.username),
                              color: "oklch(0.98 0 0)",
                            }}
                          >
                            {comment.username[0]?.toUpperCase()}
                          </div>
                          <div
                            className="flex-1 rounded-xl px-3 py-2"
                            style={{
                              background: "oklch(0.15 0.04 275)",
                              border: "1px solid oklch(0.22 0.06 280 / 0.4)",
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
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{
                        background: getAvatarColor(username),
                        color: "oklch(0.98 0 0)",
                      }}
                    >
                      {username[0]?.toUpperCase()}
                    </div>
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
                        background: "oklch(0.15 0.04 275)",
                        border: "1px solid oklch(0.25 0.06 280 / 0.6)",
                        color: "oklch(0.85 0.04 280)",
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
    </div>
  );
}
