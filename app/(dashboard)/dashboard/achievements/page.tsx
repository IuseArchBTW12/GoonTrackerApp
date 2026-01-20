"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Lock, Loader2, TrendingUp } from "lucide-react";

export default function AchievementsPage() {
  const { user } = useUser();

  const currentUser = useQuery(api.functions.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const achievements = useQuery(api.achievements.getUserAchievements,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  const progress = useQuery(api.achievements.getAchievementProgress,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (!currentUser || !achievements || !progress) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-electric-purple" />
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercentage = Math.round((unlockedCount / totalCount) * 100);

  const categories = {
    milestone: "Session Milestones",
    duration: "Time Achievements",
    streak: "Streak Achievements",
    intensity: "Intensity Achievements",
    special: "Special Achievements",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gradient mb-2">
          Achievements 🏆
        </h1>
        <p className="text-gray-400">
          Track your progress and unlock rewards
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unlocked</p>
                <p className="text-3xl font-black text-gradient">
                  {unlockedCount}/{totalCount}
                </p>
              </div>
              <Trophy className="w-10 h-10 text-electric-indigo" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Completion</p>
                <p className="text-3xl font-black text-gradient">
                  {completionPercentage}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-electric-purple" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-400">Total Sessions</p>
              <p className="text-3xl font-black">{progress.sessions}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-gray-400">Current Streak</p>
              <p className="text-3xl font-black">{progress.currentStreak} days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Overall Progress</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-electric-indigo to-electric-purple transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements by Category */}
      {Object.entries(categories).map(([category, title]) => {
        const categoryAchievements = achievements.filter((a) => a.category === category);
        
        return (
          <div key={category}>
            <h2 className="text-2xl font-black mb-4">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryAchievements.map((achievement) => (
                <Card
                  key={achievement.type}
                  className={`transition-all ${
                    achievement.unlocked
                      ? "border-2 border-electric-indigo/50 shadow-lg shadow-electric-indigo/20"
                      : "opacity-60 grayscale"
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-lg">{achievement.name}</h3>
                          {achievement.unlocked ? (
                            <Trophy className="w-5 h-5 text-electric-indigo" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-electric-indigo">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}

      {/* Progress Hints */}
      <Card className="border-2 border-electric-purple/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric-purple" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Total Sessions</p>
              <p className="text-xl font-bold">{progress.sessions}</p>
            </div>
            <div>
              <p className="text-gray-400">Total Hours</p>
              <p className="text-xl font-bold">{progress.totalHours}h</p>
            </div>
            <div>
              <p className="text-gray-400">Current Streak</p>
              <p className="text-xl font-bold">{progress.currentStreak} days</p>
            </div>
            <div>
              <p className="text-gray-400">Longest Streak</p>
              <p className="text-xl font-bold">{progress.longestStreak} days</p>
            </div>
            <div>
              <p className="text-gray-400">Max Intensity Sessions</p>
              <p className="text-xl font-bold">{progress.maxIntensitySessions}</p>
            </div>
            <div>
              <p className="text-gray-400">Weekend Sessions</p>
              <p className="text-xl font-bold">{progress.weekendSessions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
