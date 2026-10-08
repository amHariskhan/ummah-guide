import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-lg font-bold text-white">
            U
          </span>
          <span className="text-xl font-bold text-emerald-800">Ummah Guide</span>
        </Link>

        {/* Menu links (hidden on small phones) */}
        <div className="hidden gap-8 text-gray-600 md:flex">
          <Link href="/scholars" className="hover:text-emerald-700">Scholars</Link>
          <Link href="#how-it-works" className="hover:text-emerald-700">How It Works</Link>
          <Link href="/about" className="hover:text-emerald-700">About</Link>
        </div>

        {/* Login / Sign up */}
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-gray-700 hover:text-emerald-700">Login</Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-700 px-5 py-2 font-semibold text-white hover:bg-emerald-800"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </header>
  );
}