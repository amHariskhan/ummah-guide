"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  MailCheck,
  Lock,
  Eye,
  EyeOff,
  UserRound,
  GraduationCap,
} from "lucide-react";
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
  const [emailSent, setEmailSent] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient(); // created only when the button is clicked
    setError("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role },
         emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // With "Confirm email" ON, Supabase hides duplicate emails by returning
    // a fake user with an empty identities list (and no error).
    if (data.user && data.user.identities?.length === 0) {
      setError("This email is already registered. Please log in instead.");
      return;
    }

    // No session = email confirmation is required
    if (!data.session) {
      setEmailSent(true);
      return;
    }

    // Session exists = confirmation is OFF, go straight in
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
      title={emailSent ? "Check your email" : "Create your account"}
      subtitle={
        emailSent
          ? "One last step to activate your account"
          : "Join Ummah Guide to ask verified scholars"
      }
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-emerald-700 hover:text-emerald-900">
            Login
          </Link>
        </>
      }
    >
      {emailSent ? (
        <div className="mt-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-2 ring-gold-400/60">
            <MailCheck className="h-8 w-8" />
          </div>
          <p className="mt-5 text-gray-700">
            We sent a confirmation link to{" "}
            <span className="font-semibold text-gray-900">{email}</span>.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Click the link in that email to activate your account. If you don&apos;t see
            it, check your Spam folder.
          </p>
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
          >
            Use a different email
          </button>
        </div>
      ) : (
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
      )}
    </AuthShell>
  );
}