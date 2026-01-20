"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calendar, Target } from "lucide-react";
import { formatDurationToMinutes } from "@/lib/utils/format";

export default function AnalyticsPage() {
  const { user } = useUser();
  const currentUser = useQuery(
    api.functions.getCurrentUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  
  const analytics = useQuery(
    api.functions.getUserAnalytics,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  if (!currentUser || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-electric-indigo mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const { summary, weeklyData, distribution, goals } = analytics;
  const maxDuration = Math.max(...weeklyData.map((d) => d.duration), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-gradient mb-2">
          Performance Analytics 📊
        </h1>
        <p className="text-gray-400">
          Deep insights into your gooning patterns and progress trends.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-panel-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-gradient">
              {formatDurationToMinutes(summary.thisWeekMinutes)}
            </div>
            <div className={`text-xs flex items-center gap-1 mt-1 ${summary.weekChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className="w-3 h-3" />
              {summary.weekChange >= 0 ? '+' : ''}{summary.weekChange}% vs last week
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Avg Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-electric-cyan">
              {formatDurationToMinutes(summary.avgDuration)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.avgDuration > 60 ? 'Excellent!' : 'Keep pushing!'}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Peak Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-electric-purple">
              {summary.peakDay}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {formatDurationToMinutes(summary.peakDayMinutes)} logged
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-400">Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-electric-indigo">
              {summary.consistency}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {summary.activeDays}/7 days active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Overview Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-electric-indigo" />
            Weekly Session Duration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.filter(d => d.duration > 0).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No sessions recorded this week yet.</p>
              <p className="text-sm mt-2">Start tracking to see your weekly breakdown!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {weeklyData.map((day) => (
                <div key={day.day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold w-12">{day.day}</span>
                    <span className="text-gray-400">{formatDurationToMinutes(day.duration)}</span>
                  </div>
                  {day.duration > 0 && (
                    <div className="relative h-8 bg-white/5 rounded-lg overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-electric-indigo to-electric-purple rounded-lg transition-all duration-500"
                        style={{ width: `${(day.duration / maxDuration) * 100}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <span className="text-xs font-bold text-white/80">
                          {day.intensity > 0 ? `Intensity: ${day.intensity}/10` : 'No data'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-electric-cyan" />
              Session Time Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { range: "< 30 min", ...distribution.under30 },
                { range: "30-60 min", ...distribution.thirtyTo60 },
                { range: "60-90 min", ...distribution.sixtyTo90 },
                { range: "> 90 min", ...distribution.over90 },
              ].map((item) => (
                <div key={item.range} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{item.range}</span>
                    <span className="font-semibold">
                      {item.count} sessions ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-electric-cyan to-electric-indigo rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goals & Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-electric-purple" />
              Goals & Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  goal: "Weekly Goal: 500 minutes",
                  progress: goals.weeklyGoal.progress,
                  current: goals.weeklyGoal.current,
                  target: goals.weeklyGoal.target,
                },
                {
                  goal: "30-Day Streak",
                  progress: goals.streak.progress,
                  current: goals.streak.current,
                  target: goals.streak.target,
                },
                {
                  goal: "100 Total Sessions",
                  progress: goals.totalSessions.progress,
                  current: goals.totalSessions.current,
                  target: goals.totalSessions.target,
                },
              ].map((item) => (
                <div key={item.goal} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{item.goal}</span>
                    <span className="text-gray-400">
                      {item.current}/{item.target}
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-electric-purple to-electric-cyan rounded-full transition-all duration-500"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-2 border-electric-purple/30">
        <CardHeader>
          <CardTitle>🤖 AI Performance Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {summary.thisWeekMinutes === 0 ? (
            <div className="glass-panel p-4 rounded-xl">
              <p className="text-sm text-gray-400">
                Start tracking sessions to receive personalized AI insights about your performance patterns!
              </p>
            </div>
          ) : (
            <>
              {summary.peakDay !== "N/A" && (
                <div className="glass-panel p-4 rounded-xl">
                  <p className="text-sm">
                    📈 <span className="font-bold">Pattern Detected:</span> Your peak
                    performance occurs on {summary.peakDay}. Consider scheduling your most
                    intensive sessions for this day.
                  </p>
                </div>
              )}
              {summary.avgDuration > 0 && (
                <div className="glass-panel p-4 rounded-xl">
                  <p className="text-sm">
                    ⚡ <span className="font-bold">Optimization Tip:</span>{" "}
                    {summary.avgDuration < 45
                      ? "Your sessions are shorter than average. Try extending them to 60-75 minutes for optimal results."
                      : summary.avgDuration > 90
                      ? "You're putting in serious work! Make sure to take breaks to avoid burnout."
                      : `Your ${summary.avgDuration}-minute sessions are in the optimal range. Keep it up!`}
                  </p>
                </div>
              )}
              {goals.totalSessions.current > 0 && (
                <div className="glass-panel p-4 rounded-xl">
                  <p className="text-sm">
                    🎯 <span className="font-bold">Goal Prediction:</span> At your
                    current pace, you'll hit {goals.totalSessions.target} total sessions in{" "}
                    {Math.ceil((goals.totalSessions.target - goals.totalSessions.current) / (summary.thisWeekMinutes > 0 ? summary.activeDays : 1))}{" "}
                    weeks. Keep it up!
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
