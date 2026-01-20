import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI Coaching Action - sends user stats to LLM for personalized insights
export const generateAICoaching = action({
  args: {
    userId: v.id("users"),
    insightType: v.union(
      v.literal("daily_summary"),
      v.literal("weekly_review"),
      v.literal("performance_tip"),
      v.literal("milestone_celebration"),
      v.literal("streak_motivation")
    ),
  },
  handler: async (ctx, args): Promise<{ success: boolean; content?: string; insightId?: any; message?: string }> => {
    // Fetch recent sessions
    const sessions: any = await ctx.runQuery(api.functions.getUserSessions, {
      userId: args.userId,
      limit: 30,
    });

    const user: any = await ctx.runQuery(api.functions.getUserAnalytics, {
      userId: args.userId,
    });

    if (!user || !sessions.length) {
      return {
        success: false,
        message: "Start tracking sessions to get AI coaching insights!",
      };
    }

    // Calculate key metrics
    const totalDuration = sessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);
    const avgIntensity = sessions.reduce((sum: number, s: any) => sum + s.intensity, 0) / sessions.length;
    const recentSessions = sessions.slice(0, 7);
    const last7DaysDuration = recentSessions.reduce((sum: number, s: any) => sum + (s.duration || 0), 0);

    // Prepare context for LLM
    const statsContext: any = {
      totalSessions: sessions.length,
      totalDuration: Math.floor(totalDuration / 60), // convert to minutes
      avgIntensity: avgIntensity.toFixed(1),
      last7Days: recentSessions.length,
      last7DaysDuration: Math.floor(last7DaysDuration / 60),
      weeklyGoalProgress: user.goals.weeklyGoal.progress,
      currentStreak: user.goals.streak.current,
    };

    // System prompt based on insight type
    const systemPrompts = {
      daily_summary: "You are a high-energy performance coach for a fitness tracking app called GoonTracker. Provide a motivating daily summary in 2-3 sentences about the user's training sessions. Be enthusiastic but concise.",
      weekly_review: "You are a performance analyst for GoonTracker. Provide actionable insights about the user's weekly training performance. Include specific metrics and one concrete suggestion for improving their workout routine. Keep it under 100 words.",
      performance_tip: "You are an optimization expert for GoonTracker. Give one specific, tactical tip to improve training performance based on recent session patterns. Be direct and under 50 words.",
      milestone_celebration: "You are a hype coach for GoonTracker. Celebrate the user's training achievement or milestone with energy and encouragement. Keep it under 40 words.",
      streak_motivation: "You are a streak guardian for GoonTracker. Motivate the user to maintain their daily training streak. Be direct, inspiring, and under 50 words.",
    };

    const userPrompt = `User Stats:
- Total Sessions: ${statsContext.totalSessions}
- Total Time: ${statsContext.totalDuration} minutes
- Avg Intensity: ${statsContext.avgIntensity}/10
- Last 7 Days: ${statsContext.last7Days} sessions, ${statsContext.last7DaysDuration} minutes
- Weekly Goal Progress: ${statsContext.weeklyGoalProgress}%
- Current Streak: ${statsContext.currentStreak} days

Generate an ${args.insightType.replace('_', ' ')}.`;

    // Call Anthropic API
    const aiResponse = await generateClaudeResponse(
      systemPrompts[args.insightType],
      userPrompt
    );

    // Store the insight
    const insightId: any = await ctx.runMutation(api.aiActions.saveInsight, {
      userId: args.userId,
      insightType: args.insightType,
      content: aiResponse,
      data: statsContext,
    });

    return {
      success: true,
      content: aiResponse,
      insightId,
    };
  },
});

// Helper function to call Claude API
async function generateClaudeResponse(systemPrompt: string, userPrompt: string): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      temperature: 0.8,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const textContent = message.content.find((c) => c.type === "text");
    return textContent && textContent.type === "text" ? textContent.text : "Keep up the great work!";
  } catch (error) {
    console.error("Claude API error:", error);
    return "Keep pushing! Your dedication is impressive. 💪";
  }
}

// Save AI insight to database
export const saveInsight = mutation({
  args: {
    userId: v.id("users"),
    insightType: v.union(
      v.literal("daily_summary"),
      v.literal("weekly_review"),
      v.literal("performance_tip"),
      v.literal("milestone_celebration"),
      v.literal("streak_motivation")
    ),
    content: v.string(),
    data: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const insightId = await ctx.db.insert("aiInsights", {
      userId: args.userId,
      generatedAt: Date.now(),
      insightType: args.insightType,
      content: args.content,
      data: args.data,
      read: false,
    });
    
    return insightId;
  },
});

// Get recent AI insights for user
export const getRecentInsights = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    
    const insights = await ctx.db
      .query("aiInsights")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return insights;
  },
});
