# Environment Variables Reference

This document explains all environment variables used in the Gear Catalogue App.

## Quick Setup

1. **Local Development:** Copy `env.template` to `.env.local` and fill in values
2. **Production:** Add these variables to Vercel Dashboard (Settings → Environment Variables)

---

## Required Variables

### `DATABASE_URL`

**Purpose:** PostgreSQL database connection string

**Local Development:**

```env
DATABASE_URL="postgresql://username@localhost:5432/gear_catalog?schema=public"
```

**Production Options:**

**Vercel Postgres** (auto-generated):

```env
DATABASE_URL="postgres://default:xxx@xxx-pooler.postgres.vercel-storage.com:5432/verceldb"
```

**Supabase:**

```env
DATABASE_URL="postgresql://postgres.[PROJECT]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

**Used in:**

- All database operations via Prisma
- All API routes that access data

---

### `ADMIN_ACCESS_KEY`

**Purpose:** Authentication key for admin operations (CRUD, image management)

**How to Generate:**

```bash
openssl rand -base64 32
```

**Example:**

```env
ADMIN_ACCESS_KEY="xK7mP9vR2nQ4tY8wE1sA5bC6dF3gH0jL9mN8oP7qR6s="
```

**Security Notes:**

- Use a strong, randomly generated key (32+ characters)
- Different keys for development and production
- Store in password manager
- Never commit to git

**Used in:**

- Admin login (`/src/contexts/AdminContext.tsx`)
- Protected API routes (`/src/lib/admin.ts`)
- All CRUD operations
- Image upload/delete operations

---

### `BLOB_READ_WRITE_TOKEN`

**Purpose:** Vercel Blob Storage authentication for image uploads

**How to Get:**

1. Enable Vercel Blob Storage in your project
2. Token is auto-generated and added to environment variables

**Example:**

```env
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_abc123xyz789"
```

**Local Development:**

- Can be left empty (uses placeholder images)
- Or use Vercel Blob token from your project

**Used in:**

- Image upload API (`/src/app/api/gear/[id]/images/upload/route.ts`)
- Image delete API
- Admin toolbar image operations

---

### `CRON_SECRET`

**Purpose:** Protects cron job endpoints from unauthorized access

**How to Generate:**

```bash
openssl rand -base64 32
```

**Example:**

```env
CRON_SECRET="aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5="
```

**Security Notes:**

- Use a different secret than `ADMIN_ACCESS_KEY`
- Vercel Cron automatically includes this in requests

**Used in:**

- Daily image fetch cron (`/src/app/api/cron/daily-images/route.ts`)

---

### `NEXT_PUBLIC_BASE_URL`

**Purpose:** Base URL for your application (used in cron jobs and API calls)

**Local Development:**

```env
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

**Production:**

```env
NEXT_PUBLIC_BASE_URL="https://gear-catalogue-app.vercel.app"
```

**Notes:**

- Must start with `http://` or `https://`
- No trailing slash
- Update after getting your Vercel URL

**Used in:**

- Cron job API calls
- Bulk upload image processing
- Internal API requests

---

## Optional Variables

### `GOOGLE_CSE_API_KEY`

**Purpose:** Google Custom Search API for automatic gear image fetching

**How to Get:**

1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable "Custom Search API"
4. Create credentials → API Key

**Example:**

```env
GOOGLE_CSE_API_KEY="AIzaSyAbC123XyZ789-dEfGhIjKlMnOpQrStUvWx"
```

**Setup Guide:** See `docs/GOOGLE_CSE_SETUP.md`

**Used in:**

- Image fetch API (`/src/app/api/gear/[id]/fetch-image/route.ts`)
- Automatic image search
- Cron job for daily image updates

**Free Tier:** 100 searches/day

---

### `GOOGLE_CSE_ID`

**Purpose:** Custom Search Engine ID (companion to `GOOGLE_CSE_API_KEY`)

**How to Get:**

1. Go to https://cse.google.com/cse/
2. Create a search engine
3. Configure to search entire web
4. Copy the Search Engine ID

**Example:**

```env
GOOGLE_CSE_ID="a1b2c3d4e5f6g7h8i9"
```

**Used in:**

- Same as `GOOGLE_CSE_API_KEY`
- Both required for Google Image Search to work

---

### `UNSPLASH_ACCESS_KEY`

**Purpose:** Unsplash API for high-quality stock images (alternative to Google)

**How to Get:**

1. Go to https://unsplash.com/developers
2. Create a new application
3. Copy your Access Key

**Example:**

```env
UNSPLASH_ACCESS_KEY="xyz789abc123def456ghi789jkl012mno345pqr678"
```

**Used in:**

- Image fetch script (`scripts/fetch-gear-images.ts`)

**Free Tier:** 50 requests/hour

---

## Environment-Specific Setup

### Local Development (.env.local)

