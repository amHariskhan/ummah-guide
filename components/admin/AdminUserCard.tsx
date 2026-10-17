import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";
import { connection } from "next/server";

export default async function AdminUserCard() {
      await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="truncate text-sm font-semibold text-gray-900">
        {profile?.full_name ?? "Admin"}
      </p>
      <p className="truncate text-xs text-gray-500">{user.email}</p>
      <div className="mt-3">
        <LogoutButton />
      </div>
    </div>
  );
}