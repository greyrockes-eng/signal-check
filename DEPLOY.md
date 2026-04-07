# Signal Check - Deploy Guide

## Quick Deploy (2 minutes)

### Step 1: Open Terminal
Open a terminal and navigate to this folder:
```
cd "Signal check/signal-check"
```

### Step 2: Install & Deploy
```
npm install
npx vercel
```

It will ask you a few questions:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your team (greyrockes-eng's projects)
- **Link to existing project?** → No
- **Project name?** → signal-check
- **Directory?** → ./
- **Override settings?** → No

### Step 3: Go to Production
After the preview deploys successfully:
```
npx vercel --prod
```

That's it! You'll get a live URL like `signal-check.vercel.app`

## Environment Variables (already in vercel.json)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## AI News Aggregation
The Supabase Edge Function is already deployed. To trigger it:
```
curl -X POST https://kxcpvhviisevixuvmztw.supabase.co/functions/v1/aggregate-news
```

For full news API access, add a NEWS_API_KEY secret in your Supabase dashboard:
1. Go to https://supabase.com/dashboard/project/kxcpvhviisevixuvmztw/settings/functions
2. Add secret: NEWS_API_KEY = (get free key from newsapi.org)
