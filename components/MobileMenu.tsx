"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";

type Props = {
  role: string;
  isLoggedIn: boolean;
  fullName: string;
  totalUnread: number;
  logoutButton: React.ReactNode;
};

export default function MobileMenu({
  role,
  isLoggedIn,
  fullName,
  totalUnread,
  logoutButton,
}: Props) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  const linkClass =
    "block rounded-xl px-4 py-3 font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-800";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100 bg-white text-emerald-800 transition-colors hover:bg-emerald-50 md:hidden"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full border-b border-emerald-100 bg-white/95 px-4 pb-5 pt-3 shadow-xl backdrop-blur-lg md:hidden"
          >
            {isLoggedIn && (
              <p className="px-4 pb-3 text-sm text-gray-500">
                Assalamu Alaikum,{" "}
                <span className="font-semibold text-emerald-900">{fullName}</span>
              </p>
            )}

            <Link href="/scholars" onClick={close} className={linkClass}>
              Scholars
            </Link>
            <Link href="/#how-it-works" onClick={close} className={linkClass}>
              How It Works
            </Link>
            <Link href="/about" onClick={close} className={linkClass}>
              About
            </Link>

            {role === "admin" && (
              <Link href="/admin" onClick={close} className={linkClass}>
                Admin
              </Link>
            )}

            {role === "scholar" && (
              <Link href="/scholars/profile" onClick={close} className={linkClass}>
                My Profile
              </Link>
            )}

            {(role === "user" || role === "scholar") && (
              <Link
                href="/chats"
                onClick={close}
                className={`${linkClass} flex items-center justify-between`}
              >
                Messages
                {totalUnread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-emerald-950">
                    {totalUnread > 99 ? "99+" : totalUnread}
                  </span>
                )}
              </Link>
            )}

            <div className="mt-3 border-t border-emerald-100 pt-4">
              {isLoggedIn ? (
                <div className="px-4">{logoutButton}</div>
              ) : (
                <div className="flex gap-3 px-4">
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex-1 rounded-full border border-emerald-200 py-2.5 text-center font-medium text-emerald-800 hover:bg-emerald-50"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={close}
                    className="flex-1 rounded-full bg-emerald-700 py-2.5 text-center font-medium text-white hover:bg-emerald-800"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}