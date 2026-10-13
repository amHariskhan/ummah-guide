"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// The shape of the data this form works with
type ScholarProfile = {
  specialty: string | null;
  qualification: string | null;
  experience_years: number | null;
  bio: string | null;
};

const SPECIALTIES = [
  "Fiqh (Islamic Jurisprudence)",
  "Hadith",
  "Tafsir (Quran Interpretation)",
  "Aqeedah (Beliefs)",
  "Family & Marriage",
  "Islamic Finance & Business",
  "General Guidance",
];

export default function ScholarProfileForm({
  userId,
  initialData,
}: {
  userId: string;
  initialData: ScholarProfile | null;
}) {
  const router = useRouter();

  // Start with saved values if they exist, otherwise empty
  const [specialty, setSpecialty] = useState(initialData?.specialty ?? "");
  const [qualification, setQualification] = useState(initialData?.qualification ?? "");
  const [experienceYears, setExperienceYears] = useState(
    initialData?.experience_years?.toString() ?? ""
  );
  const [bio, setBio] = useState(initialData?.bio ?? "");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    setError("");
    setMessage("");
    setLoading(true);

    // upsert = insert if new, update if it already exists
    const { error } = await supabase.from("scholar_profiles").upsert({
      id: userId,
      specialty,
      qualification,
      experience_years: Number(experienceYears),
      bio,
      status: "pending",
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Profile saved! It is now waiting for admin approval.");
    router.refresh(); // reload server data so the status box updates
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700">Specialty</label>
        <select
          required
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select your specialty</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Qualification</label>
        <input
          type="text"
          required
          placeholder="e.g. Dars-e-Nizami, Jamia Binoria / MA Islamic Studies"
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Years of experience</label>
        <input
          type="number"
          required
          min={0}
          max={80}
          value={experienceYears}
          onChange={(e) => setExperienceYears(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          required
          rows={5}
          placeholder="Tell users about your background, teaching, and the areas you can guide them in."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {message && <p className="text-emerald-700 text-sm font-medium">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save & Submit for Review"}
      </button>
    </form>
  );
}