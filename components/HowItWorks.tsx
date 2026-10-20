import { Search, MessageSquarePlus, MessagesSquare } from "lucide-react";
import Reveal from "./Reveal";

const steps = [
  {
    icon: Search,
    title: "Find a verified scholar",
    text: "Browse scholars whose credentials were checked by our admin team. Filter by specialty to find the right person.",
  },
  {
    icon: MessageSquarePlus,
    title: "Ask your question",
    text: "Write your daily-life question in your own words and send it directly to the scholar you trust.",
  },
  {
    icon: MessagesSquare,
    title: "Get a trusted answer",
    text: "Chat privately, one-to-one, and receive guidance from a real scholar, not an AI or a random website.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-linear-to-b from-white via-emerald-50/60 to-white py-24"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-0 h-64 w-150 -translate-x-1/2 rounded-full bg-emerald-200/40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-gold-500">
            How it works
          </span>
          <h2 className="font-heading mt-3 text-3xl font-bold text-emerald-950 md:text-5xl">
            Three simple steps to trusted guidance
          </h2>
          <p className="mt-4 text-gray-600">
            No searching through endless results. Just ask and receive an answer
            from someone qualified.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.15}>
              <div className="group relative h-full rounded-3xl border border-emerald-100 bg-white/80 p-8 shadow-sm backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-900/10">
                <span className="absolute right-6 top-4 font-heading text-6xl font-bold text-emerald-100 transition-colors group-hover:text-gold-300/60">
                  {i + 1}
                </span>

                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-700 to-teal-600 text-white shadow-lg shadow-emerald-700/30">
                  <step.icon className="h-7 w-7" />
                </div>

                <h3 className="relative mt-6 text-xl font-semibold text-emerald-950">
                  {step.title}
                </h3>
                <p className="relative mt-3 leading-relaxed text-gray-600">
                  {step.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}