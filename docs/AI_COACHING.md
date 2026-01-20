# AI Coaching Implementation Guide

## Overview

The AI coaching system uses Convex Actions to securely communicate with LLM APIs, generating personalized performance insights based on user activity patterns.

## Architecture

### 1. Data Flow

```
User Activity → Convex DB → Convex Action → LLM API → Insight Storage → Dashboard Display
```

### 2. Key Components

#### A. Stats Aggregation (`convex/functions.ts`)
- Queries recent sessions for a user
- Calculates metrics: total duration, avg intensity, streak data
- Provides context window (e.g., last 30 sessions)

#### B. AI Action (`convex/aiActions.ts`)
- Receives userId and insightType
- Builds context-rich prompts
- Calls external LLM API
- Stores results in `aiInsights` table

#### C. Insight Types

| Type | Purpose | Frequency | Example |
|------|---------|-----------|---------|
| `daily_summary` | End-of-day recap | Daily | "🔥 47 minutes today, 12% above your average!" |
| `weekly_review` | Performance analysis | Weekly | "Peak performance on Tuesdays. Try front-loading Monday sessions." |
| `performance_tip` | Tactical advice | On-demand | "Your intensity drops after 30 min. Try the Pomodoro technique." |
| `milestone_celebration` | Achievement recognition | Event-based | "🎉 100 sessions complete! You're in the top 5% of users." |
| `streak_motivation` | Streak protection | When at risk | "Don't break your 47-day streak! Quick 15-min session = win." |

### 3. LLM Integration

#### Option A: OpenAI

```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateLLMResponse(systemPrompt: string, userPrompt: string) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 150,
    temperature: 0.7,
  });
  
  return response.choices[0].message.content;
}
```

#### Option B: Anthropic Claude

```typescript
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateLLMResponse(systemPrompt: string, userPrompt: string) {
  const message = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 150,
    system: systemPrompt,
    messages: [
      { role: "user", content: userPrompt }
    ],
  });
  
  return message.content[0].text;
}
```

### 4. Prompt Engineering

#### System Prompts by Type

```typescript
const SYSTEM_PROMPTS = {
  daily_summary: `You are a high-energy performance coach. 
    Provide a motivating daily summary in 2-3 sentences. 
    Be enthusiastic but concise. Use emojis sparingly (max 1-2).
    Focus on specific achievements and momentum.`,
  
  weekly_review: `You are a data-driven performance analyst.
    Provide actionable insights about weekly performance.
    Include specific metrics and one concrete suggestion.
    Be direct and tactical. No fluff.`,
  
  performance_tip: `You are an optimization expert.
    Give ONE specific, tactical tip based on recent patterns.
    Be prescriptive. Suggest exact actions or techniques.
    Keep under 40 words.`,
  
  milestone_celebration: `You are a hype coach.
    Celebrate achievements with energy and encouragement.
    Keep under 50 words. Use 1-2 emojis.
    Make the user feel like a champion.`,
  
  streak_motivation: `You are a streak guardian.
    Motivate streak continuation with urgency and inspiration.
    Be direct. Remind them what they'll lose.
    Keep under 30 words.`,
};
```

#### User Prompt Template

```typescript
function buildUserPrompt(stats: UserStats, insightType: string) {
  return `
User Performance Data:
- Sessions This Period: ${stats.sessionCount}
- Total Duration: ${stats.totalDuration} minutes
- Average Intensity: ${stats.avgIntensity}/10
- Peak Intensity: ${stats.peakIntensity}/10
- Current Streak: ${stats.currentStreak} days
- Longest Streak: ${stats.longestStreak} days
- Tier: ${stats.tier.toUpperCase()}
- Rank: Top ${stats.percentile}%

Recent Trends:
- Last 7 days: ${stats.last7Days} sessions
- Compared to average: ${stats.comparisonToAverage}
- Most active time: ${stats.peakHour}

Generate a ${insightType.replace('_', ' ')}.
  `.trim();
}
```

### 5. Scheduling & Triggers

#### Daily Summary (8 PM every day)

```typescript
// convex/crons.ts
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "generate daily summaries",
  { hourUTC: 20, minuteUTC: 0 }, // 8 PM UTC
  internal.aiActions.generateDailySummaries
);

export default crons;
```

#### Streak Protection (when at risk)

