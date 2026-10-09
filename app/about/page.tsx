import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import FeaturedScholars from "@/components/FeaturedScholars";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <HowItWorks />
      <FeaturedScholars />
    </main>
  );
}