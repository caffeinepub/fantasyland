import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useActor } from "./useActor";

export function usePresence(roomId: string, username: string) {
  const { actor } = useActor();
  const qc = useQueryClient();

  useEffect(() => {
    if (!actor || !username || !roomId) return;

    const sendHeartbeat = async () => {
      try {
        await (actor as any).updatePresence(roomId, username);
        qc.invalidateQueries({ queryKey: ["onlineUsers", roomId] });
        qc.invalidateQueries({ queryKey: ["onlineCount", roomId] });
      } catch {
        // silent
      }
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [actor, roomId, username, qc]);
}
