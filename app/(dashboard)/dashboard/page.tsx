"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import SessionTracker from "@/components/dashboard/SessionTracker";
import StatsCard from "@/components/dashboard/StatsCard";
import AICoachPanel from "@/components/dashboard/AICoachPanel";
import RecentSessions from "@/components/dashboard/RecentSessions";
import AIChat from "@/components/dashboard/AIChat";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const currentUser = useQuery(
    api.functions.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const createUser = useMutation(api.functions.createUser);

  // Auto-create user if they don't exist in Convex yet
  useEffect(() => {
    if (isLoaded && user && currentUser === null && !isCreatingUser) {
      setIsCreatingUser(true);
      createUser({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name: user.fullName || undefined,
        imageUrl: user.imageUrl || undefined,
        username: user.username || undefined,
      })
        .then(() => {
          console.log("User created in Convex");
          setIsCreatingUser(false);
        })
        .catch((err) => {
          console.error("Failed to create user:", err);
          setError("Failed to create your account. Please try refreshing.");
          setIsCreatingUser(false);
        });
    }
  }, [isLoaded, user, currentUser, createUser, isCreatingUser]);

  // Handle errors
  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      console.error("Dashboard error:", event);
      setError("Something went wrong. Please refresh the page.");
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-panel p-8 rounded-2xl max-w-md">
          <p className="text-2xl mb-4">⚠️</p>
          <p className="text-red-500 font-semibold mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-electric-indigo rounded-xl hover:bg-electric-indigo/90 transition-all"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading while Clerk loads
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-indigo mx-auto mb-4" />
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    );
  }

  // Show loading while fetching user data or creating user
  if (currentUser === undefined || isCreatingUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-indigo mx-auto mb-4" />
          <p className="text-gray-400">
            {isCreatingUser ? "Setting up your account..." : "Loading your dashboard..."}
          </p>
        </div>
      </div>
    );
  }

  // This shouldn't happen anymore, but keep as fallback
  if (currentUser === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center glass-panel p-8 rounded-2xl max-w-md">
          <p className="text-4xl mb-4">👋</p>
          <h2 className="text-2xl font-black text-gradient mb-2">Welcome to GoonTracker!</h2>
          <p className="text-gray-400 mb-4">
            Setting up your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-black text-gradient mb-2">
          Welcome back, {user?.firstName || "Gooner"}! 🔥
        </h1>
        <p className="text-gray-400">
          Ready to crush another session? Let's make it legendary.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Current Streak"
          value={currentUser.currentStreak}
          subtitle="days"
          icon="🔥"
          trend={currentUser.currentStreak > currentUser.longestStreak / 2 ? "up" : "neutral"}
        />
        <StatsCard
          title="Total Sessions"
          value={currentUser.totalSessions}
          subtitle="all-time"
          icon="⚡"
          trend="up"
        />
        <StatsCard
          title="Longest Streak"
          value={currentUser.longestStreak}
          subtitle="days"
          icon="🏆"
          trend="neutral"
        />
        <StatsCard
          title="Tier"
          value={currentUser.tier.toUpperCase()}
          subtitle="membership"
          icon="👑"
          trend="neutral"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Tracker - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          <SessionTracker userId={currentUser._id} />
          <RecentSessions userId={currentUser._id} />
        </div>

        {/* AI Coach Panel - Takes 1 column */}
        <div>
          <AICoachPanel userId={currentUser._id} />
        </div>
      </div>

      {/* Floating Chat Button */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-electric-purple rounded-full shadow-lg hover:shadow-electric-purple/50 flex items-center justify-center transition-all hover:scale-110 z-40"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* AI Chat Modal */}
      {showChat && (
        <div className="fixed bottom-6 right-6 w-[400px] z-50">
          <AIChat 
            userId={currentUser._id}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  );
}
