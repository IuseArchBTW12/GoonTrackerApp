"use client";

import { useUser } from "@clerk/nextjs";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Trophy, BarChart3, Settings, Award } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Activity },
    { name: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Achievements", href: "/dashboard/achievements", icon: Award },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-obsidian" suppressHydrationWarning>
      {/* Top Navigation Bar */}
      <nav className="glass-panel border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
          <div className="flex justify-between items-center h-16" suppressHydrationWarning>
            <div className="flex items-center gap-8">
              <Link href="/dashboard">
                <img 
                  src="/logo.png" 
                  alt="GoonTracker" 
                  className="h-10 w-auto object-contain"
                />
              </Link>
              <div className="hidden md:flex gap-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? "bg-electric-indigo/20 text-electric-indigo"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="font-semibold">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-4" suppressHydrationWarning>
              <div className="text-right hidden sm:block" suppressHydrationWarning>
                <p className="text-sm font-semibold text-white">{user?.firstName}</p>
                <p className="text-xs text-gray-500">Pro Member</p>
              </div>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 ring-2 ring-electric-indigo/50",
                  },
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
        {children}
      </main>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 pb-safe" suppressHydrationWarning>
        <div className="grid grid-cols-5 gap-1 p-2" suppressHydrationWarning>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-electric-indigo/20 text-electric-indigo"
                    : "text-gray-400"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
