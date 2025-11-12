# Gear Catalogue App - Project Documentation

## Team Members

- **Alex Wandres** - Project Lead & Developer
- **Sam Huff** - Developer

## Repository

- **GitHub**: https://github.com/awandres/gear-catalogue
- **Branch Strategy**: Main branch for production-ready code
- **Production URL**: [Deployed on Vercel] (check Vercel dashboard for live URL)

## Project Overview

The Gear Catalogue App is a comprehensive audio/studio equipment management system built with modern web technologies. It allows users to browse, search, and manage professional recording equipment with detailed specifications and metadata.

### Current Features (Completed)

✅ **Core Functionality**

- Browse gear items in a responsive grid layout (3 items per row)
- Search functionality with real-time filtering
- Filter by category, projects, and tags
- Pagination for large datasets
- Project-based gear organization and loadouts

✅ **Gear Management**

- Detailed gear pages with full specifications
- Sound characteristics tracking (tone, qualities)
- Parameter and control documentation
- Usage history tracking
- Equipment connections and pairing data

✅ **User Experience**

- Smooth transition animations when filtering
- Expandable descriptions with "Read more" toggle
- Loading states with staggered animations
- Responsive design for mobile and desktop
- Custom placeholder SVG with music/audio theme

✅ **Projects & Loadouts** (Phase 4)

- Create and manage studio recording projects
- Build custom gear loadouts for each project
- Project status tracking (Planning, Confirmed, In Session, Completed, Archived)
- Add notes to gear items within projects
- Visual project cards with client information
- Filter gear by active project
- Masonry grid layout for project overview

✅ **Technical Implementation**

- Next.js 16 with App Router
- TypeScript for type safety
- PostgreSQL database with Prisma ORM
- API routes for all CRUD operations
- Tailwind CSS for styling
- Deployed to Vercel with PostgreSQL database
- Vercel Blob Storage for image uploads
- Google Custom Search API integration (optional)

## Tech Stack

- **Frontend**: Next.js 16.0.1, React 19.2.0, TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: PostgreSQL with Prisma 6.18.0
- **Development**: Node.js, pnpm/npm

## Development Principles

### ⚡ Data-Driven Development (Critical!)

**Always design frontend forms and validations based on backend requirements.**

The source of truth for validation rules is the **backend API and database schema**. Frontend validation should mirror backend validation exactly to prevent confusing errors.

**Why this matters:**

- Prevents user frustration (form passes client-side but fails server-side)
- Ensures data integrity
- Reduces debugging time
- Creates a consistent user experience

**Best Practices:**

1. **Start with the backend schema** - Define your data model first (Prisma schema)
2. **Write backend validation** - Define validation rules in API routes (`/lib/utils.ts`)
3. **Mirror in frontend** - Match frontend form validation to backend rules exactly
4. **Document requirements** - Add validation requirements as form labels/hints

**Example Lesson Learned:**

Our create gear form initially required:

- Frontend: 1 tone, 1 tag
- Backend: 2 tones, 3 tags

Result: Form appeared to work but failed silently on submission.

**Solution:** Always check backend validation when building forms:

```typescript
// 1. Check backend validation (src/lib/utils.ts)
if (
  !item.soundCharacteristics?.tone?.length ||
  item.soundCharacteristics.tone.length < 2
) {
  errors.push("At least 2 tone characteristics required");
}

// 2. Mirror in frontend form (src/components/admin/gear/GearForm.tsx)
if (
  !formData.soundCharacteristics?.tone?.length ||
  formData.soundCharacteristics.tone.length < 2
) {
  setError("Please add at least 2 tone characteristics");
  return;
}
```

**Quick Checklist Before Building Forms:**

- [ ] Review Prisma schema for required fields
- [ ] Check backend validation rules in `/lib/utils.ts`
- [ ] Review API route validation logic
- [ ] Ensure frontend form matches all backend requirements
- [ ] Test with both valid and invalid data

## Getting Started (For Sam and Other Developers)

### Prerequisites

1. Node.js 18+ installed
2. PostgreSQL installed locally (or use Docker)
3. Git configured with access to the repository

### Initial Setup

1. **Clone the repository**

```bash
git clone https://github.com/awandres/gear-catalogue.git
cd gear-catalogue
```

2. **Install dependencies**

```bash
npm install
```

3. **Database Setup**

Create a `.env.local` file in the root directory:

```env
DATABASE_URL="postgresql://[YOUR_USERNAME]@localhost:5432/gear_catalog?schema=public"
```

Replace `[YOUR_USERNAME]` with your PostgreSQL username.

4. **Create the database**

```bash
createdb gear_catalog
```

5. **Run database migrations**

