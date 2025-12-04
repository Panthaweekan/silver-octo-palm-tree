# 🚀 FitJourney - Supabase Setup Guide

## Why Supabase?

✅ **No backend code needed** - Auto-generates REST API from database schema
✅ **Built-in Authentication** - JWT, OAuth (Google, Apple, etc.)
✅ **Real-time subscriptions** - WebSocket support out of the box
✅ **File storage** - For food images, profile pictures
✅ **Row Level Security** - Database-level access control
✅ **Free tier** - 500MB database, 1GB file storage, 2GB bandwidth

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│         Next.js Frontend                │
│      (Vercel - Free Deploy)             │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Supabase                      │
├─────────────────────────────────────────┤
│  • Authentication (JWT + OAuth)         │
│  • PostgreSQL Database                  │
│  • Auto REST API                        │
│  • File Storage                         │
│  • Real-time Subscriptions              │
└─────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         OpenAI API                      │
│    (AI Features - Optional)             │
└─────────────────────────────────────────┘
```

---

## Quick Start (5 Steps)

### Step 1: Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Sign up / Sign in
3. Click "New Project"
4. Fill in:
   - **Project Name**: `fitjourney` (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
5. Wait 2 minutes for setup

### Step 2: Get API Keys (1 minute)

1. In your project, go to **Settings** → **API**
2. Copy these values:
   - `Project URL` (e.g., https://xxxxx.supabase.co)
   - `anon public` key
   - `service_role` key (keep secret!)

3. Create `.env.local` file:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Step 3: Create Database Schema (5 minutes)

1. In Supabase Dashboard, go to **SQL Editor**
2. Run the schema file: `supabase/schema.sql`
3. This creates all tables automatically

### Step 4: Enable Authentication (2 minutes)

1. Go to **Authentication** → **Providers**
2. Enable **Email** (already enabled)
3. Optional: Enable **Google OAuth**
   - Get credentials from Google Cloud Console
   - Add OAuth Client ID & Secret

### Step 5: Install Next.js App (5 minutes)

```bash
# Navigate to web app
cd apps/web

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs

# Start development
npm run dev
```

---

## Database Schema (Simplified MVP)

### Core Tables

**1. profiles** (extends Supabase auth.users)
```sql
- id (uuid, FK to auth.users)
- email (text)
- full_name (text)
- avatar_url (text)
- date_of_birth (date)
- gender (text)
- height_cm (numeric)
- target_weight_kg (numeric)
- target_calories (integer)
- created_at (timestamptz)
- updated_at (timestamptz)
```

**2. workouts**
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- date (date)
- type (text) - 'cardio', 'strength', 'hiit', 'yoga', etc.
- duration_minutes (integer)
- distance_km (numeric) - nullable
- calories_burned (integer)
- notes (text) - nullable
- created_at (timestamptz)
```

**3. meals**
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- date (date)
- meal_type (text) - 'breakfast', 'lunch', 'dinner', 'snack'
- food_name (text)
- portion (text)
- calories (integer)
- protein_g (numeric)
- carbs_g (numeric)
- fat_g (numeric)
- image_url (text) - nullable
- created_at (timestamptz)
```

**4. weights**
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- date (date)
- weight_kg (numeric)
- body_fat_percentage (numeric) - nullable
- waist_cm (numeric) - nullable
- notes (text) - nullable
- created_at (timestamptz)
```

**5. habits**
```sql
- id (uuid, PK)
- user_id (uuid, FK to profiles)
- name (text)
- description (text) - nullable
- target_value (integer) - e.g., 8 glasses of water
- unit (text) - e.g., 'glasses', 'steps', 'hours'
- created_at (timestamptz)
```

**6. habit_logs**
```sql
- id (uuid, PK)
- habit_id (uuid, FK to habits)
- user_id (uuid, FK to profiles)
- date (date)
- value (integer)
- completed (boolean)
- created_at (timestamptz)
```

---

## Row Level Security (RLS) Policies

**Purpose**: Ensure users can only access their own data

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only insert/update their own data
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Apply similar policies to all tables
-- (See supabase/schema.sql for complete policies)
```

---

## Supabase Client Setup (Next.js)

### Create Supabase Client

**File**: `lib/supabase/client.ts`
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()
```

### Server-Side Client

**File**: `lib/supabase/server.ts`
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}
```

---

## Authentication Flow

### Sign Up
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    data: {
      full_name: 'John Doe',
    }
  }
})
```

### Sign In
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
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

### OAuth (Google)
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`
  }
})
```

---

## CRUD Operations Examples

### Insert Workout
```typescript
const { data, error } = await supabase
  .from('workouts')
  .insert({
    user_id: user.id,
    date: '2025-12-04',
    type: 'cardio',
    duration_minutes: 30,
    calories_burned: 250,
    notes: 'Morning run'
  })
  .select()
  .single()
```

### Get User Workouts
```typescript
const { data, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })
  .limit(10)
```

### Update Weight
```typescript
const { data, error } = await supabase
  .from('weights')
  .update({ weight_kg: 75.5 })
  .eq('id', weightId)
  .select()
  .single()
```

### Delete Meal
```typescript
const { error } = await supabase
  .from('meals')
  .delete()
  .eq('id', mealId)
```

### Real-time Subscription
```typescript
const channel = supabase
  .channel('workouts-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'workouts',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('Workout changed:', payload)
    }
  )
  .subscribe()
```

---

## File Storage (Images)

### Upload Food Image
```typescript
const file = event.target.files[0]
const fileName = `${user.id}/${Date.now()}.jpg`

const { data, error } = await supabase.storage
  .from('food-images')
  .upload(fileName, file)

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('food-images')
  .getPublicUrl(fileName)
```

### Create Storage Buckets

In Supabase Dashboard:
1. Go to **Storage**
2. Create buckets:
   - `avatars` (public)
   - `food-images` (private)
   - `workout-images` (private)

---

## Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (server-only)

# Optional: AI Features
OPENAI_API_KEY=sk-...
```

### Production (Vercel)
Add the same variables in Vercel dashboard:
1. Project Settings → Environment Variables
2. Add all NEXT_PUBLIC_* variables

---

## Next Steps

1. ✅ **Create Supabase project**
2. ✅ **Run database schema** (`supabase/schema.sql`)
3. ✅ **Copy API keys** to `.env.local`
4. ✅ **Setup Next.js app** (next section)
5. ✅ **Build authentication pages**
6. ✅ **Create dashboard**
7. ✅ **Add core features**

---

## Useful Commands

```bash
# Install Supabase CLI (optional, for local development)
npm install -g supabase

# Login to Supabase
supabase login

# Link to remote project
supabase link --project-ref your-project-ref

# Pull remote schema
supabase db pull

# Generate TypeScript types
supabase gen types typescript --project-id your-project-ref > types/supabase.ts
```

---

## Common Issues & Solutions

### Issue: "Row Level Security is not enabled"
**Solution**: Enable RLS on all tables:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
-- ... etc for all tables
```

### Issue: "No rows returned" when inserting
**Solution**: Add `.select()` after insert:
```typescript
.insert({ ... })
.select()
.single()
```

### Issue: Can't access other user's data (good!)
**Solution**: This is expected with RLS. Use service role key only on server-side for admin operations.

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Next.js + Supabase Tutorial](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Ready to start building? Let's create the Next.js app next!** 🚀
