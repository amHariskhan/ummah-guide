import { Suspense } from "react";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeaturedScholars from "@/components/FeaturedScholars";

function ScholarsSkeleton() {
  return (
    <section className="bg-linear-to-b from-white to-emerald-50/70 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto h-10 w-80 animate-pulse rounded-xl bg-emerald-100" />
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-3xl border border-emerald-100 bg-emerald-50"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Suspense fallback={<ScholarsSkeleton />}>
        <FeaturedScholars />
      </Suspense>
    </>
  );
}