# Remove PDF Reports for Basic Plan

## Overview
Successfully removed the "Download Audit Report" feature for Basic Plan users by properly implementing plan restrictions.

## What Was Done

### 1. **Plan Configuration Already Correct**
The Basic Plan was already configured correctly in `src/lib/plans.ts`:
- `exportReports: false` ❌ (PDF reports disabled)
- Features list doesn't include "Export reports to PDF"

### 2. **Added Plan Restriction Guard**
Updated `src/components/AuditHistory.tsx` to properly restrict PDF reports:

**Before:**
```tsx
{/* PDF Report Section */}
<PDFReport 
  auditData={audits} 
  siteName={audits.length > 0 ? audits[0].url : undefined}
  siteUrl={audits.length > 0 ? audits[0].url : undefined}
/>
```

**After:**
```tsx
{/* PDF Report Section - Restricted to Pro+ plans */}
<PlanRestrictionGuard user={user} requiredFeature="exportReports">
  <PDFReport 
    auditData={audits} 
    siteName={audits.length > 0 ? audits[0].url : undefined}
    siteUrl={audits.length > 0 ? audits[0].url : undefined}
  />
</PlanRestrictionGuard>
```

### 3. **Updated Component Interface**
- Added `user` prop to `AuditHistory` component
- Updated the component call in `src/app/audit/page.tsx` to pass the user prop

## How It Works Now

### For Basic Plan Users:
- ❌ **PDF Report section is hidden** - Users won't see the download buttons
- ✅ **Shows upgrade message** - If they somehow access it, they'll see a restriction message
- ✅ **Clear upgrade path** - Message includes "Upgrade Plan" button

### For Pro/Enterprise Users:
- ✅ **PDF Report section is visible** - Full access to download functionality
- ✅ **Both HTML and PDF downloads** - All export features available

## Plan Comparison

| Feature | Free | Basic | Pro | Enterprise |
|---------|------|-------|-----|------------|
| Export Reports | ❌ | ❌ | ✅ | ✅ |
| PDF Downloads | ❌ | ❌ | ✅ | ✅ |
| HTML Downloads | ❌ | ❌ | ✅ | ✅ |

## User Experience

### Basic Plan Users Will See:
1. **Audit History Section** - Charts and historical data (allowed)
2. **No PDF Report Section** - Completely hidden from view
3. **Upgrade Prompts** - If they try to access restricted features

### Pro/Enterprise Users Will See:
1. **Audit History Section** - Charts and historical data
2. **PDF Report Section** - Full download functionality
3. **Both HTML and PDF** - Multiple export options

## Technical Implementation

### Files Modified:
1. **`src/components/AuditHistory.tsx`**:
   - Added `PlanRestrictionGuard` import
   - Added `user` prop to interface
   - Wrapped `PDFReport` with restriction guard

2. **`src/app/audit/page.tsx`**:
   - Updated `AuditHistory` call to pass `user` prop

### Plan Restriction Logic:
- Uses existing `PlanRestrictionGuard` component
- Checks `exportReports` feature flag
- Shows appropriate restriction message for Basic Plan users
- Allows full access for Pro+ users

## Benefits

1. **Clear Feature Differentiation**: Basic Plan users understand what they get vs. Pro
2. **Upgrade Incentive**: Removes a valuable feature to encourage upgrades
3. **Consistent UX**: Uses the same restriction pattern as other premium features
4. **No Breaking Changes**: Existing Pro users retain full functionality

## Testing

### Test Scenarios:
1. **Basic Plan User**: Should not see PDF report section
2. **Pro Plan User**: Should see full PDF report functionality
3. **Free Plan User**: Should not see PDF report section
4. **Unauthenticated User**: Should not see PDF report section

### Expected Behavior:
- Basic Plan: No PDF report section visible
- Pro Plan: Full PDF report section with download buttons
- Free Plan: No PDF report section visible
- Upgrade prompts work correctly for restricted users

The PDF report feature is now properly restricted to Pro and Enterprise plans only, encouraging Basic Plan users to upgrade for this premium functionality.
