"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "scholar">("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

    // When the user leaves this page, reset it so it's fresh next time
  useEffect(() => {
    return () => {
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("user");
      setError("");
      setSuccess(false);
    };
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the page from reloading
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-emerald-50 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">
        {success ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Account created!</h1>
            <p className="mt-4 text-gray-600">
              Assalam o Alaikum, {fullName}. Welcome to Ummah Guide.
            </p>
            {role === "scholar" && (
              <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                Your scholar profile is pending review. It will appear publicly
                once our team verifies your credentials.
              </p>
            )}
            <Link
              href="/login"
              className="mt-6 inline-block rounded-full bg-emerald-700 px-8 py-3 font-semibold text-white hover:bg-emerald-800"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-center text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="mt-2 text-center text-gray-600">Join Ummah Guide today</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Role selection */}
              <div>
                <label className="text-sm font-medium text-gray-700">I am joining as</label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("user")}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      role === "user"
                        ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    A User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("scholar")}
                    className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
                      role === "scholar"
                        ? "border-emerald-700 bg-emerald-50 text-emerald-800"
                        : "border-gray-200 text-gray-600 hover:border-emerald-300"
                    }`}
                  >
                    A Scholar
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-emerald-700 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
                Login
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}