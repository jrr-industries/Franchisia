import { createContext, useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import useSocketStore from "../store/socketStore";
import { getSocket } from "../lib/socket";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated, refreshSession } = useAuth();
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);
  const isConnected = useSocketStore((s) => s.isConnected);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated && user && !isConnected) {
      const socket = connect();
      return () => {
        if (socket) {
          socket.off("connect");
          socket.off("disconnect");
          socket.off("user-online");
          socket.off("user-offline");
          socket.off("new-message");
          socket.off("message-delivered");
          socket.off("message-read");
          socket.off("message-deleted");
          socket.off("notification");
        }
      };
    }
    if (!isAuthenticated && isConnected) {
      disconnect();
    }
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["cms"] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      refreshSession();
    };
    socket.on("user-updated", handler);
    return () => { socket.off("user-updated", handler); };
  }, [queryClient, refreshSession]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = () => {
      queryClient.invalidateQueries({ queryKey: ["cms"] });
    };
    socket.on("cms-updated", handler);
    return () => { socket.off("cms-updated", handler); };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
