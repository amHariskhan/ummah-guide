import Link from "next/link";
import Form from "next/form";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SPECIALTIES = [
  "Fiqh (Islamic Jurisprudence)",
  "Hadith",
  "Tafsir (Quran Interpretation)",
  "Aqeedah (Beliefs)",
  "Family & Marriage",
  "Islamic Finance & Business",
  "General Guidance",
];

export default async function ScholarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; specialty?: string }>;
}) {
  await connection();

  // Read the search values from the URL (e.g. /scholars?q=faizan&specialty=Hadith)
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const specialty = params.specialty ?? "";

  const supabase = await createClient();

  // 1) Get APPROVED scholars (and filter by specialty if one is chosen)
  let query = supabase
    .from("scholar_profiles")
    .select("id, specialty, qualification, experience_years, bio")
    .eq("status", "approved");

  if (specialty) {
    query = query.eq("specialty", specialty);
  }

  const { data: scholars } = await query;

  // 2) Get their names
  const ids = scholars?.map((s) => s.id) ?? [];
  const nameMap: Record<string, string> = {};

  if (ids.length > 0) {
    const { data: names } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);

    names?.forEach((n) => {
      nameMap[n.id] = n.full_name;
    });
  }

  // 3) Apply the search text (name, specialty or bio)
  const search = q.toLowerCase();
  const results = (scholars ?? []).filter((s) => {
    if (!search) return true;
    const name = (nameMap[s.id] ?? "").toLowerCase();
    const spec = (s.specialty ?? "").toLowerCase();
    const bio = (s.bio ?? "").toLowerCase();
    return name.includes(search) || spec.includes(search) || bio.includes(search);
  });

  const isFiltering = q !== "" || specialty !== "";

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-emerald-800">Our Verified Scholars</h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            Every scholar here has been verified by our team. Browse their profiles and ask your
            questions with confidence.
          </p>
        </div>

        {/* Search + filter */}
        <Form
          action="/scholars"
          className="mt-10 bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row gap-3"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search by name, specialty or topic..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            name="specialty"
            defaultValue={specialty}
            className="rounded-lg border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All specialties</option>
            {SPECIALTIES.map((sp) => (
              <option key={sp} value={sp}>
                {sp}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-6 py-2 text-white font-semibold hover:bg-emerald-700"
          >
            Search
          </button>
          {isFiltering && (
            <Link
              href="/scholars"
              className="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 font-medium text-center hover:bg-gray-50"
            >
              Clear
            </Link>
          )}
        </Form>

        {/* Result count */}
        <p className="mt-6 text-sm text-gray-600">
          {results.length} {results.length === 1 ? "scholar" : "scholars"} found
        </p>

        {/* Empty states */}
        {results.length === 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow p-10 text-center text-gray-500">
            {isFiltering
              ? "No scholars match your search. Try different words or clear the filter."
              : "No verified scholars yet. Please check back soon."}
          </div>
        )}

        {/* Scholar cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {results.map((s) => {
            const name = nameMap[s.id] ?? "Scholar";
            return (
              <Link
                key={s.id}
                href={`/scholars/${s.id}`}
                className="block bg-white rounded-2xl shadow p-6 hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 shrink-0 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{name}</h2>
                    <p className="text-emerald-700 text-sm font-medium">{s.specialty}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-800">
                    ✓ Verified
                  </span>
                  <span className="rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-gray-700">
                    {s.experience_years} years experience
                  </span>
                </div>

                <p className="mt-4 text-sm text-gray-600 line-clamp-3">{s.bio}</p>

                <p className="mt-4 text-emerald-700 font-semibold text-sm">View profile →</p>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}