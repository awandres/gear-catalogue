# Gear Catalogue App - Project Documentation

## Team Members

- **Alex Wandres** - Project Lead & Developer
- **Sam Huff** - Developer

## Repository

- **GitHub**: https://github.com/awandres/gear-catalogue
- **Branch Strategy**: Main branch for production-ready code

## Project Overview

The Gear Catalogue App is a comprehensive audio/studio equipment management system built with modern web technologies. It allows users to browse, search, and manage professional recording equipment with detailed specifications and metadata.

### Current Features (Completed)

✅ **Core Functionality**

- Browse gear items in a responsive grid layout (3 items per row)
- Search functionality with real-time filtering
- Filter by category, status, and tags
- Pagination for large datasets

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

✅ **Technical Implementation**

- Next.js 16 with App Router
- TypeScript for type safety
- PostgreSQL database with Prisma ORM
- API routes for all CRUD operations
- Tailwind CSS for styling

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
- `docs/AGENT_HANDOFFS.md` - Complete handoff documentation

---

## Known Issues & TODOs

### High Priority

1. **Authentication Enhancement** _(Foundation complete)_

   - Migrate from key-based to NextAuth.js
   - Add user accounts and roles
   - Implement session management
   - Role-based permissions (admin, editor, viewer)

2. **Image Optimization** _(Basic system complete)_
   - Generate image thumbnails
   - WebP conversion for better compression
   - Responsive image variants
   - Advanced image editing (crop, rotate)

### Medium Priority

4. **Search Enhancements**

   - Add advanced search with multiple criteria
   - Implement fuzzy search for better results
   - Add search history/suggestions

5. **Performance**

   - Implement image optimization and lazy loading
   - Add caching strategy for API responses
   - Optimize database queries with proper indexing

6. **Features**
   - Add gear comparison functionality
   - Implement favorites/wishlist system
   - Add gear rental tracking
   - Create preset/patch management for digital gear

### Low Priority

7. **UI/UX Improvements**

   - Add dark mode toggle
   - Implement keyboard shortcuts
   - Add more detailed filters (price range, year)
   - Create mobile app views

8. **Integration**
   - API documentation with OpenAPI/Swagger
   - Webhook support for external integrations
   - Export to common formats (CSV, PDF)

## Deployment Considerations

### Environment Variables

Required environment variables for production:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL` - Public URL of the application

### Database

- Ensure PostgreSQL is accessible from production environment
- Run migrations before deploying new versions
- Consider connection pooling for production

### Recommended Platforms

1. **Vercel** (recommended for Next.js)

   - Automatic deployments from GitHub
   - Built-in analytics and performance monitoring
   - Edge functions support

2. **Railway/Render**

   - Good for full-stack deployment with PostgreSQL
   - Easy database provisioning

3. **Self-hosted**
   - Use PM2 or similar for process management
   - Nginx for reverse proxy
   - Let's Encrypt for SSL

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

_Last Updated: November 10, 2024_
_Document maintained by: Alex Wandres_

**Latest Milestone:** Phase 3 (Image Management) completed! Full CRUD + Image Management now live.
