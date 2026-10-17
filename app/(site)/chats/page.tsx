import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatChatTime } from "@/lib/format";

export default async function ChatsPage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // All conversations where I am the asker OR the scholar, newest first
  const { data: conversations } = await supabase
    .from("questions")
    .select("id, title, status, user_id, scholar_id, last_message_at, last_message_preview, last_sender_id")
    .or(`user_id.eq.${user.id},scholar_id.eq.${user.id}`)
    .order("last_message_at", { ascending: false });

  const list = conversations ?? [];

  // Unread count per conversation
  const { data: unreadRows } = await supabase.rpc("my_unread_counts");
  const unreadMap: Record<number, number> = {};
  (unreadRows ?? []).forEach((r: { question_id: number; unread: number }) => {
    unreadMap[r.question_id] = r.unread;
  });

  // Who is the OTHER person in each chat?
  const otherIds = Array.from(
    new Set(list.map((c) => (c.user_id === user.id ? c.scholar_id : c.user_id)))
  );

  const nameMap: Record<string, string> = {};

  if (otherIds.length > 0) {
    const { data: names } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", otherIds);

    names?.forEach((n) => {
      nameMap[n.id] = n.full_name;
    });
  }

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-800">Messages</h1>
        <p className="text-gray-600 mt-2">Your private conversations.</p>

        <div className="mt-8 bg-white rounded-2xl shadow overflow-hidden">
          {list.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No conversations yet.{" "}
              <Link href="/scholars" className="text-emerald-700 font-semibold hover:underline">
                Find a scholar
              </Link>{" "}
              to ask your first question.
            </div>
          )}

          {list.map((c) => {
            const otherId = c.user_id === user.id ? c.scholar_id : c.user_id;
            const otherName = nameMap[otherId] ?? "User";
            const sentByMe = c.last_sender_id === user.id;
            const unread = unreadMap[c.id] ?? 0;

            return (
              <Link
                key={c.id}
                href={`/chats/${c.id}`}
                className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 hover:bg-emerald-50 transition"
              >
                {/* Avatar */}
                <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold">
                  {otherName.charAt(0).toUpperCase()}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className={`truncate text-gray-900 ${unread > 0 ? "font-bold" : "font-semibold"}`}>
                      {otherName}
                    </p>
                    <span
                      className={`text-xs shrink-0 ${
                        unread > 0 ? "text-emerald-600 font-semibold" : "text-gray-500"
                      }`}
                    >
                      {formatChatTime(c.last_message_at)}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-emerald-800 truncate">{c.title}</p>

                  <div className="flex items-center justify-between gap-3 mt-0.5">
                    <p className={`text-sm truncate ${unread > 0 ? "text-gray-900 font-medium" : "text-gray-500"}`}>
                      {sentByMe && "You: "}
                      {c.last_message_preview}
                    </p>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs rounded-full px-2 py-0.5 ${
                          c.status === "answered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {c.status === "answered" ? "Answered" : "Open"}
                      </span>

                      {/* Unread badge */}
                      {unread > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                          {unread > 99 ? "99+" : unread}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}