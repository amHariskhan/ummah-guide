"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ScholarReviewActions({
  scholarId,
  status,
}: {
  scholarId: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(newStatus: "approved" | "rejected") {
    if (newStatus === "rejected" && !confirm("Are you sure you want to reject this scholar?")) {
      return;
    }

    setLoading(newStatus);
    setError("");
    const supabase = createClient();

    const { data, error } = await supabase
      .from("scholar_profiles")
      .update({ status: newStatus })
      .eq("id", scholarId)
      .select();

    setLoading(null);

    if (error) {
      setError(error.message);
      return;
    }
    if (!data || data.length === 0) {
      setError("Update was blocked. Check the admin policies in Supabase.");
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <div className="flex gap-3">
        {status !== "approved" && (
          <button
            onClick={() => updateStatus("approved")}
            disabled={loading !== null}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading === "approved" ? "Approving..." : "✓ Approve"}
          </button>
        )}

        {status !== "rejected" && (
          <button
            onClick={() => updateStatus("rejected")}
            disabled={loading !== null}
            className="rounded-lg border border-red-500 px-5 py-2 text-red-600 font-semibold hover:bg-red-50 disabled:opacity-50"
          >
            {loading === "rejected"
              ? "Saving..."
              : status === "approved"
              ? "Revoke Approval"
              : "✕ Reject"}
          </button>
        )}
      </div>

      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}