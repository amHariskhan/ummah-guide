import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-emerald-900 text-emerald-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h3 className="text-xl font-bold text-white">Ummah Guide</h3>
          <p className="mt-3 text-sm leading-relaxed">
            Connecting the Ummah with verified Islamic scholars for authentic
            guidance in daily life.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-white">Quick Links</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/scholars" className="hover:text-white">Scholars</Link></li>
            <li><Link href="#how-it-works" className="hover:text-white">How It Works</Link></li>
            <li><Link href="/about" className="hover:text-white">About</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-white">Are you a scholar?</h4>
          <p className="mt-3 text-sm">Join our platform and help guide the Ummah.</p>
          <Link
            href="/signup"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Join as a Scholar
          </Link>
        </div>
      </div>

      <div className="border-t border-emerald-800 py-6 text-center text-sm">
        © 2026 Ummah Guide. All rights reserved.
      </div>
    </footer>
  );
}