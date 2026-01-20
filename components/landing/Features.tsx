"use client";

export default function Features() {
  const features = [
    {
      icon: "🎯",
      title: "Session Tracking",
      description: "Log every goon session with intensity ratings, duration tracking, and mood analysis for complete visibility.",
    },
    {
      icon: "🏆",
      title: "Gooner Leaderboards",
      description: "Compete with fellow gooners worldwide. Real-time rankings show who's putting in the most dedication.",
    },
    {
      icon: "🤖",
      title: "AI Goon Coach",
      description: "Get personalized insights on your gooning patterns, streak protection, and tactical tips to maximize intensity.",
    },
    {
      icon: "📊",
      title: "Performance Analytics",
      description: "Deep dive into your gooning patterns with daily, weekly, and monthly breakdowns of session data.",
    },
    {
      icon: "⚡",
      title: "Instant Sync",
      description: "Real-time updates across all devices with Convex's cutting-edge backend infrastructure.",
    },
    {
      icon: "🎨",
      title: "Premium Design",
      description: "Experience the 2026 aesthetic: kinetic typography, glassmorphic cards, and smooth GSAP animations.",
    },
  ];

  return (
    <section className="py-32 px-4 bg-gradient-to-b from-obsidian to-obsidian-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-black text-center mb-4 text-gradient">
          Everything You Need for Elite Gooning
        </h2>
        <p className="text-xl text-gray-400 text-center mb-16 max-w-2xl mx-auto">
          Track your goon sessions with military precision. Built with Next.js 15,
          Convex, Clerk, and GSAP for an unparalleled experience.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={feature.title}
              className="glass-panel-hover rounded-3xl p-8 group cursor-pointer"
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="glass-panel rounded-3xl p-12 max-w-4xl mx-auto border-2 border-electric-indigo/30 glow-indigo">
            <h3 className="text-4xl font-black mb-4 text-gradient">
              Ready to Track Your Goon Sessions?
            </h3>
            <p className="text-xl text-gray-400 mb-8">
              Join thousands of dedicated gooners tracking their way to legendary status.
            </p>
            <a href="/sign-up">
              <button className="px-12 py-5 bg-gradient-to-r from-electric-indigo via-electric-purple to-electric-cyan rounded-2xl font-black text-xl hover:scale-105 transition-transform duration-300 hover:shadow-2xl hover:shadow-electric-indigo/50">
                Start Tracking Free
              </button>
            </a>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day Pro trial
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
