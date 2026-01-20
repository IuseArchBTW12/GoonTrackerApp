"use client";

import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Unlimited session tracking",
        "Basic analytics dashboard",
        "Weekly AI insights",
        "Public leaderboard access",
        "Mobile responsive design",
        "Basic achievements",
      ],
      cta: "Start Free",
      href: "/sign-up",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "per month",
      description: "For serious gooners who want more",
      features: [
        "Everything in Free, plus:",
        "Unlimited AI coaching & chat",
        "Advanced analytics & insights",
        "Custom session tags & filters",
        "Priority support",
        "Early access to new features",
        "Private competitions",
        "Ad-free experience",
        "Export your data anytime",
      ],
      cta: "Upgrade to Pro",
      href: "/sign-up",
      popular: true,
    },
    {
      name: "Elite",
      price: "$19.99",
      period: "per month",
      description: "Maximum performance tracking",
      features: [
        "Everything in Pro, plus:",
        "1-on-1 AI coaching sessions",
        "Personalized training plans",
        "Advanced pattern detection",
        "Team & group features",
        "API access for integrations",
        "Custom branding options",
        "Dedicated account manager",
        "White-glove onboarding",
      ],
      cta: "Go Elite",
      href: "/sign-up",
      popular: false,
    },
  ];

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-electric-indigo/5 to-obsidian" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric-indigo/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-purple/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gradient mb-4">
            Choose Your Plan 💎
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Start free and upgrade anytime. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "glass-panel border-2 border-electric-indigo shadow-2xl shadow-electric-indigo/20"
                  : "glass-panel"
              }`}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
              }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-electric-indigo to-electric-purple px-6 py-2 rounded-full text-white font-bold text-sm">
                    ⭐ MOST POPULAR
                  </div>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-5xl font-black text-gradient">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-sm ml-2">
                    {plan.period}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-electric-indigo flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={plan.href}>
                <button
                  className={`w-full py-4 px-6 rounded-2xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-electric-indigo to-electric-purple hover:shadow-lg hover:shadow-electric-indigo/50"
                      : "glass-panel hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ / Additional Info */}
        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-4">
            All plans include a 14-day money-back guarantee
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap text-sm text-gray-500">
            <span className="flex items-center gap-2">
              ✓ No credit card required for free plan
            </span>
            <span className="flex items-center gap-2">
              ✓ Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              ✓ Secure payments via Stripe
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
