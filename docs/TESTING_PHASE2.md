# Testing Phase 2 - CRUD Operations

## Quick Start Guide

### 1. Start the Development Server

```bash
cd /Users/alexwandres/claudecode/gear-catalogue-app
npm run dev
```

Navigate to: **http://localhost:3000/gear**

---

## 2. Enable Admin Mode

1. Look for **"Admin Access"** button in the top header
2. Click it to open the admin key dialog
3. Enter your admin key: `demo-key-123` (or whatever is in your .env.local as `ADMIN_ACCESS_KEY`)
4. Click "Unlock"

**You should see:**

- Green checkmark or success indicator
- Admin toolbar appears at the bottom of the page
- "Create New Gear" button appears at the top of the gear grid
- Edit (pencil) and Delete (trash) icons appear on each gear card

---

## 3. Test: Create New Gear

### Steps:

1. Click the **"Create New Gear"** button (blue button with plus icon)
2. Modal should open with an empty form

### Fill out the form:

- **Name:** `Test Compressor` (required)
- **Brand:** `Test Brand` (required)
- **Category:** Select `dynamics` from dropdown (required)
- **Subcategory:** Select `compressor` from dropdown (required, enabled after category selection)
- **Description:** `This is a test compressor for Phase 2 testing` (required)
- **Status:** Select `available` (required)

### Add Sound Characteristics:

- **Tone:** Type `warm` and click "Add" (or press Enter)
- **Tone:** Type `punchy` and click "Add"
- **Quality:** Type `transparent` and click "Add"
- **Quality:** Type `smooth` and click "Add"

### Add Tags:

- Type `compressor` and click "Add"
- Type `dynamics` and click "Add"
- Type `test` and click "Add"

### Notes (optional):

- Type: `Created during Phase 2 testing`

### Submit:

1. Click **"Create Gear"** button
2. Modal should close
3. Gear list should refresh
4. Your new gear should appear in the grid

**Expected Result:** ✅ New gear appears immediately, no page reload needed

---

## 4. Test: Edit Existing Gear

### Steps:

1. Find any gear card (including the one you just created)
2. Click the **pencil icon** (edit button) in the top-right of the card
3. Modal should open with the form pre-filled

### Make changes:

- Change the description
- Add a new tag by typing and clicking "Add"
- Remove a tone by clicking the "×" on a tone badge
- Change the status

### Submit:

1. Click **"Update Gear"** button
2. Modal should close
3. Gear list should refresh
4. Your changes should appear immediately

**Expected Result:** ✅ Changes appear immediately on the card

---

## 5. Test: Delete Gear

### Steps:

1. Find the gear you want to delete
2. Click the **trash icon** (delete button) in the top-right of the card
3. Confirmation modal should open

### Modal should show:

- Title: "Delete Gear Item"
- Message: "Are you sure you want to delete "[Gear Name]"? This action cannot be undone."
- Red "Delete" button
- Gray "Cancel" button

### Confirm deletion:

1. Click **"Delete"** button (red)
2. Modal should close
3. Gear list should refresh
4. The gear should disappear from the grid

**Expected Result:** ✅ Gear is removed immediately

---

## 6. Test: Form Validation

### Try to create gear with missing fields:

1. Click "Create New Gear"
2. Leave some required fields empty
3. Click "Create Gear"

**Expected Result:** ✅ Error message appears: "Please fill in all required fields"

### Try to create gear without characteristics:

1. Fill in name, brand, category, subcategory, description
2. Don't add any tones or qualities
3. Click "Create Gear"

**Expected Result:** ✅ Error message appears: "Please add at least one tone and quality"

### Try to create gear without tags:

1. Fill in all fields
2. Add tones and qualities
3. Don't add any tags
4. Click "Create Gear"

**Expected Result:** ✅ Error message appears: "Please add at least one tag"

---

## 7. Test: Modal Interactions

### Test closing methods:

