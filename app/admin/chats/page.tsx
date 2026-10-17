import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatChatTime } from "@/lib/format";
import AdminHeader from "@/components/admin/AdminHeader";

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

  const total = questions?.length ?? 0;

  return (
    <>
      <AdminHeader
        title="Conversations"
        subtitle={`${total} conversation${total === 1 ? "" : "s"} between users and scholars`}
      />

      <div className="p-6 md:p-8">
        {total === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500">
            No conversations yet.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Table header */}
            <div className="hidden grid-cols-12 gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 md:grid">
              <div className="col-span-5">Conversation</div>
              <div className="col-span-4">Participants</div>
              <div className="col-span-2">Last activity</div>
              <div className="col-span-1">Status</div>
            </div>

            {/* Rows */}
            <ul className="divide-y divide-gray-100">
              {questions!.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/admin/chats/${q.id}`}
                    className="grid grid-cols-1 gap-2 px-5 py-4 transition-colors hover:bg-emerald-50/50 md:grid-cols-12 md:items-center md:gap-4"
                  >
                    <div className="min-w-0 md:col-span-5">
                      <p className="truncate font-medium text-gray-900">{q.title}</p>
                      <p className="truncate text-sm text-gray-500">{q.last_message_preview}</p>
                    </div>
                    <div className="min-w-0 text-sm text-gray-700 md:col-span-4">
                      <span className="font-medium">{names.get(q.user_id) ?? "Unknown"}</span>
                      <span className="mx-1.5 text-gray-400">→</span>
                      <span className="font-medium text-emerald-700">
                        {names.get(q.scholar_id) ?? "Unknown"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 md:col-span-2">
                      {q.last_message_at ? formatChatTime(q.last_message_at) : "—"}
                    </div>
                    <div className="md:col-span-1">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
          </div>
        )}
      </div>
    </>
  );
}