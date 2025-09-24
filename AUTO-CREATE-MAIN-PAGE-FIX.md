# Auto-Create Main Page Fix

## Problem Identified
When users add a site, it was only creating a record in the `sites` table but not automatically creating a corresponding main page entry in the `pages` table. This caused the dashboard to show "0 pages" even though the site URL itself represents a page that can be audited.

**Example Issue:**
- User adds site: `https://www.cisco.com/`
- Dashboard shows: "0 pages" ❌
- Should show: "1 page" (the main page) ✅

## Root Cause
The `addSite` function in `src/lib/supabaseAuth.ts` was only inserting into the `sites` table but not creating a corresponding page entry in the `pages` table. The site URL should be treated as the main page.

## Solution Implemented

### 1. **Enhanced addSite Function**
Updated `addSite` to automatically create a main page entry:

**Before:**
```typescript
export const addSite = async (url: string, title?: string) => {
  // Only created site record
  const { data, error } = await supabase
    .from('sites')
    .insert({
      url,
      title: title || null,
      user_id: user.id
    })
    .select()
    .single()
  return { data, error }
}
```

**After:**
```typescript
export const addSite = async (url: string, title?: string) => {
  // 1. Create the site
  const { data: site, error: siteError } = await supabase
    .from('sites')
    .insert({
      url,
      title: title || null,
      user_id: user.id
    })
    .select()
    .single()
  
  if (siteError) {
    return { data: null, error: siteError }
  }
  
  // 2. Automatically create a main page entry
  const urlObj = new URL(url)
  const path = urlObj.pathname || '/'
  
  await supabase
    .from('pages')
    .insert({
      user_id: user.id,
      site_id: site.id,
      url: url,
      title: title || null,
      path: path,
      is_main_page: true // This is the main page for the site
    })
  
  return { data: site, error: null }
}
```

### 2. **Database Fix Script**
Created `fix-missing-main-pages.sql` to fix existing sites that don't have main page entries:

```sql
-- Create main page entries for sites that don't have them
INSERT INTO pages (user_id, site_id, url, title, path, is_main_page, created_at, updated_at)
SELECT 
  s.user_id,
  s.id as site_id,
  s.url,
  s.title,
  CASE 
    WHEN s.url ~ '^https?://[^/]+/?$' THEN '/'
    ELSE regexp_replace(s.url, '^https?://[^/]+', '')
  END as path,
  true as is_main_page,
  s.created_at,
  NOW() as updated_at
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
WHERE p.id IS NULL;
```

## How It Works Now

### New Site Creation Process:
1. **Create Site**: Insert record into `sites` table
2. **Create Main Page**: Automatically insert corresponding record into `pages` table with `is_main_page: true`
3. **Dashboard Update**: Shows "1 page" immediately after site creation

### Page Count Logic:
- **Site URL**: Treated as the main page (`is_main_page: true`)
- **Sub-pages**: Additional pages added via "Add Sub-page" or "Auto-detect"
- **Total Count**: Main page + all sub-pages

## Benefits

### 1. **Accurate Page Count**
- Dashboard immediately shows "1 page" when site is added
- Users understand they can audit the main page right away
- No confusion about available pages

### 2. **Consistent Data Model**
- Every site has a corresponding main page entry
- Proper relationship between sites and pages
- Consistent with the page-based audit system

### 3. **Better User Experience**
- Clear indication that the site URL is auditable
- Immediate feedback when adding a site
- Logical progression from site → main page → sub-pages

### 4. **Audit System Integration**
- Main page is properly tracked in `page_audit_usage` table
- Audit limits work correctly for the main page
- Dashboard shows accurate audit status badges

## Example Before/After

### Before Fix:
```
Your Pages
┌─────────────────────────────────────┐
│ Untitled Site                       │
│ 0 pages                    Delete   │ ← Wrong count
│ https://www.cisco.com/              │
│ Added 9/24/2025                    │
└─────────────────────────────────────┘
```

### After Fix:
```
Your Pages
┌─────────────────────────────────────┐
│ Untitled Site                       │
│ 1 page                     Delete   │ ← Correct count
│ https://www.cisco.com/              │
│ Added 9/24/2025                    │
└─────────────────────────────────────┘
```

## Database Structure

### Sites Table:
```sql
sites:
- id (UUID)
- user_id (UUID)
- url (TEXT) -- Main site URL
- title (TEXT)
- created_at (TIMESTAMP)
```

### Pages Table:
```sql
pages:
- id (UUID)
- site_id (UUID) -- References sites.id
- user_id (UUID)
- url (TEXT) -- Page URL
- title (TEXT)
- path (TEXT) -- URL path
- is_main_page (BOOLEAN) -- true for main page
- created_at (TIMESTAMP)
```

### Relationship:
- **1 Site** → **1 Main Page** (automatically created)
- **1 Site** → **N Sub-pages** (manually added)

## Testing

### Test Scenarios:
1. **Add New Site**: Should show "1 page" immediately
2. **Add Sub-page**: Should show "2 pages" total
3. **Delete Main Page**: Should delete entire site
4. **Delete Sub-page**: Should show reduced count
5. **Audit Main Page**: Should work and show in audit status

### Expected Results:
- **New Site**: Immediately shows "1 page"
- **Page Count**: Accurate count of main page + sub-pages
- **Audit Status**: Main page shows audit status badges
- **Data Consistency**: Every site has a main page entry

## Deployment Steps

### 1. **Deploy Code Changes**
The enhanced `addSite` function will automatically create main pages for new sites.

### 2. **Fix Existing Data (Required)**
Run the fix script in `fix-missing-main-pages.sql` to create main page entries for existing sites:

```sql
-- Run in Supabase SQL editor
INSERT INTO pages (user_id, site_id, url, title, path, is_main_page, created_at, updated_at)
SELECT 
  s.user_id,
  s.id as site_id,
  s.url,
  s.title,
  CASE 
    WHEN s.url ~ '^https?://[^/]+/?$' THEN '/'
    ELSE regexp_replace(s.url, '^https?://[^/]+', '')
  END as path,
  true as is_main_page,
  s.created_at,
  NOW() as updated_at
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id AND p.is_main_page = true
WHERE p.id IS NULL;
```

### 3. **Verify Results**
- Check dashboard shows correct page counts
- Verify main pages are created for existing sites
- Test adding new sites shows "1 page" immediately

## Impact

### For New Sites:
- ✅ **Immediate "1 page" count** when site is added
- ✅ **Main page is auditable** right away
- ✅ **Audit status badges** work for main page
- ✅ **Consistent data model** from the start

### For Existing Sites:
- ✅ **Fixed page counts** after running the SQL script
- ✅ **Main pages become auditable** with proper tracking
- ✅ **Audit status badges** appear for main pages
- ✅ **Data consistency** restored

The fix ensures that every site has a corresponding main page entry, making the page count accurate and the audit system work properly for the main site URL.
