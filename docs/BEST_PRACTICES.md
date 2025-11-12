# Development Best Practices - Gear Catalogue App

## Table of Contents

1. [Data-Driven Development](#data-driven-development)
2. [Type Safety](#type-safety)
3. [Error Handling](#error-handling)
4. [Testing](#testing)

---

## Data-Driven Development

### 🎯 Core Principle: Backend is the Source of Truth

**Always design frontend forms and validations based on backend requirements.**

The backend defines the contract. The frontend implements it.

### Why This Matters

When frontend and backend validations don't match, you get:

- ❌ Confusing user experiences (form passes, then mysteriously fails)
- ❌ Wasted debugging time
- ❌ Data integrity issues
- ❌ User frustration and lost trust

When they DO match:

- ✅ Clear, immediate feedback to users
- ✅ Consistent validation errors
- ✅ Faster development
- ✅ Better data quality

### The Right Order of Development

```
1. Database Schema (Prisma)
   ↓
2. Backend Validation (API routes + utils)
   ↓
3. Frontend Types (derive from backend)
   ↓
4. Frontend Validation (mirror backend exactly)
   ↓
5. UI/UX Polish (labels, hints, error messages)
```

### Real Example: Gear Form Validation

**❌ What Went Wrong:**

```typescript
// Backend (src/lib/utils.ts) - The TRUTH
if (item.soundCharacteristics.tone.length < 2) {
  errors.push("At least 2 tone characteristics required");
}
if (item.tags.length < 3) {
  errors.push("At least 3 tags required");
}

// Frontend (GearForm.tsx) - MISMATCHED!
if (!formData.soundCharacteristics?.tone?.length) {
  setError("Please add at least one tone"); // Wrong! Only requires 1
}
if (!formData.tags?.length) {
  setError("Please add at least one tag"); // Wrong! Only requires 1
}
```

**Result:** Users could fill the form, submit, and get a vague server error.

**✅ What's Right:**

```typescript
// Backend (src/lib/utils.ts) - The TRUTH
if (item.soundCharacteristics.tone.length < 2) {
  errors.push("At least 2 tone characteristics required");
}
if (item.tags.length < 3) {
  errors.push("At least 3 tags required");
}

// Frontend (GearForm.tsx) - MATCHED!
if (formData.soundCharacteristics.tone.length < 2) {
  setError("Please add at least 2 tone characteristics");
  return;
}
if (formData.tags.length < 3) {
  setError("Please add at least 3 tags");
  return;
}
```

**Result:** Clear, immediate feedback. No server errors. Happy users.

### Step-by-Step: Building a Data-Driven Form

#### Step 1: Review the Database Schema

```prisma
// prisma/schema.prisma
model Gear {
  name                 String  // Required by DB
  brand                String  // Required by DB
  description          String  // Required by DB
  soundCharacteristics Json    // Required by DB
  tags                 String[] // Required by DB
  status               GearStatus // Enum, required
}
```

#### Step 2: Check Backend Validation

```typescript
// src/lib/utils.ts
export function validateGearItem(item: Partial<GearItem>): string[] {
  const errors: string[] = [];

  if (!item.name) errors.push("Name is required");
  if (!item.brand) errors.push("Brand is required");
  if (item.description.length < 50) {
    errors.push("Description must be at least 50 characters");
  }
  if (item.soundCharacteristics.tone.length < 2) {
    errors.push("At least 2 tone characteristics required");
  }
  if (item.tags.length < 3) {
    errors.push("At least 3 tags required");
  }

  return errors;
}
```

#### Step 3: Check API Route

```typescript
// src/app/api/gear/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();

  // This uses the validation from step 2
  const validationErrors = validateGearItem(body);
  if (validationErrors.length > 0) {
    return NextResponse.json({ errors: validationErrors }, { status: 400 });
  }

  // ... create gear
}
```

#### Step 4: Build Frontend Form to Match

```typescript
// src/components/admin/gear/GearForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);

  // EXACT SAME VALIDATION AS BACKEND
  if (!formData.name) {
    setError("Name is required");
    return;
  }
  if (!formData.brand) {
    setError("Brand is required");
    return;
  }
  if (formData.description.length < 50) {
    setError("Description must be at least 50 characters");
    return;
  }
  if (formData.soundCharacteristics.tone.length < 2) {
    setError("Please add at least 2 tone characteristics");
    return;
  }
  if (formData.tags.length < 3) {
    setError("Please add at least 3 tags");
    return;
  }

  // Submit to backend
  await onSubmit(formData);
};
```

#### Step 5: Add User Hints in UI

```tsx
<label>
  Tone Characteristics *
  <span className="text-sm text-gray-500">(at least 2 required)</span>
</label>

<label>
  Tags *
  <span className="text-sm text-gray-500">(at least 3 required)</span>
</label>

<label>
  Description *
  <span className="text-sm text-gray-500">(minimum 50 characters)</span>
</label>
```

### Checklist: Before Building Any Form

- [ ] 1. Open `prisma/schema.prisma` - Check required fields
- [ ] 2. Open `src/lib/utils.ts` - Find validation function
- [ ] 3. Open relevant API route - Check additional validation
- [ ] 4. List ALL validation rules on paper/doc
- [ ] 5. Build form with EXACT SAME validation
- [ ] 6. Add user hints for all requirements
- [ ] 7. Test with invalid data first
- [ ] 8. Test with valid data
- [ ] 9. Test edge cases (minimum values, empty arrays, etc.)

### Common Validation Patterns

#### String Length

```typescript
// Backend
if (item.description.length < 50) errors.push("Min 50 chars");

// Frontend
if (formData.description.length < 50) {
  setError("Description must be at least 50 characters");
}
```

#### Array Minimum

```typescript
// Backend
if (item.tags.length < 3) errors.push("At least 3 tags");

// Frontend
if (formData.tags.length < 3) {
  setError("Please add at least 3 tags");
}
```

#### Required Field

```typescript
// Backend
if (!item.name) errors.push("Name required");

// Frontend
if (!formData.name) {
  setError("Name is required");
}
```

#### Enum Validation

```typescript
// Backend
const validStatuses = ["available", "in-use", "archived"];
if (!validStatuses.includes(item.status)) {
  errors.push("Invalid status");
}

// Frontend
const GEAR_STATUSES = ["available", "in-use", "archived"];
if (!GEAR_STATUSES.includes(formData.status)) {
  setError("Please select a valid status");
}
```

### Tools to Keep Frontend/Backend in Sync

1. **Shared TypeScript Types**

   ```typescript
   // src/lib/types.ts - SHARED between frontend and backend
   export interface GearItem {
     name: string;
     brand: string;
     // ...
   }
   ```

2. **Validation Constants**

   ```typescript
   // src/lib/constants.ts
   export const VALIDATION_RULES = {
     MIN_DESCRIPTION_LENGTH: 50,
     MIN_TONES: 2,
     MIN_TAGS: 3,
   };

   // Use in both backend and frontend
   if (description.length < VALIDATION_RULES.MIN_DESCRIPTION_LENGTH) {
     // error
   }
   ```

3. **Zod Schema (Future Enhancement)**

   ```typescript
   // Define once, use everywhere
   import { z } from "zod";

   export const gearSchema = z.object({
     name: z.string().min(1),
     description: z.string().min(50),
     tags: z.array(z.string()).min(3),
   });
   ```

---

## Type Safety

### Use TypeScript Everywhere

- Never use `any` unless absolutely necessary
- Define interfaces for all data structures
- Use strict mode in `tsconfig.json`

### Derive Frontend Types from Backend

```typescript
// ✅ Good - Single source of truth
import type { Gear } from "@prisma/client";

// ❌ Bad - Duplicate definitions
interface GearItem {
  /* ... */
}
```

---

## Error Handling

### Always Provide Context

```typescript
// ❌ Bad
catch (error) {
  console.error(error);
  setError('Something went wrong');
}

// ✅ Good
catch (error) {
  console.error('Error creating gear:', error);
  setError(error instanceof Error ? error.message : 'Failed to create gear');
}
```

### Backend Errors Should Be Descriptive

```typescript
// ❌ Bad
return NextResponse.json({ error: "Invalid data" }, { status: 400 });

// ✅ Good
return NextResponse.json(
  {
    error: "Validation failed",
    details: ["Name is required", "Description must be at least 50 characters"],
  },
  { status: 400 }
);
```

---

## Testing

### Test Validation Edge Cases

Always test:

- Minimum values (0, 1, etc.)
- Maximum values
- Empty arrays
- Null/undefined
- Invalid types
- Boundary conditions

---

## Summary

### The Golden Rule

**Backend defines the contract. Frontend implements it. Always.**

When in doubt:

1. Check the backend first
2. Match it exactly in the frontend
3. Add clear user feedback
4. Test with invalid data

This saves hours of debugging and creates better user experiences.

---

_Last Updated: November 11, 2024_  
_Maintained by: Development Team_
