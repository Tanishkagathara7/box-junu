# Frontend API Connection Fix Guide

## Problem Summary
Your frontend (deployed on Vercel) cannot connect to your backend API (deployed on Render) due to:
1. ❌ Wrong API URL configuration
2. ❌ CORS policy blocking your Vercel domain
3. ❌ Missing environment variables

## ✅ Already Fixed
- Updated API URL from `boxcric-api.onrender.com` to `box-new.onrender.com`
- Created proper `.env` and `vercel.json` configuration files
- Built project with correct settings

## 🚨 Still Need to Fix

### 1. Update Backend CORS Settings
Your backend currently only allows these domains:
- `https://boxcric.netlify.app`
- `https://box-host.netlify.app`

But your frontend is at: `https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app`

**SOLUTION:** Add your Vercel URL to the backend's allowed origins.

### 2. Backend Environment Variables
Update your Render deployment environment variables to include:
```
FRONTEND_URL=https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app
```

## 🛠️ Immediate Fix Steps

### Step 1: Update Backend CORS (On Render)
1. Go to your Render dashboard
2. Open your `box-new` service  
3. Go to Environment tab
4. Add or update: `FRONTEND_URL=https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app`
5. Redeploy the service

### Step 2: Alternative - Update Backend Code
If you can't access Render dashboard, update the server code:

In `server/index.js`, around lines 53-59, change:
```javascript
origin: process.env.NODE_ENV === 'production' 
  ? [
      process.env.FRONTEND_URL,
      'https://boxcric.netlify.app',
      'https://box-host.netlify.app',
      'https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app', // ADD THIS LINE
      '*'
    ]
```

### Step 3: Redeploy Frontend
After backend is updated:
```bash
npm run build
# Then redeploy to Vercel
```

## 🧪 Test the Fix

1. Open `test-api-connection.html` in your browser
2. Check browser console for errors
3. Verify API calls succeed

## 🔍 Debug Information

**Your URLs:**
- Frontend: https://box-9t8s1yy3n-tanishs-projects-fa8014b4.vercel.app
- Backend API: https://box-new.onrender.com/api
- Backend Root: https://box-new.onrender.com

**Expected API Response:**
```json
{
  "success": true,
  "grounds": [...]
}
```

## 📞 If Still Not Working

1. Check browser Network tab for actual error messages
2. Verify backend logs on Render
3. Confirm environment variables are set correctly
4. Test API directly: https://box-new.onrender.com/api/grounds

---

**Next Steps After Fix:**
1. Your grounds should load properly
2. User authentication should work
3. Booking functionality should be restored
