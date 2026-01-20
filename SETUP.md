# GoonTracker Setup Guide

## ✅ What's Already Done

1. ✅ Dependencies installed
2. ✅ Convex initialized and deployed
3. ✅ Convex schema created (users, sessions, stats, competitions, AI insights)
4. ✅ Authentication pages created (sign-in, sign-up)
5. ✅ Middleware configured
6. ✅ Landing page with GSAP animations ready

## 🔧 Next Steps to Complete Setup

### 1. Set Up Clerk Authentication (5 minutes)

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your keys and update `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
   CLERK_SECRET_KEY=sk_test_xxxxx
   ```
4. In Clerk Dashboard, enable **Google** and **GitHub** OAuth providers

### 2. Test the Application

Start the development servers:

```bash
# Terminal 1 - Convex backend
npx convex dev

# Terminal 2 - Next.js frontend
npm run dev
```

Then visit:
- **Landing Page**: http://localhost:3000
- **Sign In**: http://localhost:3000/sign-in
- **Sign Up**: http://localhost:3000/sign-up

### 3. What You'll See

#### Landing Page Features:
- ✨ **Kinetic Typography** - Headline animates in and reacts to mouse movement
- 🎨 **Glassmorphic Bento Grid** - Asymmetrical card layouts with blur effects
- ⚡ **Micro-interactions** - Smooth GSAP animations on all elements
- 🌈 **Electric Indigo/Purple/Cyan** gradient accents

#### Authentication:
- Styled Clerk auth components matching 2026 dark obsidian theme
- OAuth ready for Google & GitHub

## 📊 Convex Dashboard

Your Convex deployment is live at:
**https://dashboard.convex.dev/d/beaming-marlin-311**

Here you can:
- View all database tables
- Monitor real-time queries
- Test functions directly
- Check logs

## 🎯 Key Features Ready to Build

### Immediate Next Steps:

1. **Dashboard Page** - Create session tracker interface
2. **Leaderboard** - Real-time competitive rankings
3. **AI Coaching** - Integrate OpenAI or Anthropic API
4. **Stats Analytics** - Charts and performance graphs

### File Structure Reference:

```
/app/(dashboard)/
  dashboard/page.tsx         # Main dashboard
  leaderboard/page.tsx       # Competitive leaderboard
  competitions/page.tsx      # Create/join challenges
  settings/page.tsx          # User preferences

/components/dashboard/
  SessionTracker.tsx         # Start/stop session tracking
  StatsCard.tsx             # Performance metrics display
  AICoachPanel.tsx          # AI insights display
  LeaderboardTable.tsx      # Rankings table
```

## 🚀 Development Workflow

### Adding New Features:

1. **Define Schema** (if needed) in `convex/schema.ts`
2. **Create Functions** in `convex/functions.ts` or new files
3. **Build Components** in `/components`
4. **Create Pages** in `/app`
5. **Use Convex Hooks**:
   ```tsx
   import { useQuery, useMutation } from "convex/react";
   import { api } from "@/convex/_generated/api";
   
   const data = useQuery(api.functions.myQuery, { args });
   const mutate = useMutation(api.functions.myMutation);
   ```

### Testing:

```bash
# Check TypeScript errors
npx convex dev --once

# Build for production
npm run build

# Preview production build
npm run start
```

## 🔐 Environment Variables Checklist

- [x] `CONVEX_DEPLOYMENT` - Auto-configured
- [x] `NEXT_PUBLIC_CONVEX_URL` - Auto-configured
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - **TODO: Add your key**
- [ ] `CLERK_SECRET_KEY` - **TODO: Add your key**
- [ ] `POLAR_ACCESS_TOKEN` - Optional (for payments later)

## 🎨 Design System Reference

### Colors (Tailwind):
- `bg-obsidian` - #030303
- `text-electric-indigo` - #6366f1
- `text-electric-purple` - #a855f7
- `text-electric-cyan` - #06b6d4

### Components:
- `glass-panel` - Glassmorphic card style
- `glass-panel-hover` - Interactive glass card
- `text-gradient` - Electric gradient text

### Animations (GSAP):
All included in Hero and BentoPreview components as examples.

## 📚 Documentation

- **Convex Docs**: https://docs.convex.dev
- **Clerk Docs**: https://clerk.com/docs
- **GSAP Docs**: https://gsap.com/docs
- **Next.js 15 Docs**: https://nextjs.org/docs

## 🐛 Troubleshooting

### "Clerk keys not found" error:
→ Update `.env.local` with your Clerk keys and restart dev server

### GSAP animations not working:
→ Check browser console for errors
→ Ensure `useEffect` hooks are running client-side

### Convex functions not updating:
→ `npx convex dev` must be running
→ Check Convex dashboard for errors

## ✨ You're All Set!

Your premium SaaS foundation is ready. Start by:
1. Adding your Clerk keys
2. Running the dev servers
3. Building your first dashboard feature

Happy coding! 🚀