1. Click "Create New Gear" to open modal
2. Try these ways to close:
   - Click "Cancel" button → ✅ Should close
   - Click the dark backdrop outside the modal → ✅ Should close
   - Press ESC key → ✅ Should close

### Test body scroll lock:

1. Open any modal
2. Try to scroll the page behind the modal

**Expected Result:** ✅ Page should not scroll while modal is open

---

## 8. Test: Admin Mode Toggle

### Disable admin mode:

1. Click "Admin Access" button in header again (while already in admin mode)
2. The admin access should be disabled

**Expected Result:** ✅

- "Create New Gear" button disappears
- Edit/Delete buttons disappear from cards
- Admin toolbar disappears from bottom

### Re-enable admin mode:

1. Click "Admin Access" button
2. Enter key again

**Expected Result:** ✅ All admin features reappear

---

## 9. Test: Unauthorized Access (Security)

### Test API protection:

Open browser console and try:

```javascript
// Try to create gear without admin key
fetch("/api/gear", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Hack Test",
    brand: "Test",
    category: "dynamics",
    subcategory: "compressor",
    description: "Test",
    status: "available",
    soundCharacteristics: { tone: ["test"], qualities: ["test"] },
    tags: ["test"],
  }),
})
  .then((r) => r.json())
  .then(console.log);
```

**Expected Result:** ✅ Response should be: `{ error: 'Unauthorized' }` with status 401

---

## 10. Test: Responsive Design

### Test on different screen sizes:

1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M or Cmd+Shift+M)
3. Test these sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1280px)

**Expected Results:** ✅

- Modal is centered and fits screen
- Form is readable and usable
- Buttons are accessible
- No horizontal scroll

---

## 🐛 Known Issues to Check

If you encounter any of these, let me know:

- [ ] Modal doesn't close when clicking backdrop
- [ ] Form submission doesn't refresh the gear list
- [ ] Edit button doesn't pre-fill the form
- [ ] Delete confirmation doesn't show gear name
- [ ] Admin buttons visible when not in admin mode
- [ ] TypeScript errors in console
- [ ] Console errors during operations

---

## ✅ Success Checklist

All of these should work:

- [ ] Can enable admin mode with key
- [ ] "Create New Gear" button appears in admin mode
- [ ] Can create a new gear item with all fields
- [ ] New gear appears in grid immediately after creation
- [ ] Can edit existing gear
- [ ] Changes appear immediately after edit
- [ ] Can delete gear with confirmation
- [ ] Gear disappears immediately after deletion
- [ ] Form validation works (shows errors for missing fields)
- [ ] Can add/remove tones, qualities, and tags
- [ ] Modal closes with Cancel, backdrop click, and ESC key
- [ ] Page doesn't scroll when modal is open
- [ ] Edit/Delete buttons only visible in admin mode
- [ ] API routes protected (unauthorized requests fail)
- [ ] Responsive on mobile, tablet, desktop

---

## 📊 Database Verification

### Check the database to verify CRUD operations:

```bash
# Open Prisma Studio
npm run db:studio
```

Or use psql:

```bash
psql -d gear_catalog

# List all gear
SELECT id, name, brand, status FROM "Gear";

# Check gear you created
SELECT * FROM "Gear" WHERE name = 'Test Compressor';

# Verify it was deleted
SELECT * FROM "Gear" WHERE name = 'Test Compressor';  -- Should return 0 rows
```

---

## 🎉 If Everything Works...

Congratulations! Phase 2 is complete and ready for production!

You can now:

- Move on to Phase 3 (Image Management)
- Deploy to staging for client demo
- Start user acceptance testing
- Document any additional requirements

---

## 📝 Report Issues

If you find any issues during testing, please note:

1. **What you were doing** (step-by-step)
2. **What you expected to happen**
3. **What actually happened**
4. **Error messages** (check browser console with F12)
5. **Screenshots** (if UI issue)

This will help debug and fix any problems quickly!


