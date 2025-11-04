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

## Known Issues & TODOs

### High Priority
1. **Image Management** 
   - Currently using placeholder SVGs for all gear
   - Need to implement real image upload/storage solution
   - Consider integration with cloud storage (S3, Cloudinary)

2. **Authentication**
   - No user authentication currently implemented
   - Need to add user accounts for personalized gear collections
   - Consider NextAuth.js or Clerk

3. **Data Management**
   - Add CRUD UI for managing gear (currently API-only)
   - Implement admin panel for content management
   - Add bulk import/export functionality

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

*Last Updated: November 4, 2024*
*Document maintained by: Alex Wandres*
