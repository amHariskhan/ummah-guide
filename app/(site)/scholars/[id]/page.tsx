import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  GraduationCap,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";

export default async function ScholarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: scholar }, { data: profile }] = await Promise.all([
    supabase
      .from("scholar_profiles")
      .select("id, specialty, qualification, experience_years, bio")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", id).maybeSingle(),
  ]);

  if (!scholar) notFound();

  const name = profile?.full_name ?? "Scholar";

  return (
    <>
      {/* Banner */}
      <section className="relative overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-800">
        <div
          aria-hidden="true"
          className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-6 py-14">
          <Link
            href="/scholars"
            className="inline-flex items-center gap-2 text-sm text-emerald-50/80 transition-colors hover:text-gold-300"
          >
            <ArrowLeft className="h-4 w-4" />
            All scholars
          </Link>

          <div className="mt-8 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-500 font-heading text-4xl font-bold text-white ring-4 ring-gold-400/70">
              {name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-3xl font-bold text-white md:text-4xl">
                {name}
              </h1>
              <p className="mt-2 flex items-center justify-center gap-1.5 font-medium text-gold-300 sm:justify-start">
                <BadgeCheck className="h-5 w-5" />
                Verified Scholar
              </p>
              <span className="mt-3 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-emerald-50 backdrop-blur-md">
                {scholar.specialty}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="bg-linear-to-b from-emerald-50/60 to-white py-14">
        <div className="mx-auto grid max-w-4xl gap-8 px-6 lg:grid-cols-3">
          <Reveal className="lg:col-span-2">
            <div className="h-full rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm">
              <h2 className="font-heading text-2xl font-bold text-emerald-950">
                About
              </h2>
              {scholar.bio ? (
                <p className="mt-4 whitespace-pre-line leading-relaxed text-gray-600">
                  {scholar.bio}
                </p>
              ) : (
                <p className="mt-4 text-gray-500">
                  This scholar hasn&apos;t added a bio yet.
                </p>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="h-fit rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm lg:sticky lg:top-24">
              <h2 className="font-heading text-xl font-bold text-emerald-950">
                Details
              </h2>

              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <GraduationCap className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div className="min-w-0">
                    <dt className="text-gray-500">Qualification</dt>
                    <dd className="font-medium text-gray-900">
                      {scholar.qualification || "Not provided"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                  <div>
                    <dt className="text-gray-500">Experience</dt>
                    <dd className="font-medium text-gray-900">
                      {scholar.experience_years != null
                        ? `${scholar.experience_years} years`
                        : "Not provided"}
                    </dd>
                  </div>
                </div>
              </dl>

              <Link
                href={`/ask/${scholar.id}`}
                className="mt-8 flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-700 to-teal-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <MessageCircle className="h-5 w-5" />
                Ask a Question
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}