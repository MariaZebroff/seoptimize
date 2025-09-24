# Page Audit Counting Fix

## Problem Identified
The page audit usage tracking was not working correctly. Users could perform more than 2 audits per page per day because the audit count was not being properly incremented.

## Root Cause
The issue was in the `recordPageAuditUsage` function in both:
1. `src/lib/subscriptionService.ts`
2. `src/app/api/page-audit-usage/route.ts`

The problem was using `upsert` with `audit_count: 1` instead of properly incrementing the existing count. This meant:
- First audit: Creates record with `audit_count: 1` ✅
- Second audit: Updates record but sets `audit_count: 1` again ❌ (should be 2)
- Third audit: Updates record but sets `audit_count: 1` again ❌ (should be 3)

## Solution Implemented

### 1. Fixed SubscriptionService (`src/lib/subscriptionService.ts`)
**Before:**
```typescript
const { error } = await supabase
  .from('page_audit_usage')
  .upsert({
    user_id: userId,
    page_url: pageUrl,
    audit_count: 1,  // ❌ Always sets to 1
    last_audit_date: currentDate,
    updated_at: new Date().toISOString()
  }, {
    onConflict: 'user_id,page_url,last_audit_date',
    ignoreDuplicates: false
  })
```

**After:**
```typescript
// First, try to get existing record
const { data: existingRecord, error: fetchError } = await supabase
  .from('page_audit_usage')
  .select('audit_count')
  .eq('user_id', userId)
  .eq('page_url', pageUrl)
  .eq('last_audit_date', currentDate)
  .single()

if (existingRecord) {
  // Update existing record by incrementing audit count
  const { error: updateError } = await supabase
    .from('page_audit_usage')
    .update({
      audit_count: existingRecord.audit_count + 1,  // ✅ Properly increments
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('page_url', pageUrl)
    .eq('last_audit_date', currentDate)
} else {
  // Insert new record
  const { error: insertError } = await supabase
    .from('page_audit_usage')
    .insert({
      user_id: userId,
      page_url: pageUrl,
      audit_count: 1,  // ✅ First audit
      last_audit_date: currentDate,
      updated_at: new Date().toISOString()
    })
}
```

### 2. Fixed API Endpoint (`src/app/api/page-audit-usage/route.ts`)
Applied the same fix to the API endpoint to ensure consistency.

### 3. Database Cleanup Script (`fix-page-audit-usage.sql`)
Created a SQL script to fix any existing incorrect data in the database:
- Removes duplicate records for the same user/page/date
- Updates audit counts to reflect actual usage
- Provides options for complete data reset if needed

## How to Apply the Fix

### 1. Deploy Code Changes
The code changes are ready to deploy. The fixed functions will now properly increment audit counts.

### 2. Fix Existing Data (Optional)
If you have existing incorrect data, run the SQL script in `fix-page-audit-usage.sql`:

```sql
-- Clean up duplicate records for today
DELETE FROM page_audit_usage 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, page_url, last_audit_date) id
  FROM page_audit_usage
  WHERE last_audit_date = CURRENT_DATE
  ORDER BY user_id, page_url, last_audit_date, updated_at DESC
);

-- Update audit counts to reflect actual usage
UPDATE page_audit_usage 
SET audit_count = (
  SELECT COUNT(*) 
  FROM page_audit_usage p2 
  WHERE p2.user_id = page_audit_usage.user_id 
    AND p2.page_url = page_audit_usage.page_url 
    AND p2.last_audit_date = page_audit_usage.last_audit_date
)
WHERE last_audit_date = CURRENT_DATE;
```

### 3. Test the Fix
1. Try auditing the same page multiple times
2. Check that the audit count properly increments: 1 → 2 → blocked
3. Verify dashboard shows correct status badges
4. Test with different pages to ensure limits work per page

## Expected Behavior After Fix

### First Audit:
- ✅ Creates record with `audit_count: 1`
- ✅ Dashboard shows "1/2 Available"
- ✅ User can perform another audit

### Second Audit:
- ✅ Updates record to `audit_count: 2`
- ✅ Dashboard shows "Limit Reached"
- ✅ User is blocked from further audits on this page

### Third Audit Attempt:
- ❌ Blocked with message: "You have reached your limit of 2 audits per page per day"
- ✅ User can still audit other pages

## Verification Steps

1. **Check Database:**
   ```sql
   SELECT user_id, page_url, audit_count, last_audit_date 
   FROM page_audit_usage 
   WHERE last_audit_date = CURRENT_DATE;
   ```

2. **Check Logs:**
   Look for messages like:
   - "Page audit usage recorded for [URL]: 1 audit"
   - "Page audit usage updated for [URL]: 2 audits"

3. **Check Dashboard:**
   - Status badges should update correctly
   - Summary statistics should be accurate

## Benefits of the Fix

1. **Proper Limit Enforcement**: Users can no longer exceed 2 audits per page per day
2. **Accurate Tracking**: Audit counts reflect actual usage
3. **Correct Dashboard Display**: Status badges show real-time accurate information
4. **Data Integrity**: Database records are consistent and reliable

The fix ensures that the page-specific audit limits work as intended, providing users with accurate feedback and preventing abuse of the system.
