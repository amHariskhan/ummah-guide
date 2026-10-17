"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BlockUserButton({
  userId,
  userName,
  isBlocked,
}: {
  userId: string;
  userName: string;
  isBlocked: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const question = isBlocked
      ? `Unblock ${userName}? They will be able to ask and send messages again.`
      : `Block ${userName}? They will NOT be able to ask questions or send messages.`;

    if (!confirm(question)) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("admin_set_blocked", {
      target: userId,
      blocked: !isBlocked,
    });
    setLoading(false);

    if (error) {
      alert("Failed: " + error.message);
      return;
    }

    router.refresh(); // reload the list with the new status
  }

  return isBlocked ? (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
    >
      <CheckCircle2 className="h-4 w-4" />
      {loading ? "..." : "Unblock"}
    </button>
  ) : (
    <button
      onClick={handleClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      <Ban className="h-4 w-4" />
      {loading ? "..." : "Block"}
    </button>
  );
}