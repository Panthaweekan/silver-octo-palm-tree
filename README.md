# 🏋️ FitJourney - Complete Fitness & Health Tracking Platform

> **Track → Analyze → Motivate** - Your personalized fitness companion

## 📋 Overview

FitJourney is a comprehensive health and fitness tracking application that helps users monitor their exercise, nutrition, weight progress, and daily habits with AI-powered insights.

**🎯 Lightweight & Fast Development Stack** - Built with Supabase + Next.js for rapid development and easy deployment.

### Core Principles
- **Track** → Easy logging of workouts, meals, and metrics
- **Analyze** → Long-term progress visualization and trends
- **Motivate** → Build sustainable routines with smart recommendations

## 🎯 Key Features

### 💪 Workout Tracking
- Multiple exercise types (Cardio, Strength, HIIT, Yoga, etc.)
- Detailed logging (sets, reps, time, distance)
- AI-powered calorie estimation
- Weekly summaries and macro trends

### 🍎 Food & Calorie Tracking
- Meal logging (Breakfast/Lunch/Dinner/Snacks)
- Comprehensive food database
- AI image recognition for food scanning
- Automatic macronutrient calculation (kcal, protein, carbs, fat)
- Daily calorie budget tracking

### ⚖️ Weight & Body Metrics
- Daily weight tracking
- Body measurements (waist, hips, chest)
- Body fat percentage monitoring
- Trend analysis with weekly/monthly insights

### ✅ Habit & Routine System
- Custom habit tracking (water intake, steps, sleep)
- AI-powered habit recommendations
- Streak tracking and motivation

### 📝 Daily Journal + AI Insights
- Daily note-taking
- AI-generated summaries and trend analysis
- Personalized recommendations for improvement

### 📊 Analytics Dashboard
- Weekly performance trends
- Best workout day analysis
- Calorie surplus/deficit tracking
- Weight vs calorie correlation
- Habit streak visualization

## 🏗️ Project Structure (Monorepo)

```
fitjourney-monorepo/
├── apps/
│   ├── web/              # Next.js web application
│   ├── mobile/           # React Native mobile app
│   └── api/              # FastAPI backend service
├── packages/
│   ├── ui/               # Shared UI components
│   ├── database/         # Database schemas & migrations
│   ├── types/            # Shared TypeScript types
│   └── utils/            # Shared utilities
├── docs/
│   ├── SYSTEM_DESIGN.md
│   ├── API_DESIGN.md
│   ├── DB_SCHEMA.md
│   └── ROADMAP.md
└── package.json
```

## 🚀 Quick Start

**See [QUICKSTART.md](./QUICKSTART.md) for detailed setup instructions.**

### Option 1: Supabase + Next.js (Recommended for MVP)

```bash
# 1. Create Supabase project at https://supabase.com
# 2. Run database schema (supabase/schema.sql)
# 3. Copy .env.example to .env.local
# 4. Add your Supabase credentials

# Install dependencies
cd apps/web
npm install

# Start development
npm run dev

# Open http://localhost:3000
```

### Option 2: Full Monorepo Setup

```bash
# Install all dependencies
npm install

# Run development servers
npm run dev
```

## 📚 Documentation

### Quick Start & Setup
- [Quick Start Guide](./QUICKSTART.md) - Get started in minutes
- [Supabase Setup](./docs/SUPABASE_SETUP.md) - **NEW!** Step-by-step Supabase guide

### Architecture & Design
- [System Design](./docs/SYSTEM_DESIGN.md) - Original architecture (reference)
- [Database Schema](./docs/DB_SCHEMA.md) - Complete database design
- [API Design](./docs/API_DESIGN.md) - API specifications
- [Roadmap](./docs/ROADMAP.md) - Development phases

### Current Implementation
We're using a **simplified Supabase architecture** for faster MVP development. The original microservices architecture in docs/ is kept for reference and future scaling.

## 🛠️ Tech Stack (Simplified for Fast Development)

- **Frontend**: Next.js 14 (App Router), TailwindCSS, Shadcn/ui
- **Backend**: Supabase (All-in-One Platform)
  - Authentication (JWT + OAuth)
  - PostgreSQL Database
  - Auto-generated REST API
  - File Storage
  - Real-time Subscriptions
- **AI/ML**: OpenAI API (for future AI features)
- **Deployment**: Vercel (Frontend), Supabase (Backend)

**Why This Stack?**
- ✅ No backend code needed (Supabase auto-generates APIs)
- ✅ Built-in authentication & security
- ✅ Free tier covers MVP development
- ✅ Can scale to production easily
- ✅ Deploy in minutes

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ for better health and fitness