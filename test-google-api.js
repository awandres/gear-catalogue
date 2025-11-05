// Test script for Google Custom Search API
require('dotenv').config({ path: '.env.local' });

const API_KEY = process.env.GOOGLE_CSE_API_KEY;
const CSE_ID = process.env.GOOGLE_CSE_ID;

async function testGoogleImageSearch() {
  console.log('🔍 Testing Google Custom Search API...\n');
  
  if (!API_KEY || !CSE_ID) {
    console.error('❌ Missing API credentials!');
    console.log('GOOGLE_CSE_API_KEY:', API_KEY ? '✓ Set' : '✗ Missing');
    console.log('GOOGLE_CSE_ID:', CSE_ID ? '✓ Set' : '✗ Missing');
    return;
  }

  console.log('✓ API credentials found');
  console.log(`CSE ID: ${CSE_ID.substring(0, 10)}...`);
  
  const searchQuery = 'Neve 1073 preamp professional audio';
  console.log(`\n🔎 Searching for: "${searchQuery}"`);
  
  const params = new URLSearchParams({
    key: API_KEY,
    cx: CSE_ID,
    q: searchQuery,
    searchType: 'image',
    num: '3',
    imgSize: 'large',
    safe: 'active',
    imgType: 'photo'
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?${params}`
    );
    
    console.log(`\n📡 API Response Status: ${response.status}`);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data.error?.message || 'Unknown error');
      if (data.error?.errors) {
        data.error.errors.forEach(err => {
          console.error(`   - ${err.reason}: ${err.message}`);
        });
      }
      return;
    }
    
    if (data.items && data.items.length > 0) {
      console.log(`\n✅ Found ${data.items.length} images:`);
      data.items.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.title || 'No title'}`);
        console.log(`   URL: ${item.link}`);
        console.log(`   Size: ${item.image?.width}x${item.image?.height}`);
      });
    } else {
      console.log('\n⚠️  No images found for this query');
    }
    
    if (data.searchInformation) {
      console.log(`\n📊 Search took ${data.searchInformation.formattedSearchTime}`);
      console.log(`   Total results: ${data.searchInformation.formattedTotalResults}`);
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testGoogleImageSearch();
