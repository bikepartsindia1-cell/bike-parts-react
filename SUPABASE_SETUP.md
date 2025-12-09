# Complete Supabase Setup Guide

## 🚀 Step-by-Step Supabase Setup

### Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or Email
4. Verify your email if required

### Step 2: Create a New Project

1. Click "New Project"
2. Fill in the details:
   - **Name**: `bike-parts-ecommerce` (or any name you like)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users (e.g., Mumbai for India)
   - **Pricing Plan**: Free (sufficient for starting)
3. Click "Create new project"
4. Wait 2-3 minutes for project to be ready

### Step 3: Get Your API Credentials

1. Once project is ready, go to **Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. You'll see:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
4. **Copy both** - you'll need them!

### Step 4: Create Products Table

1. Click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Paste this SQL code:

```sql
-- Create products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  image_url TEXT,
  description TEXT,
  compatibility TEXT[],
  stock_quantity INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 4.5,
  reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read products (public access)
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- Allow authenticated users to insert products
CREATE POLICY "Allow authenticated insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update products
CREATE POLICY "Allow authenticated update" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete products
CREATE POLICY "Allow authenticated delete" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
```

4. Click **Run** (or press F5)
5. You should see "Success. No rows returned"

### Step 5: Add Sample Products (Optional)

Run this SQL to add your 4 products:

```sql
INSERT INTO products (name, brand, category, price, original_price, image_url, description, compatibility, stock_quantity, rating, reviews)
VALUES 
  (
    'KTM Duke Handlebar Grips',
    'KTM',
    'Handlebars',
    850,
    850,
    'https://images.unsplash.com/photo-15881823',
    'Premium rubber grips for better control and comfort.',
    ARRAY['Duke 390', 'Duke 250', 'Duke 200'],
    15,
    4.5,
    128
  ),
  (
    'Royal Enfield Engine',
    'Royal Enfield',
    'Engine',
    2850,
    2850,
    'https://www.cariblex360.com/_next/image/u',
    'all new 350 cc (OHC) engine looks similar to the RE 650 twin',
    ARRAY['Classic 350', 'Meteor 350'],
    5,
    4.7,
    215
  ),
  (
    'Brembo Brake Pads',
    'Brembo',
    'Brakes',
    3500,
    3500,
    'https://images.unsplash.com/photo-1568605',
    'Sintered brake pads for superior stopping power.',
    ARRAY['Universal'],
    20,
    4.8,
    342
  ),
  (
    'Royal Enfield LED Headlight',
    'Royal Enfield',
    'Headlights',
    2850,
    2850,
    'https://images.unsplash.com/photo-15581618',
    'High-performance LED headlight for Royal Enfield Classic bikes',
    ARRAY['Classic 350', 'Bullet 350'],
    12,
    4.6,
    89
  );
```

### Step 6: Update Your .env File

1. Open `bike-parts-react/.env`
2. Replace with your credentials:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Example**:
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAxNTU3NjAwMH0.xxxxxxxxxxxxx
```

### Step 7: Test Locally

```bash
cd bike-parts-react
npm install
npm run dev
```

Visit `http://localhost:5173` and check if products load!

---

## 🌐 Deploy to Netlify (Correct Way)

### Method 1: Deploy via Git (Recommended)

#### Step 1: Push to GitHub

```bash
cd bike-parts-react
git init
git add .
git commit -m "Initial commit with Supabase integration"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/bike-parts-react.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub"
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Show advanced" → "Add environment variable"
7. Add your Supabase credentials:
   - `VITE_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your_anon_key`
8. Click "Deploy site"

### Method 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build your project
cd bike-parts-react
npm run build

# Deploy
netlify deploy --prod
```

When prompted:
- **Publish directory**: `dist`

Then set environment variables in Netlify dashboard.

### Method 3: Manual Upload (Not Recommended)

If you must upload manually:

1. **Build the project first**:
   ```bash
   cd bike-parts-react
   npm install
   npm run build
   ```

2. **Upload the `dist` folder** (NOT the entire project):
   - Go to Netlify Dashboard
   - Drag and drop the `dist` folder
   - Set environment variables in Site Settings

---

## 🔧 Fix White Screen Issue

### Why You're Seeing White Screen

You uploaded the **source code** (`bike-parts-react` folder) instead of the **built files** (`dist` folder).

### Solution

**Option A: Use Git Deployment (Best)**
- Follow "Method 1" above
- Netlify will automatically build and deploy

**Option B: Build and Upload Manually**
```bash
cd bike-parts-react
npm install
npm run build
```
Then upload only the `dist` folder to Netlify.

---

## ✅ Verify Everything Works

### 1. Check Supabase Connection

Open browser console (F12) and check for:
- ✅ No Supabase errors
- ✅ Products loading from database

### 2. Test Product Management

1. Go to `/admin`
2. Login (if you have auth set up)
3. Try adding a product
4. Check if it appears immediately
5. Refresh page - product should still be there

### 3. Check Netlify Environment Variables

1. Go to Netlify Dashboard
2. Site Settings → Environment Variables
3. Verify both variables are set:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

---

## 🐛 Troubleshooting

### White Screen on Netlify
- **Cause**: Uploaded source code instead of built files
- **Fix**: Use Git deployment or build first then upload `dist` folder

### "Failed to fetch" Error
- **Cause**: Missing environment variables
- **Fix**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Netlify

### Products Not Showing
- **Cause**: Empty database or wrong credentials
- **Fix**: 
  1. Check Supabase has products
  2. Verify .env credentials are correct
  3. Check browser console for errors

### Can't Add Products
- **Cause**: RLS policies not set or not authenticated
- **Fix**: 
  1. Run the RLS policy SQL from Step 4
  2. Make sure you're logged in as admin

### 404 on Page Refresh
- **Cause**: Missing redirect rules
- **Fix**: The `netlify.toml` file I created handles this

---

## 📋 Quick Checklist

Before deploying, make sure:

- [ ] Supabase project created
- [ ] Products table created with RLS policies
- [ ] Sample products added (optional)
- [ ] `.env` file updated with your credentials
- [ ] Tested locally (`npm run dev`)
- [ ] Products load correctly
- [ ] `netlify.toml` file exists
- [ ] Environment variables set in Netlify
- [ ] Deployed via Git (recommended)

---

## 🎯 Expected Result

After following this guide:
- ✅ Website loads on Netlify (no white screen)
- ✅ Products page shows your 4 database products
- ✅ Admin can add/edit/delete products
- ✅ Changes persist in database
- ✅ All users see the same products

---

## 📞 Need Help?

Common issues and solutions:

1. **White screen**: You need to build the project first
2. **No products**: Check Supabase credentials and database
3. **Can't add products**: Check RLS policies and authentication
4. **404 errors**: Make sure `netlify.toml` exists

Check browser console (F12) for specific error messages!