```env
# Database
DATABASE_URL="postgresql://yourusername@localhost:5432/gear_catalog?schema=public"

# Admin (use a simple key for dev)
ADMIN_ACCESS_KEY="dev-admin-key-123"

# Blob Storage (optional, can leave empty)
BLOB_READ_WRITE_TOKEN=""

# Cron (simple key for dev)
CRON_SECRET="dev-cron-secret-123"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Optional: Image search
GOOGLE_CSE_API_KEY=""
GOOGLE_CSE_ID=""
```

### Production (Vercel Dashboard)

```env
# Database (from Vercel Postgres or Supabase)
DATABASE_URL="postgres://default:xxx@xxx.postgres.vercel-storage.com:5432/verceldb"

# Admin (STRONG random key)
ADMIN_ACCESS_KEY="xK7mP9vR2nQ4tY8wE1sA5bC6dF3gH0jL9mN8oP7qR6s="

# Blob Storage (auto-generated)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxx"

# Cron (STRONG random key)
CRON_SECRET="aB3cD4eF5gH6iJ7kL8mN9oP0qR1sT2uV3wX4yZ5="

# Base URL (your actual URL)
NEXT_PUBLIC_BASE_URL="https://gear-catalogue-app.vercel.app"

# Optional: Image search
GOOGLE_CSE_API_KEY="AIzaSyAbC123XyZ789..."
GOOGLE_CSE_ID="a1b2c3d4e5f6g7h8i9"
```

---

## Troubleshooting

### Database Connection Failed

**Error:** `Can't reach database server`

**Check:**

- Is `DATABASE_URL` formatted correctly?
- For Supabase, use "Transaction" mode connection string
- Is database accessible from internet?
- Are credentials correct?

### Admin Login Not Working

**Error:** `Unauthorized` or `Invalid admin key`

**Check:**

- Is `ADMIN_ACCESS_KEY` set in Vercel?
- Does it match the key you're using?
- Clear browser cache and try again
- Check browser console for errors

### Image Upload Failing

**Error:** `Blob storage error`

**Check:**

- Is `BLOB_READ_WRITE_TOKEN` set?
- Is Vercel Blob Storage enabled in your project?
- Does token have write permissions?

### Cron Job Not Running

**Error:** Cron job fails or doesn't execute

**Check:**

- Is `CRON_SECRET` set in Vercel?
- Is cron job enabled in Vercel Settings → Cron Jobs?
- Are you on Vercel Hobby plan or higher?
- Check `NEXT_PUBLIC_BASE_URL` is correct

### Image Search Not Working

**Error:** Images not found or API errors

**Check:**

- Are `GOOGLE_CSE_API_KEY` and `GOOGLE_CSE_ID` both set?
- Have you exceeded your daily quota (100 searches/day)?
- Is Custom Search API enabled in Google Cloud Console?
- Is search engine configured to search entire web?

---

## Security Best Practices

1. **Never commit `.env.local`, `.env`, or `.env.backup` to git**

   - These files are in `.gitignore` by default
   - Use `env.template` for documentation only

2. **Use strong keys in production**

   - Generate with: `openssl rand -base64 32`
   - Minimum 32 characters
   - Random, not based on dictionary words

3. **Different keys for dev and production**

   - Simple keys OK for local development
   - Strong, unique keys required for production

4. **Rotate keys periodically**

   - Change `ADMIN_ACCESS_KEY` every 90 days
   - Update in Vercel and notify team

5. **Limit access to environment variables**

   - Only trusted team members should have Vercel project access
   - Use Vercel Teams for role-based access

6. **Monitor API usage**
   - Check Google Custom Search quota usage
   - Set up alerts for unusual activity

---

## Adding New Environment Variables

When adding a new environment variable:

1. **Update `env.template`** with documentation
2. **Update this file** (`ENVIRONMENT_VARIABLES.md`)
3. **Add to Vercel** if needed for production
4. **Update `DEPLOYMENT_CHECKLIST.md`**
5. **Test locally** before deploying
6. **Redeploy** to pick up new variables

---

## Quick Reference Table

| Variable                | Required? | Local Dev | Production  | Auto-Generated?      |
| ----------------------- | --------- | --------- | ----------- | -------------------- |
| `DATABASE_URL`          | ✅ Yes    | Manual    | Manual/Auto | Vercel Postgres: Yes |
| `ADMIN_ACCESS_KEY`      | ✅ Yes    | Manual    | Manual      | No                   |
| `BLOB_READ_WRITE_TOKEN` | ✅ Yes    | Optional  | Auto        | Yes (Vercel Blob)    |
| `CRON_SECRET`           | ✅ Yes    | Manual    | Manual      | No                   |
| `NEXT_PUBLIC_BASE_URL`  | ✅ Yes    | Manual    | Manual      | No                   |
| `GOOGLE_CSE_API_KEY`    | ❌ No     | Optional  | Optional    | No                   |
| `GOOGLE_CSE_ID`         | ❌ No     | Optional  | Optional    | No                   |
| `UNSPLASH_ACCESS_KEY`   | ❌ No     | Optional  | Optional    | No                   |

---

**Last Updated:** November 11, 2024  
**Maintained By:** Alex Wandres
