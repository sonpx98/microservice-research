# Tarot Vercel Deployment Guide

## Environment Variables Setup

After deploying to Vercel, you need to set the following environment variable:

### Required for Module Federation Image Loading

1. Go to your Vercel project settings
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:

```
Name: VITE_TAROT_URL
Value: tarot-omega-six.vercel.app (or your actual Vercel domain)
```

**Important**: Do NOT include `https://` in the value. Just the domain name.

### Optional: Groq API Key

If you want to enable AI tarot reading features:

```
Name: VITE_GROQ_API_KEY
Value: your_groq_api_key_here
```

Get your free API key from: https://console.groq.com/keys

## Why VITE_TAROT_URL is needed?

When the tarot app is loaded via Module Federation from `portfolio-home`, it needs to know where to fetch the tarot card images from. 

- **Development**: Images are loaded from `http://localhost:5003/images/`
- **Production**: Images are loaded from `https://tarot-omega-six.vercel.app/images/`

Without this variable, the app will try to load images from `localhost` even in production, causing 404 errors.

## After Setting Environment Variables

1. Redeploy your app (or Vercel will auto-redeploy)
2. The tarot card images should now load correctly in Module Federation mode
