# Payment Redirect and Status Fix Summary

## Issues Fixed

### 1. **Wrong Redirect URL** ❌ → ✅
**Problem**: Payment callbacks were redirecting to `box-cash.vercel.app` instead of `box-junu.vercel.app`

**Files Fixed**:
- `server/routes/payments.js` - Line 230: Updated return_url
- `.env.production` - Line 6: Updated FRONTEND_URL
- `src/lib/api.ts` - Line 5: Updated API fallback URL

### 2. **CORS Settings** ❌ → ✅
**Problem**: Backend wasn't allowing requests from `box-junu.vercel.app`

**Files Fixed**:
- `server/index.js` - Lines 43-44, 83-84: Added `box-junu.vercel.app` to allowed origins

### 3. **Payment Status Handling** ❌ → ✅
**Problem**: Cancelled payments showing as "ACTIVE" instead of "FAILED"

**Files Fixed**:
- `src/pages/PaymentCallback.tsx` - Lines 118-138: Enhanced status mapping logic
- `server/routes/payments.js` - Lines 556-564: Added more cancellation status codes

## Changes Made

### Backend Changes (`server/routes/payments.js`)
```javascript
// OLD
return_url: `https://box-cash.vercel.app/payment/callback?booking_id=${booking._id}`,

// NEW
return_url: `https://box-junu.vercel.app/payment/callback?booking_id=${booking._id}`,
```

### Environment Configuration (`.env.production`)
```bash
# OLD
FRONTEND_URL=https://box-cash.vercel.app

# NEW
FRONTEND_URL=https://box-junu.vercel.app
```

### API Configuration (`src/lib/api.ts`)
```javascript
// OLD
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://box-cash.onrender.com/api";

// NEW
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://box-junu.onrender.com/api";
```

### CORS Settings (`server/index.js`)
```javascript
// Added to both Socket.IO and Express CORS configurations
'https://box-junu.vercel.app'
```

### Payment Status Mapping (`src/pages/PaymentCallback.tsx`)
```javascript
// Enhanced to handle ACTIVE status and check for cancellation parameters
const mapCashfreeStatus = (status: string): string => {
  const statusUpper = status.toUpperCase();
  if (["SUCCESS", "PAID", "COMPLETED"].includes(statusUpper)) {
    return "SUCCESS";
  } else if (["FAILED", "CANCELLED", "EXPIRED", "TERMINATED", "USER_DROPPED"].includes(statusUpper)) {
    return "FAILED";
  } else if (["PENDING"].includes(statusUpper)) {
    return "PENDING";
  } else if (["ACTIVE"].includes(statusUpper)) {
    // Check URL parameters for cancellation
    const urlParams = new URLSearchParams(window.location.search);
    const txStatus = urlParams.get('txStatus');
    if (txStatus && ["CANCELLED", "FAILED", "USER_DROPPED"].includes(txStatus.toUpperCase())) {
      return "FAILED";
    }
    return "PENDING";
  }
  return statusUpper;
};
```

### Webhook Handler (`server/routes/payments.js`)
```javascript
// OLD
} else if (order_status === 'EXPIRED' || order_status === 'FAILED') {

// NEW
} else if (['EXPIRED', 'FAILED', 'CANCELLED', 'TERMINATED', 'USER_DROPPED'].includes(order_status)) {
```

## Current URL Configuration

### ✅ Correct URLs Now
- **Frontend**: `https://box-junu.vercel.app`
- **Backend API**: `https://box-junu.onrender.com/api`
- **Payment Return URL**: `https://box-junu.vercel.app/payment/callback?booking_id={id}`
- **Payment Webhook**: `https://box-junu.onrender.com/api/payments/webhook`

## Next Steps

1. **Deploy Backend**: Push changes to trigger Render deployment
2. **Deploy Frontend**: Redeploy Vercel to pick up new environment variables
3. **Test Payment Flow**: 
   - Try a successful payment
   - Try cancelling a payment
   - Verify correct redirects and status display

## Testing Checklist

- [ ] Successful payment redirects to `box-junu.vercel.app`
- [ ] Cancelled payment shows "FAILED" status instead of "ACTIVE"
- [ ] Cancelled payment redirects to `box-junu.vercel.app` (not `box-cash.vercel.app`)
- [ ] Payment webhook receives notifications correctly
- [ ] CORS allows requests from new domain

## Deployment Commands

```bash
# Backend (if using Git deployment)
git add .
git commit -m "Fix payment redirects and status handling"
git push origin main

# Frontend (Vercel)
# Redeploy through Vercel dashboard or:
vercel --prod
```
