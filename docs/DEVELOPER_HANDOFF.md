# Developer Handoff - Studio Gear Catalog

## Quick Start

**Main File:** `PRODUCTION_GEAR_CATALOG.json`

This JSON file contains:
- Complete schema definition
- 10 production-ready mock entries
- All categories represented (dynamics, guitar, amplifier, keyboard, microphone, effects, preamp, cabinet, bass)

---

## Schema Overview

### Essential Fields (Required)
```typescript
interface GearItem {
  // Identification
  id: string;                    // Unique identifier (e.g., "comp-001")
  name: string;                  // Display name
  brand: string;                 // Manufacturer
  category: string;              // Primary category
  subcategory: string;           // Specific type
  
  // Description
  description: string;           // 2-4 sentence description
  
  // Sound Profile
  soundCharacteristics: {
    tone: string[];              // ["warm", "bright", etc.]
    qualities: string[];         // ["punchy", "smooth", etc.]
  };
  
  // Discovery
  tags: string[];                // Search/filter keywords
  
  // Availability
  status: "available" | "in-use" | "archived" | "maintenance" | "broken";
}
```

### Recommended Fields (Strongly Encouraged)
```typescript
interface GearItem {
  // ... essential fields above
  
  // Controls (if applicable)
  parameters?: Array<{
    name: string;
    type: "knob" | "switch" | "slider" | "button" | "wheel" | "jack";
    range: string;
  }>;
  
  // Technical Details
  specifications?: {
    [key: string]: any;          // Flexible specs object
  };
  
  // Usage History
  usage?: Array<{
    songTitle: string;
    artist: string;
    timestamp: string;           // "MM:SS-MM:SS"
    context: string;
  }>;
  
  // Media Assets
  media?: {
    photos?: string[];
    demoAudio?: string;
    demoVideo?: string;
    manualPdf?: string;
  };
  
  // Relationships
  connections?: {
    pairedWith?: string[];       // Array of gear IDs
  };
  
  // Metadata
  notes?: string;
  dateAdded?: string;            // ISO date format
  lastUsed?: string;             // ISO date format
}
```

---

## Categories & Subcategories

### Supported Categories
```javascript
const categories = {
  "dynamics": ["compressor", "limiter", "gate"],
  "eq": ["equalizer", "filter"],
  "effects": ["reverb", "delay", "modulation", "tape-echo"],
  "guitar": ["electric-guitar", "acoustic-guitar"],
  "bass": ["electric-bass", "acoustic-bass"],
  "keyboard": ["analog-synthesizer", "digital-synthesizer", "piano", "organ"],
  "amplifier": ["guitar-head", "bass-head", "combo"],
  "cabinet": ["guitar-cabinet", "bass-cabinet"],
  "microphone": ["large-diaphragm-condenser", "small-diaphragm-condenser", "dynamic", "ribbon"],
  "preamp": ["microphone-preamp", "di-preamp", "channel-strip"],
  "monitoring": ["studio-monitor", "headphones"],
  "drum": ["drum-kit", "percussion"]
};
```

---

## Tag System

### Tag Categories

**Technical Architecture** (8 tags)
```
analog, tube, solid-state, FET, transformer, class-a, tape, monophonic
```

**Sound Characteristics** (8 tags)
```
warm, aggressive, color, fast-attack, versatile, classic, british, german
```

**Usage & Application** (6 tags)
```
vocal, drums, bass, lead, guitar, eq
```

**Era & Style** (7 tags)
```
vintage, vintage-style, modern, classic, anniversary-edition, blueline, boutique
```

**Power & Format** (8 tags)
```
100-watt, 300-watt, four-channel, 4x12, cardioid, omni, greenback, blackback
```

**Brand & Model Specific** (11 tags)
```
neve, ampeg, marshall, moog, telefunken, 1073, strat, 1979, british-mod, duncan, humbucker
```

**Status & Quality** (5 tags)
```
studio-standard, premium, high-gain, metal, delay, echo
```

**Total:** 52 unique tags in mock data

---

## API Endpoints (Recommended)