```bash
npm run db:generate
npm run db:migrate
```

6. **Seed the database with sample data**

```bash
npm run db:seed
```

7. **Start the development server**

```bash
npm run dev
```

The app will be available at http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run lint` - Run ESLint

### Database Management

**View/Edit Database**:

```bash
DATABASE_URL="postgresql://[YOUR_USERNAME]@localhost:5432/gear_catalog?schema=public" npm run db:studio
```

This opens Prisma Studio at http://localhost:5555 (or similar port)

**Reset Database** (if needed):

```bash
npx prisma migrate reset
```

## Project Structure

```
gear-catalogue/
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes
│   │   ├── gear/           # Gear browsing pages
│   │   └── globals.css     # Global styles
│   ├── components/         # React components
│   │   ├── filters/        # Filter components
│   │   ├── gear/           # Gear-specific components
│   │   ├── search/         # Search components
│   │   └── ui/             # Generic UI components
│   ├── lib/                # Utilities and types
│   ├── hooks/              # Custom React hooks
│   └── data/               # Mock data
├── prisma/                 # Database schema and migrations
├── docs/                   # Documentation
└── scripts/                # Utility scripts
```

## Completed Features

### ✅ Admin Mode & CRUD Operations (Phases 1-3)

**Status:** Fully implemented and production-ready!

**Admin Infrastructure:**

- ✅ Admin context provider with key-based access
- ✅ Admin mode toggle in header
- ✅ Protected API routes with admin key validation
- ✅ Admin toolbar component

**CRUD Operations:**

- ✅ Create new gear form with validation
- ✅ Edit existing gear (modal-based)
- ✅ Delete with confirmation modal
- ✅ Database integration for all operations

**Image Management:**

- ✅ Cloud storage integration (Vercel Blob)
- ✅ Drag-and-drop upload interface
- ✅ Image optimization (client-side resize/compression)
- ✅ Primary image selection
- ✅ Image gallery management
- ✅ Delete individual images

**See documentation:**

- `docs/PHASE2_SUMMARY.md` - CRUD implementation details
- `docs/PHASE3_SUMMARY.md` - Image management details
- `docs/PHASE4_STUDIO_PROJECTS.md` - Projects and loadouts feature
- `docs/AGENT_HANDOFFS.md` - Complete handoff documentation

### ✅ Projects & Loadouts (Phase 4)

**Status:** Fully implemented and deployed to production!

**Project Management:**

- ✅ Create projects with client information
- ✅ Project status workflow (Planning → Confirmed → In Session → Completed → Archived)
- ✅ Project-specific color themes for visual organization
- ✅ Share tokens for client access (foundation)
- ✅ Masonry grid layout for projects overview

**Gear Loadouts:**

- ✅ Add/remove gear to project loadouts
- ✅ Per-item notes within projects
- ✅ Category-based grouping in loadouts
- ✅ Visual indicators for gear in active projects
- ✅ Filter main gear list by active project
- ✅ Bulk operations (remove by category)

**See documentation:**

- `docs/PHASE4_STUDIO_PROJECTS.md` - Implementation details

---

## 🚀 Deployment Status

**Status:** ✅ **LIVE IN PRODUCTION**

- **Platform:** Vercel
- **Database:** Vercel Postgres (PostgreSQL)
- **Storage:** Vercel Blob Storage
- **Deployed:** November 12, 2024
- **Environment:** Production-ready with all migrations applied

**Deployment Documentation:**
- `DEPLOY.md` - Quick deployment guide (~30 minutes)
- `docs/DEPLOYMENT_GUIDE.md` - Complete step-by-step guide
- `docs/DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `docs/ENVIRONMENT_VARIABLES.md` - All environment variables explained

---

## Known Issues & TODOs

### ✅ Recently Completed

- ✅ **Projects & Loadouts System** - Full project management with gear loadouts (Phase 4)
- ✅ **Production Deployment** - Successfully deployed to Vercel with PostgreSQL
- ✅ **Database Migrations** - All migrations applied including ApiUsage tracking
- ✅ **Image Management** - Vercel Blob Storage integration with upload/delete
- ✅ **Admin CRUD Operations** - Full create, read, update, delete functionality

### 🔥 High Priority (Next Phase)

1. **Client Sharing & Collaboration**
   - Implement public share links for projects using shareToken
   - Client-facing view (read-only) of project loadouts
   - Print/PDF export of gear lists for clients
   - Email notifications for project updates

2. **Authentication Enhancement** _(Foundation complete)_
   - Migrate from key-based to NextAuth.js
   - Add user accounts and roles
   - Implement session management
   - Role-based permissions (admin, editor, viewer, client)

