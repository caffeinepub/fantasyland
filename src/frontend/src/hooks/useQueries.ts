import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useMessages(roomId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["messages", roomId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMessages(roomId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 600,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useSendMessage(roomId: string) {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      text,
      voiceUrl = null,
    }: { username: string; text: string; voiceUrl?: string | null }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(roomId, username, text, voiceUrl ?? null);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", roomId] }),
  });
}

export function useCreatePrivateRoom() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("No actor");
      return actor.createPrivateRoom(code);
    },
  });
}

export function useRoomExists() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (code: string) => {
      if (!actor) throw new Error("No actor");
      return actor.roomExists(code);
    },
  });
}

export function useOnlineCount(roomId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["onlineCount", roomId],
    queryFn: async () => {
      if (!actor) return 0n;
      return (actor as any).getRoomOnlineCount(roomId) as Promise<bigint>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useOnlineUsers(roomId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["onlineUsers", roomId],
    queryFn: async () => {
      if (!actor) return [] as string[];
      return (actor as any).getOnlineUsers(roomId) as Promise<string[]>;
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 6000,
  });
}

export function useJoinMatchmaking() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).joinMatchmaking(username) as Promise<string | null>;
    },
  });
}

export function useLeaveMatchmaking() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).leaveMatchmaking(username) as Promise<void>;
    },
  });
}

export function useGetMatchResult(username: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["matchResult", username],
    queryFn: async () => {
      if (!actor) return null;
      return (actor as any).getMatchResult(username) as Promise<string | null>;
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: enabled ? 800 : false,
  });
}

export function useJoinGameQueue() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).joinGameQueue(username);
      return result as { matchId: string; opponent: string } | null;
    },
  });
}

export function useLeaveGameQueue() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (username: string) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).leaveGameQueue(username) as Promise<void>;
    },
  });
}

export function useGetGameQueueMatch(username: string, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["gameQueueMatch", username],
    queryFn: async () => {
      if (!actor) return null;
      const result = await (actor as any).getGameQueueMatch(username);
      return result as { matchId: string; opponent: string } | null;
    },
    enabled: !!actor && !isFetching && enabled,
    refetchInterval: enabled ? 1500 : false,
  });
}

export function useCreateRPSChallenge() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      roomId,
      challenger,
    }: { roomId: string; challenger: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createRPSChallenge(
        roomId,
        challenger,
      ) as Promise<string>;
    },
  });
}

export function useJoinRPSGame() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      gameId,
      username,
    }: { gameId: string; username: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).joinRPSGame(gameId, username) as Promise<boolean>;
    },
  });
}

export function usePlayRPS() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      gameId,
      username,
      move,
    }: { gameId: string; username: string; move: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).playRPS(gameId, username, move) as Promise<void>;
    },
  });
}

export function useRPSGame(gameId: string | null, active: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["rpsGame", gameId],
    queryFn: async () => {
      if (!actor || !gameId) return null;
      const result = await (actor as any).getRPSGame(gameId);
      if (!result) return null;
      if (Array.isArray(result)) return result.length > 0 ? result[0] : null;
      return result;
    },
    enabled: !!actor && !isFetching && !!gameId && active,
    refetchInterval: active ? 800 : false,
  });
}

// ── Auth hooks ────────────────────────────────────────────────────────────────

export function useBackendRegister() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.register(username, password);
    },
  });
}

export function useBackendLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.login(username, password);
    },
  });
}

export function useBackendLogout() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("No actor");
      return actor.logout(token);
    },
  });
}

export function useValidateSession(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["session", token],
    queryFn: async () => {
      if (!actor || !token) return null;
      return actor.validateSession(token);
    },
    enabled: !!actor && !isFetching && !!token,
    staleTime: 60000,
  });
}

// ── Game Challenge hooks ───────────────────────────────────────────────────────

export function usePendingChallenges(roomId: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingChallenges", roomId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingChallenges(roomId);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
    staleTime: 0,
  });
}

export function useCreateGameChallenge() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roomId,
      challenger,
      gameName,
    }: { roomId: string; challenger: string; gameName: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createGameChallenge(roomId, challenger, gameName);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["pendingChallenges", vars.roomId],
      }),
  });
}

