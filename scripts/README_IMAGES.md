# Gear Image Management

This directory contains scripts for managing gear images in the catalog.

## Setup

### 1. Run Database Migration

First, you need to run the migration to create the `GearImage` table:

```bash
DATABASE_URL="postgresql://alexwandres@127.0.0.1:5432/gear_catalog?schema=public" npm run db:migrate
```

When prompted for a migration name, enter: `add_gear_images`

### 2. Configure Image Search APIs (Optional)

The image fetcher can use real image search APIs. Add these to your `.env.local` file:

#### Google Custom Search API

```env
GOOGLE_CSE_API_KEY=your-google-api-key
GOOGLE_CSE_ID=your-custom-search-engine-id
```

To get these:

1. Go to https://console.cloud.google.com/
2. Enable "Custom Search API"
3. Create an API key
4. Go to https://cse.google.com/cse/
5. Create a search engine that searches the entire web

#### Unsplash API

```env
UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

To get this:

1. Go to https://unsplash.com/developers
2. Create a new application
3. Copy your Access Key

### 3. Fetch Images

Run the image fetching script:

```bash
npm run fetch-images
```

This script will:

- Check all gear items in the database
- Search for relevant images using configured APIs
- If no APIs are configured, it will generate sample image URLs
- Store image URLs in the database
- Mark the first image as the primary image
- Generate a report in `scripts/reports/`

## How It Works

1. **Database First**: The `/api/gear/[id]/image` endpoint now checks the database for stored images first
2. **Fallback to Placeholder**: If no image is found in the database, it generates a nice SVG placeholder
3. **No External Requests**: The API no longer makes external HTTP requests, preventing the 500 errors
4. **Cached Results**: Both database images and placeholders are cached in memory for performance

## Manual Image Management

You can manually add/edit images using Prisma Studio:

```bash
npm run db:studio
```

Navigate to the `GearImage` table to:

- Add new image URLs
- Mark images as primary
- Delete unwanted images

## Image Sources

The script looks for images from:

1. Google Images (if configured)
2. Unsplash (if configured)
3. Sample URLs from music equipment retailers (fallback)

## Notes

- Images are stored as URLs, not as binary data
- The first image for each gear item is marked as primary
- The script respects API rate limits with delays
- All fetch operations are logged and reported

