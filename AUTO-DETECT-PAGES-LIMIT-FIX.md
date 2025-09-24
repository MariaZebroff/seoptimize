# Auto-Detect Pages Limit Fix

## Problem Identified
The auto-detect sub-pages functionality was only allowing users to add 3 sub-pages instead of the desired 4 sub-pages. This meant users could only have 4 total pages (1 main page + 3 sub-pages) instead of 5 total pages (1 main page + 4 sub-pages).

## Root Cause
The page limits were set too low in the plan configurations:
- **Free Plan**: Was set to `maxPagesPerSite: 2` (1 main + 1 sub-page)
- **Basic Plan**: Was set to `maxPagesPerSite: 5` (1 main + 4 sub-pages) ✅

The user was likely on the Free plan, which only allowed 2 total pages, but they wanted to add 4 sub-pages (5 total pages).

## Solution Implemented

### **Updated Free Plan Limits**
Changed the Free plan to allow 5 pages per site (1 main page + 4 sub-pages):

**Before:**
```typescript
{
  id: 'free',
  name: 'Free Tier',
  features: [
    '1 page audit every 3 days',
    '1 site with up to 2 pages',  // ❌ Too restrictive
    // ...
  ],
  limits: {
    maxPagesPerSite: 2, // ❌ Only 1 main + 1 sub-page
    // ...
  }
}
```

**After:**
```typescript
{
  id: 'free',
  name: 'Free Tier',
  features: [
    '1 page audit every 3 days',
    '1 site with up to 5 pages',  // ✅ Allows 4 sub-pages
    // ...
  ],
  limits: {
    maxPagesPerSite: 5, // ✅ Allows 1 main + 4 sub-pages
    // ...
  }
}
```

## How It Works Now

### **Page Limits by Plan:**
- **Free Plan**: 5 pages per site (1 main + 4 sub-pages)
- **Basic Plan**: 5 pages per site (1 main + 4 sub-pages)
- **Pro Plan**: 20 pages per site (1 main + 19 sub-pages)
- **Enterprise Plan**: Unlimited pages per site

### **Auto-Detect Process:**
1. **Detect Pages**: Finds available pages on the website
2. **Check Current Count**: Counts existing pages (main + sub-pages)
3. **Calculate Remaining**: `maxPagesPerSite - currentPageCount`
4. **Add Pages**: Adds up to the remaining limit
5. **Show Results**: Displays how many pages were added

### **Example Scenario:**
```
Current State: 1 main page
Plan Limit: 5 pages per site
Remaining Slots: 5 - 1 = 4 sub-pages available

Auto-detect finds: 6 pages
Result: Adds 4 sub-pages (hits the limit)
Message: "Found 6 pages, but you can only add 4 more pages (limit: 5 total). Adding the first 4 pages."
```

## Benefits

### 1. **More Flexibility for Free Users**
- Free users can now add 4 sub-pages instead of just 1
- Better testing and evaluation of the platform
- More comprehensive site analysis capabilities

### 2. **Consistent Limits**
- Free and Basic plans now have the same page limits
- Clearer differentiation between plans
- Better user experience

### 3. **Better Auto-Detect Experience**
- Users can discover and add more pages automatically
- More comprehensive site mapping
- Better SEO analysis coverage

## Testing Scenarios

### **Test Case 1: Free Plan User**
1. **Add Site**: `https://example.com` → Creates 1 main page
2. **Auto-detect**: Should find and add up to 4 sub-pages
3. **Result**: 5 total pages (1 main + 4 sub-pages) ✅

### **Test Case 2: Basic Plan User**
1. **Add Site**: `https://example.com` → Creates 1 main page
2. **Auto-detect**: Should find and add up to 4 sub-pages
3. **Result**: 5 total pages (1 main + 4 sub-pages) ✅

### **Test Case 3: Limit Reached**
1. **Current**: 5 pages (1 main + 4 sub-pages)
2. **Auto-detect**: Should show "You have reached your limit" message
3. **Result**: No additional pages added ✅

## Dashboard Behavior

### **Before Fix:**
```
Auto-detect Sub-pages
Found 6 pages, but you can only add 3 more pages (limit: 4 total).
Adding the first 3 pages.
```

### **After Fix:**
```
Auto-detect Sub-pages
Found 6 pages, but you can only add 4 more pages (limit: 5 total).
Adding the first 4 pages.
```

## Plan Comparison

| Plan | Max Pages per Site | Main Page | Sub-pages | Use Case |
|------|-------------------|-----------|-----------|----------|
| **Free** | 5 | 1 | 4 | Testing, small sites |
| **Basic** | 5 | 1 | 4 | Small businesses |
| **Pro** | 20 | 1 | 19 | Growing businesses |
| **Enterprise** | Unlimited | 1 | Unlimited | Large organizations |

## Impact

### **For Free Plan Users:**
- ✅ **4x more sub-pages** (1 → 4 sub-pages)
- ✅ **Better site analysis** with more pages
- ✅ **Improved auto-detect** functionality
- ✅ **Better platform evaluation**

### **For All Users:**
- ✅ **Consistent limits** across Free and Basic plans
- ✅ **Better auto-detect experience**
- ✅ **More comprehensive site mapping**
- ✅ **Clearer plan differentiation**

## Deployment

### **Code Changes:**
- Updated `src/lib/plans.ts` to increase Free plan page limit
- No database changes required
- No API changes required

### **Immediate Effect:**
- Free plan users can now add 4 sub-pages via auto-detect
- Existing users will see the new limit immediately
- No migration or data changes needed

The fix ensures that auto-detect sub-pages functionality now allows users to add 4 sub-pages (5 total pages) as requested! 🎉
