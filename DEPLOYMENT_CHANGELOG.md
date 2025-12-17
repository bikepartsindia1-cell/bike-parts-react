# Deployment Changes Changelog

This file tracks all changes made for deployment configurations to help with troubleshooting and reverting if needed.

## Changes Made for Render Deployment

### 1. Added Express Server (server.js)
**Date**: Current session
**Purpose**: Fix "No open ports detected" error on Render
**Files**: `server.js` (new file)
**Changes**:
- Created Express server to serve built Vite application
- Serves static files from `dist` directory
- Handles client-side routing for React Router
- Binds to `0.0.0.0` on PORT environment variable
- Added error handling for missing dist directory and port conflicts

### 2. Updated package.json Scripts
**Date**: Current session
**Purpose**: Add proper build command for Render
**Files**: `package.json`
**Changes**:
- Added `"render-build": "npm install && npm run build"` script
- Kept existing `"start": "node server.js"` script

### 3. Updated vite.config.js for Host Allowlist
**Date**: Current session
**Purpose**: Fix Vite host blocking error on Render
**Files**: `vite.config.js`
**Changes**:
- Added `preview.allowedHosts` configuration
- Allowed `bike-parts-react.onrender.com` and `.onrender.com`
- Added `server.host: true` for external connections

## Render Configuration Settings

### Build & Deploy Settings:
- **Build Command**: `npm run render-build`
- **Start Command**: `npm start`
- **Node Version**: 18 or 20
- **Publish Directory**: (leave empty)

### Required Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Netlify Configuration (Previous Working Setup)

### Build Settings:
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18 or 20

### Environment Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Revert Instructions

### To Revert Render Changes:
1. Delete `server.js` file
2. Remove `"render-build"` script from `package.json`
3. Revert `vite.config.js` to remove `preview.allowedHosts` and `server` configurations
4. Use original Netlify deployment method

### Original vite.config.js (before Render changes):
```javascript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
        env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
      ),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(
        env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
      ),
    },
    envPrefix: 'VITE_',
  }
})
```

## Known Issues

### Supabase Connection Issues:
- Environment variables must be prefixed with `VITE_` for Vite to expose them
- Variables must be set in hosting platform's environment settings
- Check browser console for actual environment variable values
- Verify Supabase URL and key are correct in hosting platform

### Troubleshooting Steps:
1. Check environment variables in hosting platform dashboard
2. Verify build logs for any environment variable warnings
3. Test Supabase connection in browser console
4. Check network tab for failed API requests