import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatChatTime } from "@/lib/format";

export default async function AdminChatsPage() {
  await connection();
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

  // 2. Load ALL conversations, newest first
  const { data: questions } = await supabase
    .from("questions")
    .select("id, title, status, user_id, scholar_id, last_message_at, last_message_preview")
    .order("last_message_at", { ascending: false });

  // 3. Load the names of everyone in these chats
  const ids = [
    ...new Set((questions ?? []).flatMap((q) => [q.user_id, q.scholar_id])),
  ];

  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: people } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);
    people?.forEach((p) => names.set(p.id, p.full_name ?? "No name"));
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-emerald-800">All Conversations</h1>
        <Link href="/admin" className="text-sm text-emerald-700 hover:underline">
          ← Back to Admin
        </Link>
      </div>

      {!questions || questions.length === 0 ? (
        <p className="text-gray-500">No conversations yet.</p>
      ) : (
               <ul className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white shadow-sm">
          {questions.map((q) => (
            <li key={q.id}>
              <Link
                href={`/admin/chats/${q.id}`}
                className="flex items-start justify-between gap-4 p-4 hover:bg-emerald-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">{q.title}</p>
                  <p className="text-sm text-gray-600">
                    {names.get(q.user_id) ?? "Unknown"} → {names.get(q.scholar_id) ?? "Unknown"}
                  </p>
                  <p className="truncate text-sm text-gray-500">{q.last_message_preview}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-gray-500">
                    {q.last_message_at ? formatChatTime(q.last_message_at) : ""}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                      q.status === "answered"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {q.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}