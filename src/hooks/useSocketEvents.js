import { useEffect } from "react";
import { getSocket } from "../lib/socket";

export function useSocketEvent(event, handler, deps = []) {
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [event, ...deps]);
}
