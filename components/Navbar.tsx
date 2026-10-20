import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";

const navLink =
  "relative py-1 text-gray-700 transition-colors hover:text-emerald-800 after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-gold-400 after:transition-all after:duration-300 hover:after:w-full";

export default async function Navbar() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let fullName = "";
  let role = "";
  let totalUnread = 0;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    fullName = profile?.full_name ?? "";
    role = profile?.role ?? "";

    // Total unread messages (only users and scholars chat)
    if (role === "user" || role === "scholar") {
      const { data: unreadRows } = await supabase.rpc("my_unread_counts");
      totalUnread = (unreadRows ?? []).reduce(
        (sum: number, r: { unread: number }) => sum + r.unread,
        0
      );
    }
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-100/70 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-emerald-700 to-teal-600 font-heading text-lg font-bold text-white shadow-md shadow-emerald-700/30 ring-2 ring-gold-400/70 transition-transform group-hover:scale-105">
            U
          </span>
          <span className="font-heading text-xl font-bold text-emerald-950">
            Ummah Guide
          </span>
        </Link>

        {/* Middle links (desktop) */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/scholars" className={navLink}>Scholars</Link>
          <Link href="/#how-it-works" className={navLink}>How It Works</Link>
          <Link href="/about" className={navLink}>About</Link>

          {role === "admin" && (
            <Link href="/admin" className="font-semibold text-emerald-700 hover:text-emerald-900">
              Admin
            </Link>
          )}

          {role === "scholar" && (
            <Link href="/scholars/profile" className="font-semibold text-emerald-700 hover:text-emerald-900">
              My Profile
            </Link>
          )}

          {(role === "user" || role === "scholar") && (
            <Link
              href="/chats"
              className="flex items-center gap-2 font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Messages
              {totalUnread > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1.5 text-xs font-bold text-emerald-950">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="hidden text-gray-700 lg:block">
                  Assalamu Alaikum,{" "}
                  <span className="font-semibold text-emerald-900">{fullName}</span>
                </span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="font-medium text-gray-700 transition-colors hover:text-emerald-700">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="rounded-full bg-linear-to-r from-emerald-700 to-teal-600 px-5 py-2 font-medium text-white shadow-md shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-700/30"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu (shown only on small screens) */}
          <MobileMenu
            role={role}
            isLoggedIn={!!user}
            fullName={fullName}
            totalUnread={totalUnread}
            logoutButton={<LogoutButton />}
          />
        </div>
      </div>
    </nav>
  );
}