import Link from "next/link";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  await connection(); // build this per visitor, don't pre-build it

  const supabase = await createClient();

  // Who is logged in? (user is null if nobody)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If logged in, get their name and role from profiles
  let fullName = "";
  let role = "";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

    fullName = profile?.full_name ?? "";
    role = profile?.role ?? "";
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
        </div>

        {/* Right side: depends on login status */}
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