### Basic CRUD
```
GET    /api/gear              - List all gear
GET    /api/gear/:id          - Get single item
POST   /api/gear              - Create new item
PUT    /api/gear/:id          - Update item
DELETE /api/gear/:id          - Delete item
```

### Filtering & Search
```
GET    /api/gear?category=dynamics
GET    /api/gear?status=available
GET    /api/gear?tags=vintage,tube
GET    /api/gear/search?q=compressor
GET    /api/gear/filter?category=guitar&status=available&tags=vintage
```

### Special Queries
```
GET    /api/gear/categories            - List all categories
GET    /api/gear/tags                  - List all tags with counts
GET    /api/gear/:id/related           - Get related gear (via connections)
GET    /api/gear/:id/usage             - Get usage history
```

---

## Database Implementation

### MongoDB Schema
```javascript
const gearSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, index: true },
  brand: { type: String, required: true, index: true },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, required: true, index: true },
  description: { type: String, required: true },
  soundCharacteristics: {
    tone: [String],
    qualities: [String]
  },
  tags: { type: [String], index: true },
  status: { 
    type: String, 
    enum: ['available', 'in-use', 'archived', 'maintenance', 'broken'],
    required: true,
    index: true
  },
  parameters: [{
    name: String,
    type: String,
    range: String
  }],
  specifications: mongoose.Schema.Types.Mixed,
  usage: [{
    songTitle: String,
    artist: String,
    timestamp: String,
    context: String
  }],
  media: {
    photos: [String],
    demoAudio: String,
    demoVideo: String,
    manualPdf: String
  },
  connections: {
    pairedWith: [String]
  },
  notes: String,
  dateAdded: Date,
  lastUsed: Date
}, { timestamps: true });

// Text search index
gearSchema.index({ 
  name: 'text', 
  brand: 'text', 
  description: 'text',
  tags: 'text'
});

// Compound indexes for common queries
gearSchema.index({ category: 1, status: 1 });
gearSchema.index({ 'soundCharacteristics.tone': 1 });
```

### PostgreSQL Schema (Alternative)
```sql
CREATE TABLE gear (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  subcategory VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  sound_characteristics JSONB NOT NULL,
  tags TEXT[] NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'in-use', 'archived', 'maintenance', 'broken')),
  parameters JSONB,
  specifications JSONB,
  usage JSONB,
  media JSONB,
  connections JSONB,
  notes TEXT,
  date_added DATE,
  last_used DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_gear_category ON gear(category);
CREATE INDEX idx_gear_status ON gear(status);
CREATE INDEX idx_gear_tags ON gear USING GIN(tags);
CREATE INDEX idx_gear_sound ON gear USING GIN(sound_characteristics);
CREATE INDEX idx_gear_search ON gear USING GIN(to_tsvector('english', name || ' ' || brand || ' ' || description));
```

---

## Frontend Components

### Essential Views

**1. Browse/List View**
```javascript
// Display: Grid or list of gear cards
// Features:
// - Photo thumbnail
// - Name, brand
// - Status badge
// - Top 3 tags
// - Quick view button
```

**2. Detail View**
```javascript
// Display: Full gear information
// Sections:
// - Photo gallery
// - Description
// - Sound characteristics (pills/badges)
// - Parameters table (if applicable)
// - Usage history
// - Media players (audio/video)
// - Related gear
// - Specifications accordion
```

**3. Search & Filter**
```javascript
// Filters:
// - Category dropdown
// - Status checkboxes
// - Tag multi-select
// - Sound characteristics
// - Text search bar

// Features:
// - Real-time filtering
// - Active filter badges
// - Clear all filters
// - Result count
```

### Component Examples (React)

**GearCard Component**
```jsx
function GearCard({ gear }) {
  return (
    <div className="gear-card">
      <img src={gear.media?.photos?.[0]} alt={gear.name} />
      <h3>{gear.name}</h3>
      <p className="brand">{gear.brand}</p>
      <StatusBadge status={gear.status} />
      <div className="tags">
        {gear.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}
```

