"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Eye, EyeOff, UserRound, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthShell from "@/components/AuthShell";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"user" | "scholar">("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient(); // created only when the button is clicked
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(role === "scholar" ? "/scholars/profile" : "/");
    router.refresh();
  }

  const roleClass = (active: boolean) =>
    `flex flex-col items-center gap-1 rounded-xl border px-4 py-3 font-medium transition ${
      active
        ? "border-emerald-600 bg-linear-to-br from-emerald-700 to-teal-600 text-white shadow-md shadow-emerald-700/25"
        : "border-gray-200 bg-white text-gray-700 hover:border-emerald-300 hover:bg-emerald-50"
    }`;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join Ummah Guide to ask verified scholars"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Full name</label>
          <div className="relative mt-1">
            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="relative mt-1">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-700" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            I am joining as
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={roleClass(role === "user")}
            >
              <UserRound className="h-5 w-5" />
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("scholar")}
              className={roleClass(role === "scholar")}
            >
              <GraduationCap className="h-5 w-5" />
              Scholar
            </button>
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-linear-to-r from-emerald-700 to-teal-600 py-3 font-semibold text-white shadow-lg shadow-emerald-700/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </AuthShell>
  );
}