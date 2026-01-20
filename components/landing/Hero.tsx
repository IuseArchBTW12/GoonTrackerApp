"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const ctx = gsap.context(() => {
      // Kinetic Typography - Main Headline
      const headline = headlineRef.current;
      if (headline) {
        // Split text into words for animation
        const words = headline.textContent?.split(" ") || [];
        headline.innerHTML = words
          .map((word) => `<span class="inline-block">${word}</span>`)
          .join(" ");

        const wordElements = headline.querySelectorAll("span");

        // Entrance animation
        gsap.fromTo(
          wordElements,
          {
            y: 100,
            opacity: 0,
            rotationX: -90,
          },
          {
            y: 0,
            opacity: 1,
            rotationX: 0,
            duration: 1.2,
            stagger: 0.1,
            ease: "power4.out",
          }
        );

        // Mouse move parallax effect
        const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;

          const xPos = (clientX / innerWidth - 0.5) * 20;
          const yPos = (clientY / innerHeight - 0.5) * 20;

          gsap.to(wordElements, {
            x: xPos,
            y: yPos,
            duration: 0.5,
            stagger: 0.02,
            ease: "power2.out",
          });
        };

        window.addEventListener("mousemove", handleMouseMove);

        return () => window.removeEventListener("mousemove", handleMouseMove);
      }
    }, heroRef);

    return () => ctx.revert();
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    
    // Subheadline animation
    gsap.fromTo(
      subheadlineRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.8,
        ease: "power3.out",
      }
    );

    // CTA animation
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, scale: 0.8 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        delay: 1.2,
        ease: "back.out(1.7)",
      }
    );
  }, [isMounted]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-electric-indigo/10 via-obsidian to-obsidian" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/logo.png" 
            alt="GoonTracker Logo" 
            className="h-24 md:h-32 w-auto object-contain"
          />
        </div>

        {/* Main Headline with Kinetic Typography */}
        <h1
          ref={headlineRef}
          className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-tight"
          style={{
            perspective: "1000px",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="text-gradient">Goon. Track. Dominate.</span>
        </h1>

        {/* Subheadline */}
        <p
          ref={subheadlineRef}
          className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto"
        >
          The premier gooning performance tracker. Monitor your sessions,
          compete on leaderboards, and get AI coaching to maximize your
          intensity and reach legendary status.
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/sign-up">
            <button className="group relative px-8 py-4 bg-electric-indigo hover:bg-electric-indigo/90 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-electric-indigo/50 w-full sm:w-auto">
              <span className="relative z-10">Start Gooning Free</span>
              <div className="absolute inset-0 bg-gradient-to-r from-electric-purple to-electric-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </a>

          <a href="/dashboard">
            <button className="px-8 py-4 glass-panel-hover rounded-2xl font-bold text-lg border border-white/20 hover:border-electric-indigo/50 transition-all duration-300 w-full sm:w-auto">
              View Dashboard
            </button>
          </a>
        </div>

        {/* Stats Preview */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { label: "Active Gooners", value: "50K+" },
            { label: "Goon Sessions", value: "2M+" },
            { label: "Avg Streak", value: "47 days" },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="glass-panel p-6 rounded-2xl hover:scale-105 transition-transform duration-300"
              style={{
                animation: `float 3s ease-in-out ${idx * 0.2}s infinite`,
              }}
            >
              <div className="text-3xl font-black text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-electric-indigo/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-electric-purple/20 rounded-full blur-3xl animate-pulse delay-1000" />
    </section>
  );
}