**FilterPanel Component**
```jsx
function FilterPanel({ filters, onFilterChange }) {
  return (
    <aside className="filter-panel">
      <h3>Filters</h3>
      
      <CategoryFilter 
        selected={filters.category}
        onChange={onFilterChange}
      />
      
      <StatusFilter
        selected={filters.status}
        onChange={onFilterChange}
      />
      
      <TagFilter
        selected={filters.tags}
        allTags={getAllTags()}
        onChange={onFilterChange}
      />
      
      <button onClick={clearFilters}>Clear All</button>
    </aside>
  );
}
```

---

## Search Implementation

### Basic Text Search (Frontend)
```javascript
function searchGear(query, gearList) {
  const lowerQuery = query.toLowerCase();
  
  return gearList.filter(item => {
    return (
      item.name.toLowerCase().includes(lowerQuery) ||
      item.brand.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.tags.some(tag => tag.includes(lowerQuery))
    );
  });
}
```

### Advanced Filter (Frontend)
```javascript
function filterGear(filters, gearList) {
  return gearList.filter(item => {
    // Category filter
    if (filters.category && item.category !== filters.category) {
      return false;
    }
    
    // Status filter
    if (filters.status?.length > 0 && !filters.status.includes(item.status)) {
      return false;
    }
    
    // Tag filter (any match)
    if (filters.tags?.length > 0) {
      const hasTag = filters.tags.some(tag => item.tags.includes(tag));
      if (!hasTag) return false;
    }
    
    // Sound characteristic filter
    if (filters.tone?.length > 0) {
      const hasTone = filters.tone.some(tone => 
        item.soundCharacteristics.tone.includes(tone)
      );
      if (!hasTone) return false;
    }
    
    return true;
  });
}
```

### Backend Search (MongoDB)
```javascript
async function searchGear(query, filters) {
  const searchQuery = {};
  
  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  // Category filter
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  // Status filter
  if (filters.status) {
    searchQuery.status = { $in: filters.status };
  }
  
  // Tag filter
  if (filters.tags?.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  // Tone filter
  if (filters.tone?.length > 0) {
    searchQuery['soundCharacteristics.tone'] = { $in: filters.tone };
  }
  
  return await Gear.find(searchQuery)
    .sort(query ? { score: { $meta: 'textScore' } } : { name: 1 });
}
```

---

## Data Validation

### Required Field Validation
```javascript
function validateGearItem(item) {
  const errors = [];
  
  // Required fields
  if (!item.id) errors.push('ID is required');
  if (!item.name) errors.push('Name is required');
  if (!item.brand) errors.push('Brand is required');
  if (!item.category) errors.push('Category is required');
  if (!item.subcategory) errors.push('Subcategory is required');
  if (!item.description || item.description.length < 50) {
    errors.push('Description must be at least 50 characters');
  }
  if (!item.soundCharacteristics?.tone?.length) {
    errors.push('At least 2 tone characteristics required');
  }
  if (!item.tags?.length || item.tags.length < 3) {
    errors.push('At least 3 tags required');
  }
  if (!item.status) errors.push('Status is required');
  
  // Status validation
  const validStatuses = ['available', 'in-use', 'archived', 'maintenance', 'broken'];
  if (item.status && !validStatuses.includes(item.status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }
  
  return errors;
}
```

---

## File Upload Strategy

### Media File Naming Convention
```
/media/gear/{category}/{id}-{descriptor}.{ext}

Examples:
/media/gear/dynamics/comp-001-front.jpg
/media/gear/guitar/guitar-001-headstock.jpg
/media/demos/comp-001-vocal-demo.wav
/media/manuals/amp-001-manual.pdf
```

