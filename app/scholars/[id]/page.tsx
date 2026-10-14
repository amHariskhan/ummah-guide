import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export default async function ScholarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  // Read the id from the URL (/scholars/THIS-PART)
  const { id } = await params;

  const supabase = await createClient();

  // Get this scholar, only if APPROVED
  const { data: scholar } = await supabase
    .from("scholar_profiles")
    .select("id, specialty, qualification, experience_years, bio")
    .eq("id", id)
    .eq("status", "approved")
    .maybeSingle();

  // Not found or not approved → show 404 page
  if (!scholar) {
    notFound();
  }

  // Get their name
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", id)
    .maybeSingle();

  const name = profile?.full_name ?? "Scholar";

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link href="/scholars" className="text-emerald-700 font-medium hover:underline">
          ← Back to all scholars
        </Link>

        {/* Main card */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="w-24 h-24 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-4xl font-bold">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{name}</h1>
              <p className="text-emerald-700 font-medium text-lg mt-1">{scholar.specialty}</p>
              <span className="inline-block mt-3 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm text-emerald-800">
                ✓ Verified by Ummah Guide
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Qualification</p>
              <p className="font-semibold text-gray-900 mt-1">{scholar.qualification}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-gray-500">Experience</p>
              <p className="font-semibold text-gray-900 mt-1">{scholar.experience_years} years</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-emerald-800">About</h2>
            <p className="mt-3 text-gray-700 whitespace-pre-line leading-relaxed">{scholar.bio}</p>
          </div>

          {/* Trust note */}
          <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            🛡️ This scholar&apos;s qualifications and certificates have been reviewed and verified
            by the Ummah Guide team.
          </div>

          {/* Ask button */}
          <Link
            href={`/ask/${scholar.id}`}
            className="mt-8 block w-full rounded-lg bg-emerald-600 py-3 text-center text-white font-semibold hover:bg-emerald-700"
          >
            Ask {name} a Question
          </Link>
        </div>
      </div>
    </main>
  );
}