```typescript
// Trigger when user hasn't logged in for 20 hours
export const checkStreakRisk = internalMutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const now = Date.now();
    const TWENTY_HOURS = 20 * 60 * 60 * 1000;
    
    for (const user of users) {
      if (user.currentStreak > 3 && now - user.lastActive > TWENTY_HOURS) {
        await ctx.scheduler.runAfter(0, internal.aiActions.generateAICoaching, {
          userId: user._id,
          insightType: "streak_motivation",
        });
      }
    }
  },
});
```

### 6. Cost Optimization

#### Caching Strategy

```typescript
// Check if recent insight exists before generating
export const getOrGenerateInsight = action({
  args: { userId: v.id("users"), insightType: v.string() },
  handler: async (ctx, args) => {
    // Check for recent insight (last 24 hours)
    const recentInsight = await ctx.runQuery(
      api.functions.getRecentInsight,
      { userId: args.userId, insightType: args.insightType, hours: 24 }
    );
    
    if (recentInsight) {
      return recentInsight;
    }
    
    // Generate new if none found
    return await generateAICoaching(ctx, args);
  },
});
```

#### Token Usage Limits

```typescript
const TOKEN_LIMITS = {
  daily_summary: 100,
  weekly_review: 200,
  performance_tip: 80,
  milestone_celebration: 60,
  streak_motivation: 50,
};

// Set max_tokens based on insight type
const response = await openai.chat.completions.create({
  model: "gpt-4-turbo-preview",
  messages: [...],
  max_tokens: TOKEN_LIMITS[insightType],
  temperature: 0.7,
});
```

### 7. Error Handling

```typescript
export const generateAICoaching = action({
  args: { userId: v.id("users"), insightType: v.string() },
  handler: async (ctx, args) => {
    try {
      // Fetch data
      const stats = await fetchUserStats(ctx, args.userId);
      
      if (!stats) {
        throw new Error("Insufficient data for insight generation");
      }
      
      // Generate insight
      const insight = await callLLM(stats, args.insightType);
      
      // Save to database
      await saveInsight(ctx, args.userId, insight);
      
      return insight;
      
    } catch (error) {
      console.error("AI coaching generation failed:", error);
      
      // Return fallback message
      return getFallbackMessage(args.insightType);
    }
  },
});

function getFallbackMessage(type: string): string {
  const fallbacks = {
    daily_summary: "Great work today! Keep building momentum.",
    weekly_review: "You're making progress. Stay consistent.",
    performance_tip: "Focus on consistency over intensity.",
    milestone_celebration: "You've hit a new milestone! 🎉",
    streak_motivation: "Keep your streak alive!",
  };
  
  return fallbacks[type] || "Keep going!";
}
```

### 8. Testing

```typescript
// Test with mock data
export const testAICoaching = action({
  args: {},
  handler: async (ctx) => {
    const mockStats = {
      sessionCount: 25,
      totalDuration: 1200,
      avgIntensity: 7.5,
      currentStreak: 12,
      longestStreak: 30,
      tier: "pro",
    };
    
    const insight = await generateLLMResponse(
      SYSTEM_PROMPTS.weekly_review,
      buildUserPrompt(mockStats, "weekly_review")
    );
    
    return insight;
  },
});
```

### 9. Dashboard Integration

```typescript
// components/dashboard/AICoachPanel.tsx
export function AICoachPanel({ userId }: { userId: string }) {
  const insights = useQuery(api.functions.getRecentInsights, { userId });
  const generateInsight = useMutation(api.aiActions.generateAICoaching);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>🤖 AI Coach</CardTitle>
      </CardHeader>
      <CardContent>
        {insights?.map(insight => (
          <div key={insight._id} className="glass-panel p-4 rounded-xl mb-4">
            <p>{insight.content}</p>
            <span className="text-xs text-gray-500">
              {new Date(insight.generatedAt).toLocaleString()}
            </span>
          </div>
        ))}
        
        <Button onClick={() => generateInsight({ 
          userId, 
          insightType: "performance_tip" 
        })}>
          Get Performance Tip
        </Button>
      </CardContent>
    </Card>
  );
}
```

## Next Steps

1. Choose your LLM provider (OpenAI or Anthropic)
2. Add API key to `.env.local`
3. Implement `generateLLMResponse` function
4. Test with mock data
5. Deploy and monitor token usage
6. Iterate on prompts based on user feedback
