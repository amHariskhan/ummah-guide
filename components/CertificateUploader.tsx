"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Certificate = {
  id: string;
  title: string;
  file_path: string;
  url: string | null;
};

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export default function CertificateUploader({
  userId,
  certificates,
}: {
  userId: string;
  certificates: Certificate[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError("");
    setMessage("");

    if (!file) {
      setError("Please choose a file.");
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only PDF, JPG, PNG or WEBP files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 5 MB.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `${userId}/${Date.now()}-${safeName}`;

    // 1) Upload the file to Storage
    const { error: uploadError } = await supabase.storage
      .from("certificates")
      .upload(filePath, file);

    if (uploadError) {
      setLoading(false);
      setError(uploadError.message);
      return;
    }

    // 2) Save a record of it in the database
    const { error: insertError } = await supabase.from("certificates").insert({
      scholar_id: userId,
      title,
      file_path: filePath,
    });

    if (insertError) {
      await supabase.storage.from("certificates").remove([filePath]);
      setLoading(false);
      setError(insertError.message);
      return;
    }

    setLoading(false);
    setTitle("");
    setFile(null);
    form.reset();
    setMessage("Certificate uploaded successfully!");
    router.refresh();
  }

  async function handleDelete(cert: Certificate) {
    if (!confirm(`Delete "${cert.title}"?`)) return;

    setDeletingId(cert.id);
    setError("");
    setMessage("");
    const supabase = createClient();

    await supabase.storage.from("certificates").remove([cert.file_path]);
    const { error } = await supabase.from("certificates").delete().eq("id", cert.id);

    setDeletingId(null);

    if (error) {
      setError(error.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Certificate title</label>
          <input
            type="text"
            required
            placeholder="e.g. Shahadat-ul-Aalamiyah, Ijazah in Hadith"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">File (PDF, JPG, PNG, WEBP – max 5 MB)</label>
          <input
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mt-1 w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-medium file:text-emerald-800 hover:file:bg-emerald-200"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {message && <p className="text-emerald-700 text-sm font-medium">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-3 text-white font-semibold hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Certificate"}
        </button>
      </form>

      <div className="mt-8">
        <h3 className="font-semibold text-gray-800">Your certificates ({certificates.length})</h3>

        {certificates.length === 0 ? (
          <p className="text-gray-500 text-sm mt-2">No certificates uploaded yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {certificates.map((cert) => (
              <li
                key={cert.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <span className="text-gray-800">📄 {cert.title}</span>
                <div className="flex items-center gap-4">
                  {cert.url && (
                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 font-medium hover:underline"
                    >
                      View
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(cert)}
                    disabled={deletingId === cert.id}
                    className="text-red-600 font-medium hover:underline disabled:opacity-50"
                  >
                    {deletingId === cert.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}