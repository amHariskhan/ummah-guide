import Link from "next/link";
import { BadgeCheck, ShieldCheck, MessageCircle, HeartHandshake } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/Reveal";

const values = [
  {
    icon: BadgeCheck,
    title: "Verified, not assumed",
    text: "Every scholar uploads their credentials, and our admin team reviews them before the scholar appears publicly.",
  },
  {
    icon: MessageCircle,
    title: "Private and personal",
    text: "Ask your question and chat one-to-one with the scholar you trust, like a normal messaging app.",
  },
  {
    icon: ShieldCheck,
    title: "A permanent record",
    text: "Messages cannot be edited or deleted, so every answer stays exactly as the scholar gave it.",
  },
  {
    icon: HeartHandshake,
    title: "Built as sadqa jariya",
    text: "Ummah Guide is built with the intention of benefiting the Ummah, insha'Allah.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="About Ummah Guide"
        subtitle="Authentic Islamic guidance for daily life, from real, verified scholars."
      />

      <section className="bg-linear-to-b from-white to-emerald-50/60 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-widest text-gold-500">
              Our Mission
            </span>
            <h2 className="font-heading mt-3 text-3xl font-bold text-emerald-950 md:text-4xl">
              Why we built this
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              Many people ask their everyday Islamic questions to AI tools or
              search engines. These are not a valid source of fatwa. Ummah Guide
              connects you directly with qualified scholars whose credentials
              have been checked, so the guidance you receive comes from a real
              person you can trust.
            </p>
          </Reveal>
        </div>

        <div className="mx-auto mt-16 grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="h-full rounded-3xl border border-emerald-100 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-gold-300 hover:shadow-xl hover:shadow-emerald-900/10">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-700 to-teal-600 text-white shadow-lg shadow-emerald-700/30">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-emerald-950">
                  {v.title}
                </h3>
                <p className="mt-2 leading-relaxed text-gray-600">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-16 text-center">
          <Link
            href="/scholars"
            className="inline-block rounded-full bg-linear-to-r from-emerald-700 to-teal-600 px-8 py-3 font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            Find a Scholar
          </Link>
        </Reveal>
      </section>
    </>
  );
}