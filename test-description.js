// Test Google Custom Search for gear descriptions
const https = require('https');

const brand = 'Fulltone';
const name = 'OCD';
const category = 'effects';
const searchQuery = `${brand} ${name} studio ${category} professional audio`;

const GOOGLE_CSE_API_KEY = 'AIzaSyDSsv0YjtnrAe2rWVxRy-0eTzKCBIOMmcw';
const GOOGLE_CSE_ID = '25ba2a4b672694ab6';

const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CSE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(searchQuery)}&num=3`;

console.log('Testing description fetch for:', brand, name);
console.log('Search query:', searchQuery);
console.log('---\n');

https.get(url, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.error) {
        console.error('❌ Google API Error:', json.error.message);
        console.error('Details:', json.error);
        return;
      }
      
      if (json.items && json.items.length > 0) {
        console.log(`✅ Found ${json.items.length} results:\n`);
        json.items.forEach((item, i) => {
          console.log(`Result ${i + 1}:`);
          console.log('  Title:', item.title);
          console.log('  Snippet:', item.snippet);
          console.log('');
        });
        
        // Show what description would be extracted
        const snippet = json.items[0].snippet || '';
        let description = snippet
          .replace(/\s+/g, ' ')
          .replace(/\.\.\.$/, '.')
          .trim();
        
        if (description.length > 200) {
          description = description.substring(0, 197) + '...';
        }
        
        console.log('---');
        console.log('📝 Extracted description:');
        console.log(description);
      } else {
        console.log('❌ No results found');
        console.log('Response:', JSON.stringify(json, null, 2));
      }
    } catch (err) {
      console.error('❌ Parse error:', err.message);
      console.log('Raw response:', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

