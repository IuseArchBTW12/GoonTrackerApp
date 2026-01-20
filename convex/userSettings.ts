import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    username: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    await ctx.db.patch(userId, {
      ...updates,
      lastActive: Date.now(),
    });

    return { success: true };
  },
});

// Get user settings
export const getUserSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Get settings or return defaults
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    return settings || {
      userId: args.userId,
      notifications: {
        sessionReminders: true,
        streakAlerts: true,
        leaderboardUpdates: false,
        aiCoachInsights: true,
        achievementUnlocks: true,
      },
      privacy: {
        profileVisibility: true,
        showStatsPublicly: false,
        anonymousMode: false,
      },
    };
  },
});

// Update notification settings
export const updateNotificationSettings = mutation({
  args: {
    userId: v.id("users"),
    setting: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update the nested notification setting
      const updatedNotifications = {
        ...existing.notifications,
        [args.setting]: args.enabled,
      };
      
      await ctx.db.patch(existing._id, {
        notifications: updatedNotifications,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        notifications: {
          sessionReminders: true,
          streakAlerts: true,
          leaderboardUpdates: false,
          aiCoachInsights: true,
          achievementUnlocks: true,
          [args.setting]: args.enabled,
        },
        privacy: {
          profileVisibility: true,
          showStatsPublicly: false,
          anonymousMode: false,
        },
      });
    }

    return { success: true };
  },
});

// Update privacy settings
export const updatePrivacySettings = mutation({
  args: {
    userId: v.id("users"),
    setting: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (existing) {
      // Update the nested privacy setting
      const updatedPrivacy = {
        ...existing.privacy,
        [args.setting]: args.enabled,
      };
      
      await ctx.db.patch(existing._id, {
        privacy: updatedPrivacy,
      });
    } else {
      await ctx.db.insert("userSettings", {
        userId: args.userId,
        notifications: {
          sessionReminders: true,
          streakAlerts: true,
          leaderboardUpdates: false,
          aiCoachInsights: true,
          achievementUnlocks: true,
        },
        privacy: {
          profileVisibility: true,
          showStatsPublicly: false,
          anonymousMode: false,
          [args.setting]: args.enabled,
        },
      });
    }

    return { success: true };
  },
});

// Export user data
export const exportUserData = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    const insights = await ctx.db
      .query("aiInsights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const chatMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return {
      user,
      sessions,
      insights,
      chatMessages,
      exportedAt: Date.now(),
    };
  },
});

// Delete user account
export const deleteUserAccount = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Delete all sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const session of sessions) {
      await ctx.db.delete(session._id);
    }

    // Delete all AI insights
    const insights = await ctx.db
      .query("aiInsights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const insight of insights) {
      await ctx.db.delete(insight._id);
    }

    // Delete all chat messages
    const chatMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    for (const message of chatMessages) {
      await ctx.db.delete(message._id);
    }

    // Delete settings
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    // Delete user
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});
