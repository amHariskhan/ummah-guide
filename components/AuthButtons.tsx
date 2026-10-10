"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export default function AuthButtons() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // 1. Check who is logged in when the page loads
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    // 2. Update automatically when someone logs in or out
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // 3. Clean up when the component is removed
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  // While checking, keep the space empty so the navbar doesn't jump
  if (loading) {
    return <div className="h-10 w-36" />;
  }

  // Logged in: show name + Logout
  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-medium text-gray-700 sm:inline">
          {user.user_metadata.full_name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="rounded-full border border-emerald-700 px-5 py-2 font-semibold text-emerald-700 hover:bg-emerald-50"
        >
          Logout
        </button>
      </div>
    );
  }

  // Logged out: show Login + Sign Up
  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-gray-700 hover:text-emerald-700">
        Login
      </Link>
      <Link
        href="/signup"
        className="rounded-full bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800"
      >
        Sign Up
      </Link>
    </div>
  );
}