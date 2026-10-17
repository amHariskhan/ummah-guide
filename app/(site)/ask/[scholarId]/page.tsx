import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Ban } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AskQuestionForm from "@/components/AskQuestionForm";

export default async function AskPage({
  params,
}: {
  params: Promise<{ scholarId: string }>;
}) {
  await connection();

  const { scholarId } = await params;
  const supabase = await createClient();

  // Must be logged in to ask
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Scholar (must be APPROVED), scholar's name, and MY blocked status – all together
  const [{ data: scholar }, { data: scholarProfile }, { data: myProfile }] =
    await Promise.all([
      supabase
        .from("scholar_profiles")
        .select("id, specialty")
        .eq("id", scholarId)
        .eq("status", "approved")
        .maybeSingle(),
      supabase.from("profiles").select("full_name").eq("id", scholarId).maybeSingle(),
      supabase.from("profiles").select("is_blocked").eq("id", user.id).single(),
    ]);

  if (!scholar) {
    notFound();
  }

  const scholarName = scholarProfile?.full_name ?? "the scholar";

  // A scholar can't ask themselves
  const isSelf = user.id === scholarId;
  const isBlocked = myProfile?.is_blocked ?? false;

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link
          href={`/scholars/${scholarId}`}
          className="text-emerald-700 font-medium hover:underline"
        >
          ← Back to profile
        </Link>

        <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-emerald-800">Ask {scholarName}</h1>
          <p className="text-emerald-700 font-medium mt-1">{scholar.specialty}</p>

          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            🔒 Your question is private. Only you, {scholarName} and the Ummah Guide admin can see it.
          </div>

          <div className="mt-8">
            {isBlocked ? (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <Ban className="mt-0.5 h-4 w-4 shrink-0" />
                <p>
                  Your account has been suspended by the admin, so you cannot ask new
                  questions. You can still read your existing conversations in{" "}
                  <Link href="/chats" className="font-medium underline">
                    Messages
                  </Link>
                  .
                </p>
              </div>
            ) : isSelf ? (
              <p className="text-gray-600 text-center">
                This is your own profile. You can&apos;t ask yourself a question.
              </p>
            ) : (
              <AskQuestionForm
                userId={user.id}
                scholarId={scholarId}
                scholarName={scholarName}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}