import Link from "next/link";
import { BadgeCheck, ShieldCheck, MessageCircle } from "lucide-react";

const exploreLinks = [
  { href: "/scholars", label: "Find a Scholar" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/about", label: "About Us" },
];

const accountLinks = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign Up" },
  { href: "/chats", label: "My Messages" },
];

const linkClass =
  "text-emerald-50/70 transition-colors hover:text-gold-300";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-teal-900 text-emerald-50">
      {/* Gold line on top */}
      <div className="h-1 w-full bg-linear-to-r from-transparent via-gold-400 to-transparent" />

      {/* Glowing shape */}
      <div
        aria-hidden="true"
        className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-600 to-teal-500 font-heading text-lg font-bold text-white ring-2 ring-gold-400/70">
                U
              </span>
              <span className="font-heading text-2xl font-bold">
                Ummah Guide
              </span>
            </Link>
            <p className="mt-5 max-w-sm leading-relaxed text-emerald-50/70">
              A trusted platform where you can ask your daily-life Islamic
              questions directly to verified scholars, not AI or random
              search results.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-emerald-50/80">
              <li className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-gold-300" />
                Credentials checked by admin
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gold-300" />
                Private one-to-one chat
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-gold-300" />
                Real scholars, real answers
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-gold-300">
              Explore
            </h3>
            <ul className="mt-4 space-y-3">
              {exploreLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-gold-300">
              Account
            </h3>
            <ul className="mt-4 space-y-3">
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-emerald-50/60 sm:flex-row">
          <p>© 2026 Ummah Guide. All rights reserved.</p>
          <p>Built as a sadqa jariya 🤲</p>
        </div>
      </div>
    </footer>
  );
}