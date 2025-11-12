# 🚀 Deploy to Production - Quick Start

**Time Required:** ~30 minutes  
**Cost:** Free tier available

---

## Step 1: Prepare Code (5 min)

```bash
# Commit all changes
git add .
git commit -m "Prepare for production deployment"
git push origin main

# Test build
npm run build
```

---

## Step 2: Create Vercel Project (5 min)

1. Go to https://vercel.com
2. Click "Add New..." → "Project"
3. Import: `awandres/gear-catalogue`
4. **Don't deploy yet!** Continue to step 3...

---

## Step 3: Add Environment Variables (10 min)

In Vercel, go to **Settings** → **Environment Variables** and add:

### Generate Keys First:

```bash
# Run these commands to generate secure keys:
openssl rand -base64 32  # For ADMIN_ACCESS_KEY
openssl rand -base64 32  # For CRON_SECRET
```

### Required Variables:

| Variable               | Value                                               |
| ---------------------- | --------------------------------------------------- |
| `ADMIN_ACCESS_KEY`     | Use first generated key ↑                           |
| `CRON_SECRET`          | Use second generated key ↑                          |
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` (update after deploy) |

**Note:** `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` will be auto-generated in next steps.

Select **"All Environments"** for each variable.

---

## Step 4: Set Up Database (5 min)

In Vercel project dashboard, go to **Storage** tab:

1. Click **"Create Database"** → **"Postgres"**
2. Choose your region
3. Click **"Create"**
4. ✅ `DATABASE_URL` automatically added!

---

## Step 5: Set Up Blob Storage (2 min)

Still in **Storage** tab:

1. Click **"Create Database"** → **"Blob"**
2. Click **"Create"**
3. ✅ `BLOB_READ_WRITE_TOKEN` automatically added!

---

## Step 6: Deploy! (3 min)

1. Click **"Deploy"**
2. Wait for build to complete
3. Copy your production URL (e.g., `https://gear-catalogue-abc123.vercel.app`)
4. Go to **Settings** → **Environment Variables**
5. Update `NEXT_PUBLIC_BASE_URL` with your actual URL
6. **Redeploy** (Deployments → ⋯ menu → "Redeploy")

---

## Step 7: Run Database Migrations (5 min)

On your local machine:

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Pull environment variables (gets DATABASE_URL)
vercel env pull .env.production

# Run migrations
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy

# Clean up (DON'T commit this file!)
rm .env.production
```

---

## Step 8: Seed Database (Optional, 2 min)

**Only if you want sample data:**

```bash
# Copy your DATABASE_URL from Vercel dashboard
# Then run:
DATABASE_URL="your-production-database-url-here" npm run db:seed
```

---

## Step 9: Test Your Deployment (5 min)

Visit your production URL and test:

- [ ] Homepage loads
- [ ] Can browse gear
- [ ] Search works
- [ ] Click "Admin" in header
- [ ] Enter your `ADMIN_ACCESS_KEY`
- [ ] Create a test gear item
- [ ] Upload an image
- [ ] Visit `/projects` page

✅ **You're live!**

---

## Troubleshooting

### Build Failed?

```bash
# Test locally first:
npm install
npm run build
```

### Can't Login to Admin?

- Double-check `ADMIN_ACCESS_KEY` in Vercel matches what you're entering
- Try incognito mode

### Database Connection Error?

- Verify Vercel Postgres was created
- Check `DATABASE_URL` exists in environment variables
- Try redeploying

### Images Not Uploading?

- Verify Vercel Blob Storage was created
- Check `BLOB_READ_WRITE_TOKEN` exists in environment variables

---

## Next Steps

- [ ] Bookmark your production URL
- [ ] Save admin key in password manager
- [ ] Share URL with team
- [ ] Consider setting up custom domain (optional)

---

## Need More Details?

See the complete guides:

- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Full documentation
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Detailed checklist
- **[ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)** - Variable reference

---

**Questions?** Check the troubleshooting section in `docs/DEPLOYMENT_GUIDE.md`
