import {
  ArrowLeft,
  Check,
  MessageCircle,
  Search,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { playFriendRequestSound } from "../hooks/useNotificationSound";
import {
  useFriends,
  usePendingFriendRequests,
  useRespondToFriendRequest,
} from "../hooks/useQueries";
import AnimatedAvatar from "./AnimatedAvatar";
import UsernameTopBar from "./UsernameTopBar";

interface Props {
  username: string;
  onBack: () => void;
  onOpenDm: (roomId: string, friendName: string) => void;
}

export default function DirectPanel({ username, onBack, onOpenDm }: Props) {
  const { data: pendingRequests = [], isLoading: reqLoading } =
    usePendingFriendRequests(username);
  const { data: friends = [], isLoading: friendsLoading } =
    useFriends(username);
  const respondMutation = useRespondToFriendRequest();
  const { actor } = useActor();
  const [openingDm, setOpeningDm] = useState<string | null>(null);

  // New Chat state
  const [newChatInput, setNewChatInput] = useState("");
  const [newChatError, setNewChatError] = useState("");

  const handleNewChat = () => {
    const trimmed = newChatInput.trim();
    if (!trimmed) {
      setNewChatError("Please enter a username or ID");
      return;
    }
    if (trimmed.toLowerCase() === username.toLowerCase()) {
      setNewChatError("You can't message yourself!");
      return;
    }
    setNewChatError("");
    const roomId = [username, trimmed].sort().join("--dm--");
    onOpenDm(roomId, trimmed);
    setNewChatInput("");
  };

  // Only show incoming pending requests (where I am the recipient)
  const incomingRequests = pendingRequests.filter(
    (r) => r.to === username && r.status === ("pending" as any),
  );
  const prevRequestCount = useRef(0);
  useEffect(() => {
    if (incomingRequests.length > prevRequestCount.current) {
      playFriendRequestSound();
    }
    prevRequestCount.current = incomingRequests.length;
  }, [incomingRequests.length]);

  const handleAccept = async (fromUser: string) => {
    try {
      await respondMutation.mutateAsync({
        fromUser,
        toUser: username,
        accept: true,
      });
      toast.success(`You and ${fromUser} are now friends! 🎉`);
    } catch {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (fromUser: string) => {
    try {
      await respondMutation.mutateAsync({
        fromUser,
        toUser: username,
        accept: false,
      });
      toast.success("Request declined");
    } catch {
      toast.error("Failed to decline request");
    }
  };

  const handleOpenDm = async (friendName: string) => {
    if (!actor) return;
    setOpeningDm(friendName);
    try {
      const roomId = (await (actor as any).getFriendDmRoomId(
        username,
        friendName,
      )) as string | null;
      if (roomId) {
        onOpenDm(roomId, friendName);
      } else {
        toast.error("Could not open DM room");
      }
    } catch {
      toast.error("Failed to open DM");
    } finally {
      setOpeningDm(null);
    }
  };

  return (
    <div
      data-ocid="direct.panel"
      className="min-h-screen flex flex-col"
      style={{
        background: "oklch(0.08 0.025 260)",
        color: "oklch(0.9 0.04 280)",
      }}
    >
      {/* Background texture */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: "url(/assets/uploads/IMG_20260312_155116-1.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.04,
        }}
      />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <header
          className="flex items-center gap-3 px-4 py-4 border-b flex-shrink-0"
          style={{
            borderColor: "oklch(0.22 0.06 280 / 0.5)",
            background: "oklch(0.1 0.03 275 / 0.9)",
          }}
        >
          <button
            type="button"
            data-ocid="direct.back.button"
            onClick={onBack}
            className="p-2 rounded-lg transition-all hover:scale-105"
            style={{
              background: "oklch(0.15 0.04 275)",
              border: "1px solid oklch(0.22 0.06 280 / 0.5)",
              color: "oklch(0.75 0.06 280)",
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <MessageCircle
              size={20}
              style={{ color: "oklch(0.75 0.22 320)" }}
            />
            <h1
              className="font-bold text-lg"
              style={{ color: "oklch(0.92 0.04 280)" }}
            >
              Direct Messages
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 pb-24 space-y-8">
          {/* New Chat Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Search size={16} style={{ color: "oklch(0.75 0.22 320)" }} />
              <h2
                className="font-bold text-sm uppercase tracking-widest"
                style={{ color: "oklch(0.75 0.22 320)" }}
              >
                New Chat
              </h2>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: "oklch(0.12 0.04 275 / 0.6)",
                border: "1px solid oklch(0.22 0.06 280 / 0.4)",
              }}
            >
              <div className="flex gap-2">
                <input
                  data-ocid="direct.new_chat.input"
                  type="text"
                  value={newChatInput}
                  onChange={(e) => {
                    setNewChatInput(e.target.value);
                    if (newChatError) setNewChatError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleNewChat()}
                  placeholder="Enter username or ID (#12345678)"
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: "oklch(0.08 0.025 260)",
                    border: `1px solid ${newChatError ? "oklch(0.6 0.25 20)" : "oklch(0.25 0.07 280 / 0.6)"}`,
                    color: "oklch(0.9 0.04 280)",
                  }}
                />
                <button
                  type="button"
                  data-ocid="direct.new_chat.submit_button"
                  onClick={handleNewChat}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 flex-shrink-0"
                  style={{
                    background: "oklch(0.55 0.28 305 / 0.25)",
                    border: "1px solid oklch(0.65 0.28 305 / 0.6)",
                    color: "oklch(0.85 0.2 305)",
                  }}
                >
                  <Search size={14} />
                  Start Chat
                </button>
              </div>
              {newChatError && (
                <p
                  data-ocid="direct.new_chat.error_state"
                  className="mt-2 text-xs"
                  style={{ color: "oklch(0.72 0.22 20)" }}
                >
                  {newChatError}
                </p>
              )}
            </div>
          </section>

          {/* Friend Requests Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} style={{ color: "oklch(0.78 0.22 340)" }} />
              <h2
                className="font-bold text-sm uppercase tracking-widest"
                style={{ color: "oklch(0.78 0.22 340)" }}
              >
                Friend Requests
              </h2>
              {incomingRequests.length > 0 && (
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: "oklch(0.65 0.28 20 / 0.2)",
                    border: "1px solid oklch(0.65 0.28 20 / 0.5)",
                    color: "oklch(0.85 0.2 25)",
                  }}
                >
                  {incomingRequests.length}
                </span>
              )}
            </div>

            {reqLoading ? (
              <div
                data-ocid="direct.requests.loading_state"
                className="py-6 text-center text-sm"
                style={{ color: "oklch(0.45 0.04 280)" }}
              >
                Loading requests…
              </div>
            ) : incomingRequests.length === 0 ? (
              <div
                data-ocid="direct.requests.empty_state"
                className="py-6 text-center rounded-xl"
                style={{
                  background: "oklch(0.12 0.04 275 / 0.5)",
                  border: "1px solid oklch(0.22 0.06 280 / 0.3)",
                  color: "oklch(0.45 0.04 280)",
                }}
              >
                <div className="text-2xl mb-2">💌</div>
                <p className="text-sm">No pending friend requests</p>
              </div>
            ) : (
              <div className="space-y-2">
                {incomingRequests.map((req, idx) => {
                  return (
                    <div
                      key={req.from}
                      data-ocid={`direct.requests.item.${idx + 1}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: "oklch(0.12 0.04 275 / 0.6)",
                        border: "1px solid oklch(0.22 0.06 280 / 0.4)",
                      }}
                    >
                      <AnimatedAvatar username={req.from} size="md" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "oklch(0.9 0.04 280)" }}
                        >
                          {req.from}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.5 0.04 280)" }}
                        >
                          Wants to be friends
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          data-ocid={`direct.accept_button.${idx + 1}`}
                          onClick={() => handleAccept(req.from)}
                          disabled={respondMutation.isPending}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                          style={{
                            background: "oklch(0.45 0.2 145 / 0.2)",
                            border: "1px solid oklch(0.5 0.2 145 / 0.5)",
                            color: "oklch(0.78 0.22 145)",
                          }}
                        >
                          <Check size={12} />
                          Accept
                        </button>
                        <button
                          type="button"
                          data-ocid={`direct.decline_button.${idx + 1}`}
                          onClick={() => handleDecline(req.from)}
                          disabled={respondMutation.isPending}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                          style={{
                            background: "oklch(0.45 0.2 20 / 0.15)",
                            border: "1px solid oklch(0.5 0.2 20 / 0.4)",
                            color: "oklch(0.75 0.2 25)",
                          }}
                        >
                          <X size={12} />
                          Decline
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Friends Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle
                size={16}
                style={{ color: "oklch(0.72 0.2 200)" }}
              />
              <h2
                className="font-bold text-sm uppercase tracking-widest"
                style={{ color: "oklch(0.72 0.2 200)" }}
              >
                Friends
              </h2>
              {friends.length > 0 && (
                <span
                  className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: "oklch(0.55 0.22 200 / 0.2)",
                    border: "1px solid oklch(0.55 0.22 200 / 0.4)",
                    color: "oklch(0.75 0.15 200)",
                  }}
                >
                  {friends.length}
                </span>
              )}
            </div>

            {friendsLoading ? (
              <div
                data-ocid="direct.friends.loading_state"
                className="py-6 text-center text-sm"
                style={{ color: "oklch(0.45 0.04 280)" }}
              >
                Loading friends…
              </div>
            ) : friends.length === 0 ? (
              <div
                data-ocid="direct.friends.empty_state"
                className="py-6 text-center rounded-xl"
                style={{
                  background: "oklch(0.12 0.04 275 / 0.5)",
                  border: "1px solid oklch(0.22 0.06 280 / 0.3)",
                  color: "oklch(0.45 0.04 280)",
                }}
              >
                <div className="text-2xl mb-2">👥</div>
                <p className="text-sm">No friends yet.</p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.38 0.04 280)" }}
                >
                  Send friend requests from chat rooms!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {friends.map((friendName, idx) => {
                  return (
                    <div
                      key={friendName}
                      data-ocid={`direct.friends.item.${idx + 1}`}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{
                        background: "oklch(0.12 0.04 275 / 0.6)",
                        border: "1px solid oklch(0.22 0.06 280 / 0.4)",
                      }}
                    >
                      <AnimatedAvatar username={friendName} size="md" />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "oklch(0.9 0.04 280)" }}
                        >
                          {friendName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: "oklch(0.5 0.04 280)" }}
                        >
                          Friend
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid={`direct.message_button.${idx + 1}`}
                        onClick={() => handleOpenDm(friendName)}
                        disabled={openingDm === friendName}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all hover:scale-105"
                        style={{
                          background:
                            openingDm === friendName
                              ? "oklch(0.65 0.28 305 / 0.1)"
                              : "oklch(0.65 0.28 305 / 0.2)",
                          border: "1px solid oklch(0.65 0.28 305 / 0.5)",
                          color: "oklch(0.85 0.15 305)",
                        }}
                      >
                        <MessageCircle size={12} />
                        {openingDm === friendName ? "Opening…" : "Message"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      <UsernameTopBar username={username} onRename={() => {}} />
    </div>
  );
}
