"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  Globe,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";

type NavLink = { href: string; label: string; icon: LucideIcon };

const sections: { title: string; links: NavLink[] }[] = [
  {
    title: "Overview",
    links: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Moderation",
    links: [
      { href: "/admin/chats", label: "Conversations", icon: MessagesSquare },
      { href: "/admin/users", label: "Users", icon: Users },
    ],
  },
  {
    title: "Website",
    links: [{ href: "/", label: "View website", icon: Globe }],
  },
];

export default function AdminSidebar({ userCard }: { userCard: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // "/admin" must match exactly; others also match their sub-pages
  function isActive(href: string) {
    if (href === "/admin" || href === "/") return pathname === href;
    return pathname.startsWith(href);
  }

  // Same content is used on desktop and in the mobile drawer
  function renderContent(onNavigate?: () => void) {
    return (
      <>
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-gray-100 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            U
          </span>
          <span className="font-bold text-emerald-800">Ummah Guide</span>
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
            Admin
          </span>
          {onNavigate && (
            <button
              type="button"
              onClick={onNavigate}
              aria-label="Close menu"
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.links.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        isActive(href)
                          ? "bg-emerald-50 font-medium text-emerald-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logged-in admin (passed in from the layout) */}
        <div className="shrink-0 border-t border-gray-100 p-3">{userCard}</div>
      </>
    );
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
        {renderContent()}
      </aside>

      {/* Mobile: floating menu button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed bottom-5 left-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-700 text-white shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-800 md:hidden"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Mobile: slide-in drawer */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="absolute left-0 top-0 flex h-full w-72 max-w-[85%] flex-col bg-white shadow-2xl"
            >
              {renderContent(() => setOpen(false))}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}