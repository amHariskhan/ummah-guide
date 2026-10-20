import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ChatWindow from "@/components/ChatWindow";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const questionId = Number(id);

  // The id must be a number (questions.id is bigint)
  if (!Number.isInteger(questionId)) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load the conversation
  const { data: question } = await supabase
    .from("questions")
    .select("id, title, status, user_id, scholar_id")
    .eq("id", questionId)
    .maybeSingle();

  if (!question) {
    notFound();
  }

  // Only the asker and the scholar can open this chat
  const isScholar = question.scholar_id === user.id;
  const isAsker = question.user_id === user.id;

  if (!isScholar && !isAsker) {
    notFound();
  }

  // The other person's name
  const otherId = isScholar ? question.user_id : question.scholar_id;
  const { data: other } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherId)
    .maybeSingle();

  const otherName = other?.full_name ?? "User";

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", user.id)
    .single();

  // Opening the chat = I have read it
  await supabase.rpc("mark_conversation_read", { qid: questionId });

  // All messages, oldest first
  const { data: messages } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  return (
    <main className="min-h-[calc(100vh-4.5rem)] bg-linear-to-b from-emerald-100/70 via-emerald-50 to-white px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/chats"
          className="inline-flex items-center gap-2 font-medium text-emerald-700 transition-colors hover:text-emerald-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All messages
        </Link>

        <div className="mt-4 overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-900/10">
          {/* Header */}
          <div className="flex items-center gap-4 bg-linear-to-r from-emerald-950 via-emerald-900 to-teal-800 px-5 py-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-500 text-lg font-bold text-white ring-2 ring-gold-400/70">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{otherName}</p>
              <p className="truncate text-sm text-emerald-100/80">{question.title}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                question.status === "answered"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-gold-300 text-emerald-950"
              }`}
            >
              {question.status === "answered" ? "Answered" : "Open"}
            </span>
          </div>

          <ChatWindow
            questionId={question.id}
            currentUserId={user.id}
            initialMessages={messages ?? []}
            isScholar={isScholar}
            status={question.status}
            isBlocked={myProfile?.is_blocked ?? false}
          />
        </div>
      </div>
    </main>
  );
}