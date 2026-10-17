"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  Users,
  Globe,
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

  // "/admin" must match exactly; others also match their sub-pages
  function isActive(href: string) {
    if (href === "/admin" || href === "/") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b border-gray-100 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
          U
        </span>
        <span className="font-bold text-emerald-800">Ummah Guide</span>
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-amber-700">
          Admin
        </span>
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
      <div className="border-t border-gray-100 p-3">{userCard}</div>
    </aside>
  );
}