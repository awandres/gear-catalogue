# Code Audit Report

**Generated:** November 13, 2024  
**Purpose:** Comprehensive review of code quality, serverless compatibility, and architectural patterns

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. ✅ FIXED: PrismaClient Singleton Not Used Consistently

**Status:** RESOLVED  
**Files Fixed:** 8 API routes now use shared singleton  
**Impact:** Was causing 500 errors in production due to connection pool exhaustion

---

### 2. In-Memory State in Serverless Environment

**Status:** ⚠️ ACTIVE ISSUE  
**Impact:** HIGH - Data inconsistency across serverless function invocations  
**Files Affected:**

- `src/app/api/gear/[id]/image/route.ts`

**Problems:**

```typescript
// Line 5: Won't persist across serverless invocations
const imageCache = new Map<string, string>();

// Lines 12-40: Counter resets on each cold start
const apiCallTracker = {
  count: 0,
  resetDate: new Date().toDateString(),
  // ... methods that won't work in serverless
};
```

**Why This Breaks:**

- Each Vercel serverless function invocation may use a different instance
- Cache is lost between invocations
- API rate limiting counter resets unpredictably
- Multiple concurrent requests don't share state

**Solution:**

- Remove `imageCache` - rely on database queries (already cached by Prisma)
- Remove `apiCallTracker` - use existing database-backed tracker in `/api/admin/api-usage/route.ts`
- The proper implementation already exists! Just needs to be used consistently

**Evidence of Correct Pattern:**

- ✅ `/api/admin/api-usage/route.ts` - Database-backed API usage tracking (GOOD)
- ✅ `/api/gear/[id]/fetch-image/route.ts` - Uses `canMakeApiCalls()` from database (GOOD)
- ❌ `/api/gear/[id]/image/route.ts` - Uses in-memory tracker (BAD)

---

### 3. Deprecated/Redundant API Route

**Status:** ⚠️ NEEDS REVIEW  
**Impact:** MEDIUM - Confusion, possible bugs from outdated code  
**File:** `src/app/api/gear/[id]/image/route.ts`

**Analysis:**
This file appears to be **legacy code** that's been superseded by:

- `/api/gear/[id]/images/route.ts` - Get all images for gear
- `/api/gear/[id]/fetch-image/route.ts` - Fetch new images from Google

**Issues:**

