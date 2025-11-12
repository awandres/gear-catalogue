# Deployment Guide - Gear Catalogue App

## 🚀 Quick Overview

This guide will walk you through deploying the Gear Catalogue App to production on Vercel with a PostgreSQL database.

**Estimated Time:** 30-45 minutes  
**Cost:** Free tier available (Vercel Hobby + Vercel Postgres/Supabase)

---

## Prerequisites

- [ ] GitHub account with access to https://github.com/awandres/gear-catalogue
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] All local changes committed and pushed to GitHub
- [ ] Your local `.env.local` file with current configuration

---

## Part 1: Pre-Deployment Checklist

### 1.1 Commit All Changes

You currently have many uncommitted changes. Let's commit them:

```bash
# Review what's changed
git status

# Add all new files and changes
git add .

# Commit with a descriptive message
git commit -m "Prepare for production deployment - Add projects, admin features, and image management"

# Push to GitHub
git push origin main
```

### 1.2 Verify Build Locally

Test that your app builds successfully:

```bash
# Clean install
npm install

# Build the app
npm run build

# If successful, test the production build locally
npm run start
```

If the build fails, fix any errors before proceeding.

---

## Part 2: Database Setup

You have two excellent options for production PostgreSQL:

### Option A: Vercel Postgres (Recommended - Easiest)

**Pros:** Integrated with Vercel, automatic connection, generous free tier  
**Cons:** Locked to Vercel ecosystem

**Pricing:** Free tier includes 256MB storage, 60 hours compute/month

### Option B: Supabase (Recommended - Most Flexible)

**Pros:** Full PostgreSQL access, generous free tier, can migrate away from Vercel easily  
**Cons:** Requires manual connection string setup

**Pricing:** Free tier includes 500MB database, unlimited API requests

---

## Part 3: Deploy to Vercel

### 3.1 Create New Project

1. Go to https://vercel.com
2. Click **"Add New..." → "Project"**
3. Import your GitHub repository: `awandres/gear-catalogue`
4. Configure your project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)

### 3.2 Set Environment Variables

**Before deploying**, click **"Environment Variables"** and add these:

#### Required Variables:

| Variable                | Value                         | How to Get                             |
| ----------------------- | ----------------------------- | -------------------------------------- |
| `DATABASE_URL`          | See database setup below      | From Vercel Postgres or Supabase       |
| `ADMIN_ACCESS_KEY`      | Strong random string          | Generate: `openssl rand -base64 32`    |
| `BLOB_READ_WRITE_TOKEN` | Auto-generated                | Enable Vercel Blob Storage (see below) |
| `CRON_SECRET`           | Strong random string          | Generate: `openssl rand -base64 32`    |
| `NEXT_PUBLIC_BASE_URL`  | `https://your-app.vercel.app` | Will be shown after deployment         |

#### Optional Variables (for image search):

| Variable             | Value                 | Notes                          |
| -------------------- | --------------------- | ------------------------------ |
| `GOOGLE_CSE_API_KEY` | Your Google API key   | See `docs/GOOGLE_CSE_SETUP.md` |
| `GOOGLE_CSE_ID`      | Your search engine ID | See `docs/GOOGLE_CSE_SETUP.md` |

**Important:** Select **"All Environments"** (Production, Preview, Development) for each variable.

### 3.3 Set Up Database

#### If Using Vercel Postgres:

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → **"Postgres"**
3. Choose your region (closest to your users)
4. Click **"Create"**
5. Vercel will automatically add `DATABASE_URL` to your environment variables
6. ✅ Database is ready!

#### If Using Supabase:

1. Go to https://supabase.com and create a new project
2. Wait for the database to provision (~2 minutes)
3. Go to **Project Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Replace `[YOUR-PASSWORD]` with your database password
6. Add this as `DATABASE_URL` in Vercel environment variables

### 3.4 Set Up Blob Storage (for image uploads)

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → **"Blob"**
3. Click **"Create"**
4. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables
5. ✅ Blob storage is ready!

### 3.5 Generate Admin Key

On your local machine, generate a secure admin key:

```bash
openssl rand -base64 32
```

Copy the output and add it as `ADMIN_ACCESS_KEY` in Vercel.

### 3.6 Generate Cron Secret

Generate another secure secret:

```bash
openssl rand -base64 32
```

Copy the output and add it as `CRON_SECRET` in Vercel.

### 3.7 Deploy!

1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. Once deployed, copy your production URL (e.g., `https://gear-catalogue-app.vercel.app`)
4. Go back to **Settings** → **Environment Variables**
5. Update `NEXT_PUBLIC_BASE_URL` with your actual production URL
6. Redeploy (Deployments → ⋯ menu → "Redeploy")

---

## Part 4: Database Migration & Seeding

### 4.1 Run Migrations

You need to run Prisma migrations on your production database:

**Option A: Using Vercel CLI (Recommended)**

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables (including DATABASE_URL)
vercel env pull .env.production

# Run migration (note: removes quotes from DATABASE_URL)
DATABASE_URL=$(grep DATABASE_URL .env.production | head -1 | cut -d '=' -f2- | sed 's/"//g') npx prisma migrate deploy