export function useRespondToChallenge() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      challengeId,
      username,
      accept,
    }: { challengeId: string; username: string; accept: boolean }) => {
      if (!actor) throw new Error("No actor");
      return actor.respondToChallenge(challengeId, username, accept);
    },
  });
}

// ── Friend Request hooks ──────────────────────────────────────────────────────

export function useSendFriendRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromUser,
      toUser,
    }: { fromUser: string; toUser: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).sendFriendRequest(
        fromUser,
        toUser,
      ) as Promise<boolean>;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["friendRequestStatus", vars.fromUser, vars.toUser],
      });
      qc.invalidateQueries({
        queryKey: ["pendingFriendRequests", vars.toUser],
      });
    },
  });
}

export function useRespondToFriendRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fromUser,
      toUser,
      accept,
    }: { fromUser: string; toUser: string; accept: boolean }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).respondToFriendRequest(
        fromUser,
        toUser,
        accept,
      ) as Promise<boolean>;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["pendingFriendRequests", vars.toUser],
      });
      qc.invalidateQueries({ queryKey: ["friends", vars.toUser] });
      qc.invalidateQueries({ queryKey: ["friends", vars.fromUser] });
    },
  });
}

export function usePendingFriendRequests(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingFriendRequests", username],
    queryFn: async () => {
      if (!actor || !username) return [];
      return (actor as any).getPendingFriendRequests(username) as Promise<
        any[]
      >;
    },
    enabled: !!actor && !isFetching && !!username,
    refetchInterval: 5000,
  });
}

export function useFriends(username: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friends", username],
    queryFn: async () => {
      if (!actor || !username) return [] as string[];
      return (actor as any).getFriends(username) as Promise<string[]>;
    },
    enabled: !!actor && !isFetching && !!username,
    refetchInterval: 10000,
  });
}

export function useFriendDmRoomId(user1: string, user2: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friendDmRoomId", user1, user2],
    queryFn: async () => {
      if (!actor || !user1 || !user2) return null;
      return (actor as any).getFriendDmRoomId(user1, user2) as Promise<
        string | null
      >;
    },
    enabled: !!actor && !isFetching && !!user1 && !!user2,
  });
}

export function useFriendRequestStatus(fromUser: string, toUser: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["friendRequestStatus", fromUser, toUser],
    queryFn: async () => {
      if (!actor || !fromUser || !toUser) return "none";
      return (actor as any).getFriendRequestStatus(
        fromUser,
        toUser,
      ) as Promise<string>;
    },
    enabled: !!actor && !isFetching && !!fromUser && !!toUser,
    refetchInterval: 8000,
  });
}

// ─── Game Session Hooks ───────────────────────────────────────────────────────

export function useCreateGameSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      sessionId,
      player1,
      gameType,
    }: { sessionId: string; player1: string; gameType: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).createGameSession(
        sessionId,
        player1,
        gameType,
      ) as Promise<boolean>;
    },
  });
}

export function useJoinGameSession() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      sessionId,
      player2,
    }: { sessionId: string; player2: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).joinGameSession(
        sessionId,
        player2,
      ) as Promise<boolean>;
    },
  });
}

export function useSubmitRPSMove() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      sessionId,
      username,
      move,
    }: { sessionId: string; username: string; move: string }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).submitRPSMove(
        sessionId,
        username,
        move,
      ) as Promise<void>;
    },
  });
}

export function useSubmitTTTMove() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      sessionId,
      username,
      cellIndex,
    }: { sessionId: string; username: string; cellIndex: number }) => {
      if (!actor) throw new Error("No actor");
      return (actor as any).submitTTTMove(
        sessionId,
        username,
        BigInt(cellIndex),
      ) as Promise<boolean>;
    },
  });
}

export function useGetGameSession(sessionId: string | null, enabled: boolean) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["gameSession", sessionId],
    queryFn: async () => {
      if (!actor || !sessionId) return null;
      const result = await (actor as any).getGameSession(sessionId);
      if (!result) return null;
      return result as {
        id: string;
        gameType: string;
        player1: string;
        player2: string | null;
        status: string;
        rpsMove1: string | null;
        rpsMove2: string | null;
        tttCells: (string | null)[];
        tttTurn: bigint;
        result: string | null;
      };
    },
    enabled: !!actor && !isFetching && !!sessionId && enabled,
    refetchInterval: enabled ? 1200 : false,
    staleTime: 0,
  });
}
