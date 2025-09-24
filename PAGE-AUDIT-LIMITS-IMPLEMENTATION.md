# Page-Specific Audit Limits Implementation

## Overview
This implementation changes the Basic Plan audit limits from "2 audits per day total" to "2 audits per page per day", allowing users to audit different pages multiple times while maintaining reasonable usage limits.

## Database Changes

### New Table: `page_audit_usage`
Run the SQL in `database-schema-page-audit-limits.sql` in your Supabase SQL editor:

```sql
-- Creates table to track audits per page URL for Basic Plan users
CREATE TABLE IF NOT EXISTS page_audit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  audit_count INTEGER NOT NULL DEFAULT 0,
  last_audit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, page_url, last_audit_date)
);
```

### Key Features:
- Tracks audit count per page URL per user per day
- Automatically resets daily (new day = fresh limit)
- Includes helper functions for checking and recording usage
- Row Level Security (RLS) enabled for data protection

## Code Changes

### 1. SubscriptionService Updates (`src/lib/subscriptionService.ts`)
- **Modified `canUserPerformAudit()`**: Now accepts optional `pageUrl` parameter
- **Added `checkPageSpecificAuditLimits()`**: Private method to check page-specific limits for Basic Plan users
- **Modified `recordAuditUsage()`**: Now accepts optional `pageUrl` parameter
- **Added `recordPageAuditUsage()`**: Private method to record page-specific usage

### 2. Audit API Updates (`src/app/api/audit/route.ts`)
- **Updated audit limit checking**: Now passes the URL to `canUserPerformAudit()`
- **Updated usage recording**: Now passes the URL to `recordAuditUsage()`

### 3. Plan Description Updates (`src/lib/plans.ts`)
- **Updated Basic Plan features**: Changed from "2 page audits per day" to "2 audits per page per day"

## How It Works

### For Basic Plan Users:
1. **Page-Specific Limits**: Each page URL can be audited up to 2 times per day
2. **Multiple Pages**: Users can audit different pages (up to 5 pages per site)
3. **Daily Reset**: Limits reset at midnight each day
4. **Example**: User can audit:
   - `https://example.com/` - 2 times
   - `https://example.com/about` - 2 times  
   - `https://example.com/contact` - 2 times
   - Total: 6 audits per day across different pages

### For Other Plans:
- **Free Plan**: Still uses 3-day limits (unchanged)
- **Pro Plan**: Still has unlimited audits (unchanged)
- **Enterprise Plan**: Still has unlimited audits (unchanged)

## Error Messages
When users reach their page limit, they'll see:
> "You have reached your limit of 2 audits per page per day. You can audit other pages or upgrade to Pro plan for unlimited audits."

## Database Functions Available

### `check_page_audit_limits(user_uuid, page_url, max_audits_per_page)`
Returns boolean indicating if user can perform more audits on the specific page.

### `get_page_audit_count(user_uuid, page_url)`
Returns current audit count for the page today.

### `record_page_audit_usage(user_uuid, page_url)`
Records an audit usage for the specific page.

### `reset_daily_page_audit_counts()`
Cleanup function to remove old records (older than 7 days).

## Testing
1. Run the SQL schema in Supabase
2. Test with a Basic Plan user:
   - Audit the same page 2 times (should work)
   - Try to audit the same page a 3rd time (should be blocked)
   - Audit a different page (should work)
3. Verify limits reset daily

## Benefits
- **Better User Experience**: Users can audit multiple pages without hitting global limits
- **More Flexible**: Allows focused testing on specific pages
- **Maintains Fair Usage**: Still prevents abuse with reasonable per-page limits
- **Scalable**: Easy to adjust limits per plan in the future
