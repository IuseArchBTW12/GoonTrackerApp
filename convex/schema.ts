import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table - enhanced with Clerk auth
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
    tier: v.union(v.literal("free"), v.literal("pro"), v.literal("elite")),
    createdAt: v.number(),
    lastActive: v.number(),
    totalSessions: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_tier", ["tier"]),

  // Activity/Session tracking
  sessions: defineTable({
    userId: v.id("users"),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    duration: v.optional(v.number()), // in seconds
    intensity: v.number(), // 1-10 scale
    tags: v.array(v.string()),
    notes: v.optional(v.string()),
    mood: v.optional(v.union(
      v.literal("energized"),
      v.literal("focused"),
      v.literal("relaxed"),
      v.literal("stressed")
    )),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_time", ["userId", "startTime"]),

  // User stats aggregation
  stats: defineTable({
    userId: v.id("users"),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly"), v.literal("all_time")),
    date: v.string(), // ISO date for the period
    totalDuration: v.number(),
    sessionCount: v.number(),
    averageIntensity: v.number(),
    peakIntensity: v.number(),
    rank: v.optional(v.number()),
    percentile: v.optional(v.number()),
  })
    .index("by_user_and_period", ["userId", "period", "date"])
    .index("by_period_and_date", ["period", "date"]),

  // Competitions/Leaderboards
  competitions: defineTable({
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("friends"), v.literal("global"), v.literal("team")),
    period: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    startDate: v.number(),
    endDate: v.number(),
    creatorId: v.id("users"),
    isActive: v.boolean(),
    prize: v.optional(v.string()),
    participants: v.array(v.id("users")),
  })
    .index("by_creator", ["creatorId"])
    .index("by_active", ["isActive"])
    .index("by_type", ["type"]),

  // Competition entries
  competitionEntries: defineTable({
    competitionId: v.id("competitions"),
    userId: v.id("users"),
    score: v.number(),
    rank: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_competition", ["competitionId", "score"])
    .index("by_user", ["userId"]),

  // AI Insights & Coaching
  aiInsights: defineTable({
    userId: v.id("users"),
    generatedAt: v.number(),
    insightType: v.union(
      v.literal("daily_summary"),
      v.literal("weekly_review"),
      v.literal("performance_tip"),
      v.literal("milestone_celebration"),
      v.literal("streak_motivation")
    ),
    content: v.string(),
    data: v.optional(v.any()), // Stats snapshot used for generation
    read: v.boolean(),
    actionable: v.optional(v.string()), // Suggested action
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"])
    .index("by_type", ["insightType"]),

  // Social connections
  friendships: defineTable({
    requesterId: v.id("users"),
    addresseeId: v.id("users"),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    createdAt: v.number(),
  })
    .index("by_requester", ["requesterId"])
    .index("by_addressee", ["addresseeId"])
    .index("by_status", ["status"]),

  // Achievements
  achievements: defineTable({
    userId: v.id("users"),
    type: v.string(), // e.g., "first_session", "7_day_streak", "100_hours", etc.
    unlockedAt: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["type"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("achievement"),
      v.literal("competition"),
      v.literal("friend_request"),
      v.literal("ai_insight"),
      v.literal("system")
    ),
    read: v.boolean(),
    createdAt: v.number(),
    link: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"]),

  // AI Chat Messages
  chatMessages: defineTable({
    userId: v.id("users"),
    sessionId: v.optional(v.id("sessions")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_user_and_time", ["userId", "timestamp"]),

  // User Settings
  userSettings: defineTable({
    userId: v.id("users"),
    notifications: v.object({
      sessionReminders: v.boolean(),
      streakAlerts: v.boolean(),
      leaderboardUpdates: v.boolean(),
      aiCoachInsights: v.boolean(),
      achievementUnlocks: v.boolean(),
    }),
    privacy: v.object({
      profileVisibility: v.boolean(),
      showStatsPublicly: v.boolean(),
      anonymousMode: v.boolean(),
    }),
  })
    .index("by_user", ["userId"]),
});
