# Phase 4: Studio Projects & Gear Loadouts - Planning Document

**Created:** November 11, 2024  
**Status:** 📋 Planning Phase

---

## 🎯 Vision

Transform the Gear Catalogue from a static inventory into a **dynamic studio workflow system** that connects gear to real recording projects and clients.

## 📊 Core Concepts

### 1. **Projects**

- Represents a band/artist recording session
- Has dates, client info, session notes
- Contains a "Gear Loadout" (selected equipment)
- Tracks what gear was actually used

### 2. **Gear Loadouts**

- Curated selection of gear for a specific project
- Can be saved as templates
- Includes notes on why each piece was chosen
- Shows gear relationships (e.g., "This mic pairs well with this preamp")

### 3. **Templates**

- Pre-made gear loadouts for common scenarios
- Examples: "Rock Band Basic", "Singer-Songwriter", "Hip-Hop Production"
- Admin can customize and save new templates
- Speeds up project setup

### 4. **Client Access**

- Clients get read-only view of their project
- Can see selected gear with descriptions
- Builds excitement and transparency
- Educational value for clients

---

## 🗄️ Database Schema

```prisma
// Add to existing schema.prisma

model Project {
  id          String   @id @default(cuid())
  name        String   // "Arctic Monkeys - New Album"
  clientName  String   // "Arctic Monkeys"
  clientEmail String?
  startDate   DateTime
  endDate     DateTime?
  status      ProjectStatus @default(PLANNING)
  notes       String?  // Session notes

  // Relations
  loadout     ProjectGear[]
  templates   ProjectTemplate[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProjectGear {
  id          String   @id @default(cuid())
  projectId   String
  gearId      String
  notes       String?  // "Using vintage mode for warmth"
  addedAt     DateTime @default(now())

  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  gear        Gear     @relation(fields: [gearId], references: [id])

  @@unique([projectId, gearId])
  @@index([projectId])
  @@index([gearId])
}

model ProjectTemplate {
  id          String   @id @default(cuid())
  name        String   // "Rock Band - Full Production"
  description String
  category    String   // "rock", "acoustic", "electronic"
  isPublic    Boolean  @default(true)

  // Gear included in template
  gearItems   TemplateGear[]

  // Usage tracking
  projects    Project[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TemplateGear {
  id          String   @id @default(cuid())
  templateId  String
  gearId      String
  notes       String?  // "Essential for this setup"
  order       Int      @default(0) // Display order

  template    ProjectTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  gear        Gear     @relation(fields: [gearId], references: [id])

  @@unique([templateId, gearId])
}

enum ProjectStatus {
  PLANNING    // Setting up gear loadout
  CONFIRMED   // Client approved
  IN_SESSION  // Currently recording
  COMPLETED   // Project finished
  ARCHIVED    // Old project
}

// Update Gear model to add relation
model Gear {
  // ... existing fields

  // New relations
  projectGear    ProjectGear[]
  templateGear   TemplateGear[]
}
```

---

## 🎨 UI/UX Design

### 1. **Project Management View**

```
┌─────────────────────────────────────────────┐
│ Projects                          + New Project │
├─────────────────────────────────────────────┤
│ 🎵 Arctic Monkeys - New Album               │
│    Client: Arctic Monkeys                    │
│    Dates: Nov 15-30, 2024                   │
│    Status: Planning | 24 items selected     │
│                                             │
│ 🎸 The Strokes - Demos                      │
│    Client: The Strokes                      │
│    Dates: Dec 1-5, 2024                    │
│    Status: Confirmed | Template: Rock Band  │
└─────────────────────────────────────────────┘
```

### 2. **Project Detail View (Admin)**

```
┌─────────────────────────────────────────────┐
│ Arctic Monkeys - New Album        [Edit]    │
│                                             │
│ Selected Gear (24 items)          [+ Add Gear] │
├─────────────────────────────────────────────┤
│ DRUMS                                       │
│ ├─ 🥁 Ludwig Black Beauty         [Remove] │
│ │    Notes: For that classic snare crack    │
│ ├─ 🎤 AKG D112 (Kick)            [Remove] │
│ └─ 🎤 Coles 4038 (Overheads)     [Remove] │
│                                             │
│ GUITARS                                     │
│ ├─ 🎸 Fender Stratocaster         [Remove] │
│ │    Notes: Alex's main guitar             │
│ └─ 🔊 Vox AC30                   [Remove] │
│                                             │
│ [Save as Template]                          │
├─────────────────────────────────────────────┤
│ Available Gear                    [Filter ▼] │
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│ │ +  │ │ +  │ │ +  │ │ +  │              │
│ └────┘ └────┘ └────┘ └────┘              │
└─────────────────────────────────────────────┘
```

### 3. **Quick Add Widget (on Gear Cards)**

```
┌──────────────────────────┐
│ [Gear Image]             │
│ 1176 Compressor          │
│ Universal Audio          │
│                         │
│ [+ Add to Arctic Monks..]│ ← Dropdown of active projects
└──────────────────────────┘
```

### 4. **Template Library**

