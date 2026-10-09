import Link from "next/link";
import { scholars } from "@/lib/scholars";

export default function FeaturedScholars() {
  return (
    <section className="bg-emerald-50 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-center text-3xl font-bold text-gray-900 md:text-4xl">
          Featured Scholars
        </h2>
        <p className="mt-4 text-center text-gray-600">
          Every scholar is verified by our team before joining the platform.
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {scholars.slice(0, 3).map((scholar) => (
            <div
              key={scholar.name}
              className="rounded-2xl bg-white p-8 text-center shadow-sm transition hover:shadow-md"
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-700 text-2xl font-bold text-white">
                {scholar.initials}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-gray-900">{scholar.name}</h3>
              <span className="mt-2 inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
                ✓ Verified
              </span>
              <p className="mt-4 font-medium text-emerald-700">{scholar.specialty}</p>
              <p className="mt-1 text-sm text-gray-600">{scholar.qualification}</p>
              <p className="mt-1 text-sm text-gray-500">{scholar.experience} experience</p>
              <Link
                href="/scholars"
                className="mt-6 inline-block rounded-full border border-emerald-700 px-6 py-2 font-semibold text-emerald-700 hover:bg-emerald-50"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/scholars"
            className="font-semibold text-emerald-700 hover:text-emerald-900"
          >
            View all scholars →
          </Link>
        </div>
      </div>
    </section>
  );
}