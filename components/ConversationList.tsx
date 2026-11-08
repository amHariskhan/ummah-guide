"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatChatTime } from "@/lib/format";

export type ConversationItem = {
  id: number;
  title: string;
  status: string;
  otherName: string;
  last_message_at: string;
  last_message_preview: string | null;
  last_sender_id: string | null;
};

type NewMessage = {
  question_id: number;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ConversationList({
  currentUserId,
  initialItems,
  initialUnread,
}: {
  currentUserId: string;
  initialItems: ConversationItem[];
  initialUnread: Record<number, number>;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);

  // Lets the live listener check the latest list without re-subscribing
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Ignore slow, outdated answers when two refreshes overlap
  const requestId = useRef(0);

  const refreshUnread = useCallback(async () => {
    const id = ++requestId.current;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("my_unread_counts");
    if (error || id !== requestId.current) return;

    const map: Record<number, number> = {};
    (data ?? []).forEach((r: { question_id: number; unread: number }) => {
      map[r.question_id] = r.unread;
    });
    setUnread(map);
  }, []);

  useEffect(() => {
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
        .channel(`chat-list-${currentUserId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (payload) => {
            const msg = payload.new as NewMessage;

            // A conversation we don't have yet → reload the page data
            const known = itemsRef.current.some((c) => c.id === msg.question_id);
            if (!known) {
              router.refresh();
              return;
            }

            // Update preview + time, then move it to the top
            setItems((prev) =>
              prev
                .map((c) =>
                  c.id === msg.question_id
                    ? {
                        ...c,
                        last_message_at: msg.created_at,
                        last_message_preview: msg.body.slice(0, 120),
                        last_sender_id: msg.sender_id,
                      }
                    : c
                )
                .sort(
                  (a, b) =>
                    new Date(b.last_message_at).getTime() -
                    new Date(a.last_message_at).getTime()
                )
            );

            // Only messages from the OTHER person can become unread
            if (msg.sender_id !== currentUserId) refreshUnread();
          }
        )
        .subscribe();
    }

    subscribe();

    // Coming back to the tab: catch up on anything missed
    const onFocus = () => refreshUnread();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
      if (channel) supabase.removeChannel(channel);
    };
  }, [currentUserId, refreshUnread, router]);

  // ===== Empty state =====
  if (items.length === 0) {
    return (
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 p-12 text-center shadow-xl shadow-emerald-900/10 backdrop-blur">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-2 ring-gold-400/60">
          <MessageCircle className="h-6 w-6" />
        </span>
        <p className="mt-4 font-heading text-xl font-bold text-emerald-950">
          No conversations yet
        </p>
        <p className="mt-1 text-gray-600">
          <Link
            href="/scholars"
            className="font-semibold text-emerald-700 hover:underline"
          >
            Find a scholar
          </Link>{" "}
          to ask your first question.
        </p>
      </div>
    );
  }

  // ===== List =====
  return (
    <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white/80 shadow-xl shadow-emerald-900/10 backdrop-blur">
      {items.map((c) => {
        const sentByMe = c.last_sender_id === currentUserId;
        const count = unread[c.id] ?? 0;

        return (
          <motion.div
            key={c.id}
            layout="position"
            transition={{ duration: 0.3 }}
            className="border-b border-emerald-100/70 last:border-b-0"
          >
            <Link
              href={`/chats/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-emerald-50/70"
            >
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-500 text-lg font-bold text-white ring-2 ring-gold-400/70">
                {c.otherName.charAt(0).toUpperCase()}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={`truncate text-gray-900 ${
                      count > 0 ? "font-bold" : "font-semibold"
                    }`}
                  >
                    {c.otherName}
                  </p>
                  <span
                    className={`shrink-0 text-xs ${
                      count > 0
                        ? "font-semibold text-emerald-700"
                        : "text-gray-500"
                    }`}
                  >
                    {formatChatTime(c.last_message_at)}
                  </span>
                </div>

                <p className="truncate text-sm font-medium text-emerald-800">
                  {c.title}
                </p>

                <div className="mt-0.5 flex items-center justify-between gap-3">
                  <p
                    className={`truncate text-sm ${
                      count > 0 ? "font-medium text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {sentByMe && "You: "}
                    {c.last_message_preview}
                  </p>

                  <div className="flex shrink-0 items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        c.status === "answered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gold-300 text-emerald-950"
                      }`}
                    >
                      {c.status === "answered" ? "Answered" : "Open"}
                    </span>

                    {count > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-emerald-950">
                        {count > 99 ? "99+" : count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}