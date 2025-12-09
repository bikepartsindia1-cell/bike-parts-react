# 🚀 Deploy to Netlify - Simple Guide

## ⚠️ IMPORTANT: Fix White Screen

You're seeing a white screen because you uploaded the **source folder** instead of the **built files**.

## ✅ Correct Way to Deploy

### Option 1: Deploy via GitHub (RECOMMENDED)

This is the easiest and best way:

#### Step 1: Push to GitHub

```bash
# Navigate to your project
cd bike-parts-react

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

#### Step 2: Connect Netlify to GitHub

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub
5. Select your repository
6. Configure settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
7. Click **"Show advanced"** → **"New variable"**
8. Add environment variables:
   ```
   VITE_SUPABASE_URL = https://vutkiitfvgrbhmsuuois.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dGtpaXRmdmdyYmhtc3V1b2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjU1NTcsImV4cCI6MjA4MDg0MTU1N30.VV1wy4UJ52vlyobjA6E6SdwyfzsqdWU5592uYAkpCYE
   ```
9. Click **"Deploy site"**

✅ Done! Netlify will build and deploy automatically.

---

### Option 2: Manual Upload (If you must)

If you can't use GitHub:

#### Step 1: Build the Project

```bash
# Navigate to project
cd bike-parts-react

# Install dependencies
npm install

# Build the project
npm run build
```

This creates a `dist` folder with the built files.

#### Step 2: Upload to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Deploy manually"**
3. **Drag and drop ONLY the `dist` folder** (NOT the entire project)
4. Wait for upload to complete

#### Step 3: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add:
   ```
   Key: VITE_SUPABASE_URL
   Value: https://vutkiitfvgrbhmsuuois.supabase.co
   ```
4. Add another:
   ```
   Key: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dGtpaXRmdmdyYmhtc3V1b2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjU1NTcsImV4cCI6MjA4MDg0MTU1N30.VV1wy4UJ52vlyobjA6E6SdwyfzsqdWU5592uYAkpCYE
   ```
5. Click **"Save"**

#### Step 4: Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

---

### Option 3: Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login
netlify login

# Navigate to project
cd bike-parts-react

# Build
npm run build

# Deploy
netlify deploy --prod --dir=dist
```

When prompted, select "Create & configure a new site".

Then add environment variables in Netlify dashboard.

---

## 🔍 What Went Wrong?

### You Uploaded This:
```
bike-parts-react/
├── src/
├── public/
├── node_modules/
├── package.json
└── ... (source files)
```

❌ **This won't work!** Netlify needs built files, not source code.

### You Should Upload This:
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js
│   └── index-xyz789.css
└── ... (built files)
```

✅ **This works!** These are the compiled, optimized files.

---

## 📋 Quick Fix Steps

1. **Delete your current Netlify site** (or keep it and create a new one)

2. **Choose one of the 3 options above**:
   - Option 1 (GitHub) - Best for continuous deployment
   - Option 2 (Manual) - Quick but need to rebuild each time
   - Option 3 (CLI) - Good for developers

3. **Make sure environment variables are set**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. **Test your site**:
   - Visit the Netlify URL
   - Check if products load
   - Try adding a product from admin panel

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Website loads (no white screen)
- [ ] Products page shows your 4 database products
- [ ] No console errors (press F12)
- [ ] Images load correctly
- [ ] Navigation works
- [ ] Admin panel accessible at `/admin`
- [ ] Can add/edit products (if logged in)

---

## 🐛 Still Having Issues?

### White Screen
- **Check**: Did you upload `dist` folder or source folder?
- **Fix**: Upload only the `dist` folder

### "Failed to fetch"
- **Check**: Are environment variables set in Netlify?
- **Fix**: Add them in Site Settings → Environment Variables

### Products Not Showing
- **Check**: Browser console (F12) for errors
- **Fix**: Verify Supabase credentials are correct

### 404 on Page Refresh
- **Check**: Is `netlify.toml` in your project root?
- **Fix**: I already created it for you, make sure it's included

---

## 📁 Project Structure

Your project should look like this:

```
bike-parts-react/
├── dist/                    ← Upload this to Netlify (manual)
├── src/
├── public/
├── .env                     ← Local credentials
├── netlify.toml            ← Netlify configuration (I created this)
├── package.json
└── vite.config.js
```

---

## 🎯 Recommended Approach

**Use GitHub deployment (Option 1)** because:
- ✅ Automatic builds on every push
- ✅ No need to manually build
- ✅ Easy to rollback
- ✅ Preview deployments for branches
- ✅ Environment variables managed in Netlify

---

## 💡 Pro Tips

1. **Always use Git deployment** for production sites
2. **Never commit `.env` file** to Git (it's in `.gitignore`)
3. **Set environment variables in Netlify**, not in code
4. **Test locally first** with `npm run dev`
5. **Check browser console** for errors

---

## 🆘 Emergency Fix

If nothing works, do this:

```bash
# 1. Build locally
cd bike-parts-react
npm install
npm run build

# 2. Check if dist folder was created
ls dist

# 3. If dist exists, upload ONLY that folder to Netlify
# Drag and drop the dist folder to Netlify

# 4. Add environment variables in Netlify dashboard

# 5. Redeploy
```

---

## 📞 Next Steps

1. Choose your deployment method (GitHub recommended)
2. Follow the steps carefully
3. Add environment variables
4. Test your site
5. If issues persist, check browser console for specific errors

Your site should work perfectly after following these steps! 🎉
