import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthContext";
import useSocketStore from "../store/socketStore";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);
  const isConnected = useSocketStore((s) => s.isConnected);

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

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
