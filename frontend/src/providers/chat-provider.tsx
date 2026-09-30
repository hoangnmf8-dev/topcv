"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { io, type Socket } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccountStore } from "@/stores/auth.store";
import { getAccesToken, makeRefreshToken } from "@/actions/auth.action";
import { httpRequest } from "@/lib/utils";
type State = {
  accountId: string;
  total: number;
  counts: Record<string, number>;
  online: Record<string, boolean>;
  pending: string[];
};
const ChatContext = createContext<{
  state?: State;
  connected: boolean;
  ack: (ids: string[], read: boolean) => void;
}>({ connected: false, ack: () => {} });
export const useChat = () => useContext(ChatContext);
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const account = useAccountStore((s) => s.account);
  const accountId =
    account && ["candidate", "company"].includes(account.role)
      ? account.id
      : undefined;
  const client = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const state = useQuery({
    queryKey: ["chat-state", accountId],
    enabled: !!accountId,
    queryFn: async ({ signal }) => {
      const data = (await httpRequest.get("/conversation/state", { signal }))
        .data.data as State;
      if (data.accountId !== accountId)
        throw new Error("Tài khoản tin nhắn đã thay đổi");
      return data;
    },
    refetchInterval: 30000,
  });
  const currentState =
    state.data?.accountId === accountId ? state.data : undefined;
  const ack = useCallback(
    (ids: string[], read: boolean) => {
      if (!socketRef.current?.connected || !ids.length) return;
      for (let i = 0; i < ids.length; i += 100)
        socketRef.current
          .timeout(5000)
          .emit(
            "message:receipt",
            { ids: ids.slice(i, i + 100), read },
            (error: unknown, result?: { ok: boolean }) => {
              if (!error && result?.ok)
                void client.invalidateQueries({
                  queryKey: ["chat-state", accountId],
                });
            },
          );
    },
    [accountId, client],
  );
  useEffect(() => {
    if (!accountId) return;
    let disposed = false;
    let refreshing = false;
    let refreshed = false;
    const socket = io(
      process.env.NEXT_PUBLIC_BACKEND_API ?? "http://localhost:3100",
      {
        autoConnect: false,
        auth: (callback) => {
          void getAccesToken()
            .then((token) => {
              if (!disposed) callback({ token: token ?? "" });
            })
            .catch(() => {
              if (!disposed) callback({ token: "" });
            });
        },
      },
    );
    const sync = () => {
      void client.invalidateQueries({ queryKey: ["conversations", accountId] });
      void client.invalidateQueries({ queryKey: ["messages", accountId] });
      void client.invalidateQueries({ queryKey: ["chat-state", accountId] });
    };
    socket.on("session:ready", () => {
      refreshed = false;
      setConnected(true);
      sync();
    });
    socketRef.current = socket;
    socket.on("message:new", sync);
    socket.on("message:state", sync);
    socket.on(
      "presence:changed",
      () =>
        void client.invalidateQueries({ queryKey: ["chat-state", accountId] }),
    );
    socket.on("disconnect", (reason) => {
      setConnected(false);
      if (reason === "io server disconnect" && !disposed) socket.connect();
    });
    socket.on("connect_error", async (error) => {
      setConnected(false);
      if (error.message !== "UNAUTHORIZED" || refreshing || refreshed) return;
      refreshing = true;
      refreshed = true;
      try {
        if ((await makeRefreshToken()) && !disposed) socket.connect();
      } catch {
        setConnected(false);
      } finally {
        refreshing = false;
      }
    });
    socket.connect();
    return () => {
      disposed = true;
      socketRef.current = null;
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [accountId, client]);

  useEffect(() => {
    if (connected && currentState?.pending.length)
      ack(currentState.pending, false);
  }, [connected, currentState, ack]);
  return (
    <ChatContext.Provider
      value={{
        state: accountId ? currentState : undefined,
        connected: !!accountId && connected,
        ack,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
export function MessageBadge() {
  const { state } = useChat();
  return state?.total ? (
    <span
      aria-label={state.total + " tin nhắn chưa đọc"}
      className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] leading-4 text-white"
    >
      {state.total > 99 ? "99+" : state.total}
    </span>
  ) : null;
}
