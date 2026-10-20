"use client";

import { motion } from "motion/react";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-[calc(100vh-4.5rem)] items-center justify-center overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-800 px-4 py-16">
      <svg
        className="absolute inset-0 h-full w-full text-white/8"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="auth-pattern"
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
        <rect width="100%" height="100%" fill="url(#auth-pattern)" />
      </svg>

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

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-3xl border border-white/20 bg-white/95 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-emerald-700 to-teal-600 font-heading text-2xl font-bold text-white shadow-lg shadow-emerald-700/30 ring-2 ring-gold-400/70">
          U
        </div>
        <h1 className="mt-5 text-center font-heading text-3xl font-bold text-emerald-950">
          {title}
        </h1>
        <p className="mt-2 text-center text-gray-500">{subtitle}</p>

        {children}

        <p className="mt-6 text-center text-sm text-gray-600">{footer}</p>
      </motion.div>
    </main>
  );
}