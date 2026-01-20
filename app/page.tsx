"use client";

import Hero from "@/components/landing/Hero";
import BentoPreview from "@/components/landing/BentoPreview";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-obsidian">
      <Hero />
      <BentoPreview />
      <Features />
      <Pricing />
    </main>
  );
}
