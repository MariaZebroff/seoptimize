# Main Page Creation Fix

## Problem Identified
After adding a site, the dashboard still shows "0 pages" instead of "1 page" even though the site was created successfully. The main page entry is not being created in the `pages` table.

## Root Cause Analysis

### 1. **Missing Database Table**
The `pages` table might not exist in the database. The application code expects a `pages` table to store individual page entries, but if this table doesn't exist, the main page creation will fail silently.

### 2. **Dashboard Not Refreshing**
After adding a site, the dashboard wasn't calling `loadSites()` to refresh the data and show the newly created main page.

## Solution Implemented

### 1. **Fixed Dashboard Refresh**
Updated `handleAddSite` in `src/app/dashboard/page.tsx` to reload sites after adding:

**Before:**
```typescript
const { data, error } = await addSite(newSiteUrl.trim(), newSiteTitle.trim() || undefined)
if (error) {
  // handle error
} else {
  setSites([data, ...sites]) // ❌ Just adds to state, doesn't refresh
  setNewSiteUrl("")
  setNewSiteTitle("")
  setShowAddSite(false)
}
```

**After:**
```typescript
const { data, error } = await addSite(newSiteUrl.trim(), newSiteTitle.trim() || undefined)
if (error) {
  // handle error
} else {
  // Reload sites to get the updated data with pages
  await loadSites() // ✅ Refreshes data from database
  setNewSiteUrl("")
  setNewSiteTitle("")
  setShowAddSite(false)
}
```

### 2. **Database Schema Fix**
Created `create-pages-table.sql` to ensure the `pages` table exists:

```sql
-- Create pages table for individual pages under sites
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  path TEXT NOT NULL,
  is_main_page BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pages" ON pages
  FOR SELECT USING (auth.uid() = user_id);
-- ... other policies
```

## How It Works Now

### **Site Creation Process:**
1. **User adds site**: `https://www.cisco.com/`
2. **Create site record**: Insert into `sites` table
3. **Create main page**: Insert into `pages` table with `is_main_page: true`
4. **Dashboard refreshes**: Calls `loadSites()` to get updated data
5. **Show result**: Dashboard displays "1 page" ✅

### **Data Flow:**
```
Add Site → Create Site Record → Create Main Page → Refresh Dashboard → Show "1 page"
```

## Testing Scenarios

### **Test Case 1: New Site Creation**
1. **Add site**: `https://www.cisco.com/`
2. **Expected**: Dashboard shows "1 page" immediately
3. **Result**: ✅ Should work after fixes

### **Test Case 2: Existing Site**
1. **Site exists**: Already has 1 main page
2. **Add sub-page**: Should show "2 pages" total
3. **Result**: ✅ Should work correctly

### **Test Case 3: Database Issues**
1. **Missing pages table**: Run `create-pages-table.sql`
2. **Add site**: Should create main page entry
3. **Result**: ✅ Should work after schema fix

## Deployment Steps

### 1. **Deploy Code Changes**
The dashboard refresh fix is already implemented.

### 2. **Create Database Table (Required)**
Run the SQL script in Supabase SQL editor:

```sql
-- Run create-pages-table.sql
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  path TEXT NOT NULL,
  is_main_page BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- ... rest of the script
```

### 3. **Fix Existing Sites (Optional)**
If you have existing sites without main page entries, run:

```sql
-- Run fix-missing-main-pages.sql
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

## Expected Results

### **Before Fix:**
```
Your Pages
┌─────────────────────────────────────┐
│ test                                │
│ 0 pages                    Delete   │ ← Wrong count
│ https://www.cisco.com/              │
└─────────────────────────────────────┘
```

### **After Fix:**
```
Your Pages
┌─────────────────────────────────────┐
│ test                                │
│ 1 page                     Delete   │ ← Correct count
│ https://www.cisco.com/              │
└─────────────────────────────────────┘
```

## Troubleshooting

### **If Still Shows "0 pages":**

1. **Check Database Table:**
   ```sql
   SELECT COUNT(*) FROM pages;
   ```
   Should return a number > 0.

2. **Check Site-Page Relationship:**
   ```sql
   SELECT s.url, p.url, p.is_main_page 
   FROM sites s 
   LEFT JOIN pages p ON s.id = p.site_id 
   WHERE s.url = 'https://www.cisco.com/';
   ```
   Should show the site and its main page.

3. **Check Console Logs:**
   Look for "Created main page for site: ..." message in browser console.

4. **Verify RLS Policies:**
   Make sure the `pages` table has proper RLS policies for the user.

### **Common Issues:**

- **Missing pages table**: Run `create-pages-table.sql`
- **RLS blocking access**: Check RLS policies
- **User authentication**: Ensure user is logged in
- **Database permissions**: Verify user can insert into pages table

## Impact

### **For New Sites:**
- ✅ **Immediate "1 page" count** when site is added
- ✅ **Main page is auditable** right away
- ✅ **Proper data consistency** from the start

### **For Existing Sites:**
- ✅ **Fixed page counts** after running SQL scripts
- ✅ **Main pages become auditable** with proper tracking
- ✅ **Data consistency** restored

The fix ensures that every site has a corresponding main page entry and the dashboard displays the correct page count immediately after adding a site! 🎉
