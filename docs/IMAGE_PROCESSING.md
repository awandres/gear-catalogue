# Image Processing System

## Overview

Automated image fetching system with daily limits and intelligent processing.

## Features

### 1. Daily API Limit

- **Hard limit**: 95 Google CSE API calls per day
- **Bulk upload**: Max 40 images randomly selected
- **Daily auto-fetch**: 20 images for items with placeholders
- **Smart allocation**: Only fetches if items need images

### 2. Bulk Upload Image Processing

When you upload gear via Kenny Kloud:

- Automatically triggers image fetch for up to 40 random items
- Runs in background after upload completes
- Prioritizes recently uploaded items

### 3. Daily Automated Processing

**Cron Schedule**: Every day at 2:00 AM

- Checks for gear with only placeholder images
- Processes up to 20 items
- Skips if all items have images
- Prioritizes recently added gear

### 4. Manual Trigger

**Admin Toolbar → "Fetch Images" button**

- Indigo button in admin toolbar
- Fetches images for up to 40 items
- Shows progress and results
- Available anytime for admins

## Setup

### Environment Variables

Add to `.env.local`:

```env
CRON_SECRET="your-secret-key-here"
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

### Vercel Deployment

The `vercel.json` file configures the daily cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-images",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Manual Cron Setup (Non-Vercel)

If not using Vercel, set up a cron job to call:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/daily-images
```

## API Endpoints

### `/api/admin/process-images` (POST)

**Purpose**: Manual/bulk image processing
**Auth**: Admin key required
**Body**:

```json
{
  "mode": "bulk" | "daily"
}
```

**Response**:

```json
{
  "success": true,
  "processed": 40,
  "succeeded": 38,
  "failed": 2,
  "items": [...]
}
```

### `/api/cron/daily-images` (GET)

**Purpose**: Automated daily processing
**Auth**: Bearer token with CRON_SECRET
**Response**: Same as process-images

## Usage Tracking

### Current Implementation

- Tracks usage per day
- Resets at midnight
- Stored in API response headers

### Future Enhancement

Consider adding a dedicated `ApiUsage` table to Prisma schema:

```prisma
model ApiUsage {
  id        String   @id @default(cuid())
  date      DateTime
  endpoint  String
  callCount Int
  createdAt DateTime @default(now())

  @@unique([date, endpoint])
  @@index([date])
}
```

## Workflow

### After Bulk Upload

1. User uploads gear via Kenny Kloud
2. System creates gear items
3. Background: Randomly selects up to 40 items
4. Fetches images from Google CSE
5. Stores in database

### Daily Automated

1. Cron triggers at 2 AM
2. Queries gear with no images (excluding needs-review)
3. If items found: Process up to 20
4. If none found: Skip (saves API calls)
5. Logs results

### Manual Processing

1. Admin clicks "Fetch Images" button
2. Confirmation dialog
3. Processes up to 40 items
4. Shows success/failure summary
5. Refreshes stats

## Best Practices

1. **Monitor API usage**: Check Google CSE quota in console
2. **Adjust limits**: Modify constants in code if needed
3. **Review failures**: Items that fail can be manually updated
4. **Placeholder detection**: System checks for GearImage records
5. **Rate limiting**: Built-in delays between requests

## Troubleshooting

### Images not fetching

- Check Google CSE API key and ID
- Verify daily limit not exceeded
- Check network connectivity
- Review console logs

### Cron not running

- Verify `vercel.json` configuration
- Check cron secret matches
- Review Vercel dashboard logs
- Test manual trigger first

### Too many API calls

- Reduce `BULK_UPLOAD_MAX` (default: 40)
- Reduce `DAILY_AUTO_FETCH` (default: 20)
- Increase delays between requests
