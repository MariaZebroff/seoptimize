# ✅ Vercel Deployment Checklist

## Before Deployment

- [ ] App works locally (`npm run dev`)
- [ ] All tests pass (if any)
- [ ] Environment variables are ready
- [ ] Code is pushed to GitHub
- [ ] Supabase project is configured

## During Deployment

- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Set environment variables in Vercel
- [ ] Deploy project
- [ ] Update Supabase settings for production

## After Deployment

- [ ] Test authentication flow
- [ ] Test site management
- [ ] Verify Google OAuth (if using)
- [ ] Check all pages load correctly
- [ ] Test on mobile devices

## Environment Variables Needed

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Supabase Settings to Update

- [ ] Site URL: `https://your-app.vercel.app`
- [ ] Redirect URLs: `https://your-app.vercel.app/**`
- [ ] Google OAuth redirect (if using)

## Quick Commands

```bash
# Build locally to test
npm run build

# Start production build locally
npm run start

# Check for TypeScript errors
npx tsc --noEmit
```
