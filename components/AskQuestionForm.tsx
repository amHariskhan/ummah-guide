"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
      setError(error.message);
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
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Your question in detail</label>
        <textarea
          required
          rows={7}
          maxLength={3000}
          placeholder="Explain your situation clearly so the scholar can give you an accurate answer."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <p className="text-xs text-gray-500 mt-1">{body.length} / 3000</p>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Question"}
      </button>
    </form>
  );
}