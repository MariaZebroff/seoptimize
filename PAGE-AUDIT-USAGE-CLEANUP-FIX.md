# Page Audit Usage Cleanup Fix

## Problem Identified
When users delete sites or pages, the page audit usage data was not being cleaned up from the `page_audit_usage` table. This caused the dashboard to show stale audit usage statistics, including pages that no longer exist.

**Example Issue:**
- User deletes a site with 3 pages
- Dashboard still shows "3 Limit Reached" in the audit usage summary
- The deleted pages' audit records remain in the database

## Root Cause
The `deleteSite` and `deletePage` functions in `src/lib/supabaseAuth.ts` were only deleting from the `sites` and `pages` tables, but not cleaning up the related `page_audit_usage` records.

## Solution Implemented

### 1. **Enhanced deleteSite Function**
Updated `deleteSite` to clean up all related page audit usage records:

**Before:**
```typescript
export const deleteSite = async (siteId: string) => {
  // Only deleted from sites table
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('user_id', user.id)
  return { error }
}
```

**After:**
```typescript
export const deleteSite = async (siteId: string) => {
  // 1. Get all pages for this site
  const { data: pages } = await supabase
    .from('pages')
    .select('url')
    .eq('site_id', siteId)
    .eq('user_id', user.id)
  
  // 2. Get the site URL (main page)
  const { data: site } = await supabase
    .from('sites')
    .select('url')
    .eq('id', siteId)
    .eq('user_id', user.id)
    .single()
  
  // 3. Collect all URLs to cleanup
  const urlsToCleanup = [site.url]
  if (pages) {
    pages.forEach(page => urlsToCleanup.push(page.url))
  }
  
  // 4. Clean up page audit usage records
  await supabase
    .from('page_audit_usage')
    .delete()
    .eq('user_id', user.id)
    .in('page_url', urlsToCleanup)
  
  // 5. Delete the site
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId)
    .eq('user_id', user.id)
  
  return { error }
}
```

### 2. **Enhanced deletePage Function**
Updated `deletePage` to clean up individual page audit usage records:

**Before:**
```typescript
export const deletePage = async (pageId: string) => {
  // Only deleted from pages table
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)
    .eq('user_id', user.id)
  return { data, error }
}
```

**After:**
```typescript
export const deletePage = async (pageId: string) => {
  // 1. Get the page URL before deleting
  const { data: page } = await supabase
    .from('pages')
    .select('url')
    .eq('id', pageId)
    .eq('user_id', user.id)
    .single()
  
  // 2. Clean up page audit usage record
  await supabase
    .from('page_audit_usage')
    .delete()
    .eq('user_id', user.id)
    .eq('page_url', page.url)
  
  // 3. Delete the page
  const { data, error } = await supabase
    .from('pages')
    .delete()
    .eq('id', pageId)
    .eq('user_id', user.id)
  
  return { data, error }
}
```

### 3. **Database Cleanup Script**
Created `cleanup-orphaned-audit-usage.sql` to clean up any existing orphaned records:

```sql
-- Delete orphaned page audit usage records
DELETE FROM page_audit_usage 
WHERE id IN (
  SELECT pau.id
  FROM page_audit_usage pau
  LEFT JOIN pages p ON pau.page_url = p.url AND pau.user_id = p.user_id
  LEFT JOIN sites s ON pau.page_url = s.url AND pau.user_id = s.user_id
  WHERE p.id IS NULL AND s.id IS NULL
);
```

## How It Works Now

### Site Deletion Process:
1. **Collect URLs**: Get all page URLs associated with the site
2. **Clean Audit Data**: Delete all `page_audit_usage` records for those URLs
3. **Delete Site**: Delete the site (cascades to delete pages)
4. **Update Dashboard**: Dashboard refreshes and shows accurate statistics

### Page Deletion Process:
1. **Get Page URL**: Retrieve the page URL before deletion
2. **Clean Audit Data**: Delete the `page_audit_usage` record for that URL
3. **Delete Page**: Delete the page
4. **Update Dashboard**: Dashboard refreshes and shows accurate statistics

## Benefits

### 1. **Accurate Dashboard Statistics**
- Audit usage summary shows only existing pages
- No more stale "Limit Reached" counts for deleted pages
- Real-time accuracy of available audits

### 2. **Data Consistency**
- No orphaned audit usage records
- Clean database with no dangling references
- Proper referential integrity

### 3. **Better User Experience**
- Users see accurate audit limits after deletions
- No confusion about available audits
- Dashboard reflects current state

### 4. **Database Health**
- Prevents accumulation of orphaned records
- Maintains clean data structure
- Improves query performance

## Testing

### Test Scenarios:
1. **Delete Site with Multiple Pages**: Should clean up all page audit usage
2. **Delete Individual Page**: Should clean up only that page's audit usage
3. **Delete Main Page**: Should clean up entire site's audit usage
4. **Dashboard Refresh**: Should show accurate statistics after deletion

### Expected Results:
- **Before Fix**: Dashboard shows stale audit counts
- **After Fix**: Dashboard shows accurate audit counts
- **Database**: No orphaned `page_audit_usage` records

## Deployment Steps

### 1. **Deploy Code Changes**
The enhanced functions are ready to deploy and will automatically clean up new deletions.

### 2. **Clean Existing Data (Optional)**
Run the cleanup script in `cleanup-orphaned-audit-usage.sql` to clean up any existing orphaned records:

```sql
-- Run in Supabase SQL editor
DELETE FROM page_audit_usage 
WHERE id IN (
  SELECT pau.id
  FROM page_audit_usage pau
  LEFT JOIN pages p ON pau.page_url = p.url AND pau.user_id = p.user_id
  LEFT JOIN sites s ON pau.page_url = s.url AND pau.user_id = s.user_id
  WHERE p.id IS NULL AND s.id IS NULL
);
```

### 3. **Verify Results**
- Check dashboard shows accurate audit statistics
- Verify no orphaned records in database
- Test site/page deletion functionality

## Example Before/After

### Before Fix:
```
Daily Audit Usage
┌─────────────────┬─────────────────┬─────────────────┐
│   Pages Available │  Partially Used │  Limit Reached  │
│        2         │        0        │        3        │ ← Stale data
└─────────────────┴─────────────────┴─────────────────┘
```

### After Fix:
```
Daily Audit Usage
┌─────────────────┬─────────────────┬─────────────────┐
│   Pages Available │  Partially Used │  Limit Reached  │
│        2         │        0        │        0        │ ← Accurate data
└─────────────────┴─────────────────┴─────────────────┘
```

The fix ensures that page audit usage data is properly cleaned up when sites or pages are deleted, maintaining accurate dashboard statistics and database integrity.
