import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import ConversationList, {
  type ConversationItem,
} from "@/components/ConversationList";

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
    .select(
      "id, title, status, user_id, scholar_id, last_message_at, last_message_preview, last_sender_id"
    )
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

  const items: ConversationItem[] = list.map((c) => {
    const otherId = c.user_id === user.id ? c.scholar_id : c.user_id;
    return {
      id: c.id,
      title: c.title,
      status: c.status,
      otherName: nameMap[otherId] ?? "User",
      last_message_at: c.last_message_at,
      last_message_preview: c.last_message_preview,
      last_sender_id: c.last_sender_id,
    };
  });

  // When the server data changes (e.g. after router.refresh), this key makes
  // the list start fresh from the new data
  const listKey = items.map((i) => `${i.id}:${i.last_message_at}`).join("|");

  return (
    <>
      <PageHeader title="Messages" subtitle="Your private conversations." />

      <main className="bg-linear-to-b from-emerald-100/70 via-emerald-50 to-white px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <ConversationList
            key={listKey}
            currentUserId={user.id}
            initialItems={items}
            initialUnread={unreadMap}
          />
        </div>
      </main>
    </>
  );
}