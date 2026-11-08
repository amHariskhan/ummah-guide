"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const UnreadContext = createContext(0);

export function useUnreadCount() {
  return useContext(UnreadContext);
}

export default function UnreadProvider({
  initialCount,
  userId,
  enabled,
  children,
}: {
  initialCount: number;
  userId: string | null;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [count, setCount] = useState(initialCount);
  // Counts requests so an old, slow answer can't overwrite a newer one
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("my_unread_counts");
    if (error || id !== requestId.current) return;

    setCount(
      (data ?? []).reduce(
        (sum: number, r: { unread: number }) => sum + r.unread,
        0
      )
    );
  }, []);

  // Re-check whenever the page changes (e.g. after opening a chat)
  useEffect(() => {
    if (enabled) refresh();
  }, [pathname, enabled, refresh]);

  // Live updates + safety nets
  useEffect(() => {
    if (!enabled || !userId) return;

    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      // Give Realtime our login so it can apply the privacy rules
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase
        .channel(`unread-${userId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg = payload.new as { sender_id: string };
            // Only messages from the OTHER person can become unread
            if (msg.sender_id !== userId) refresh();
          }
        )
        .subscribe();
    }

    subscribe();

    const onRefresh = () => refresh();
    // ChatWindow fires this right after it marks a conversation as read
    window.addEventListener("unread:refresh", onRefresh);
    // Coming back to the tab: catch up on anything missed
    window.addEventListener("focus", onRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("unread:refresh", onRefresh);
      window.removeEventListener("focus", onRefresh);
      if (channel) supabase.removeChannel(channel);
    };
  }, [enabled, userId, refresh]);

  return (
    <UnreadContext.Provider value={enabled ? count : 0}>
      {children}
    </UnreadContext.Provider>
  );
}

// The gold number bubble. Shows nothing when there are no unread messages.
export function UnreadBadge() {
  const count = useUnreadCount();
  if (count <= 0) return null;

  return (
    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-emerald-950">
      {count > 99 ? "99+" : count}
    </span>
  );
}