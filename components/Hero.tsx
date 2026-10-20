"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { ShieldCheck, MessageCircle, BadgeCheck } from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: "easeOut" },
  }),
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-800">
      {/* Islamic geometric pattern */}
      <svg
        className="absolute inset-0 h-full w-full text-white/8"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="islamic-pattern"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="20" y="20" width="40" height="40" />
              <rect
                x="20"
                y="20"
                width="40"
                height="40"
                transform="rotate(45 40 40)"
              />
              <circle cx="40" cy="40" r="8" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-pattern)" />
      </svg>

      {/* Glowing blurred shapes */}
      <motion.div
        aria-hidden="true"
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl"
        animate={{ y: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl"
        animate={{ y: [0, -30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-6 py-24 text-center md:py-32">
        <motion.span
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-emerald-50 backdrop-blur-md"
        >
          Verified Scholars • Authentic Guidance
        </motion.span>

        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="font-heading mt-6 text-4xl font-bold leading-tight text-white md:text-6xl"
        >
          Get Islamic guidance from{" "}
          <span className="bg-linear-to-r from-gold-300 to-gold-400 bg-clip-text text-transparent">
            real scholars
          </span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mx-auto mt-6 max-w-2xl text-lg text-emerald-50/80"
        >
          Stop relying on AI tools and random search results. Ask your
          daily-life questions directly to qualified, verified Ulama and
          receive trusted answers.
        </motion.p>

        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-col justify-center gap-4 sm:flex-row"
        >
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/scholars"
              className="block rounded-full bg-gold-400 px-8 py-3 font-semibold text-emerald-950 shadow-lg shadow-gold-400/30 transition-colors hover:bg-gold-300"
            >
              Find a Scholar
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/signup"
              className="block rounded-full border border-white/30 bg-white/10 px-8 py-3 font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              Ask a Question
            </Link>
          </motion.div>
        </motion.div>

        <motion.ul
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-14 flex flex-col items-center justify-center gap-4 text-sm text-emerald-50/80 sm:flex-row sm:gap-10"
        >
          <li className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-gold-300" />
            Credentials checked by admin
          </li>
          <li className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gold-300" />
            Private one-to-one chat
          </li>
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold-300" />
            Real scholars, not AI
          </li>
        </motion.ul>
      </div>
    </section>
  );
}