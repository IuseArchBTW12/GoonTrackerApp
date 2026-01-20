import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Create or update user from Clerk webhook
export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        email: args.email,
        name: args.name,
        imageUrl: args.imageUrl,
        username: args.username,
        lastActive: Date.now(),
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      imageUrl: args.imageUrl,
      username: args.username,
      tier: "free",
      createdAt: Date.now(),
      lastActive: Date.now(),
      totalSessions: 0,
      currentStreak: 0,
      longestStreak: 0,
    });

    return userId;
  },
});

// Get current user
export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

// Start a new session
export const startSession = mutation({
  args: {
    userId: v.id("users"),
    intensity: v.number(),
    tags: v.array(v.string()),
    mood: v.optional(v.union(
      v.literal("energized"),
      v.literal("focused"),
      v.literal("relaxed"),
      v.literal("stressed")
    )),
  },
  handler: async (ctx, args) => {
    const sessionId = await ctx.db.insert("sessions", {
      userId: args.userId,
      startTime: Date.now(),
      intensity: args.intensity,
      tags: args.tags,
      mood: args.mood,
    });

    return sessionId;
  },
});

// End a session
export const endSession = mutation({
  args: {
    sessionId: v.id("sessions"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.endTime) return null;

    const endTime = Date.now();
    const duration = Math.floor((endTime - session.startTime) / 1000);

    await ctx.db.patch(args.sessionId, {
      endTime,
      duration,
      notes: args.notes,
    });

    // Update user stats
    const user = await ctx.db.get(session.userId);
    if (user) {
      await ctx.db.patch(session.userId, {
        totalSessions: user.totalSessions + 1,
        lastActive: endTime,
      });
      
      // Check for new achievements (async, don't wait)
      ctx.scheduler.runAfter(0, api.achievements.checkAndUnlockAchievements, {
        userId: session.userId,
      });
    }

    return { duration, endTime };
  },
});

// Get user sessions
export const getUserSessions = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

// Get leaderboard
export const getLeaderboard = query({
  args: {
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    
    // Calculate time range based on period
    const now = Date.now();
    let startTime: number;
    
    if (args.period === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
    } else if (args.period === "weekly") {
      startTime = now - 7 * 24 * 60 * 60 * 1000;
    } else {
      startTime = now - 30 * 24 * 60 * 60 * 1000;
    }

    // Get all users
    const allUsers = await ctx.db.query("users").collect();

    // Calculate stats for each user
    const userStats = await Promise.all(
      allUsers.map(async (user) => {
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => 
            q.and(
              q.gte(q.field("startTime"), startTime),
              q.neq(q.field("duration"), undefined)
            )
          )
          .collect();

        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const sessionCount = sessions.length;
        const avgIntensity = sessionCount > 0
          ? sessions.reduce((sum, s) => sum + (s.intensity || 5), 0) / sessionCount
          : 0;

        return {
          userId: user._id,
          user: {
            name: user.name,
            username: user.username,
            imageUrl: user.imageUrl,
            clerkId: user.clerkId,
          },
          totalDuration,
          sessionCount,
          averageIntensity: avgIntensity,
        };
      })
    );

    // Filter out users with no activity and sort by total duration
    const activeUsers = userStats
      .filter((stat) => stat.sessionCount > 0)
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, limit);

    // Add percentile ranking
    const totalActive = activeUsers.length;
    return activeUsers.map((stat, idx) => ({
      _id: stat.userId,
      ...stat,
      rank: idx + 1,
      percentile: totalActive > 0 ? Math.round(((idx + 1) / totalActive) * 100) : 0,
    }));
  },
});

// Get user's leaderboard rank
export const getUserRank = query({
  args: {
    userId: v.id("users"),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
  },
  handler: async (ctx, args) => {
    // Calculate time range based on period
    const now = Date.now();
    let startTime: number;
    
    if (args.period === "daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      startTime = today.getTime();
    } else if (args.period === "weekly") {
      startTime = now - 7 * 24 * 60 * 60 * 1000;
    } else {
      startTime = now - 30 * 24 * 60 * 60 * 1000;
    }

    // Get current user's sessions
    const userSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.gte(q.field("startTime"), startTime),
          q.neq(q.field("duration"), undefined)
        )
      )
      .collect();

    const userTotalDuration = userSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const userSessionCount = userSessions.length;
    const userAvgIntensity = userSessionCount > 0
      ? userSessions.reduce((sum, s) => sum + (s.intensity || 5), 0) / userSessionCount
      : 0;

    // Get all users and their stats to determine rank
    const allUsers = await ctx.db.query("users").collect();
    
    const allStats = await Promise.all(
      allUsers.map(async (user) => {
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .filter((q) => 
            q.and(
              q.gte(q.field("startTime"), startTime),
              q.neq(q.field("duration"), undefined)
            )
          )
          .collect();

        const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        return { userId: user._id, totalDuration };
      })
    );

    // Count how many users have more duration
    const usersAhead = allStats.filter((stat) => stat.totalDuration > userTotalDuration).length;
    const rank = usersAhead + 1;
    
    // Find gap to next rank
    const sortedStats = allStats
      .filter((stat) => stat.totalDuration > userTotalDuration)
      .sort((a, b) => a.totalDuration - b.totalDuration);
    
    const gapToNextRank = sortedStats.length > 0 
      ? sortedStats[0].totalDuration - userTotalDuration 
      : 0;

    return {
      rank,
      totalDuration: userTotalDuration,
      sessionCount: userSessionCount,
      averageIntensity: userAvgIntensity,
      gapToNextRank: Math.max(0, gapToNextRank),
      totalCompetitors: allStats.filter((s) => s.totalDuration > 0).length,
    };
  },
});

