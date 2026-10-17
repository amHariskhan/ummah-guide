import { connection } from "next/server";
import { Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

// Shows a red bar at the top of the site if the logged-in user is blocked
export default async function BlockedBanner() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_blocked")
    .eq("id", user.id)
    .single();

  if (!profile?.is_blocked) return null;

  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-3">
      <p className="mx-auto flex max-w-6xl items-center gap-2 text-sm text-red-700">
        <Ban className="h-4 w-4 shrink-0" />
        Your account has been suspended by the admin. You can read your conversations, but
        you cannot ask new questions or send messages.
      </p>
    </div>
  );
}