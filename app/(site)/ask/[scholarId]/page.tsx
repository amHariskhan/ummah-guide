import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Ban, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import AskQuestionForm from "@/components/AskQuestionForm";
import PageHeader from "@/components/PageHeader";

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
    <>
      <PageHeader title={`Ask ${scholarName}`} subtitle={scholar.specialty} />

      <section className="bg-linear-to-b from-emerald-50/60 to-white px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/scholars/${scholarId}`}
            className="inline-flex items-center gap-2 font-medium text-emerald-700 transition-colors hover:text-emerald-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to profile
          </Link>

          <div className="mt-6 rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-900/10">
            <div className="flex items-start gap-3 rounded-2xl border border-gold-300/50 bg-linear-to-r from-gold-300/15 to-emerald-50 p-4 text-sm text-emerald-900">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold-500" />
              <p>
                Your question is private. Only you, {scholarName} and the Ummah
                Guide admin can see it.
              </p>
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
                <p className="text-center text-gray-600">
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
      </section>
    </>
  );
}