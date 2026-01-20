# GoonTracker - Premium Performance Tracking SaaS

![2026 Premium Design](https://img.shields.io/badge/Design-2026%20Premium-6366f1)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%2015%20%7C%20Convex%20%7C%20Clerk-a855f7)

## 🚀 Overview

GoonTracker is a high-performance, competitive habit-tracking SaaS built with cutting-edge 2026 design aesthetics. Track your performance, compete with friends, and receive AI-powered coaching to reach elite status.

## 🎨 Design Philosophy

- **Obsidian Dark Mode**: Primary palette #030303 with Electric Indigo accents
- **Kinetic Typography**: GSAP-powered animations that react to user interaction
- **Glassmorphic Bento Grids**: Asymmetrical layouts with backdrop-blur-2xl
- **Micro-interactions**: Every interaction features smooth, physics-based animations

## 🛠 Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS** + **ShadCN/UI**
- **GSAP** (GreenSock) for advanced animations

### Backend & Real-time
- **Convex** - All database operations, queries, and file storage
- **Clerk** - OAuth-first authentication (Google, GitHub)

### Payments
- **Polar.sh** - Subscription management and billing

## 📁 Project Architecture

```
GoonTrackerApp/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── leaderboard/
│   │   ├── competitions/
│   │   └── settings/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── landing/
│   │   ├── Hero.tsx
│   │   ├── BentoPreview.tsx
│   │   └── Features.tsx
│   ├── dashboard/
│   │   ├── SessionTracker.tsx
│   │   ├── StatsCard.tsx
│   │   └── AICoachPanel.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── input.tsx
│   └── providers/
│       └── ConvexClientProvider.tsx
├── convex/
│   ├── schema.ts
│   ├── functions.ts
│   ├── aiActions.ts
│   └── _generated/
├── lib/
│   └── utils.ts
├── public/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

## 🗄 Convex Schema

### Core Tables

1. **users** - User profiles with Clerk integration
   - Tracks tier (free/pro/elite), streaks, and total sessions
   
2. **sessions** - Individual tracking sessions
   - Duration, intensity (1-10), tags, mood, notes
   
3. **stats** - Aggregated performance metrics
   - Daily/weekly/monthly/all-time statistics with rankings
   
4. **competitions** - Leaderboard challenges
   - Friends, global, or team competitions
   
5. **aiInsights** - AI-generated coaching
   - Daily summaries, performance tips, milestone celebrations

6. **friendships** - Social connections
7. **achievements** - Unlockable milestones
8. **notifications** - Real-time user alerts

## 🤖 AI Coaching Logic

### How It Works

1. **Data Collection**: Convex queries aggregate recent session data (duration, intensity, frequency, streaks)

2. **Context Building**: Stats are formatted into a structured prompt for the LLM

3. **AI Generation**: Convex Action sends data to your preferred LLM (OpenAI, Anthropic, etc.)

4. **Insight Types**:
   - `daily_summary` - Motivating end-of-day recap
   - `weekly_review` - Analytical performance breakdown
   - `performance_tip` - Tactical optimization advice
   - `milestone_celebration` - Achievement recognition
   - `streak_motivation` - Streak protection alerts

5. **Storage & Delivery**: Insights saved to `aiInsights` table and surfaced in dashboard

### Implementation Example

```typescript
// convex/aiActions.ts
export const generateAICoaching = action({
  args: { userId, insightType },
  handler: async (ctx, args) => {
    // 1. Fetch user stats
    const stats = await ctx.runQuery(api.functions.getUserStats, {...});
    
    // 2. Build LLM prompt
    const prompt = buildPrompt(stats, args.insightType);
    
    // 3. Call LLM API
    const insight = await callLLM(prompt);
    
    // 4. Save to database
    await ctx.runMutation(api.aiActions.saveInsight, {...});
    
    return insight;
  }
});
```

## 🎯 Key Features

### ✅ Completed
- [x] Project architecture & configuration
- [x] Convex schema with all tables
- [x] Hero component with kinetic typography
- [x] Asymmetrical bento grid preview
- [x] Features section
- [x] Core UI components (Button, Input, Card)
- [x] AI coaching action framework

### 🚧 Next Steps
- [ ] Clerk authentication integration
- [ ] Dashboard session tracker
- [ ] Real-time leaderboard component
- [ ] Competition creation flow
- [ ] Polar.sh payment integration
- [ ] LLM API integration (OpenAI/Anthropic)
- [ ] Mobile responsive optimizations

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment
NEXT_PUBLIC_CONVEX_URL=your-convex-url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-key
CLERK_SECRET_KEY=your-secret

# Polar.sh
POLAR_ACCESS_TOKEN=your-token
NEXT_PUBLIC_POLAR_ORGANIZATION_ID=your-org-id
```

### 3. Initialize Convex

```bash
npx convex dev
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎨 Design System

### Colors
- **Obsidian**: `#030303` (primary background)
- **Electric Indigo**: `#6366f1` (primary accent)
- **Electric Purple**: `#a855f7` (secondary accent)
- **Electric Cyan**: `#06b6d4` (tertiary accent)

### Typography
- **Font**: Inter (Google Fonts)
- **Headings**: Font weight 900 (Black)
- **Kinetic Effects**: GSAP mouse tracking and scroll triggers

### Components
- **Glass Panels**: `bg-white/5 backdrop-blur-2xl border border-white/10`
- **Buttons**: Rounded-2xl with hover scale and glow effects
- **Cards**: Rounded-3xl with gradient hover states

## 📄 License

MIT

## 🤝 Contributing

This is a premium SaaS template. For customization or enterprise inquiries, reach out!

---

Built with ⚡ by developers who believe in 2026 design excellence.