```
┌─────────────────────────────────────────────┐
│ Gear Templates                   [+ Create] │
├─────────────────────────────────────────────┤
│ 📦 Rock Band - Full Production             │
│    32 items | Amps, Drums, Mics, Effects  │
│    [View] [Use for Project]               │
│                                            │
│ 🎤 Singer-Songwriter                       │
│    12 items | Acoustic focus, minimal     │
│    [View] [Use for Project]               │
│                                            │
│ 🎹 Electronic Production                   │
│    18 items | Synths, drum machines      │
│    [View] [Use for Project]               │
└─────────────────────────────────────────────┘
```

### 5. **Client View (Read-Only)**

```
┌─────────────────────────────────────────────┐
│ Your Project: New Album                     │
│ Status: Planning                            │
├─────────────────────────────────────────────┤
│ Selected Gear for Your Session:             │
│                                            │
│ 🎸 GUITARS & AMPS                          │
│                                            │
│ Fender Stratocaster (1979)                 │
│ A vintage beauty with incredible tone...    │
│ [View Details]                             │
│                                            │
│ Marshall JCM800                            │
│ The classic British rock sound...          │
│ [View Details]                             │
│                                            │
│ 🎤 MICROPHONES                             │
│ ...                                        │
└─────────────────────────────────────────────┘
```

---

## 🛠️ Implementation Plan

### Phase 4.1: Core Project System (3-4 days)

1. **Database Updates**

   - Add Project model
   - Add ProjectGear junction table
   - Update Gear relations
   - Create migration

2. **API Routes**

   - `GET/POST /api/projects` - List/Create projects
   - `GET/PUT/DELETE /api/projects/[id]` - Project CRUD
   - `POST /api/projects/[id]/gear` - Add gear to project
   - `DELETE /api/projects/[id]/gear/[gearId]` - Remove gear
   - `GET /api/projects/[id]/loadout` - Get project's gear

3. **UI Components**

   - `ProjectList` - Shows all projects
   - `ProjectCard` - Individual project summary
   - `ProjectForm` - Create/edit project
   - `ProjectDetail` - Full project view with loadout
   - `AddToProjectButton` - Quick add widget for gear cards

4. **Admin Features**
   - Create/edit/delete projects
   - Add/remove gear from projects
   - Add notes to gear selections
   - Set project status

### Phase 4.2: Templates System (2-3 days)

1. **Database Updates**

   - Add ProjectTemplate model
   - Add TemplateGear junction table
   - Create migration

2. **API Routes**

   - CRUD for templates
   - Apply template to project
   - Save project as template

3. **UI Components**
   - `TemplateLibrary` - Browse templates
   - `TemplateCard` - Template preview
   - `TemplateDetail` - Full template view
   - `SaveAsTemplate` - Modal to save current loadout

### Phase 4.3: Client Access (2 days)

1. **Simple Auth**

   - Project-specific access tokens
   - Email magic links
   - Or simple password per project

2. **Client Routes**

   - `/client/project/[token]` - Client view
   - Read-only gear details
   - Beautiful presentation

3. **Sharing Features**
   - Generate client links
   - Email notifications
   - PDF export of loadout

---

## 🔄 Workflow Examples

### Creating a New Project

1. Admin clicks "New Project"
2. Fills in: Band name, dates, notes
3. Either:
   - Starts from blank
   - Applies a template
   - Copies previous project
4. Browses gear catalog
5. Adds items with notes
6. Saves project
7. Generates client link

### Using Templates

1. Admin creates "Rock Band Basic" template
2. Includes: Drum kit, 2 guitar amps, bass amp, essential mics
3. When new rock band books:
   - Create project
   - Apply template
   - Customize as needed
   - Much faster setup!

### Client Experience

1. Receives email with link
2. Clicks to view their project
3. Sees professional presentation of selected gear
4. Can read about each piece
5. Gets excited about the session!

---

## 🎯 Benefits

### For the Studio

- **Efficiency**: Templates speed up planning
- **Organization**: Track gear usage by project
- **History**: See what worked for past projects
- **Professional**: Impress clients with preparation

### For Clients

- **Transparency**: See exactly what they're paying for
- **Education**: Learn about professional gear
- **Excitement**: Build anticipation for session
- **Trust**: Shows studio's expertise

### For the Business

- **Upselling**: "Upgrade to our Premium template"
- **Marketing**: Share great setups on social
- **Analytics**: See most-used gear
- **Inventory**: Track gear availability

---

## 🚀 Quick Wins for MVP

Start simple:

1. **Basic Projects** - Just name, date, gear list
2. **Add to Project** - Button on each gear card
3. **Project View** - See selected gear
4. **One Template** - "Basic Band Setup"
5. **Simple Sharing** - Copy link to share

Then enhance:

- More templates
- Better client views
- Email notifications
- Calendar integration
- Availability checking

---

## 💡 Future Enhancements

- **Calendar Integration**: Block gear when in use
- **Pricing**: Calculate session cost based on gear
- **History**: Track actual vs planned gear usage
- **Reviews**: Clients rate gear after session
- **Recommendations**: AI suggests gear based on genre
- **Availability**: Real-time gear availability
- **Invoicing**: Generate invoices with gear list

---

## 📊 Success Metrics

- Projects created per month
- Templates used vs custom
- Client link views
- Time to create loadout (should decrease)
- Most used gear/templates

---

This transforms your gear catalog into a **studio workflow system** that adds real business value! 🎵



