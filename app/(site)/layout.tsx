import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlockedBanner from "@/components/BlockedBanner";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense
        fallback={<div className="h-18.25 bg-white border-b border-emerald-100" />}
      >
        <Navbar />
      </Suspense>
      <Suspense fallback={null}>
        <BlockedBanner />
      </Suspense>
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}