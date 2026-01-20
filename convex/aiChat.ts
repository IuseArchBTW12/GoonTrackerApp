import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Send a chat message and get AI response
export const sendChatMessage = action({
  args: {
    userId: v.id("users"),
    message: v.string(),
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args): Promise<void> => {
    // Save user message
    await ctx.runMutation(api.aiChat.saveChatMessage, {
      userId: args.userId,
      sessionId: args.sessionId,
      role: "user",
      content: args.message,
    });

    // Get recent chat history for context
    const recentMessages: any = await ctx.runQuery(api.aiChat.getChatMessages, {
      userId: args.userId,
      limit: 10,
    });

    // Get user analytics for context
    const userAnalytics: any = await ctx.runQuery(api.functions.getUserAnalytics, {
      userId: args.userId,
    });

    // Get current session info if in-session
    let sessionContext = "";
    if (args.sessionId) {
      const session: any = await ctx.runQuery(api.functions.getUserSessions, {
        userId: args.userId,
        limit: 1,
      });
      if (session && session.length > 0) {
        sessionContext = `\nCurrent Session: Intensity ${session[0].intensity}/10, Started ${Math.floor((Date.now() - session[0].startTime) / 60000)} minutes ago.`;
      }
    }

    // Build conversation history for Claude
    const conversationHistory = recentMessages
      .slice()
      .reverse()
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      }));

    // Create system prompt with user context
    const systemPrompt = `You are an enthusiastic and supportive AI Training Coach helping users track and optimize their workout sessions. You're knowledgeable, motivating, and provide practical advice about fitness and training.

User Context:
- Total Sessions: ${userAnalytics?.goals?.totalSessions?.current || 0}
- Current Streak: ${userAnalytics?.goals?.streak?.current || 0} days
- Weekly Progress: ${userAnalytics?.summary?.thisWeekMinutes || 0} seconds this week
- Average Session Duration: ${userAnalytics?.summary?.avgDuration || 0} seconds
${sessionContext}

Guidelines:
- Be encouraging and positive about their training progress
- Provide specific, actionable advice for workouts
- Reference their stats when relevant
- Keep responses concise (2-4 sentences usually)
- If they're in a session, provide real-time training coaching
- Help them optimize performance and maintain daily streaks
- Focus on consistency, intensity, and progressive improvement`;

    try {
      // Call Claude API with conversation history
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        temperature: 0.7,
        system: systemPrompt,
        messages: conversationHistory,
      });

      const aiMessage = response.content.find((c) => c.type === "text");
      const aiResponse = aiMessage && aiMessage.type === "text" 
        ? aiMessage.text 
        : "I'm here to help! Keep up the great work! 💪";

      // Save AI response
      await ctx.runMutation(api.aiChat.saveChatMessage, {
        userId: args.userId,
        sessionId: args.sessionId,
        role: "assistant",
        content: aiResponse,
      });
    } catch (error) {
      console.error("Claude API error:", error);
      
      // Save fallback response
      await ctx.runMutation(api.aiChat.saveChatMessage, {
        userId: args.userId,
        sessionId: args.sessionId,
        role: "assistant",
        content: "I'm experiencing some technical difficulties, but I'm still here to support you! Keep pushing forward! 💪",
      });
    }
  },
});

// Save a chat message to the database
export const saveChatMessage = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.optional(v.id("sessions")),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chatMessages", {
      userId: args.userId,
      sessionId: args.sessionId,
      role: args.role,
      content: args.content,
      timestamp: Date.now(),
    });
    
    return messageId;
  },
});

// Get chat messages for a user
export const getChatMessages = query({
  args: {
    userId: v.id("users"),
    sessionId: v.optional(v.id("sessions")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    let query = ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc");
    
    // If sessionId provided, filter to that session only
    if (args.sessionId) {
      const allMessages = await query.take(200);
      return allMessages
        .filter((msg) => msg.sessionId === args.sessionId)
        .slice(0, limit);
    }
    
    return await query.take(limit);
  },
});

// Clear chat history for a user
export const clearChatHistory = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }
    
    return { deleted: messages.length };
  },
});
