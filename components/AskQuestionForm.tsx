"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const fieldClass =
  "mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";

export default function AskQuestionForm({
  userId,
  scholarId,
}: {
  userId: string;
  scholarId: string;
  scholarName: string;
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    setError("");
    setLoading(true);

    // Save the question and get back its new id
    const { data, error } = await supabase
      .from("questions")
      .insert({
        user_id: userId,
        scholar_id: scholarId,
        title,
        body,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) {
      setLoading(false);
      // Friendly text only, never raw database errors
      setError(
        error.message.includes("Blocked users")
          ? "Your account has been suspended by the admin, so you cannot ask new questions."
          : "Your question could not be sent. Please try again."
      );
      return;
    }

    // Go straight into the new conversation
    router.push(`/chats/${data.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Question title</label>
        <input
          type="text"
          required
          maxLength={150}
          placeholder="e.g. Is it permissible to combine prayers while travelling?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Your question in detail
        </label>
        <textarea
          required
          rows={7}
          maxLength={3000}
          placeholder="Explain your situation clearly so the scholar can give you an accurate answer."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={fieldClass}
        />
        <p className="mt-1 text-right text-xs text-gray-500">{body.length} / 3000</p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-700 to-teal-600 py-3 font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
      >
        <Send className="h-4 w-4" />
        {loading ? "Sending..." : "Send Question"}
      </button>
    </form>
  );
}   