# Delete the .env.production file (don't commit it!)
rm .env.production
```

**Option B: Using Supabase Dashboard**

If using Supabase, you can run migrations through their SQL editor:

1. Go to your Supabase project
2. Click **SQL Editor**
3. Copy the contents of each migration file from `prisma/migrations/*/migration.sql`
4. Run them in order

**Option C: Temporary Local Connection**

```bash
# Temporarily set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Unset the variable
unset DATABASE_URL
```

### 4.2 Seed the Database (Optional)

If you want to populate your production database with sample data:

```bash
# Using the same DATABASE_URL from above
DATABASE_URL="your-production-database-url" npm run db:seed
```

**⚠️ Warning:** Only do this on initial deployment. Don't seed a database with existing data!

### 4.3 Verify Database

Check that your tables were created:

**Using Prisma Studio:**

```bash
DATABASE_URL="your-production-database-url" npx prisma studio
```

**Using Supabase Dashboard:**

- Go to **Table Editor** tab to see your tables

---

## Part 5: Configure Cron Jobs

Your app has a daily cron job for fetching gear images. Enable it in Vercel:

1. The `vercel.json` file already configures the cron job
2. Vercel will automatically detect and enable it on Hobby/Pro plans
3. To verify, go to your project → **Settings** → **Cron Jobs**
4. You should see: `Daily Gear Images` running at `0 2 * * *` (2 AM daily)

**Note:** Cron jobs are only available on Vercel Hobby plan (free) and above.

---

## Part 6: Test Your Deployment

### 6.1 Basic Functionality

1. Visit your production URL
2. Browse gear items
3. Use search and filters
4. View a gear detail page

### 6.2 Admin Functionality

1. Click "Admin" in the header
2. Enter your `ADMIN_ACCESS_KEY` when prompted
3. Try creating a new gear item
4. Test image upload
5. Verify everything saves correctly

### 6.3 Projects Feature

1. Navigate to `/projects`
2. Create a test project
3. Add gear to the project
4. Verify the project displays correctly

---

## Part 7: Post-Deployment Configuration

### 7.1 Custom Domain (Optional)

1. In Vercel project → **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_BASE_URL` environment variable with your custom domain
5. Redeploy

### 7.2 Update Admin Key

Store your `ADMIN_ACCESS_KEY` securely:

- Use a password manager
- Share securely with Sam Huff if needed (use a secure method like 1Password shared vault)

### 7.3 Enable Google Image Search (Optional)

If you want automatic gear image fetching:

1. Follow instructions in `docs/GOOGLE_CSE_SETUP.md`
2. Add `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_ID` to Vercel environment variables
3. Redeploy
4. The cron job will automatically fetch images daily

---

## Part 8: Monitoring & Maintenance

### 8.1 View Logs

Monitor your app's health:

1. Vercel Dashboard → Your Project → **Logs**
2. Filter by time range and severity
3. Look for errors or warnings

### 8.2 Database Backups

**Vercel Postgres:**

- Automatic backups on paid plans
- Free tier: manual exports only

**Supabase:**

- Daily backups on all plans (retained 7 days on free tier)
- Go to **Database** → **Backups** to restore

### 8.3 Update Checklist

When making changes:

1. Test locally first
2. Commit and push to GitHub
3. If database schema changed, run migrations on production
4. Vercel auto-deploys on push to main branch
5. Verify deployment in Vercel dashboard

---

## Troubleshooting

### Build Fails

**Error:** `Module not found` or `Type error`

**Solution:**

```bash
# Locally, clear everything and rebuild
rm -rf node_modules .next
npm install
npm run build
```

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**

- Check `DATABASE_URL` format in Vercel environment variables
- Ensure database is accessible from internet (check firewall rules)
- Verify credentials are correct
- For Supabase, use "Transaction" mode connection string

### Images Not Uploading

**Error:** `Blob storage error`

**Solution:**

- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check token has write permissions
- Ensure Vercel Blob storage is enabled

### Admin Login Not Working

**Error:** `Unauthorized`

**Solution:**

- Double-check `ADMIN_ACCESS_KEY` matches in Vercel and your local copy
- Clear browser cache
- Try in incognito mode

### Cron Job Not Running

**Solution:**

- Verify you're on Vercel Hobby plan or higher
- Check cron job is enabled in Settings → Cron Jobs
- Verify `CRON_SECRET` environment variable is set
- Check logs for any errors

---

## Production URLs

After deployment, your app will be available at:

- **Production:** `https://gear-catalogue-app.vercel.app` (or your custom domain)
- **Admin Panel:** `https://your-url.vercel.app` → Click "Admin" in header
- **Projects:** `https://your-url.vercel.app/projects`
- **API:** `https://your-url.vercel.app/api/*`

---

## Security Checklist

- [ ] `ADMIN_ACCESS_KEY` is strong and secure (32+ characters)
- [ ] `CRON_SECRET` is strong and secure
- [ ] `.env.local`, `.env`, and `.env.backup` are NOT committed to git
- [ ] Database credentials are secure
- [ ] Only trusted team members have Vercel project access
- [ ] Admin key is stored in password manager

---

## Cost Estimate

**Free Tier (Recommended for Starting):**

- Vercel Hobby: Free

  - 100GB bandwidth/month
  - Serverless functions
  - Automatic HTTPS
  - Custom domains

- Vercel Postgres: Free

  - 256MB storage
  - 60 compute hours/month
  - (Alternative: Supabase free tier: 500MB)

- Vercel Blob Storage: Free
  - 10GB storage
  - 100GB bandwidth/month

**This should easily handle:**

- Thousands of page views/month
- Hundreds of gear items
- Dozens of concurrent users

---

## Need Help?

- **Vercel Documentation:** https://vercel.com/docs
- **Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
- **Project Documentation:** See `PROJECT.md` and other files in `/docs`

---

## Quick Reference: Environment Variables

Copy your values from `.env.local` and add them to Vercel:

```bash
# View your current local environment variables (DO NOT share these!)
cat .env.local
```

Then manually copy each variable to Vercel dashboard under Settings → Environment Variables.

**Remember:** NEVER commit your `.env.local`, `.env`, or `.env.backup` files to git!

---

**Last Updated:** November 11, 2024  
**Deployment Platform:** Vercel  
**Database:** PostgreSQL (Vercel Postgres or Supabase)
