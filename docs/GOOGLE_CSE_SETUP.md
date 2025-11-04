# Google Custom Search Engine Setup Guide

## Quick Setup Steps

### 1. Enable the Custom Search API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Custom Search API"
5. Click on it and press "Enable"

### 2. Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key
4. (Optional) Click "Edit API key" to add restrictions for security

### 3. Create a Custom Search Engine

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/create)
2. Fill in the form:
   - **Search engine name**: "Gear Catalog Images"
   - **What to search**: Select "Search the entire web"
   - Click "Create"
3. After creation, click on your search engine
4. Copy the "Search engine ID" (looks like: `017643444788157903118:6_s_bzcotx4`)

### 4. Add to Your Project

Add these to your `.env.local` file:

```bash
GOOGLE_CSE_API_KEY=your-api-key-here
GOOGLE_CSE_ID=your-search-engine-id-here
```

### 5. Test Your Setup

Run this command to verify:

```bash
curl "https://www.googleapis.com/customsearch/v1?q=neve+1073+preamp&cx=YOUR_CSE_ID&key=YOUR_API_KEY&searchType=image&num=1"
```

You should get a JSON response with image results.

## Free Tier Limits

- **100 searches per day** (free)
- Each search can return up to 10 results
- Perfect for populating a gear catalog!

## Tips for Better Results

1. **Be specific in searches**: "Neve 1073 preamp module" instead of just "1073"
2. **Add context**: Include "professional audio", "studio equipment", etc.
3. **Use the `imgSize` parameter**: Set to "large" for better quality images

## Troubleshooting

- **"API key not valid"**: Make sure you've enabled the Custom Search API
- **"Invalid custom search engine ID"**: Double-check your CSE ID from the control panel
- **No results**: Try broader search terms or check if "Search the entire web" is enabled
