"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatChatTime } from "@/lib/format";

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export default function ChatWindow({
  questionId,
  currentUserId,
  initialMessages,
  isScholar,
  status,
}: {
  questionId: number;
  currentUserId: string;
  initialMessages: Message[];
  isScholar: boolean;
  status: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");

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
    if (!body || sending) return;

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
      setError(error.message);
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
      setError(error?.message ?? "Could not update the status.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="flex flex-col">
      {/* Scholar action bar */}
      {isScholar && status !== "answered" && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-yellow-50 border-b border-yellow-100">
          <p className="text-sm text-yellow-800">When you have fully answered, mark this as answered.</p>
          <button
            onClick={markAnswered}
            disabled={marking}
            className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {marking ? "Saving..." : "✓ Mark as Answered"}
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="h-[60vh] overflow-y-auto bg-emerald-50/60 px-4 py-6 space-y-3">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  mine
                    ? "bg-emerald-600 text-white rounded-br-sm"
                    : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                }`}
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.body}</p>
                <p className={`text-[11px] mt-1 text-right ${mine ? "text-emerald-100" : "text-gray-400"}`}>
                  {formatChatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Error */}
      {error && <p className="px-5 pt-2 text-red-600 text-sm">{error}</p>}

      {/* Message box */}
      <form ref={formRef} onSubmit={handleSend} className="flex items-end gap-3 p-4 border-t border-gray-100">
        <textarea
          rows={1}
          maxLength={3000}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 max-h-40"
        />
        <button
          type="submit"
          disabled={sending || text.trim() === ""}
          className="shrink-0 rounded-full bg-emerald-600 w-12 h-12 flex items-center justify-center text-white text-lg hover:bg-emerald-700 disabled:opacity-50"
          aria-label="Send"
        >
          ➤
        </button>
      </form>
    </div>
  );
}