3. **Google Image Search Integration** _(API ready)_
   - Test and optimize automatic image fetching
   - Monitor API usage and quotas
   - Implement fallback strategies for quota limits
   - Add manual image search/selection UI

### 📊 Medium Priority

4. **Analytics & Insights**
   - Track most-used gear across projects
   - Project duration and equipment utilization stats
   - Generate reports for business insights
   - Cost tracking per project

5. **Search Enhancements**
   - Add advanced search with multiple criteria
   - Implement fuzzy search for better results
   - Add search history/suggestions
   - Search within project loadouts

6. **Performance Optimization**
   - Implement image optimization and lazy loading
   - Add caching strategy for API responses
   - Optimize database queries with proper indexing
   - CDN integration for static assets

### 💡 Future Features

7. **Enhanced Project Management**
   - Project templates (e.g., "Full Band Recording", "Podcast Setup")
   - Clone projects for similar sessions
   - Project timeline and scheduling
   - Integration with calendar apps

8. **Gear Features**
   - Add gear comparison functionality
   - Implement favorites/wishlist system
   - Add gear rental/loan tracking
   - Create preset/patch management for digital gear
   - Maintenance schedules and reminders

9. **UI/UX Improvements**
   - Add dark mode toggle
   - Implement keyboard shortcuts
   - Add more detailed filters (price range, year, manufacturer)
   - Mobile app optimization
   - Drag-and-drop gear organization

10. **Integration & Export**
    - API documentation with OpenAPI/Swagger
    - Webhook support for external integrations
    - Export to common formats (CSV, PDF, Excel)
    - Integration with DAW session metadata

## Deployment Considerations

### ✅ Current Production Setup

**Platform:** Vercel (Hobby Plan)
- ✅ Automatic deployments from GitHub main branch
- ✅ Serverless functions for all API routes
- ✅ Automatic HTTPS and custom domain support
- ✅ PostgreSQL database (Vercel Postgres)
- ✅ Blob Storage for image uploads
- ✅ Cron jobs for daily image fetching

### Environment Variables

**Required in Production:**
- ✅ `DATABASE_URL` - PostgreSQL connection string (Vercel Postgres)
- ✅ `ADMIN_ACCESS_KEY` - Secure admin authentication key
- ✅ `BLOB_READ_WRITE_TOKEN` - Vercel Blob Storage token
- ✅ `CRON_SECRET` - Cron job protection secret
- ✅ `NEXT_PUBLIC_BASE_URL` - Production URL

**Optional:**
- `GOOGLE_CSE_API_KEY` - Google Custom Search API key
- `GOOGLE_CSE_ID` - Google Custom Search Engine ID

**See:** `docs/ENVIRONMENT_VARIABLES.md` for complete reference

### Database

- ✅ PostgreSQL on Vercel Postgres (256MB storage, 60 compute hours/month free tier)
- ✅ All 6 migrations applied successfully
- ✅ Connection pooling handled by Vercel
- ✅ Automatic backups (on paid plans)

### Monitoring & Maintenance

- Vercel dashboard for deployment logs and analytics
- Database queries monitored via Vercel Postgres dashboard
- API usage tracking via `ApiUsage` table
- Error logging via console.error (consider Sentry integration later)

## Development Workflow

1. Create a feature branch from `main`
2. Make changes and test locally
3. Ensure database migrations are included if schema changes
4. Create a pull request with clear description
5. Review and merge to main

## Contact & Communication

- **Alex Wandres** - Project Lead
- **Sam Huff** - Developer
- **Repository Issues** - Use GitHub issues for bug tracking and feature requests

## Additional Notes

- The `.env.local` file is gitignored - never commit database credentials
- Always run `npm run db:generate` after pulling schema changes
- Test with both empty and seeded database states
- The app uses mock data in development but real database in production

---

_Last Updated: November 12, 2024_  
_Document maintained by: Alex Wandres_

## 🎉 Latest Milestones

**November 12, 2024 - PRODUCTION DEPLOYMENT SUCCESS! 🚀**
- ✅ Successfully deployed to Vercel production
- ✅ All database migrations applied
- ✅ Phase 4 (Projects & Loadouts) fully functional
- ✅ Image management with Vercel Blob Storage working
- ✅ Admin CRUD operations operational
- ✅ Google API integration configured

**November 11, 2024 - Phase 4 Complete**
- Projects & Loadouts system implemented
- Full project management with gear organization
- Status workflow and project filtering

**November 10, 2024 - Phase 3 Complete**  
- Image Management system with Vercel Blob Storage
- Upload, delete, and primary image selection

**November 4, 2024 - Phase 2 Complete**  
- Full CRUD operations for gear items
- Admin authentication system
