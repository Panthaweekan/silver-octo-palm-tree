# ⚡ FitJourney - Quick Reference Guide

คู่มือฉบับย่อสำหรับเริ่มต้นใช้งานอย่างรวดเร็ว

---

## 🚀 เริ่มต้นใน 5 นาที

### 1️⃣ สร้าง Supabase Project (2 นาที)

```
https://supabase.com
→ New Project
→ Name: fitjourney-dev
→ Password: [รหัสผ่านที่แข็งแรง]
→ Region: Southeast Asia (Singapore)
→ Plan: Free
→ Create
```

### 2️⃣ Run Database Schema (1 นาที)

```
Supabase Dashboard
→ SQL Editor
→ Copy/Paste: supabase/schema.sql
→ Run
```

### 3️⃣ Get API Keys (30 วินาที)

```
Settings → API
→ คัดลอก:
  - Project URL
  - anon public key
  - service_role key
```

### 4️⃣ Setup Local Project (1.5 นาที)

```bash
cd apps/web
cp .env.example .env.local
# แก้ไข .env.local ใส่ API keys
npm install
npm run dev
```

### 5️⃣ ทดสอบ (30 วินาที)

```
http://localhost:3000
→ สมัครสมาชิก
→ ยืนยันอีเมล
→ เข้าสู่ระบบ
```

---

## 📋 Environment Variables Template

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗂️ Database Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `profiles` | ข้อมูลผู้ใช้ | id, email, full_name, height_cm |
| `workouts` | บันทึก workout | user_id, type, duration, calories |
| `meals` | บันทึกอาหาร | user_id, food_name, calories, protein |
| `weights` | น้ำหนักและวัดร่างกาย | user_id, weight_kg, date |
| `habits` | นิสัยที่ติดตาม | user_id, name, target_value |
| `habit_logs` | Log นิสัยประจำวัน | habit_id, date, completed |
| `daily_journals` | บันทึกประจำวัน | user_id, content, mood |
| `food_database` | ฐานข้อมูลอาหาร | name, calories, protein, carbs |

---

## 🔐 Supabase Client Usage

### Client-Side (Browser)

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Query data
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id)

// Insert data
const { data, error } = await supabase
  .from('workouts')
  .insert({ user_id, type, duration })
  .select()
```

### Server-Side (Next.js Server Components)

```typescript
import { createServerClient } from '@/lib/supabase/server'

const supabase = createServerClient()

const { data: { user } } = await supabase.auth.getUser()
```

---

## 🎨 UI Components (Shadcn/ui)

### Available Components

```typescript
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
```

### Button Variants

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

---

## 📱 Routes Structure

| Route | Description | Protected |
|-------|-------------|-----------|
| `/` | Landing page | ❌ Public |
| `/login` | Login page | ❌ Public |
| `/register` | Register page | ❌ Public |
| `/dashboard` | Main dashboard | ✅ Protected |
| `/dashboard/workouts` | Workouts page | ✅ Protected |
| `/dashboard/meals` | Meals page | ✅ Protected |
| `/dashboard/weight` | Weight tracking | ✅ Protected |
| `/dashboard/habits` | Habits page | ✅ Protected |
| `/dashboard/analytics` | Analytics | ✅ Protected |
| `/dashboard/settings` | Settings | ✅ Protected |

---

## 🔑 Authentication Cheat Sheet

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { full_name: 'John Doe' }
  }
})
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

### Sign Out

```typescript
const { error } = await supabase.auth.signOut()
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser()
```

### Google OAuth

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

---

## 🗄️ Common SQL Queries

### Get today's workouts

```sql
SELECT * FROM workouts
WHERE user_id = '[USER_ID]'
  AND date = CURRENT_DATE
ORDER BY created_at DESC;
```

### Get weekly calorie summary

```sql
SELECT
  DATE(date) as workout_date,
  SUM(calories_burned) as total_calories
FROM workouts
WHERE user_id = '[USER_ID]'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(date)
ORDER BY workout_date;
```

### Get latest weight

```sql
SELECT * FROM weights
WHERE user_id = '[USER_ID]'
ORDER BY date DESC
LIMIT 1;
```

---

## 🚨 Common Errors & Fixes

### Error: "Row level security policy violated"

```typescript
// ✅ Correct: Always filter by user_id
const { data } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id)  // Important!

// ❌ Wrong: No user_id filter
const { data } = await supabase
  .from('workouts')
  .select('*')
```

### Error: "Invalid Supabase URL"

```bash
# Check .env.local format:
# ✅ Correct
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co

# ❌ Wrong (missing https://)
NEXT_PUBLIC_SUPABASE_URL=abc123.supabase.co

# ❌ Wrong (trailing slash)
NEXT_PUBLIC_SUPABASE_URL=https://abc123.supabase.co/
```

### Error: "Failed to fetch"

```bash
# Restart dev server
Ctrl+C
npm run dev
```

---

## 📦 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Supabase (if using Supabase CLI)
supabase login
supabase link --project-ref [PROJECT-REF]
supabase db pull         # Pull remote schema
supabase gen types typescript --project-id [PROJECT-REF] > types/supabase.ts
```

---

## 🎯 Project Structure

```
apps/web/
├── app/                      # Routes
│   ├── (auth)/              # Auth pages
│   ├── dashboard/           # Dashboard pages
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # Shadcn components
│   └── dashboard/           # Dashboard components
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Client-side
│   │   ├── server.ts        # Server-side
│   │   └── middleware.ts    # Middleware
│   └── utils.ts             # Utilities
├── types/
│   └── supabase.ts          # Database types
├── middleware.ts            # Route protection
└── .env.local               # Environment vars
```

---

## 🔗 Important Links

| Resource | URL |
|----------|-----|
| Supabase Dashboard | https://app.supabase.com |
| Supabase Docs | https://supabase.com/docs |
| Next.js Docs | https://nextjs.org/docs |
| Shadcn/ui | https://ui.shadcn.com |
| TailwindCSS | https://tailwindcss.com |
| Vercel | https://vercel.com |

---

## 💡 Tips & Best Practices

### ✅ DO

- ✅ Always filter queries by `user_id`
- ✅ Use RLS policies for security
- ✅ Keep API keys in `.env.local`
- ✅ Use TypeScript types
- ✅ Handle errors gracefully
- ✅ Use Server Components when possible
- ✅ Optimize images with Next.js Image

### ❌ DON'T

- ❌ Don't commit `.env.local`
- ❌ Don't use `service_role` key in client-side
- ❌ Don't skip RLS policies
- ❌ Don't fetch all data without pagination
- ❌ Don't ignore TypeScript errors
- ❌ Don't store sensitive data in localStorage

---

## 🎓 Next Steps

1. ✅ Complete setup
2. 📝 Implement Workout logging form
3. 🍎 Implement Meal logging form
4. ⚖️ Implement Weight tracking
5. 📊 Add analytics charts
6. 🤖 Integrate AI features
7. 🚀 Deploy to Vercel

---

## 📞 Need Help?

- 📖 [Full Setup Guide](./SETUP_GUIDE.md)
- 📘 [Supabase Setup](./SUPABASE_SETUP.md)
- 🐛 [GitHub Issues](https://github.com/Panthaweekan/silver-octo-palm-tree/issues)

---

**Last Updated:** December 4, 2025
**Version:** 1.0