// Get user analytics
export const getUserAnalytics = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get all sessions
    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("duration"), undefined))
      .collect();

    // Get last 7 days of sessions
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentSessions = allSessions.filter(
      (s) => s.startTime >= sevenDaysAgo
    );

    // Get last 14 days (for comparison)
    const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
    const previousWeekSessions = allSessions.filter(
      (s) => s.startTime >= fourteenDaysAgo && s.startTime < sevenDaysAgo
    );

    // Calculate weekly totals
    const thisWeekMinutes = recentSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const lastWeekMinutes = previousWeekSessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );
    const weekChange =
      lastWeekMinutes > 0
        ? ((thisWeekMinutes - lastWeekMinutes) / lastWeekMinutes) * 100
        : 0;

    // Calculate average session duration
    const avgDuration =
      recentSessions.length > 0
        ? thisWeekMinutes / recentSessions.length
        : 0;

    // Find peak day
    const dayTotals: Record<string, number> = {};
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    recentSessions.forEach((session) => {
      const date = new Date(session.startTime);
      const dayName = days[date.getDay()];
      dayTotals[dayName] = (dayTotals[dayName] || 0) + (session.duration || 0);
    });

    const peakDay = Object.keys(dayTotals).length > 0
      ? Object.entries(dayTotals).sort((a, b) => b[1] - a[1])[0]
      : ["N/A", 0];

    // Calculate consistency (days with sessions in last 7 days)
    const uniqueDays = new Set(
      recentSessions.map((s) => new Date(s.startTime).toDateString())
    );
    const consistency = (uniqueDays.size / 7) * 100;

    // Weekly data by day
    const weeklyData = days.map((dayName) => {
      const dayNum = days.indexOf(dayName);
      const daySessions = recentSessions.filter(
        (s) => new Date(s.startTime).getDay() === dayNum
      );
      const duration = daySessions.reduce((sum, s) => sum + (s.duration || 0), 0);
      const avgIntensity =
        daySessions.length > 0
          ? daySessions.reduce((sum, s) => sum + (s.intensity || 5), 0) /
            daySessions.length
          : 0;

      return {
        day: dayName.slice(0, 3),
        duration,
        intensity: parseFloat(avgIntensity.toFixed(1)),
      };
    });

    // Session time distribution
    const distribution = {
      under30: allSessions.filter((s) => (s.duration || 0) < 30).length,
      thirtyTo60: allSessions.filter(
        (s) => (s.duration || 0) >= 30 && (s.duration || 0) < 60
      ).length,
      sixtyTo90: allSessions.filter(
        (s) => (s.duration || 0) >= 60 && (s.duration || 0) < 90
      ).length,
      over90: allSessions.filter((s) => (s.duration || 0) >= 90).length,
    };

    const totalDist = Object.values(distribution).reduce((a, b) => a + b, 0);

    return {
      summary: {
        thisWeekMinutes: Math.round(thisWeekMinutes),
        weekChange: Math.round(weekChange),
        avgDuration: Math.round(avgDuration),
        peakDay: peakDay[0],
        peakDayMinutes: Math.round(typeof peakDay[1] === 'number' ? peakDay[1] : 0),
        consistency: Math.round(consistency),
        activeDays: uniqueDays.size,
      },
      weeklyData,
      distribution: {
        under30: {
          count: distribution.under30,
          percentage: totalDist > 0 ? Math.round((distribution.under30 / totalDist) * 100) : 0,
        },
        thirtyTo60: {
          count: distribution.thirtyTo60,
          percentage: totalDist > 0 ? Math.round((distribution.thirtyTo60 / totalDist) * 100) : 0,
        },
        sixtyTo90: {
          count: distribution.sixtyTo90,
          percentage: totalDist > 0 ? Math.round((distribution.sixtyTo90 / totalDist) * 100) : 0,
        },
        over90: {
          count: distribution.over90,
          percentage: totalDist > 0 ? Math.round((distribution.over90 / totalDist) * 100) : 0,
        },
      },
      goals: {
        weeklyGoal: {
          target: 500,
          current: Math.round(thisWeekMinutes),
          progress: Math.min(Math.round((thisWeekMinutes / 500) * 100), 100),
        },
        streak: {
          target: 30,
          current: user.currentStreak || 0,
          progress: Math.min(Math.round(((user.currentStreak || 0) / 30) * 100), 100),
        },
        totalSessions: {
          target: 100,
          current: user.totalSessions || 0,
          progress: Math.min(Math.round(((user.totalSessions || 0) / 100) * 100), 100),
        },
      },
    };
  },
});
