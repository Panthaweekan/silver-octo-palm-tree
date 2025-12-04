# 🌐 FitJourney Web App

Next.js web application for FitJourney fitness tracking platform.

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React + Shadcn/ui + TailwindCSS
- **Backend**: Supabase (Auth + Database + Storage)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Icons**: Lucide React

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
```

## ⚙️ Environment Variables

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from your Supabase project dashboard.

## 🏃 Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## 🏗️ Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages (login, register)
│   ├── auth/              # Auth callbacks
│   ├── dashboard/         # Protected dashboard routes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Shadcn UI components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── utils.ts           # Helper functions
├── types/
│   └── supabase.ts        # TypeScript types
└── middleware.ts          # Route protection
```

## 📱 Features

### Completed ✅
- Landing page with hero section
- User authentication (Email + Google OAuth)
- Protected dashboard routes
- Dashboard layout with sidebar navigation
- Today's activity overview
- Quick stats cards
- Responsive design

### In Progress 🚧
- Workout logging
- Meal tracking
- Weight tracking
- Habit tracking

### Planned 📋
- AI food image recognition
- Analytics & charts
- Progress reports

## 🎨 UI Components

Using [Shadcn/ui](https://ui.shadcn.com/) components:
- Button, Input, Label, Card
- Dialog, Dropdown Menu, Tabs, Toast

## 🔐 Authentication Flow

1. User signs up/logs in → Supabase Auth
2. JWT token stored in cookies
3. Middleware protects dashboard routes
4. Profile auto-created on signup

## 🗄️ Database

Using Supabase PostgreSQL with:
- Automatic API generation
- Row Level Security (RLS)
- Real-time subscriptions

See `/supabase/schema.sql` for database schema.

## 📚 Learn More

- [Supabase Setup Guide](../../docs/SUPABASE_SETUP.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project to Vercel
3. Add environment variables
4. Deploy

---

Built with ❤️ using Next.js and Supabase
