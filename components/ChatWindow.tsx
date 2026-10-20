"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, Check, SendHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatChatTime } from "@/lib/format";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

const BLOCKED_TEXT =
  "Your account has been suspended by the admin, so you cannot send messages.";

export default function ChatWindow({
  questionId,
  currentUserId,
  initialMessages,
  isScholar,
  status,
  isBlocked = false,
}: {
  questionId: number;
  currentUserId: string;
  initialMessages: Message[];
  isScholar: boolean;
  status: string;
  isBlocked?: boolean;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");
  // Starts with what the server told us; becomes true if the database refuses a send
  const [blocked, setBlocked] = useState(isBlocked);

  const bottomRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Add a message only if we don't already have it (prevents duplicates)
  function addMessage(msg: Message) {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }

  // ===== Live updates: listen for new messages in this conversation =====
  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function subscribe() {
      // Give Realtime our login so it can check the privacy rules
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) supabase.realtime.setAuth(session.access_token);
      if (cancelled) return;

      channel = supabase
        .channel(`question-${questionId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `question_id=eq.${questionId}`,
          },
          (payload) => {
            const msg = payload.new as Message;
            addMessage(msg);

            // Message from the other person while I'm looking → mark as read
            if (msg.sender_id !== currentUserId) {
              supabase.rpc("mark_conversation_read", { qid: questionId }).then(() => {});
            }
          }
        )
        .subscribe();
    }

    subscribe();

    // Stop listening when the user leaves the page
    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [questionId, currentUserId]);

  // ===== Auto-scroll to the newest message =====
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ===== Send a message =====
  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending || blocked) return;

    setSending(true);
    setError("");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({ question_id: questionId, sender_id: currentUserId, body })
      .select("id, sender_id, body, created_at")
      .single();

    setSending(false);

    if (error) {
      // Database refused because this account is blocked → show the friendly notice
      if (error.message.includes("Blocked users")) {
        setBlocked(true);
        return;
      }
      setError("Message could not be sent. Please try again.");
      return;
    }

    addMessage(data);
    setText("");
  }

  // Enter = send, Shift+Enter = new line (like WhatsApp Web)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  // ===== Scholar marks the conversation as answered =====
  async function markAnswered() {
    setMarking(true);
    setError("");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("questions")
      .update({ status: "answered", answered_at: new Date().toISOString() })
      .eq("id", questionId)
      .select("id");

    setMarking(false);

    if (error || !data || data.length === 0) {
      setError("Could not update the status. Please try again.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col">
      {/* Scholar action bar (hidden if blocked) */}
      {isScholar && status !== "answered" && !blocked && (
        <div className="flex flex-col gap-3 border-b border-gold-300/40 bg-linear-to-r from-gold-300/20 to-amber-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            When you have fully answered, mark this as answered.
          </p>
          <button
            onClick={markAnswered}
            disabled={marking}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-700 to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-700/25 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Check className="h-4 w-4" />
            {marking ? "Saving..." : "Mark as Answered"}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="h-[60vh] space-y-3 overflow-y-auto bg-linear-to-b from-emerald-50/80 to-white px-4 py-6">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  mine
                    ? "rounded-br-sm bg-linear-to-br from-emerald-700 to-teal-600 text-white shadow-emerald-700/20"
                    : "rounded-bl-sm border border-emerald-100 bg-white text-gray-900"
                }`}
              >
                <p className="whitespace-pre-wrap wrap-break-word text-sm leading-relaxed">
                  {m.body}
                </p>
                <p
                  className={`mt-1 text-right text-[11px] ${
                    mine ? "text-emerald-100" : "text-gray-400"
                  }`}
                >
                  {formatChatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && <p className="px-5 pt-2 text-sm text-red-600">{error}</p>}

      {/* Message box OR blocked notice */}
      {blocked ? (
        <div className="flex items-center gap-2 border-t border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <Ban className="h-4 w-4 shrink-0" />
          {BLOCKED_TEXT}
        </div>
      ) : (
        <form
          ref={formRef}
          onSubmit={handleSend}
          className="flex items-end gap-3 border-t border-emerald-100 bg-white p-4"
        >
          <textarea
            rows={1}
            maxLength={3000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="max-h-40 flex-1 resize-none rounded-2xl border border-gray-200 bg-emerald-50/40 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
          <button
            type="submit"
            disabled={sending || text.trim() === ""}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-700 to-teal-600 text-white shadow-lg shadow-emerald-700/30 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
            aria-label="Send"
          >
            <SendHorizontal className="h-5 w-5" />
          </button>
        </form>
      )}
    </div>
  );
}