# Deployment Troubleshooting Guide

## Supabase Connection Issues

### Common Symptoms:
- Products not loading
- Authentication not working
- Database operations failing
- Console errors about missing environment variables

### Troubleshooting Steps:

#### 1. Check Environment Variables in Hosting Platform

**For Netlify:**
1. Go to Site Settings → Environment Variables
2. Ensure these variables are set:
   - `VITE_SUPABASE_URL` = `https://vutkiitfvgrbhmsuuois.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1dGtpaXRmdmdyYmhtc3V1b2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyNjU1NTcsImV4cCI6MjA4MDg0MTU1N30.VV1wy4UJ52vlyobjA6E6SdwyfzsqdWU5592uYAkpCYE`

**For Render:**
1. Go to Environment tab in your service
2. Add the same variables as above

#### 2. Check Browser Console
1. Open your deployed site
2. Open Developer Tools (F12)
3. Check Console tab for debug messages
4. Look for "🔍 Debugging Supabase Connection..." messages

#### 3. Verify Build Process
1. Check build logs in hosting platform
2. Look for any warnings about environment variables
3. Ensure build completes successfully

#### 4. Test Environment Variables
Add this to your browser console on the deployed site:
```javascript
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

### Quick Fixes:

#### Fix 1: Redeploy After Setting Environment Variables
1. Set environment variables in hosting platform
2. Trigger a new deployment (don't just restart)
3. Environment variables only take effect on new builds

#### Fix 2: Check Variable Names
- Must be exactly `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
- Must be exactly `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
- Case sensitive!

#### Fix 3: Clear Build Cache
**Netlify:**
1. Go to Deploys tab
2. Click "Clear cache and deploy site"

**Render:**
1. Go to Events tab
2. Click "Clear build cache" if available, then redeploy

## Render-Specific Issues

### Issue: "No open ports detected"
**Solution:** Use the Express server setup (already implemented)
- Build Command: `npm run render-build`
- Start Command: `npm start`

### Issue: "Blocked request" / Host not allowed
**Solution:** Vite host configuration (already implemented)
- Added `preview.allowedHosts` in vite.config.js

## Netlify-Specific Issues

### Issue: Client-side routing not working
**Solution:** Add `_redirects` file (already exists)
```
/*    /index.html   200
```

### Issue: Build fails
**Common causes:**
1. Missing environment variables
2. Node version mismatch
3. Dependency issues

**Solutions:**
1. Set Node version to 18 or 20 in build settings
2. Check build logs for specific errors
3. Ensure all dependencies are in package.json

## Emergency Revert Process

If deployment is completely broken:

1. **Revert to working commit:**
   ```bash
   git log --oneline  # Find last working commit
   git reset --hard <commit-hash>
   git push --force-with-lease origin main
   ```

2. **Use backup configuration:**
   - Copy original vite.config.js from DEPLOYMENT_CHANGELOG.md
   - Remove server.js
   - Remove render-build script from package.json

3. **Redeploy on Netlify:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Set environment variables

## Contact Information

If issues persist:
1. Check GitHub repository for latest changes
2. Review all console errors in browser
3. Check hosting platform build logs
4. Verify Supabase project is active and accessible