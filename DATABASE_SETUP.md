# Database Setup Guide

## Option 1: SQLite (Easiest for Development)

1. Create a `.env.local` file in the root directory:

```
DATABASE_URL="file:./dev.db"
```

2. Update `prisma/schema.prisma` datasource to:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

3. Run migrations and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Option 2: PostgreSQL (Local)

1. Install PostgreSQL locally (if not already installed):

   - Mac: `brew install postgresql`
   - Ubuntu: `sudo apt-get install postgresql`
   - Windows: Download from https://www.postgresql.org/download/

2. Create database:

```bash
createdb gear_catalog
```

3. Create `.env.local` file:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gear_catalog?schema=public"
```

4. Run migrations and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Option 3: PostgreSQL (Docker)

1. Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: gear_catalog
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

2. Start PostgreSQL:

```bash
docker-compose up -d
```

3. Create `.env.local`:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gear_catalog?schema=public"
```

4. Run migrations and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Option 4: Supabase (Free Cloud PostgreSQL)

1. Sign up at https://supabase.com
2. Create a new project
3. Get your connection string from Settings > Database
4. Create `.env.local`:

```
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

5. Run migrations and seed:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Useful Commands

- **View database**: `npm run db:studio` - Opens Prisma Studio GUI
- **Reset database**: `npx prisma migrate reset` - Drops, recreates, migrates, and seeds
- **Generate client**: `npm run db:generate` - Regenerate Prisma Client after schema changes

## Current Implementation

The app currently uses **in-memory mock data** stored in the API routes. To switch to a real database:

1. Set up one of the above database options
2. The API routes will automatically use Prisma instead of the mock data array
3. All features (search, filter, CRUD) will work with the database

## Notes

- The seed script uses the mock data from `src/data/mock-gear.ts`
- JSON fields are automatically serialized/deserialized by Prisma
- The `in-use` status is mapped to `in_use` in the database enum
- Indexes are created on commonly queried fields for performance
