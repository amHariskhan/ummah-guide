"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient(); // created only when the button is clicked
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-full border border-emerald-600 px-4 py-2 text-emerald-700 font-medium hover:bg-emerald-50"
    >
      Logout
    </button>
  );
}