1. Uses deprecated in-memory state (see issue #2)
2. Duplicates functionality available in newer routes
3. Has its own Google CSE integration (conflicts with fetch-image route)
4. 257 lines of potentially unused code

**Recommendation:**

- Audit frontend to see if this route is still used
- If yes: refactor to use database-backed tracking
- If no: delete this file entirely

---

## 🟠 HIGH PRIORITY (Fix Soon)

### 4. Inconsistent Error Response Formats

**Impact:** Makes frontend error handling difficult  
**Examples:**

```typescript
// Some routes return this:
{ error: "Unauthorized" }  // lowercase "error"

// Others return:
{ error: 'Failed to fetch gear' }

// Some include details:
{ error: 'Google API error', details: error, remainingCalls: available }

// Some include stack traces:
{ error: 'Failed', details: error.message, stack: error.stack }
```

**Recommendation:**
Create standardized error response type:

```typescript
type ApiError = {
  error: string; // User-friendly message
  code?: string; // Error code (e.g., 'UNAUTHORIZED', 'NOT_FOUND')
  details?: string; // Technical details (dev only)
  statusCode: number; // HTTP status
};
```

---

### 5. Environment Variables Accessed Directly Throughout Code

**Impact:** Hard to test, no validation, scattered config  
**Files:** 9 API routes access `process.env` directly

**Current Pattern:**

```typescript
const GOOGLE_CSE_API_KEY = process.env.GOOGLE_CSE_API_KEY;
const cronSecret = process.env.CRON_SECRET || "dev-secret-change-in-production";
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
```

**Problems:**

- No validation that required vars exist
- Defaults scattered across files
- Can't easily mock for testing
- Type safety issues (all strings)

**Recommendation:**
Create `/src/lib/config.ts`:

```typescript
export const config = {
  google: {
    cseApiKey: process.env.GOOGLE_CSE_API_KEY,
    cseId: process.env.GOOGLE_CSE_ID,
  },
  auth: {
    adminKey: process.env.ADMIN_ACCESS_KEY!,
    cronSecret: process.env.CRON_SECRET!,
  },
  app: {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  },
};

// Validate on startup
export function validateConfig() {
  const required = ["ADMIN_ACCESS_KEY", "CRON_SECRET", "DATABASE_URL"];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
}
```

---

### 6. No Input Validation on Many Routes

**Impact:** Security risk, data integrity issues  
**Status:** Partial validation exists but inconsistent

**Has Validation:**

- ✅ `/api/gear/route.ts` - Uses `validateGearItem()` for POST
- ✅ `/api/gear/[id]/route.ts` - Uses `validateGearItem()` for PUT

**Missing Validation:**

- ❌ `/api/gear/[id]/fetch-image/route.ts` - Minimal validation
- ❌ `/api/projects/*` - No validation visible
- ❌ Query parameters not validated (page, pageSize, etc.)

**Example Risk:**

```typescript
// What if someone sends page=-1 or pageSize=99999?
const page = parseInt(searchParams.get("page") || "1");
const pageSize = parseInt(searchParams.get("pageSize") || "24");
```

**Recommendation:**

- Create validation utilities or use Zod
- Validate all user inputs
- Sanitize before database queries

---

### 7. TypeScript `any` Usage

**Impact:** Loses type safety, hides bugs  
**Count:** 4 instances found in recently modified files

**Examples:**

```typescript
// src/app/api/gear/[id]/fetch-image/route.ts
const currentMedia = (gear.media as Record<string, any>) || {};

// src/app/api/gear/route.ts
const where: any = {};
```

**Recommendation:**

- Define proper types for `media`, Prisma where clauses
- Enable `noImplicitAny` in tsconfig (already enabled via `strict: true`)
- Fix remaining instances

---

### 8. Cron Secret Has Weak Default

**Impact:** Security risk in development  
**File:** `src/app/api/cron/daily-images/route.ts`

```typescript
const cronSecret = process.env.CRON_SECRET || "dev-secret-change-in-production";
```

**Problem:**

- Default is publicly visible in code
- If someone deploys without setting CRON_SECRET, this is the value
- Comment suggests it's a placeholder but code allows it

**Recommendation:**

```typescript
const cronSecret = process.env.CRON_SECRET;
if (!cronSecret) {
  return NextResponse.json(
    { error: "Server configuration error" },
    { status: 500 }
  );
}
```

---

### 9. No Request Timeout Protection

**Impact:** Functions could run until timeout (10s on Hobby plan)  
**Risk:** Cost overruns, poor UX

**Problem Routes:**

- `/api/admin/process-images` - Processes up to 50 items
- `/api/cron/daily-images` - Processes up to 20 items with delays
- `/api/admin/bulk-upload` - Processes entire JSON file

**Example:**

```typescript
// This could easily exceed 10s on Vercel Hobby plan
for (const gear of toProcess) {
  await fetchImageForGear(...);
  await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
}
// 20 items × 2s each = 40 seconds (will timeout!)
```

**Recommendation:**

- Add timeout checks in loops
- Return partial results if timeout approaching
- Consider background jobs for long-running tasks
- Or upgrade to Pro plan (60s timeout)

---

## 🟡 MEDIUM PRIORITY (Improve Code Quality)

### 10. Duplicate Authentication Logic

**Impact:** Maintenance burden, inconsistency risk  
**Count:** 14 routes manually check `isAdminRequest()`

**Current Pattern:**

```typescript
// Repeated in every admin route:
if (!(await isAdminRequest(request))) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

**Better Pattern:**
`/src/lib/admin.ts` already has `requireAdmin()` middleware but it's not used!

**Recommendation:**

- Use the existing `requireAdmin()` wrapper OR
- Create Next.js middleware for auth checking

---

### 11. Console.log Statements in Production Code

**Impact:** Performance, log noise  
**Count:** 19+ console statements in API routes

**Examples:**

```typescript
console.log("✅ Google API call made - usage incremented");
console.log(`Google CSE API: Found ${data.items.length} images...`);
console.log("Fetching API usage for date:", today.toISOString());
```

**Recommendation:**

- Create logging utility with levels (debug, info, warn, error)
- Only log errors and warnings in production
- Use Vercel's log drains for structured logging

---

### 12. No ESLint Custom Rules

**Impact:** Can't enforce patterns automatically  
**File:** `eslint.config.mjs` - Very basic configuration

**Current:**

```typescript
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // That's it!
]);
```

**Should Add:**

```typescript
rules: {
  // Ban PrismaClient except in /lib/db.ts
  'no-restricted-imports': ['error', {
    patterns: [{
      group: ['@prisma/client'],
      importNames: ['PrismaClient'],
      message: 'Use shared prisma instance from @/lib/db instead'
    }]
  }],

  // Enforce consistent error responses
  '@typescript-eslint/no-explicit-any': 'error',

  // No console in production
  'no-console': ['warn', { allow: ['warn', 'error'] }]
}
```

---

### 13. Lack of API Route Tests

**Impact:** Bugs reach production, hard to refactor safely  
**Status:** No test files found

**Recommendation:**

- Add Jest or Vitest
- Test critical paths: auth, CRUD operations, error handling
- Mock Prisma for fast tests
- Test API routes in isolation

---

### 14. Database Queries Not Optimized

**Impact:** Slower responses, higher costs  
**Examples:**

```typescript
// Fetches ALL gear, then filters in memory
const allGear = await prisma.gear.findMany({
  where: { category: { not: "needs-review" } },
});

