# Gear Catalogue App

A comprehensive studio gear management system built with Next.js, TypeScript, and PostgreSQL.

> **⚡ Important:** This project follows **data-driven development** principles. Always check backend validation rules before building frontend forms. See [Best Practices](docs/BEST_PRACTICES.md) for details.

## Documentation

- **[PROJECT.md](PROJECT.md)** - Complete project overview and setup guide
- **[BEST_PRACTICES.md](docs/BEST_PRACTICES.md)** - Development principles and lessons learned
- **[PHASE3_SUMMARY.md](docs/PHASE3_SUMMARY.md)** - Latest implementation details (Image Management)
- **[AGENT_HANDOFFS.md](docs/AGENT_HANDOFFS.md)** - Complete development history

## Quick Start

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

Ready to deploy to production? We've got you covered!

### 📚 Deployment Documentation

- **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** - Complete step-by-step deployment guide
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Checklist to track your progress
- **[ENVIRONMENT_VARIABLES.md](docs/ENVIRONMENT_VARIABLES.md)** - All environment variables explained
- **[env.template](env.template)** - Template for required environment variables

### 🚀 Quick Deployment (Vercel)

1. Push your code to GitHub
2. Import repository to [Vercel](https://vercel.com/new)
3. Set up environment variables (see `env.template`)
4. Deploy!
5. Run database migrations (see deployment guide)

**Platform:** Vercel (recommended)  
**Database:** PostgreSQL (Vercel Postgres or Supabase)  
**Storage:** Vercel Blob  
**Time:** ~30 minutes

For detailed instructions, see **[docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)**
