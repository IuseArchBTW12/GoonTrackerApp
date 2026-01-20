# 🚀 Quick Start

Your GoonTracker app is **95% ready**! Here's what you need to do:

## ✅ Setup Complete
- ✅ All dependencies installed
- ✅ Convex database deployed
- ✅ Landing page with GSAP animations ready
- ✅ Authentication pages created
- ✅ Premium 2026 design system configured

## 🔑 Next: Add Clerk Keys (2 minutes)

### Step 1: Get Your Clerk Keys
1. Visit: **https://dashboard.clerk.com**
2. Click **"+ Create Application"**
3. Choose a name (e.g., "GoonTracker")
4. Select **Google** and **GitHub** as auth methods
5. Click **Create Application**

### Step 2: Copy Your Keys
After creation, you'll see your API keys. Copy them!

### Step 3: Update `.env.local`
Replace the placeholder keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY
CLERK_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY
```

### Step 4: Restart the Server
```bash
# Press Ctrl+C to stop current server
npm run dev
```

## 🌐 View Your App

Once Clerk keys are added, visit:
- **Landing Page**: http://localhost:3000
- **Sign In**: http://localhost:3000/sign-in
- **Sign Up**: http://localhost:3000/sign-up

## 🎯 What You'll See

### Landing Page Features:
- ✨ **Kinetic Typography** - Headline words float and react to mouse
- 🎨 **Glassmorphic Bento Grid** - Premium card layouts
- ⚡ **GSAP Animations** - Smooth scroll-triggered effects
- 🌈 **Electric Indigo Theme** - 2026 dark mode obsidian

### Authentication:
- Styled sign-in/sign-up pages
- OAuth ready (Google & GitHub)
- Protected routes with middleware

## 📊 Your Convex Database

Live at: **https://dashboard.convex.dev/d/beaming-marlin-311**

Tables created:
- `users` - User profiles & stats
- `sessions` - Activity tracking
- `stats` - Performance metrics
- `competitions` - Leaderboards
- `aiInsights` - AI coaching
- `friendships`, `achievements`, `notifications`

## 🛠 Development Commands

```bash
# Start dev server
npm run dev

# Start Convex backend (separate terminal)
npx convex dev

# Or use the combined script
./dev.sh

# Build for production
npm run build

# Check for errors
npx convex dev --once
```

## 🎨 Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Convex** - Real-time database
- **Clerk** - Authentication
- **Tailwind CSS** - Styling
- **ShadCN/UI** - Component library
- **GSAP** - Premium animations

## 📚 Key Files

```
/app/page.tsx              # Landing page
/app/layout.tsx            # Root layout with providers
/app/(auth)/sign-in        # Sign in page
/app/(auth)/sign-up        # Sign up page
/convex/schema.ts          # Database schema
/convex/functions.ts       # Backend functions
/convex/aiActions.ts       # AI coaching logic
/components/landing/       # Landing page components
/components/ui/            # Reusable UI components
/middleware.ts             # Auth & routing middleware
```

## 🐛 Troubleshooting

### "Publishable key not valid"
→ Update `.env.local` with real Clerk keys from dashboard.clerk.com

### GSAP animations not working
→ Check browser console. Animations run client-side only.

### Convex functions not found
→ Run `npx convex dev` in a separate terminal

## 🚀 Next Features to Build

1. **Dashboard** - Session tracker interface
2. **Leaderboard** - Real-time competitive rankings
3. **AI Coaching** - Integrate OpenAI/Anthropic
4. **Analytics** - Performance charts & graphs
5. **Competitions** - Challenge creation flow
6. **Payments** - Polar.sh integration

See `SETUP.md` for detailed documentation!

---

**Ready to build?** Add your Clerk keys and you're live! 🎉
