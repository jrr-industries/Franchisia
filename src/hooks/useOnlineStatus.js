import { useCallback, useEffect, useState } from "react";
import { checkOnline } from "../lib/socket";
import useSocketStore from "../store/socketStore";

export function useOnlineStatus(userId) {
  const onlineUsers = useSocketStore((s) => s.onlineUsers);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (!userId) return;
    if (userId in onlineUsers) {
      setOnline(onlineUsers[userId]);
    } else {
      checkOnline(userId).then((res) => setOnline(res.online));
    }
  }, [userId, onlineUsers]);

  return online;
}

export function useTypingStatus(conversationId) {
  const typingUsers = useSocketStore((s) => s.typingUsers);
  if (!conversationId) return [];
  return Object.entries(typingUsers)
    .filter(([key]) => key.startsWith(`${conversationId}-`))
    .map(([, value]) => value);
}
