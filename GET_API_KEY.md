# 🔑 How to Get Your AudD API Key

## 🎯 Your Current Situation

The API key in your `.env.local` has reached its limit. I've updated it to use `"test"` mode, which allows limited testing.

---

## ✅ **Option 1: Test with Demo Mode (No API Key Needed)**

1. Refresh your browser at http://localhost:3000
2. Click **"Try Demo Track"** button
3. This works without any API key!
4. Perfect for testing the UI and features

---

## 🆓 **Option 2: Get 300 Free Requests**

### Step 1: Register for Free
1. Go to: **https://audd.io/#signup**
2. Enter your email address
3. Click "Sign Up"

### Step 2: Check Your Email
1. Open your email inbox
2. Look for email from AudD
3. Click the verification link
4. This activates your 300 free requests

### Step 3: Get Your API Token
1. Go to: **https://dashboard.audd.io**
2. Log in with your email
3. Find your API token on the dashboard
4. Copy it

### Step 4: Update Your .env.local
Replace the current token in `.env.local`:

```env
AUDD_API_TOKEN="your-new-token-here"
```

### Step 5: Restart Server
Stop and restart the dev server to load the new token.

---

## 🔄 **Option 3: Check Your Existing Key**

If you already registered at https://audd.io:

1. **Check your email** for verification link
2. Click the verification link to activate
3. Go to **https://dashboard.audd.io**
4. Your old key should now have 300 requests available
5. If it works, you can update `.env.local` back to your old key

---

## 💡 **For Vercel Deployment**

When you deploy to Vercel, you'll need to:

### Option A: Use Your Own Key (Recommended)
1. Get a fresh API key from https://audd.io
2. Add it as environment variable in Vercel:
   ```
   AUDD_API_TOKEN = your-new-token
   ```

### Option B: Use "test" Mode
1. Set environment variable in Vercel:
   ```
   AUDD_API_TOKEN = test
   ```
2. This gives limited demo functionality
3. Users can still use "Try Demo Track" feature

### Option C: Let Users Add Their Own Keys
1. Your app already has a Settings modal!
2. Users can click the "API Config" button in the navbar
3. They can enter their own AudD API keys
4. This is great for power users

---

## 🎵 **What Works Without API Key?**

Even with `"test"` token, your app still has:

- ✅ **Demo Track Recognition** - Built-in demo mode
- ✅ **Text Search** - Uses iTunes API (free)
- ✅ **Popular Charts** - Uses iTunes API (free)
- ✅ **Audio Visualizer** - Client-side feature
- ✅ **File Upload UI** - Upload works, but recognition limited
- ✅ **Settings Modal** - Users can add their own keys

---

## 📊 **API Key Limits**

### Free Tier (After Email Verification)
- **Requests:** 300 free
- **Cost:** $0
- **Duration:** No expiration
- **Speed:** Fast recognition

### Paid Tiers (If You Need More)
Visit https://dashboard.audd.io/pricing for:
- Monthly subscriptions
- Pay-as-you-go
- Enterprise plans

---

## 🚀 **Current Status**

Your `.env.local` now has:
```env
AUDD_API_TOKEN="test"
```

**What This Means:**
- ✅ Demo mode works
- ✅ Search works (iTunes)
- ✅ Popular charts work
- ✅ UI fully functional
- ⚠️ Limited live recognition
- ✅ Users can add their own keys via Settings

**Server Status:** ✅ Running on http://localhost:3000

---

## ✨ **Recommendation for Deployment**

1. **For Development/Testing:**
   - Use "test" token (current setup)
   - Use Demo Mode
   - Use search functionality

2. **For Production:**
   - Get your own API key (300 free)
   - Add to Vercel environment variables
   - Let users add their own keys if they want more requests

3. **For Public Launch:**
   - Consider paid plan if you expect high traffic
   - Or build a "Bring Your Own Key" feature (already built!)
   - Monitor usage at https://dashboard.audd.io

---

## 🎉 **You're Still Ready to Deploy!**

Even with "test" token, your app is fully functional and can be deployed to Vercel. The Demo Mode works great for showcasing the app!

---

**Quick Links:**
- Sign Up: https://audd.io/#signup
- Dashboard: https://dashboard.audd.io
- Pricing: https://dashboard.audd.io/pricing
- Documentation: https://docs.audd.io

**Test Now:** http://localhost:3000 (Click "Try Demo Track")
