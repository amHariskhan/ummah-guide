import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
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
    <main className="min-h-screen bg-emerald-50 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/chats" className="text-emerald-700 font-medium hover:underline">
          ← All messages
        </Link>

        <div className="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
            <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{otherName}</p>
              <p className="text-sm text-emerald-800 truncate">{question.title}</p>
            </div>
            <span
              className={`text-xs shrink-0 rounded-full px-3 py-1 ${
                question.status === "answered"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-yellow-100 text-yellow-800"
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