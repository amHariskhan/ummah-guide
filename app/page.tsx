export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-emerald-50 text-center px-6">
      <h1 className="text-5xl font-bold text-emerald-800">Ummah Guide</h1>
      <p className="mt-4 text-lg text-gray-600 max-w-xl">
        Ask your daily life questions directly to verified Islamic scholars.
      </p>
      <button className="mt-8 rounded-full bg-emerald-700 px-8 py-3 text-white font-semibold hover:bg-emerald-800">
        Find a Scholar
      </button>
    </main>
  );
}