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
    }: { username: string; text: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(roomId, username, text);
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
