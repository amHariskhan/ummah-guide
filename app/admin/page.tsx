import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import {
  Clock,
  ShieldCheck,
  Users,
  MessagesSquare,
  AlertCircle,
  FileText,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ScholarReviewActions from "@/components/ScholarReviewActions";
import AdminHeader from "@/components/admin/AdminHeader";

const TABS = ["pending", "approved", "rejected"] as const;
type Status = (typeof TABS)[number];

type CertLink = { id: string; title: string; url: string | null };

// One stat box (icon + label + number). If href is given, the box is clickable.
function StatCard({
  label,
  value,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: "emerald" | "amber";
  href?: string;
}) {
  const tile =
    tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600";

  const box = (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tile}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{box}</Link> : box;
}

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

  // All counts at once
  const [
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: userCount },
    { count: questionCount },
  ] = await Promise.all([
    supabase.from("scholar_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("scholar_profiles").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("scholar_profiles").select("*", { count: "exact", head: true }).eq("status", "rejected"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("questions").select("*", { count: "exact", head: true }),
  ]);

  const tabCounts: Record<Status, number> = {
    pending: pendingCount ?? 0,
    approved: approvedCount ?? 0,
    rejected: rejectedCount ?? 0,
  };

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
    <>
      <AdminHeader
        title="Dashboard"
        subtitle={`Welcome, ${profile.full_name}. Here's the platform at a glance.`}
        actions={
          <Link
            href="/admin/chats"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            View conversations
          </Link>
        }
      />

      <div className="space-y-8 p-6 md:p-8">
        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Pending scholars" value={tabCounts.pending} icon={Clock} tone="amber" href="/admin?status=pending" />
          <StatCard label="Approved scholars" value={tabCounts.approved} icon={ShieldCheck} tone="emerald" href="/admin?status=approved" />
          <StatCard label="Total users" value={userCount ?? 0} icon={Users} tone="emerald" href="/admin/users" />
          <StatCard label="Conversations" value={questionCount ?? 0} icon={MessagesSquare} tone="emerald" href="/admin/chats" />
        </div>

        {/* Alert banner (only when scholars are waiting) */}
        {tabCounts.pending > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <p className="flex items-center gap-2 text-sm text-amber-800">
              <AlertCircle className="h-5 w-5" />
              {tabCounts.pending} scholar{tabCounts.pending === 1 ? " is" : "s are"} waiting for verification.
            </p>
            <Link
              href="/admin?status=pending"
              className="rounded-lg border border-amber-300 bg-white px-4 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              Review now
            </Link>
          </div>
        )}

        {/* Scholar verification */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-gray-900">Scholar verification</h2>

            {/* Tabs */}
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
              {TABS.map((tab) => (
                <Link
                  key={tab}
                  href={`/admin?status=${tab}`}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                    activeTab === tab
                      ? "bg-emerald-600 text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab}
                  <span
                    className={`rounded-full px-1.5 text-xs ${
                      activeTab === tab ? "bg-white/20" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {tabCounts[tab]}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Scholar list */}
          <div className="mt-4 space-y-4">
            {(!scholars || scholars.length === 0) && (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                No {activeTab} scholars.
              </div>
            )}

            {scholars?.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-semibold text-emerald-700">
                      {(nameMap[s.id] ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {nameMap[s.id] ?? "Unknown name"}
                      </h3>
                      <p className="text-sm text-emerald-700">{s.specialty}</p>
                    </div>
                  </div>
                  <ScholarReviewActions scholarId={s.id} status={s.status} />
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <p>
                    <span className="text-gray-500">Qualification:</span>{" "}
                    <span className="text-gray-900">{s.qualification}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Experience:</span>{" "}
                    <span className="text-gray-900">{s.experience_years} years</span>
                  </p>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm text-gray-700">{s.bio}</p>

                {/* Certificates */}
                <div className="mt-5 border-t border-gray-100 pt-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Certificates
                  </h4>
                  {certsByScholar[s.id]?.length ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {certsByScholar[s.id].map((c) => (
                        <li key={c.id}>
                          {c.url ? (
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-100"
                            >
                              <FileText className="h-4 w-4" />
                              {c.title}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-500">{c.title} (link unavailable)</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-amber-600">
                      <AlertCircle className="h-4 w-4" />
                      No certificates uploaded.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}