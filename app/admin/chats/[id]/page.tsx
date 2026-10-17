import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Full date + time in Pakistan time, e.g. "14 Oct 2026, 3:45 PM"
function fullTime(date: string) {
  return new Date(date).toLocaleString("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default async function AdminChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const questionId = Number(id);
  if (!Number.isInteger(questionId)) notFound();

  const supabase = await createClient();

  // 1. Only admins allowed
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (me?.role !== "admin") redirect("/");

  // 2. Load the conversation + its messages together
  const [{ data: question }, { data: messages }] = await Promise.all([
    supabase
      .from("questions")
      .select("id, title, status, user_id, scholar_id, created_at")
      .eq("id", questionId)
      .maybeSingle(),
    supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("question_id", questionId)
      .order("created_at", { ascending: true }),
  ]);

  if (!question) notFound();

  // 3. Names of the two people
  const { data: people } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", [question.user_id, question.scholar_id]);

  const names = new Map<string, string>();
  people?.forEach((p) => names.set(p.id, p.full_name ?? "No name"));

  const askerName = names.get(question.user_id) ?? "Unknown";
  const scholarName = names.get(question.scholar_id) ?? "Unknown";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/admin/chats" className="text-sm text-emerald-700 hover:underline">
        ← All Conversations
      </Link>

      {/* Header */}
      <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-emerald-800">{question.title}</h1>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${
              question.status === "answered"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {question.status}
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">User:</span> {askerName} &nbsp;·&nbsp;
          <span className="font-medium">Scholar:</span> {scholarName}
        </p>
        <p className="mt-1 text-xs text-gray-500">Started {fullTime(question.created_at)}</p>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Read-only view for moderation. Admin cannot send messages here.
        </p>
      </div>

      {/* Messages */}
      <div className="mt-6 space-y-3">
        {(messages ?? []).map((m) => {
          const isScholar = m.sender_id === question.scholar_id;
          return (
            <div key={m.id} className={`flex ${isScholar ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                  isScholar ? "bg-emerald-600 text-white" : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className={`text-xs font-semibold ${isScholar ? "text-emerald-100" : "text-emerald-700"}`}>
                  {names.get(m.sender_id) ?? "Unknown"}
                </p>
                <p className="whitespace-pre-line wrap-break-word">{m.body}</p>
                <p className={`mt-1 text-right text-[11px] ${isScholar ? "text-emerald-100" : "text-gray-400"}`}>
                  {fullTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}