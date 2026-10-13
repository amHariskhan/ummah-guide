import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
    await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → go to login
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Logged in but not admin → go home
  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <>
     
      <main className="min-h-screen bg-emerald-50 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-emerald-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome, {profile.full_name}. Here you will approve scholars and manage the platform.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-gray-800">Pending Scholars</h2>
              <p className="text-3xl font-bold text-emerald-700 mt-2">–</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-gray-800">Total Users</h2>
              <p className="text-3xl font-bold text-emerald-700 mt-2">–</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="font-semibold text-gray-800">Questions</h2>
              <p className="text-3xl font-bold text-emerald-700 mt-2">–</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}