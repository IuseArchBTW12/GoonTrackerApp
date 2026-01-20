import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// Achievement definitions
export const ACHIEVEMENTS = {
  // First steps
  first_session: {
    name: "First Goon! 🎯",
    description: "Complete your first session",
    icon: "🎯",
    category: "milestone",
  },
  five_sessions: {
    name: "Getting Started 🔥",
    description: "Complete 5 sessions",
    icon: "🔥",
    category: "milestone",
  },
  ten_sessions: {
    name: "Dedicated Gooner 💪",
    description: "Complete 10 sessions",
    icon: "💪",
    category: "milestone",
  },
  fifty_sessions: {
    name: "Veteran Gooner 🏆",
    description: "Complete 50 sessions",
    icon: "🏆",
    category: "milestone",
  },
  hundred_sessions: {
    name: "Century Club 💯",
    description: "Complete 100 sessions",
    icon: "💯",
    category: "milestone",
  },
  
  // Time-based
  one_hour: {
    name: "Hour Hero ⏰",
    description: "Accumulate 1 hour total",
    icon: "⏰",
    category: "duration",
  },
  ten_hours: {
    name: "Endurance King 👑",
    description: "Accumulate 10 hours total",
    icon: "👑",
    category: "duration",
  },
  hundred_hours: {
    name: "Time Master ⚡",
    description: "Accumulate 100 hours total",
    icon: "⚡",
    category: "duration",
  },
  
  // Streaks
  three_day_streak: {
    name: "On Fire 🔥",
    description: "Maintain a 3-day streak",
    icon: "🔥",
    category: "streak",
  },
  seven_day_streak: {
    name: "Week Warrior 📅",
    description: "Maintain a 7-day streak",
    icon: "📅",
    category: "streak",
  },
  thirty_day_streak: {
    name: "Monthly Master 📆",
    description: "Maintain a 30-day streak",
    icon: "📆",
    category: "streak",
  },
  hundred_day_streak: {
    name: "Unstoppable Force 💥",
    description: "Maintain a 100-day streak",
    icon: "💥",
    category: "streak",
  },
  
  // Intensity
  max_intensity: {
    name: "Maximum Effort 🌟",
    description: "Complete a session at max intensity (10)",
    icon: "🌟",
    category: "intensity",
  },
  ten_max_sessions: {
    name: "Intensity Beast 💪",
    description: "Complete 10 sessions at max intensity",
    icon: "💪",
    category: "intensity",
  },
  
  // Special
  night_owl: {
    name: "Night Owl 🦉",
    description: "Complete a session between 12 AM - 5 AM",
    icon: "🦉",
    category: "special",
  },
  early_bird: {
    name: "Early Bird 🌅",
    description: "Complete a session between 5 AM - 7 AM",
    icon: "🌅",
    category: "special",
  },
  weekend_warrior: {
    name: "Weekend Warrior 🎮",
    description: "Complete 10 weekend sessions",
    icon: "🎮",
    category: "special",
  },
};

// Check and unlock achievements for a user
export const checkAndUnlockAchievements = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return { unlocked: [] };

    // Get all user sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("endTime"), undefined))
      .collect();

    // Get already unlocked achievements
    const unlockedAchievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const unlockedTypes = new Set(unlockedAchievements.map((a) => a.type));
    const newlyUnlocked: string[] = [];

    // Helper to unlock achievement
    const unlock = async (type: string, metadata?: any) => {
      if (!unlockedTypes.has(type)) {
        await ctx.db.insert("achievements", {
          userId: args.userId,
          type,
          unlockedAt: Date.now(),
          metadata,
        });
        newlyUnlocked.push(type);
        
        // Create notification
        const achievement = ACHIEVEMENTS[type as keyof typeof ACHIEVEMENTS];
        if (achievement) {
          await ctx.db.insert("notifications", {
            userId: args.userId,
            title: "Achievement Unlocked! 🎉",
            message: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
            type: "achievement",
            read: false,
            createdAt: Date.now(),
          });
        }
      }
    };

    // Session count achievements
    const sessionCount = sessions.length;
    if (sessionCount >= 1) await unlock("first_session");
    if (sessionCount >= 5) await unlock("five_sessions");
    if (sessionCount >= 10) await unlock("ten_sessions");
    if (sessionCount >= 50) await unlock("fifty_sessions");
    if (sessionCount >= 100) await unlock("hundred_sessions");

    // Time-based achievements
    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = totalSeconds / 3600;
    if (totalHours >= 1) await unlock("one_hour");
    if (totalHours >= 10) await unlock("ten_hours");
    if (totalHours >= 100) await unlock("hundred_hours");

    // Streak achievements
    if (user.currentStreak >= 3) await unlock("three_day_streak");
    if (user.currentStreak >= 7) await unlock("seven_day_streak");
    if (user.currentStreak >= 30) await unlock("thirty_day_streak");
    if (user.currentStreak >= 100) await unlock("hundred_day_streak");

    // Intensity achievements
    const maxIntensitySessions = sessions.filter((s) => s.intensity === 10);
    if (maxIntensitySessions.length >= 1) await unlock("max_intensity");
    if (maxIntensitySessions.length >= 10) await unlock("ten_max_sessions");

    // Special achievements
    for (const session of sessions) {
      const hour = new Date(session.startTime).getHours();
      
      if (hour >= 0 && hour < 5) {
        await unlock("night_owl", { sessionId: session._id });
      }
      
      if (hour >= 5 && hour < 7) {
        await unlock("early_bird", { sessionId: session._id });
      }
    }

    // Weekend warrior
    const weekendSessions = sessions.filter((s) => {
      const day = new Date(s.startTime).getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    });
    if (weekendSessions.length >= 10) await unlock("weekend_warrior");

    return { unlocked: newlyUnlocked };
  },
});

// Get user achievements
export const getUserAchievements = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const unlocked = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const unlockedTypes = new Set(unlocked.map((a) => a.type));

    // Return all achievements with unlock status
    return Object.entries(ACHIEVEMENTS).map(([type, details]) => ({
      type,
      ...details,
      unlocked: unlockedTypes.has(type),
      unlockedAt: unlocked.find((a) => a.type === type)?.unlockedAt,
    }));
  },
});

// Get achievement progress
export const getAchievementProgress = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("endTime"), undefined))
      .collect();

    const totalSeconds = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalHours = totalSeconds / 3600;
    const maxIntensitySessions = sessions.filter((s) => s.intensity === 10).length;
    const weekendSessions = sessions.filter((s) => {
      const day = new Date(s.startTime).getDay();
      return day === 0 || day === 6;
    }).length;

    return {
      sessions: sessions.length,
      totalHours: Math.floor(totalHours * 10) / 10,
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      maxIntensitySessions,
      weekendSessions,
    };
  },
});

// Get recent achievements (for notifications/feed)
export const getRecentAchievements = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return achievements.map((a) => ({
      ...a,
      details: ACHIEVEMENTS[a.type as keyof typeof ACHIEVEMENTS],
    }));
  },
});
