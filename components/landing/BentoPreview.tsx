"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function BentoPreview() {
  const bentoRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    const cards = bentoRef.current?.querySelectorAll(".bento-card");

    if (cards) {
      gsap.fromTo(
        cards,
        {
          opacity: 0,
          y: 100,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: bentoRef.current,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }
  }, [isMounted]);

  return (
    <section ref={bentoRef} className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-4 text-gradient">
          Built for Peak Gooning Performance
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          A premium experience designed to track every goon session, monitor
          intensity levels, and push your performance to legendary status.
        </p>

        {/* Asymmetrical Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4 auto-rows-[200px]">
          {/* Large Feature Card - AI Coaching */}
          <div className="bento-card md:col-span-6 lg:col-span-7 lg:row-span-2 glass-panel rounded-3xl p-8 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-electric-indigo/20 rounded-full mb-4">
                  <span className="text-2xl">🤖</span>
                  <span className="text-sm font-semibold text-electric-indigo">
                    AI POWERED
                  </span>
                </div>
                <h3 className="text-4xl font-black mb-4">
                  Your Personal Goon Coach
                </h3>
                <p className="text-gray-400 text-lg">
                  AI-powered insights analyze your gooning patterns, intensity
                  levels, and session duration to provide personalized coaching.
                </p>
              </div>
              <div className="glass-panel p-4 rounded-2xl mt-4">
                <p className="text-sm text-electric-cyan font-mono">
                  "🔥 Incredible momentum! You're crushing it with consistent
                  sessions. Your 7-day streak is 3x above average—keep this energy!"
                </p>
              </div>
            </div>
          </div>

          {/* Leaderboard Card */}
          <div className="bento-card md:col-span-3 lg:col-span-5 lg:row-span-2 glass-panel rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black">Live Leaderboard</h3>
                <span className="text-2xl">🏆</span>
              </div>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Sarah K.", score: "287 hrs", trend: "+12" },
                  { rank: 2, name: "Mike R.", score: "264 hrs", trend: "+8" },
                  { rank: 3, name: "You", score: "251 hrs", trend: "+15", highlight: true },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      user.highlight
                        ? "glass-panel border-2 border-electric-indigo glow-indigo"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-600">
                        #{user.rank}
                      </span>
                      <span className="font-semibold">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-electric-cyan">
                        +{user.trend}
                      </span>
                      <span className="font-mono">{user.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bento-card md:col-span-3 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-cyan/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Weekly Goal</span>
                    <span className="text-sm font-bold">87%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-electric-indigo to-electric-purple rounded-full"
                      style={{ width: "87%" }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-black text-gradient">47</div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-gradient">8.2</div>
                    <div className="text-xs text-gray-500">Avg Intensity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Competition Card */}
          <div className="bento-card md:col-span-3 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-indigo/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-4">Active Challenge</h3>
              <div className="glass-panel p-4 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold">Team Battle Royale</span>
                  <span className="text-xs px-2 py-1 bg-electric-indigo/30 rounded-full">
                    3d left
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">
                  You vs 12 competitors
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥈</span>
                  <span className="text-sm font-semibold text-gray-400">
                    2nd Place
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Card */}
          <div className="bento-card md:col-span-6 lg:col-span-4 glass-panel rounded-3xl p-6 relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-electric-purple/30 to-electric-cyan/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-4">⚡</div>
              <h3 className="text-2xl font-black mb-2">Start Session</h3>
              <p className="text-sm text-gray-400">
                Track a new session in seconds
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
