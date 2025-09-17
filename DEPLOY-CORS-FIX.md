# CORS Fix Deployment Instructions

## Changes Made

1. **Enhanced CORS Configuration** with detailed logging
2. **Added manual OPTIONS preflight handler** as fallback
3. **Added CORS test endpoint** at `/api/cors-test`
4. **Fixed API URL configuration** to prevent double `/api/api/` paths

## Environment Variables Required on Render

Make sure these environment variables are set in your Render dashboard:

```
NODE_ENV=production
FRONTEND_URL=https://box-junu.vercel.app
MONGODB_URI=mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority
JWT_SECRET=boxcric_jwt_secret_key_super_secure_random_string_2024
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=boxcrick3@gmail.com
EMAIL_PASS=ckzy yjpt corp ljnb
EMAIL_FROM=BoxCric <boxcrick3@gmail.com>
CASHFREE_APP_ID=10273687cc0f80bdee21e4c30d68637201
CASHFREE_SECRET_KEY=cfsk_ma_prod_09c55cbdb72bc613fbf861ab777f8b7b_2bcc3b72
CASHFREE_API_URL=https://api.cashfree.com/pg
```

## Environment Variables Required on Vercel

Make sure this environment variable is set in your Vercel project settings:

```
VITE_API_URL=https://box-junu.onrender.com
```

## Deployment Steps

### 1. Deploy Backend (Render)
- Push this updated server code to your Git repository
- Render should auto-deploy the changes
- Check the Render logs for CORS debug messages

### 2. Deploy Frontend (Vercel)
- Make sure `VITE_API_URL=https://box-junu.onrender.com` is set in Vercel env vars
- Redeploy the frontend on Vercel

### 3. Test the Fix

After deployment, test these URLs in your browser:

1. **CORS Test Endpoint**: `https://box-junu.onrender.com/api/cors-test`
2. **Server Health**: `https://box-junu.onrender.com/api/test`
3. **Main API**: `https://box-junu.onrender.com/api/grounds?cityId=rajkot&page=1&limit=20`

### 4. Check Logs

Monitor the Render server logs for these messages:
- `🔍 CORS Check - Origin: https://box-junu.vercel.app`
- `✅ CORS: Origin allowed` or `✅ CORS: Vercel domain pattern matched`

If you see `❌ CORS: Origin not allowed`, then there's still an environment variable issue.

## Expected Result

After deployment, the frontend should:
- ✅ Load grounds data without CORS errors
- ✅ Show mobile search bar and notification bell when logged in
- ✅ Display proper API responses in console
- ❌ No more "No 'Access-Control-Allow-Origin' header" errors

## Troubleshooting

If CORS issues persist:

1. **Check Render Environment Variables**: Make sure `FRONTEND_URL=https://box-junu.vercel.app` is set
2. **Check Render Logs**: Look for the CORS debug messages
3. **Test Direct API Access**: Visit `https://box-junu.onrender.com/api/cors-test` directly
4. **Clear Browser Cache**: Hard refresh your Vercel site (Ctrl+Shift+R)

## Emergency Fallback

If issues persist, you can temporarily make CORS fully permissive by setting:
- In Render environment: `CORS_ORIGIN=*` (not recommended for production)

But the current configuration should work correctly with proper environment variables.