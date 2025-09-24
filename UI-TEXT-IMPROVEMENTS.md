# UI Text Improvements

## Problem Identified
The user interface was using inconsistent terminology that could confuse users. The text referred to "pages" when users were actually adding websites/domains, which was misleading.

## Changes Made

### 1. **Empty State Message**
**Before:**
```
No pages added yet
Add your first page to start tracking its SEO performance.
[Add Your First Page]
```

**After:**
```
No sites added yet
Add your first website to start tracking its SEO performance.
[Add Your Website]
```

### 2. **Main Add Button**
**Before:**
```
[Add Page]
```

**After:**
```
[Add Website]
```

### 3. **Form Labels**
**Before:**
```
Page URL *
Site Title (Optional)
Placeholder: "My Page"
```

**After:**
```
Website URL *
Site Title (Optional)
Placeholder: "My Website"
```

## Why These Changes Matter

### **Clarity for Users:**
- **Before**: Users might think they're adding individual pages like `/about` or `/contact`
- **After**: Users understand they're adding entire websites/domains like `https://example.com`

### **Consistent Terminology:**
- **Before**: Mixed use of "page" and "site" terminology
- **After**: Clear distinction between "website" (domain) and "pages" (sub-pages within a website)

### **Better User Experience:**
- **Before**: Confusing workflow - "Add Page" but actually adding a website
- **After**: Clear workflow - "Add Website" to add a domain, then add sub-pages within it

## User Workflow Now

### **Step 1: Add Website**
1. User clicks "Add Your Website"
2. Enters website URL: `https://www.cisco.com/`
3. Optionally adds title: "Cisco Website"
4. System creates site and main page automatically

### **Step 2: Add Sub-pages (Optional)**
1. User can add sub-pages like `/about`, `/contact`, etc.
2. Or use "Auto-detect Sub-pages" to find them automatically
3. Each sub-page can be audited separately

## Terminology Clarification

| Term | Usage | Example |
|------|-------|---------|
| **Website** | Main domain/site | `https://www.cisco.com/` |
| **Site** | Same as website | `https://www.cisco.com/` |
| **Page** | Individual pages within a website | `/about`, `/contact`, `/products` |
| **Main Page** | The homepage of a website | `https://www.cisco.com/` (root) |
| **Sub-page** | Additional pages within a website | `/about`, `/contact` |

## Impact

### **For New Users:**
- ✅ **Clearer onboarding** - understand they're adding websites, not individual pages
- ✅ **Better expectations** - know they can add sub-pages later
- ✅ **Less confusion** - consistent terminology throughout the interface

### **For Existing Users:**
- ✅ **Better understanding** - clearer distinction between websites and pages
- ✅ **Improved workflow** - know when to add websites vs. sub-pages
- ✅ **Consistent experience** - terminology matches the actual functionality

## Before/After Comparison

### **Before (Confusing):**
```
No pages added yet
Add your first page to start tracking its SEO performance.
[Add Your First Page]

Form:
Page URL *: https://www.cisco.com/
Site Title: My Page
```

### **After (Clear):**
```
No sites added yet
Add your first website to start tracking its SEO performance.
[Add Your Website]

Form:
Website URL *: https://www.cisco.com/
Site Title: My Website
```

The UI text now accurately reflects what users are actually doing - adding websites/domains rather than individual pages! 🎉
