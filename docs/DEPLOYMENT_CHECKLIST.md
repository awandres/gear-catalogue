# Deployment Checklist

Use this checklist to ensure you complete all deployment steps.

## Pre-Deployment

- [ ] All local changes committed to git
- [ ] All changes pushed to GitHub
- [ ] `npm run build` succeeds locally
- [ ] Environment variables documented in `env.template`

## Vercel Setup

- [ ] GitHub repository imported to Vercel
- [ ] Project created in Vercel dashboard

## Database Setup

Choose one:

### Option A: Vercel Postgres

- [ ] Created Vercel Postgres database
- [ ] `DATABASE_URL` automatically added to environment variables

### Option B: Supabase

- [ ] Created Supabase project
- [ ] Copied connection string
- [ ] Added `DATABASE_URL` to Vercel environment variables

## Environment Variables

Add these to Vercel (Settings → Environment Variables):

- [ ] `DATABASE_URL` - From Vercel Postgres or Supabase
- [ ] `ADMIN_ACCESS_KEY` - Generate with: `openssl rand -base64 32`
- [ ] `BLOB_READ_WRITE_TOKEN` - Auto-generated from Vercel Blob Storage
- [ ] `CRON_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `NEXT_PUBLIC_BASE_URL` - Your Vercel URL (e.g., `https://your-app.vercel.app`)

### Optional (for image search):

- [ ] `GOOGLE_CSE_API_KEY` - From Google Cloud Console
- [ ] `GOOGLE_CSE_ID` - From Google Custom Search Engine

## Storage Setup

- [ ] Created Vercel Blob Storage
- [ ] `BLOB_READ_WRITE_TOKEN` automatically added

## Initial Deployment

- [ ] Clicked "Deploy" in Vercel
- [ ] Deployment succeeded
- [ ] Copied production URL
- [ ] Updated `NEXT_PUBLIC_BASE_URL` with production URL
- [ ] Redeployed with correct URL

## Database Migration

Choose one method:

### Method 1: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy
rm .env.production
```

- [ ] Installed Vercel CLI
- [ ] Pulled environment variables
- [ ] Ran migrations
- [ ] Deleted `.env.production` file

### Method 2: Direct Connection

```bash
export DATABASE_URL="your-production-url"
npx prisma migrate deploy
unset DATABASE_URL
```

- [ ] Set temporary DATABASE_URL
- [ ] Ran migrations
- [ ] Unset DATABASE_URL

### Method 3: Supabase SQL Editor

- [ ] Opened Supabase SQL Editor
- [ ] Ran each migration file in order

## Database Seeding (Optional)

Only if you want sample data:

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

- [ ] Seeded database with sample gear items
- [ ] Verified data in Prisma Studio or Supabase dashboard

## Testing

- [ ] Visited production URL
- [ ] Homepage loads correctly
- [ ] Can browse gear items
- [ ] Search works
- [ ] Filters work
- [ ] Gear detail pages load
- [ ] Admin mode accessible
- [ ] Can login to admin (using `ADMIN_ACCESS_KEY`)
- [ ] Can create new gear item
- [ ] Can upload images
- [ ] Projects page works
- [ ] Can create and view projects

## Cron Jobs

- [ ] Verified cron job configured in Vercel Settings → Cron Jobs
- [ ] Cron job shows: "Daily Gear Images" at `0 2 * * *`

## Security

- [ ] `ADMIN_ACCESS_KEY` stored in password manager
- [ ] Shared admin key securely with team (if needed)
- [ ] Verified `.env.local`, `.env`, `.env.backup` are in `.gitignore`
- [ ] Confirmed no secrets committed to git
- [ ] Reviewed Vercel project access permissions

## Optional Enhancements

- [ ] Custom domain configured
- [ ] Google Custom Search API configured
- [ ] DNS records updated for custom domain
- [ ] SSL certificate verified (automatic with Vercel)

## Post-Deployment Monitoring

- [ ] Checked Vercel logs for errors
- [ ] Set up Vercel notifications (optional)
- [ ] Bookmarked production URL
- [ ] Documented production URL in team wiki/docs

## Share with Team

- [ ] Shared production URL with Sam Huff: [[memory:10769045]]
- [ ] Shared admin access key securely
- [ ] Updated `PROJECT.md` with production URL
- [ ] Notified team of successful deployment

---

## Quick Command Reference

**Generate secure keys:**

```bash
openssl rand -base64 32
```

**Test build locally:**

```bash
npm run build
npm run start
```

**View production database:**

```bash
DATABASE_URL="your-production-url" npx prisma studio
```

**Check deployment status:**

```bash
vercel --prod
```

---

**Deployment Date:** ********\_********  
**Production URL:** ********\_********  
**Deployed By:** ********\_********
