import Link from "next/link";
import { connection } from "next/server";
import { GraduationCap, Clock, ArrowRight, BadgeCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Reveal from "./Reveal";

export default async function FeaturedScholars() {
  await connection();

  const supabase = await createClient();

  const { data: scholars } = await supabase
    .from("scholar_profiles")
    .select("id, specialty, qualification, experience_years, bio")
    .eq("status", "approved")
    .not("specialty", "is", null)
    .limit(3);

  const ids = (scholars ?? []).map((s) => s.id);

  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] };

  const names = new Map<string, string>();
  (profiles ?? []).forEach((p) => names.set(p.id, p.full_name));

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-white to-emerald-50/70 py-24">
      <div
        aria-hidden="true"
        className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-gold-300/20 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold-500">
            Our Scholars
          </span>
          <h2 className="font-heading mt-3 text-3xl font-bold text-emerald-950 md:text-5xl">
            Learn from verified Ulama
          </h2>
          <p className="mt-4 text-gray-600">
            Every scholar here has had their credentials reviewed by our admin
            team before appearing publicly.
          </p>
        </Reveal>

        {(scholars ?? []).length === 0 ? (
          <p className="mt-12 text-center text-gray-500">
            Scholars will appear here soon, insha'Allah.
          </p>
        ) : (
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {(scholars ?? []).map((s, i) => {
              const name = names.get(s.id) ?? "Scholar";
              return (
                <Reveal key={s.id} delay={i * 0.15}>
                  <Link
                    href={`/scholars/${s.id}`}
                    className="group relative block h-full rounded-3xl border border-emerald-100 bg-white/80 p-7 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-gold-300 hover:shadow-xl hover:shadow-emerald-900/10"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-700 to-teal-600 font-heading text-2xl font-bold text-white ring-2 ring-gold-400/70">
                        {name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-semibold text-emerald-950">
                          {name}
                        </h3>
                        <p className="flex items-center gap-1 text-sm font-medium text-emerald-700">
                          <BadgeCheck className="h-4 w-4 text-gold-500" />
                          Verified
                        </p>
                      </div>
                    </div>

                    <span className="mt-5 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                      {s.specialty}
                    </span>

                    <ul className="mt-4 space-y-2 text-sm text-gray-600">
                      {s.qualification && (
                        <li className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 shrink-0 text-emerald-700" />
                          <span className="truncate">{s.qualification}</span>
                        </li>
                      )}
                      {s.experience_years != null && (
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4 shrink-0 text-emerald-700" />
                          {s.experience_years} years experience
                        </li>
                      )}
                    </ul>

                    {s.bio && (
                      <p className="mt-4 line-clamp-3 leading-relaxed text-gray-600">
                        {s.bio}
                      </p>
                    )}

                    <span className="mt-6 flex items-center gap-2 font-semibold text-emerald-700 transition-colors group-hover:text-emerald-900">
                      View profile
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        )}

        <Reveal className="mt-14 text-center">
          <Link
            href="/scholars"
            className="inline-block rounded-full bg-linear-to-r from-emerald-700 to-teal-600 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Browse all scholars
          </Link>
        </Reveal>
      </div>
    </section>
  );
}