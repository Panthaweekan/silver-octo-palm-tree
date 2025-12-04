# 🚀 FitJourney - Complete Setup Guide

คู่มือการติดตั้งและเริ่มต้นใช้งาน FitJourney แบบละเอียด ทีละขั้นตอน

---

## 📋 Table of Contents

1. [ข้อกำหนดของระบบ](#1-ข้อกำหนดของระบบ)
2. [สร้าง Supabase Project](#2-สร้าง-supabase-project)
3. [ตั้งค่า Database Schema](#3-ตั้งค่า-database-schema)
4. [ตั้งค่า Authentication](#4-ตั้งค่า-authentication)
5. [ตั้งค่า Storage](#5-ตั้งค่า-storage)
6. [Setup Local Project](#6-setup-local-project)
7. [การทดสอบ](#7-การทดสอบ)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. ข้อกำหนดของระบบ

### สิ่งที่ต้องติดตั้งก่อน

```bash
# ตรวจสอบเวอร์ชัน
node --version    # ควรเป็น v18.0.0 ขึ้นไป
npm --version     # ควรเป็น v9.0.0 ขึ้นไป
git --version     # เวอร์ชันล่าสุด
```

### หากยังไม่มี ให้ติดตั้ง:

**macOS:**
```bash
# ติดตั้ง Homebrew (ถ้ายังไม่มี)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# ติดตั้ง Node.js
brew install node
```

**Windows:**
```bash
# ดาวน์โหลดจาก https://nodejs.org/
# เลือก LTS version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 2. สร้าง Supabase Project

### ขั้นตอนที่ 1: สมัคร Supabase Account

1. เปิดเว็บเบราว์เซอร์ ไปที่: https://supabase.com
2. คลิก **"Start your project"** ที่มุมขวาบน
3. เลือกวิธีการสมัคร:
   - **GitHub** (แนะนำ - เชื่อมต่อ repo ได้ง่าย)
   - **Google**
   - **Email**

4. ยืนยันอีเมล (ถ้าสมัครด้วย email)
5. คุณจะเข้าสู่หน้า Dashboard

### ขั้นตอนที่ 2: สร้าง Organization (ถ้ายังไม่มี)

1. ที่หน้า Dashboard คลิก **"New organization"**
2. กรอกข้อมูล:
   - **Organization name**: `FitJourney` (หรือชื่อที่คุณต้องการ)
   - **Pricing plan**: เลือก **Free** (0$/month)
3. คลิก **"Create organization"**

### ขั้นตอนที่ 3: สร้าง Project

1. คลิก **"New project"**
2. กรอกข้อมูลดังนี้:

   **Project Name:**
   ```
   fitjourney-dev
   ```
   หรือชื่อที่คุณต้องการ (ตัวอักษรพิมพ์เล็ก, ไม่มีช่องว่าง)

   **Database Password:**
   ```
   สร้างรหัสผ่านที่ปลอดภัย (อย่างน้อย 12 ตัวอักษร)
   ```
   ⚠️ **สำคัญมาก:** เก็บรหัสผ่านนี้ไว้ในที่ปลอดภัย (เช่น password manager)

   **Region:**
   - เลือก **Southeast Asia (Singapore)** - ใกล้ไทยที่สุด
   - หรือ **Northeast Asia (Tokyo)** - ทางเลือกที่สอง

   **Pricing Plan:**
   - เลือก **Free** (มี limit ที่เหมาะสำหรับ MVP)

3. คลิก **"Create new project"**

4. รอประมาณ 2-3 นาที จนกว่า project จะพร้อมใช้งาน
   - คุณจะเห็นแถบสีเขียวแสดงสถานะ "Setting up project..."
   - เมื่อเสร็จจะขึ้น "Your project is ready!"

---

## 3. ตั้งค่า Database Schema

### ขั้นตอนที่ 1: เข้าสู่ SQL Editor

1. ที่ Sidebar ด้านซ้าย คลิก **"SQL Editor"** (ไอคอน `</>`)
2. คุณจะเห็นหน้าต่าง SQL Query editor

### ขั้นตอนที่ 2: คัดลอก Schema SQL

1. เปิดไฟล์ `/supabase/schema.sql` ในโปรเจคของคุณ
2. คัดลอกโค้ด SQL ทั้งหมด (Ctrl/Cmd + A แล้ว Ctrl/Cmd + C)

หรือดาวน์โหลดจาก GitHub:
```bash
# ในเครื่องของคุณ
cd /path/to/silver-octo-palm-tree
cat supabase/schema.sql
```

### ขั้นตอนที่ 3: รัน SQL Schema

1. ใน SQL Editor วางโค้ดที่คัดลอกมา (Ctrl/Cmd + V)
2. คลิกปุ่ม **"Run"** (หรือกด Ctrl/Cmd + Enter)
3. รอประมาณ 5-10 วินาที
4. คุณควรเห็นข้อความ:
   ```
   Success. No rows returned
   ```

### ขั้นตอนที่ 4: ตรวจสอบตารางที่สร้าง

1. ที่ Sidebar คลิก **"Table Editor"** (ไอคอนตาราง)
2. คุณควรเห็นตารางทั้งหมด 8 ตาราง:
   - ✅ `profiles`
   - ✅ `workouts`
   - ✅ `meals`
   - ✅ `weights`
   - ✅ `habits`
   - ✅ `habit_logs`
   - ✅ `daily_journals`
   - ✅ `food_database`

3. คลิกที่แต่ละตารางเพื่อดูโครงสร้าง

### ขั้นตอนที่ 5: ตรวจสอบ Row Level Security (RLS)

1. คลิกที่ตาราง `profiles`
2. ไปที่แท็บ **"Policies"**
3. คุณควรเห็น policies:
   - ✅ Users can view own profile
   - ✅ Users can update own profile
   - ✅ Users can insert own profile

4. ทำเช่นเดียวกันกับตารางอื่นๆ เพื่อยืนยันว่า RLS ทำงาน

---

## 4. ตั้งค่า Authentication

### ขั้นตอนที่ 1: Email Authentication (เปิดใช้งานอยู่แล้ว)

1. ที่ Sidebar คลิก **"Authentication"** → **"Providers"**
2. ตรวจสอบว่า **"Email"** เปิดใช้งานอยู่ (toggle สีเขียว)

### ขั้นตอนที่ 2: ตั้งค่า Email Templates (ทางเลือก)

1. ไปที่ **"Authentication"** → **"Email Templates"**
2. ปรับแต่ง email templates ตามต้องการ:
   - **Confirm signup** - อีเมลยืนยันการสมัครสมาชิก
   - **Magic Link** - ลิงก์เข้าสู่ระบบผ่านอีเมล
   - **Reset Password** - รีเซ็ตรหัสผ่าน

### ขั้นตอนที่ 3: ตั้งค่า Google OAuth (ทางเลือก แต่แนะนำ)

#### 3.1 สร้าง Google OAuth Client

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่:
   - คลิก **"Select a project"** → **"New Project"**
   - ตั้งชื่อ: `FitJourney`
   - คลิก **"Create"**

3. เปิดใช้งาน Google+ API:
   - ไปที่ **"APIs & Services"** → **"Library"**
   - ค้นหา **"Google+ API"**
   - คลิก **"Enable"**

4. สร้าง OAuth Consent Screen:
   - ไปที่ **"APIs & Services"** → **"OAuth consent screen"**
   - เลือก **"External"**
   - กรอกข้อมูล:
     - **App name**: FitJourney
     - **User support email**: อีเมลของคุณ
     - **Developer contact**: อีเมลของคุณ
   - คลิก **"Save and Continue"** จนจบ

5. สร้าง OAuth Client ID:
   - ไปที่ **"APIs & Services"** → **"Credentials"**
   - คลิก **"Create Credentials"** → **"OAuth client ID"**
   - Application type: **"Web application"**
   - Name: `FitJourney Web`
   - **Authorized JavaScript origins**:
     ```
     https://your-project-ref.supabase.co
     ```
     (เปลี่ยน `your-project-ref` เป็น project reference ของคุณ)

   - **Authorized redirect URIs**:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - คลิก **"Create"**

6. คัดลอก **Client ID** และ **Client Secret**

#### 3.2 เพิ่ม Google OAuth ใน Supabase

1. กลับไปที่ Supabase Dashboard
2. ไปที่ **"Authentication"** → **"Providers"**
3. เลื่อนลงหา **"Google"**
4. เปิดใช้งาน (toggle)
5. วาง **Client ID** และ **Client Secret** ที่คัดลอกมา
6. คลิก **"Save"**

---

## 5. ตั้งค่า Storage

### ขั้นตอนที่ 1: สร้าง Storage Buckets

1. ที่ Sidebar คลิก **"Storage"**
2. คลิก **"Create a new bucket"**

#### Bucket 1: avatars (สำหรับรูปโปรไฟล์)

```
Name: avatars
Public bucket: ✅ เปิด (เพื่อให้แสดงรูปได้)
File size limit: 2 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

คลิก **"Create bucket"**

#### Bucket 2: food-images (สำหรับรูปอาหาร)

```
Name: food-images
Public bucket: ❌ ปิด (private)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

คลิก **"Create bucket"**

#### Bucket 3: workout-images (สำหรับรูป workout)

```
Name: workout-images
Public bucket: ❌ ปิด (private)
File size limit: 5 MB
Allowed MIME types: image/jpeg, image/png, image/webp
```

คลิก **"Create bucket"**

### ขั้นตอนที่ 2: ตั้งค่า Storage Policies

สำหรับแต่ละ bucket:

1. คลิกที่ชื่อ bucket
2. ไปที่แท็บ **"Policies"**
3. คลิก **"New Policy"**

#### Policy สำหรับ avatars:

**Policy 1: Users can upload their own avatar**
```sql
Policy name: Users can upload avatar
Allowed operation: INSERT
Target roles: authenticated

WITH CHECK expression:
bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text
```

**Policy 2: Anyone can view avatars**
```sql
Policy name: Public avatar access
Allowed operation: SELECT
Target roles: public, authenticated

USING expression:
bucket_id = 'avatars'
```

#### Policy สำหรับ food-images และ workout-images:

**Policy: Users can manage their own images**
```sql
Policy name: Users can manage own images
Allowed operation: ALL
Target roles: authenticated

USING expression:
bucket_id = 'food-images' AND (storage.foldername(name))[1] = auth.uid()::text

WITH CHECK expression:
bucket_id = 'food-images' AND (storage.foldername(name))[1] = auth.uid()::text
```

(ทำแบบเดียวกันสำหรับ workout-images)

---

## 6. Setup Local Project

### ขั้นตอนที่ 1: Clone Project

```bash
# Clone repository
git clone https://github.com/Panthaweekan/silver-octo-palm-tree.git

# เข้าไปในโฟลเดอร์
cd silver-octo-palm-tree

# ตรวจสอบว่าอยู่ branch ที่ถูกต้อง
git branch
# ควรเห็น: * claude/fitness-tracking-app-design-01QT6CJTwksLc7gFtvEcgihM
```

### ขั้นตอนที่ 2: ดึง API Keys จาก Supabase

1. ไปที่ Supabase Dashboard
2. คลิก **"Settings"** (ไอคอนเฟือง) ที่ Sidebar
3. คลิก **"API"**
4. คุณจะเห็น:

   **Project URL:**
   ```
   https://abcdefghijklmnop.supabase.co
   ```

   **Project API keys:**
   - `anon` `public` - ใช้ใน client-side
   - `service_role` `secret` - ใช้ใน server-side เท่านั้น (อย่าแชร์!)

5. คัดลอกค่าทั้งหมดไว้

### ขั้นตอนที่ 3: สร้างไฟล์ Environment Variables

```bash
# เข้าไปในโฟลเดอร์ web app
cd apps/web

# สำเนาไฟล์ .env.example
cp .env.example .env.local

# แก้ไขไฟล์ .env.local
nano .env.local
# หรือใช้ text editor ที่คุณถนัด
```

**แก้ไขไฟล์ `.env.local`:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: AI Features (สำหรับภายหลัง)
# OPENAI_API_KEY=sk-...
```

⚠️ **สำคัญ:**
- เปลี่ยน `your-project-ref` เป็น project reference จริง
- วาง API keys ที่ถูกต้อง
- ไม่ต้อง commit ไฟล์ `.env.local` (มี .gitignore อยู่แล้ว)

บันทึกไฟล์ (Ctrl/Cmd + S)

### ขั้นตอนที่ 4: ติดตั้ง Dependencies

```bash
# ตรวจสอบว่าอยู่ใน apps/web
pwd
# ควรได้: /path/to/silver-octo-palm-tree/apps/web

# ติดตั้ง packages
npm install

# รอประมาณ 1-2 นาที
```

คุณควรเห็นข้อความ:
```
added 300+ packages in 45s
```

### ขั้นตอนที่ 5: เริ่มต้น Development Server

```bash
npm run dev
```

คุณควรเห็น:
```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### ขั้นตอนที่ 6: ตรวจสอบว่าทำงาน

1. เปิดเว็บเบราว์เซอร์
2. ไปที่: http://localhost:3000
3. คุณควรเห็น **Landing Page** ของ FitJourney

---

## 7. การทดสอบ

### ทดสอบที่ 1: ลงทะเบียนผู้ใช้ใหม่

1. คลิกปุ่ม **"เริ่มต้นใช้งาน"** หรือ **"สมัครสมาชิก"**
2. กรอกข้อมูล:
   ```
   ชื่อ-นามสกุล: Test User
   อีเมล: test@example.com
   รหัสผ่าน: test123456
   ยืนยันรหัสผ่าน: test123456
   ```
3. คลิก **"สมัครสมาชิก"**

**ผลลัพธ์ที่คาดหวัง:**
- เห็นข้อความ "สมัครสมาชิกสำเร็จ!"
- ได้รับอีเมลยืนยัน (ตรวจสอบ inbox หรือ spam)

### ทดสอบที่ 2: ยืนยันอีเมล

1. เปิดอีเมลที่ได้รับจาก Supabase
2. คลิกลิงก์ **"Confirm your mail"**
3. คุณจะถูก redirect ไปที่หน้า dashboard

### ทดสอบที่ 3: เข้าสู่ระบบ

1. ไปที่ http://localhost:3000/login
2. กรอก email และ password ที่สมัครไว้
3. คลิก **"เข้าสู่ระบบ"**

**ผลลัพธ์ที่คาดหวัง:**
- Redirect ไปที่ `/dashboard`
- เห็นข้อมูลสถิติเริ่มต้น (ทั้งหมดเป็น 0)
- เห็น Sidebar navigation ด้านซ้าย
- เห็นชื่อผู้ใช้ที่มุมขวาบน

### ทดสอบที่ 4: ตรวจสอบ Database

1. กลับไปที่ Supabase Dashboard
2. ไปที่ **"Table Editor"** → **"profiles"**
3. คุณควรเห็นข้อมูลผู้ใช้ที่สร้างใหม่
4. ตรวจสอบว่า `email`, `full_name` ถูกบันทึกถูกต้อง

### ทดสอบที่ 5: Protected Routes

1. Logout จาก dashboard (คลิกปุ่ม Logout ที่ Sidebar)
2. พยายามเข้าไปที่ http://localhost:3000/dashboard โดยตรง

**ผลลัพธ์ที่คาดหวัง:**
- ถูก redirect ไปที่ `/login` อัตโนมัติ
- แสดงว่า middleware ทำงานถูกต้อง

---

## 8. Troubleshooting

### ปัญหา 1: `npm install` ล้มเหลว

**อาการ:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**วิธีแก้:**
```bash
# ลบ node_modules และ package-lock.json
rm -rf node_modules package-lock.json

# ติดตั้งใหม่
npm install --legacy-peer-deps
```

### ปัญหา 2: Supabase connection error

**อาการ:**
```
Error: Invalid Supabase URL
```

**วิธีแก้:**
1. ตรวจสอบ `.env.local`:
   - URL ต้องขึ้นต้นด้วย `https://`
   - ไม่มี trailing slash `/` ต่อท้าย
   - ตัวอย่างที่ถูกต้อง: `https://abc123.supabase.co`

2. ตรวจสอบว่าใช้ API key ที่ถูกต้อง
3. Restart dev server:
   ```bash
   # กด Ctrl+C เพื่อหยุด server
   # แล้วรันใหม่
   npm run dev
   ```

### ปัญหา 3: Authentication ไม่ทำงาน

**อาการ:**
- ลงทะเบียนแล้วไม่ได้อีเมล
- Login แล้ว error

**วิธีแก้:**

1. ตรวจสอบ Supabase Email settings:
   - ไปที่ **"Authentication"** → **"Email Templates"**
   - ตรวจสอบว่า **"Enable Email Confirmations"** เปิดอยู่

2. สำหรับ development คุณสามารถปิด email confirmation:
   - ไปที่ **"Authentication"** → **"Settings"**
   - ปิด **"Enable email confirmations"**
   - ผู้ใช้จะสามารถ login ได้ทันทีหลังสมัคร

### ปัญหา 4: Port 3000 ถูกใช้งานแล้ว

**อาการ:**
```
Error: Port 3000 is already in use
```

**วิธีแก้:**

**Option 1: ใช้ port อื่น**
```bash
npm run dev -- -p 3001
```

**Option 2: หา process ที่ใช้ port 3000**

macOS/Linux:
```bash
lsof -i :3000
kill -9 <PID>
```

Windows:
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### ปัญหา 5: RLS Policy ไม่ทำงาน

**อาการ:**
- ไม่สามารถ insert/update ข้อมูลได้
- Error: "new row violates row-level security policy"

**วิธีแก้:**

1. ตรวจสอบว่า RLS เปิดใช้งาน:
   ```sql
   -- ใน SQL Editor
   SELECT tablename, rowsecurity
   FROM pg_tables
   WHERE schemaname = 'public';
   ```

2. ตรวจสอบ policies:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```

3. ถ้าไม่เห็น policies ให้รัน schema.sql ใหม่

### ปัญหา 6: Google OAuth ไม่ทำงาน

**อาการ:**
- คลิก "เข้าสู่ระบบด้วย Google" แล้ว error

**วิธีแก้:**

1. ตรวจสอบ Redirect URI:
   - ต้องตรงกับที่ตั้งไว้ใน Google Cloud Console
   - สำหรับ local: `http://localhost:3000/auth/callback`
   - สำหรับ production: `https://your-domain.com/auth/callback`

2. ตรวจสอบว่า Google+ API enable แล้ว

3. ตรวจสอบ OAuth Consent Screen ว่ากรอกข้อมูลครบ

### ปัญหา 7: TypeScript errors

**อาการ:**
```
Type error: Property 'xxx' does not exist on type 'Database'
```

**วิธีแก้:**

1. Generate types จาก Supabase:
   ```bash
   npx supabase gen types typescript --project-id your-project-ref > types/supabase.ts
   ```

2. หรือใช้ types ที่มีอยู่แล้วใน `types/supabase.ts`

---

## 🎉 เสร็จสิ้น!

หากทำตามขั้นตอนทั้งหมดแล้ว คุณควรมี:

- ✅ Supabase project ที่ทำงานได้
- ✅ Database schema พร้อม RLS policies
- ✅ Authentication (Email + Google OAuth)
- ✅ Storage buckets พร้อม policies
- ✅ Local development environment ที่พร้อมใช้งาน
- ✅ Landing page + Auth pages + Dashboard

---

## 📚 ขั้นตอนต่อไป

1. [เริ่มพัฒนาฟีเจอร์ Workout Logging](./WORKOUT_FEATURE.md)
2. [เรียนรู้การใช้ Supabase Client](./SUPABASE_CLIENT_GUIDE.md)
3. [Deploy to Vercel](./DEPLOYMENT_GUIDE.md)

---

## 🆘 ต้องการความช่วยเหลือ?

- 📖 [Supabase Documentation](https://supabase.com/docs)
- 💬 [Supabase Discord](https://discord.supabase.com/)
- 📧 Email: support@fitjourney.app

---

**เวอร์ชัน:** 1.0
**อัปเดตล่าสุด:** December 4, 2025
**ผู้เขียน:** FitJourney Development Team