// Then manually checks each one
for (const gear of allGear) {
  if (await hasOnlyPlaceholder(gear.id)) {
    gearNeedingImages.push(gear);
  }
}
```

**Better:**

```typescript
// Use database to do the filtering
const gearNeedingImages = await prisma.gear.findMany({
  where: {
    category: { not: "needs-review" },
    images: { none: {} }, // No images at all
  },
  take: 20,
});
```

---

### 15. No API Response Caching

**Impact:** Slower responses, more database queries  
**Opportunities:**

- `/api/gear/categories` - Changes rarely
- `/api/gear/tags` - Changes with new gear
- Individual gear items - Could use stale-while-revalidate

**Recommendation:**

```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
```

---

### 16. Mixed Error Logging Patterns

**Impact:** Inconsistent debugging experience

**Variations Found:**

```typescript
console.error("Error fetching gear:", error);
console.error(
  "Error stack:",
  error instanceof Error ? error.stack : "No stack trace"
);
console.error("[CRON] Error in daily image fetch:", error);
```

**Recommendation:**

- Standardize on one format
- Always include request context
- Use structured logging

---

### 17. Hardcoded Magic Numbers

**Impact:** Hard to maintain, unclear intent  
**Examples:**

```typescript
const DAILY_LIMIT = 100;  // Good! ✅
// But then...
await new Promise(resolve => setTimeout(resolve, 1000)); // What's 1000?
.slice(0, 5) // Why 5?
const toProcess = gearNeedingImages.slice(0, 20); // Why 20?
```

**Recommendation:**

```typescript
const GOOGLE_API_DELAY_MS = 1000;
const MAX_GEAR_PHOTOS = 5;
const CRON_BATCH_SIZE = 20;
```

---

## 🟢 LOW PRIORITY (Nice to Have)

### 18. No Pre-commit Hooks

**Recommendation:** Add Husky + lint-staged

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

### 19. TypeScript Strict Mode Already Enabled ✅

**Good!** `tsconfig.json` has `"strict": true`  
**But:** Still has some `any` usage (see issue #7)

---

### 20. Documentation Could Be More Granular

**Current:** Good docs in `/docs` folder  
**Missing:**

- API route documentation (OpenAPI/Swagger?)
- Architecture decision records (ADRs)
- Runbook for common issues

---

### 21. No Dependency Vulnerability Scanning

**Recommendation:**

```bash
npm audit
# Or use GitHub Dependabot (already enabled on GitHub repos)
```

---

## 📊 Summary Statistics

| Category         | Count | Critical | High | Medium | Low |
| ---------------- | ----- | -------- | ---- | ------ | --- |
| **Total Issues** | 21    | 3        | 6    | 9      | 3   |
| **Fixed**        | 1     | 1        | 0    | 0      | 0   |
| **Remaining**    | 20    | 2        | 6    | 9      | 3   |

---

## 🎯 Recommended Action Plan

### Phase 1: Get App Stable (1-2 hours)

1. ✅ Fix PrismaClient singleton (DONE)
2. Fix in-memory state in `/api/gear/[id]/image/route.ts`
3. Add timeout protection to long-running routes
4. Validate all environment variables on startup

### Phase 2: Improve Security (2-3 hours)

5. Standardize error responses
6. Add input validation to all routes
7. Remove cron secret default fallback
8. Centralize environment variable access

### Phase 3: Code Quality (3-4 hours)

9. Add ESLint custom rules
10. Replace console.log with proper logging
11. Optimize database queries
12. Add API response caching

### Phase 4: Long-term Health (ongoing)

13. Add API route tests
14. Set up pre-commit hooks
15. Document architecture decisions
16. Regular dependency updates

---

## 🔍 Files Requiring Immediate Attention

1. **`src/app/api/gear/[id]/image/route.ts`** - In-memory state, possibly deprecated
2. **`src/app/api/cron/daily-images/route.ts`** - Timeout risk, weak secret default
3. **`src/app/api/admin/process-images/route.ts`** - Timeout risk
4. **`src/app/api/admin/bulk-upload/route.ts`** - Timeout risk, no validation

---

## ✅ Things That Are Actually Good!

1. **TypeScript strict mode enabled** - Type safety enforced
2. **Prisma for database** - Type-safe queries
3. **Database-backed API tracking** - Proper serverless pattern
4. **Good documentation structure** - Well-organized `/docs` folder
5. **Admin authentication** - Basic auth is implemented
6. **Image management system** - Sophisticated multi-image support
7. **Project organization** - Clear separation of concerns

---

## 📝 Notes for Future Development

### Serverless Best Practices to Follow:

- ✅ Use shared database client singleton
- ✅ Store state in database, not memory
- ⚠️ Watch function execution time
- ⚠️ Implement proper timeout handling
- ❌ Never use file system for persistence

### Code Patterns to Maintain:

- Use `/lib/db.ts` for Prisma client
- Use `/lib/admin.ts` for authentication
- Follow existing error handling in newer routes
- Keep environment docs updated

---

**Last Updated:** November 13, 2024  
**Audited By:** AI Code Reviewer  
**Next Review:** After Phase 1 fixes completed
