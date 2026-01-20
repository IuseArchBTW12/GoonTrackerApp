"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import { useState } from "react";
import { formatDurationToMinutes } from "@/lib/utils/format";

export default function LeaderboardPage() {
  const { user } = useUser();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("weekly");
  
  const currentUser = useQuery(
    api.functions.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const leaderboard = useQuery(api.functions.getLeaderboard, {
    period,
    limit: 20,
  });

  const userRank = useQuery(
    api.functions.getUserRank,
    currentUser ? { userId: currentUser._id, period } : "skip"
  );

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
    return <span className="text-gray-600 font-bold">#{rank}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gradient mb-2">
          Global Gooner Leaderboard 🏆
        </h1>
        <p className="text-gray-400">
          Compete with gooners worldwide. Track your ranking and climb to the top!
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {(["daily", "weekly", "monthly"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              period === p
                ? "bg-electric-indigo text-white"
                : "glass-panel-hover text-gray-400"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Leaderboard Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-electric-purple" />
            Top Performers - {period.charAt(0).toUpperCase() + period.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!leaderboard ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-indigo mx-auto mb-4" />
              <p className="text-gray-400">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-2xl mb-2">👻</p>
              <p>No activity this {period} yet!</p>
              <p className="text-sm mt-2">Be the first to start tracking sessions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const isCurrentUser = currentUser?.clerkId === entry.user?.clerkId;
                
                return (
                  <div
                    key={entry._id}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                      isCurrentUser
                        ? "glass-panel border-2 border-electric-indigo glow-indigo"
                        : "glass-panel hover:bg-white/10"
                    }`}
                  >
                    {/* Rank */}
                    <div className="w-12 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {entry.user?.imageUrl && (
                          <img
                            src={entry.user.imageUrl}
                            alt={entry.user.name || "User"}
                            className="w-10 h-10 rounded-full ring-2 ring-electric-indigo/50"
                          />
                        )}
                        <div>
                          <p className="font-bold">
                            {entry.user?.name || entry.user?.username || "Anonymous Gooner"}
                          </p>
                          {isCurrentUser && (
                            <span className="text-xs text-electric-indigo font-semibold">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-gradient">
                        {formatDurationToMinutes(entry.totalDuration)}
                      </div>
                      <div className="text-xs text-gray-500">total time</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-electric-purple">
                        {entry.sessionCount}
                      </div>
                      <div className="text-xs text-gray-500">sessions</div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-electric-cyan">
                        {entry.averageIntensity.toFixed(1)}
                      </div>
                      <div className="text-xs text-gray-500">avg intensity</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Your Ranking */}
      {userRank && userRank.sessionCount > 0 && (
        <Card className="border-2 border-electric-indigo/30">
          <CardHeader>
            <CardTitle>Your Performance This {period.charAt(0).toUpperCase() + period.slice(1)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-black text-gradient mb-1">#{userRank.rank}</div>
                <div className="text-xs text-gray-500">Your Rank</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-electric-cyan mb-1">
                  {formatDurationToMinutes(userRank.totalDuration)}
                </div>
                <div className="text-xs text-gray-500">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-electric-purple mb-1">
                  {userRank.sessionCount}
                </div>
                <div className="text-xs text-gray-500">Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-electric-indigo mb-1">
                  {userRank.averageIntensity.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">Avg Intensity</div>
              </div>
            </div>
            {userRank.gapToNextRank > 0 && userRank.rank > 1 && (
              <div className="mt-4 p-3 rounded-lg bg-electric-indigo/10 border border-electric-indigo/20">
                <p className="text-sm text-center">
                  🔥 <span className="font-bold">Keep pushing!</span> You're only{" "}
                  <span className="text-electric-indigo font-bold">
                    {formatDurationToMinutes(userRank.gapToNextRank)}
                  </span>{" "}
                  away from rank #{userRank.rank - 1}!
                </p>
              </div>
            )}
            {userRank.rank === 1 && (
              <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-sm text-center">
                  🏆 <span className="font-bold text-yellow-500">You're #1!</span> Incredible work!
                  Keep defending your crown!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
