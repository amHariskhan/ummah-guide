import Form from "next/form";
import { connection } from "next/server";
import { Search, SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PageHeader from "@/components/PageHeader";
import ScholarCard from "@/components/ScholarCard";
import Reveal from "@/components/Reveal";

export default async function ScholarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string }>;
}) {
  await connection();

  const { q = "", specialty = "" } = await searchParams;

  const supabase = await createClient();

  const { data: scholars } = await supabase
    .from("scholar_profiles")
    .select("id, specialty, qualification, experience_years, bio")
    .eq("status", "approved")
    .not("specialty", "is", null);

  const all = scholars ?? [];
  const ids = all.map((s) => s.id);

  const { data: profiles } = ids.length
    ? await supabase.from("profiles").select("id, full_name").in("id", ids)
    : { data: [] };

  const names = new Map<string, string>();
  (profiles ?? []).forEach((p) => names.set(p.id, p.full_name));

  const specialties = [...new Set(all.map((s) => s.specialty as string))].sort();

  const term = q.trim().toLowerCase();

  const results = all.filter((s) => {
    if (specialty && s.specialty !== specialty) return false;
    if (!term) return true;
    const haystack = [
      names.get(s.id),
      s.specialty,
      s.qualification,
      s.bio,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  });

  return (
    <>
      <PageHeader
        title="Find a Verified Scholar"
        subtitle="Every scholar below has had their credentials reviewed by our admin team."
      >
        <Form
          action="/scholars"
          className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name, topic or qualification"
              className="w-full rounded-full bg-white py-3 pl-12 pr-4 text-gray-900 shadow-lg outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>

          <select
            name="specialty"
            defaultValue={specialty}
            className="rounded-full bg-white px-5 py-3 text-gray-900 shadow-lg outline-none focus:ring-2 focus:ring-gold-400"
          >
            <option value="">All specialties</option>
            {specialties.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="rounded-full bg-gold-400 px-8 py-3 font-semibold text-emerald-950 shadow-lg shadow-gold-400/30 transition hover:-translate-y-0.5 hover:bg-gold-300"
          >
            Search
          </button>
        </Form>
      </PageHeader>

      <section className="bg-linear-to-b from-emerald-50/60 to-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-8 text-sm text-gray-500">
            {results.length} {results.length === 1 ? "scholar" : "scholars"} found
          </p>

          {results.length === 0 ? (
            <div className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white p-10 text-center shadow-sm">
              <SearchX className="mx-auto h-12 w-12 text-emerald-700" />
              <h2 className="font-heading mt-4 text-2xl font-bold text-emerald-950">
                No scholars found
              </h2>
              <p className="mt-2 text-gray-600">
                Try a different name or topic, or clear the specialty filter.
              </p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((s, i) => (
                <Reveal key={s.id} delay={(i % 3) * 0.1}>
                  <ScholarCard
                    id={s.id}
                    name={names.get(s.id) ?? "Scholar"}
                    specialty={s.specialty}
                    qualification={s.qualification}
                    experienceYears={s.experience_years}
                    bio={s.bio}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}