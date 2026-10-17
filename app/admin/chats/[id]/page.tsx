import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Lock, User, ShieldCheck, Calendar, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AdminHeader from "@/components/admin/AdminHeader";

// Full date + time in Pakistan time, e.g. "14 Oct 2026, 3:45 pm"
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
  const messageCount = messages?.length ?? 0;

  return (
    <>
      <AdminHeader
        title={question.title}
        subtitle={`${askerName} → ${scholarName}`}
        actions={
          <Link
            href="/admin/chats"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        }
      />

      <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-3">
        {/* LEFT: messages */}
        <section className="rounded-xl border border-gray-200 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3 text-xs text-amber-700">
            <Lock className="h-4 w-4" />
            Read-only view for moderation. Admin cannot send messages here.
          </div>

          <div className="space-y-3 bg-slate-50/60 p-5">
            {messageCount === 0 && (
              <p className="py-10 text-center text-sm text-gray-500">No messages.</p>
            )}

            {messages?.map((m) => {
              const isScholar = m.sender_id === question.scholar_id;
              return (
                <div key={m.id} className={`flex ${isScholar ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm ${
                      isScholar
                        ? "rounded-br-sm bg-emerald-600 text-white"
                        : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
                    }`}
                  >
                    <p className={`text-xs font-semibold ${isScholar ? "text-emerald-100" : "text-emerald-700"}`}>
                      {names.get(m.sender_id) ?? "Unknown"}
                    </p>
                    <p className="whitespace-pre-line wrap-break-word text-sm">{m.body}</p>
                    <p className={`mt-1 text-right text-[11px] ${isScholar ? "text-emerald-100" : "text-gray-400"}`}>
                      {fullTime(m.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* RIGHT: info panel */}
        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Details</h2>

          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <User className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-gray-500">User</dt>
                <dd className="font-medium text-gray-900">{askerName}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-gray-500">Scholar</dt>
                <dd className="font-medium text-emerald-700">{scholarName}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-gray-500">Started</dt>
                <dd className="font-medium text-gray-900">{fullTime(question.created_at)}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-gray-500">Messages</dt>
                <dd className="font-medium text-gray-900">{messageCount}</dd>
              </div>
            </div>
          </dl>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                question.status === "answered"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {question.status}
            </span>
          </div>
        </aside>
      </div>
    </>
  );
}