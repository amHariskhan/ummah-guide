import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-emerald-50">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800">
          Verified Scholars • Authentic Guidance
        </span>

        <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
          Get Islamic guidance from <span className="text-emerald-700">real scholars</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          Stop relying on AI tools and random search results. Ask your daily-life
          questions directly to qualified, verified Ulama and receive trusted answers.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/scholars"
            className="rounded-full bg-emerald-700 px-8 py-3 font-semibold text-white hover:bg-emerald-800"
          >
            Find a Scholar
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-emerald-700 px-8 py-3 font-semibold text-emerald-700 hover:bg-emerald-100"
          >
            Ask a Question
          </Link>
        </div>
      </div>
    </section>
  );
}