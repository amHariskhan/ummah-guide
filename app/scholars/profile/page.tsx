import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import ScholarProfileForm from "@/components/ScholarProfileForm";
import CertificateUploader from "@/components/CertificateUploader";

export default async function ScholarProfilePage() {
  await connection();

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → login
  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  // Not a scholar → home
  if (profile?.role !== "scholar") {
    redirect("/");
  }

  // Get their scholar profile (might not exist yet)
  const { data: scholarProfile } = await supabase
    .from("scholar_profiles")
    .select("specialty, qualification, experience_years, bio, status")
    .eq("id", user.id)
    .maybeSingle();

  const status = scholarProfile?.status;

  // Get this scholar's certificates
  const { data: certRows } = await supabase
    .from("certificates")
    .select("id, title, file_path")
    .eq("scholar_id", user.id)
    .order("created_at", { ascending: false });

  // Files are private, so we create temporary links (valid 1 hour) to view them
  let certificates: { id: string; title: string; file_path: string; url: string | null }[] = [];

  if (certRows && certRows.length > 0) {
    const { data: signed } = await supabase.storage
      .from("certificates")
      .createSignedUrls(
        certRows.map((c) => c.file_path),
        3600
      );

    certificates = certRows.map((c) => ({
      ...c,
      url: signed?.find((s) => s.path === c.file_path)?.signedUrl ?? null,
    }));
  }

  return (
    <main className="min-h-screen bg-emerald-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-800">My Scholar Profile</h1>
        <p className="text-gray-600 mt-2">
          Assalamu Alaikum, {profile.full_name}. Complete your profile so users can find you.
        </p>

        {/* Status box */}
        <div className="mt-6">
          {!scholarProfile && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800">
              You haven&apos;t submitted your profile yet. Fill in the form below.
            </div>
          )}
          {status === "pending" && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
              ⏳ Your profile is under review. The admin will verify your details soon.
            </div>
          )}
          {status === "approved" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-100 p-4 text-emerald-800">
              ✅ Your profile is verified and visible to users. Editing it will send it for review again.
            </div>
          )}
          {status === "rejected" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
              ❌ Your profile was not approved. Please update your details and submit again.
            </div>
          )}
        </div>

        {/* Profile form */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
          <ScholarProfileForm userId={user.id} initialData={scholarProfile} />
        </div>

        {/* Certificates */}
        <div className="mt-6 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-emerald-800">Certificates & Degrees</h2>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Upload proof of your qualifications. Only you and the admin can see these files.
          </p>
          <CertificateUploader userId={user.id} certificates={certificates} />
        </div>
      </div>
    </main>
  );
}