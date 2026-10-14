import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

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
    <nav className="bg-white border-b border-emerald-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
            U
          </span>
          <span className="text-xl font-bold text-emerald-800">Ummah Guide</span>
        </Link>

        {/* Middle links */}
        <div className="hidden md:flex items-center gap-6 text-gray-700">
          <Link href="/scholars" className="hover:text-emerald-700">Scholars</Link>
          <Link href="/#how-it-works" className="hover:text-emerald-700">How It Works</Link>
          <Link href="/about" className="hover:text-emerald-700">About</Link>

          {role === "admin" && (
            <Link href="/admin" className="text-emerald-700 font-semibold">Admin</Link>
          )}

          {role === "scholar" && (
            <Link href="/scholars/profile" className="text-emerald-700 font-semibold">My Profile</Link>
          )}

          {(role === "user" || role === "scholar") && (
            <Link href="/chats" className="flex items-center gap-2 text-emerald-700 font-semibold">
              Messages
              {totalUnread > 0 && (
                <span className="min-w-5 h-5 px-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                  {totalUnread > 99 ? "99+" : totalUnread}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-gray-700">
                Assalamu Alaikum, <span className="font-semibold">{fullName}</span>
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-700 font-medium hover:text-emerald-700">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-emerald-600 px-4 py-2 text-white font-medium hover:bg-emerald-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}