### Recommended Storage
- **Images:** JPG/PNG, max 2MB, 1920px max width
- **Audio:** WAV/MP3, max 10MB, stereo
- **Video:** YouTube/Vimeo embed URLs (don't host video)
- **PDFs:** Max 25MB

---

## Initial Data Import

### Import Script (Node.js)
```javascript
const fs = require('fs');
const mongoose = require('mongoose');

async function importGearData() {
  // Connect to database
  await mongoose.connect('mongodb://localhost/studio-gear');
  
  // Read JSON file
  const data = JSON.parse(
    fs.readFileSync('PRODUCTION_GEAR_CATALOG.json', 'utf8')
  );
  
  // Import gear items
  for (const item of data.gear) {
    await Gear.findOneAndUpdate(
      { id: item.id },
      item,
      { upsert: true, new: true }
    );
    console.log(`Imported: ${item.name}`);
  }
  
  console.log(`Successfully imported ${data.gear.length} items`);
}

importGearData();
```

---

## UI/UX Recommendations

### Status Badge Colors
```css
.status-available { background: #10b981; }  /* Green */
.status-in-use { background: #f59e0b; }     /* Orange */
.status-archived { background: #6b7280; }   /* Gray */
.status-maintenance { background: #3b82f6; } /* Blue */
.status-broken { background: #ef4444; }     /* Red */
```

### Tag Color Coding
```css
/* Technical tags */
.tag-analog, .tag-tube, .tag-fet { background: #3b82f6; }

/* Sound tags */
.tag-warm, .tag-vintage { background: #f59e0b; }
.tag-aggressive, .tag-modern { background: #ef4444; }

/* Usage tags */
.tag-vocal, .tag-drums, .tag-guitar { background: #10b981; }

/* Premium tags */
.tag-studio-standard, .tag-premium { background: #8b5cf6; }
```

### Responsive Breakpoints
```css
/* Mobile: 1 column */
@media (max-width: 640px) { .gear-grid { grid-template-columns: 1fr; } }

/* Tablet: 2 columns */
@media (min-width: 641px) and (max-width: 1024px) { 
  .gear-grid { grid-template-columns: repeat(2, 1fr); } 
}

/* Desktop: 3-4 columns */
@media (min-width: 1025px) { 
  .gear-grid { grid-template-columns: repeat(3, 1fr); } 
}

@media (min-width: 1440px) { 
  .gear-grid { grid-template-columns: repeat(4, 1fr); } 
}
```

---

## Performance Optimization

### Pagination
```javascript
// Recommended: 12-24 items per page
const PAGE_SIZE = 24;

function paginateGear(gearList, page = 1) {
  const start = (page - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  
  return {
    items: gearList.slice(start, end),
    page,
    pageSize: PAGE_SIZE,
    totalItems: gearList.length,
    totalPages: Math.ceil(gearList.length / PAGE_SIZE)
  };
}
```

### Image Loading
```jsx
// Use lazy loading for images
<img 
  src={gear.media?.photos?.[0]} 
  loading="lazy"
  alt={gear.name}
/>

// Or use a library like react-lazy-load-image-component
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={gear.media?.photos?.[0]}
  alt={gear.name}
  effect="blur"
/>
```

---

## Testing Checklist

### Data Validation Tests
- [ ] Required fields are enforced
- [ ] Status values are validated
- [ ] Tag minimum/maximum enforced
- [ ] Description length validated
- [ ] ID uniqueness enforced

### Search & Filter Tests
- [ ] Text search works across name, brand, description
- [ ] Category filter works
- [ ] Status filter works (single and multiple)
- [ ] Tag filter works (single and multiple)
- [ ] Sound characteristic filter works
- [ ] Combined filters work correctly
- [ ] Empty result states handled

### UI/UX Tests
- [ ] Gear cards display correctly
- [ ] Status badges show correct color
- [ ] Tags are readable and clickable
- [ ] Detail page shows all information
- [ ] Audio/video players work
- [ ] Related gear links work
- [ ] Mobile responsive design works
- [ ] Loading states implemented
- [ ] Error states handled

---

## Future Enhancements (Out of Scope)

These were mentioned but are NOT in the current schema:
- Session management
- Preset library system
- Rental calendar
- Financial tracking
- Maintenance scheduling
- Learning resource curation

Consider these for Phase 2 if needed.

---

## Support & Questions

**Schema Documentation:** See `STREAMLINED_SCHEMA.md` for detailed field explanations
**Tag System:** See `TAG_TAXONOMY.md` for complete tag reference
**Expanded Examples:** See `diezel_vh4_expanded.json` for detailed entry example

---

## Quick Reference

**Total Items in Mock Data:** 10  
**Total Unique Tags:** 52  
**Categories Represented:** 9  
**Required Fields:** 9  
**Recommended Fields:** 14  
**File Format:** JSON  
**Schema Version:** 1.0  

**Ready to implement!** 🚀
