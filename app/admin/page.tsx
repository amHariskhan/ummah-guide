import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ScholarReviewActions from "@/components/ScholarReviewActions";

const TABS = ["pending", "approved", "rejected"] as const;
type Status = (typeof TABS)[number];

type CertLink = { id: string; title: string; url: string | null };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  // Which tab is open? (from the URL, e.g. /admin?status=approved)
  const params = await searchParams;
  const activeTab: Status = TABS.includes(params.status as Status)
    ? (params.status as Status)
    : "pending";

  // Counts for the 3 boxes
  const [{ count: pendingCount }, { count: userCount }, { count: questionCount }] =
    await Promise.all([
      supabase.from("scholar_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("questions").select("*", { count: "exact", head: true }),
    ]);

  // Scholars in the current tab
  const { data: scholars } = await supabase
    .from("scholar_profiles")
    .select("id, specialty, qualification, experience_years, bio, status")
    .eq("status", activeTab);

  const ids = scholars?.map((s) => s.id) ?? [];

  const nameMap: Record<string, string> = {};
  const certsByScholar: Record<string, CertLink[]> = {};

  if (ids.length > 0) {
    // Scholar names
    const { data: names } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);

    names?.forEach((n) => {
      nameMap[n.id] = n.full_name;
    });

    // Certificates + temporary view links
    const { data: certRows } = await supabase
      .from("certificates")
      .select("id, scholar_id, title, file_path")
      .in("scholar_id", ids);

    if (certRows && certRows.length > 0) {
      const { data: signed } = await supabase.storage
        .from("certificates")
        .createSignedUrls(
          certRows.map((c) => c.file_path),
          3600
        );

      certRows.forEach((c) => {
        const url = signed?.find((s) => s.path === c.file_path)?.signedUrl ?? null;
        if (!certsByScholar[c.scholar_id]) certsByScholar[c.scholar_id] = [];
        certsByScholar[c.scholar_id].push({ id: c.id, title: c.title, url });
      });
    }
  }

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-800">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome, {profile.full_name}. Review scholars and manage the platform.
        </p>

        {/* Stat boxes */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-800">Pending Scholars</h2>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{pendingCount ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-800">Total Users</h2>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{userCount ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="font-semibold text-gray-800">Questions</h2>
            <p className="text-3xl font-bold text-emerald-700 mt-2">{questionCount ?? 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <h2 className="text-2xl font-bold text-emerald-800 mt-12">Scholar Verification</h2>
        <div className="flex gap-2 mt-4">
          {TABS.map((tab) => (
            <Link
              key={tab}
              href={`/admin?status=${tab}`}
              className={`rounded-full px-5 py-2 font-medium capitalize ${
                activeTab === tab
                  ? "bg-emerald-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50"
              }`}
            >
              {tab}
            </Link>
          ))}
        </div>

        {/* Scholar list */}
        <div className="mt-6 space-y-6">
          {(!scholars || scholars.length === 0) && (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-gray-500">
              No {activeTab} scholars.
            </div>
          )}

          {scholars?.map((s) => (
            <div key={s.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {nameMap[s.id] ?? "Unknown name"}
                  </h3>
                  <p className="text-emerald-700 font-medium">{s.specialty}</p>
                </div>
                <ScholarReviewActions scholarId={s.id} status={s.status} />
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4 text-sm text-gray-800">
                <p>
                  <span className="font-semibold text-gray-700">Qualification:</span>{" "}
                  {s.qualification}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Experience:</span>{" "}
                  {s.experience_years} years
                </p>
              </div>

              <p className="mt-4 text-gray-700 text-sm whitespace-pre-line">{s.bio}</p>

              {/* Certificates */}
              <div className="mt-5 border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-800 text-sm">Certificates</h4>
                {certsByScholar[s.id]?.length ? (
                  <ul className="mt-2 flex flex-wrap gap-3">
                    {certsByScholar[s.id].map((c) => (
                      <li key={c.id}>
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-800 text-sm hover:bg-emerald-100"
                          >
                            📄 {c.title}
                          </a>
                        ) : (
                          <span className="text-gray-500 text-sm">📄 {c.title} (link unavailable)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-amber-600 text-sm mt-1">⚠ No certificates uploaded.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}