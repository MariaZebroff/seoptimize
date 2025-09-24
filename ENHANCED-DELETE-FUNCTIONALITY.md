# Enhanced Delete Functionality for Main Pages

## Overview
Enhanced the dashboard delete functionality to properly handle main page deletion, which should delete the entire site and all its sub-pages since they're technically part of that domain.

## What Was Implemented

### 1. **Enhanced Site Deletion Confirmation**
Updated `handleDeleteSite` function to show detailed information about what will be deleted:

**Before:**
```javascript
if (!confirm("Are you sure you want to delete this site and all its pages?")) return
```

**After:**
```javascript
// Shows detailed breakdown of what will be deleted
let confirmMessage = `Are you sure you want to delete this site?\n\n`
confirmMessage += `Site: ${site.url}\n`
confirmMessage += `Pages to be deleted: ${pages.length}\n`

if (mainPage) {
  confirmMessage += `- Main page: ${mainPage.url}\n`
}

if (subPages.length > 0) {
  confirmMessage += `- Sub-pages: ${subPages.length}\n`
  subPages.forEach(page => {
    confirmMessage += `  • ${page.url}\n`
  })
}

confirmMessage += `\nThis action cannot be undone. All audit data for this site will be permanently deleted.`
```

### 2. **Smart Main Page Deletion**
Enhanced `handleDeletePage` function to detect when a main page is being deleted:

**Key Features:**
- **Detection**: Checks if `page.is_main_page === true`
- **Warning**: Shows special warning message for main page deletion
- **Site Deletion**: Automatically calls `handleDeleteSite` instead of just deleting the page
- **Sub-page Listing**: Shows all sub-pages that will be deleted

**Warning Message:**
```
⚠️ WARNING: You are about to delete the MAIN PAGE!

This will delete the entire site and ALL its pages:

Main page: https://example.com/
Sub-pages that will also be deleted (2):
• https://example.com/about
• https://example.com/contact

This action cannot be undone. All audit data for this site will be permanently deleted.

Are you sure you want to delete the entire site?
```

### 3. **Visual Indicators**
Enhanced the UI to make it clear which page is the main page:

**Delete Button Styling:**
- **Main Page**: Red button with border, says "Delete Site"
- **Sub-pages**: Normal red button, says "Delete"
- **Tooltip**: Hover text explains the difference

**Button Styling:**
```javascript
className={`px-3 py-1 text-xs rounded ${
  page.is_main_page 
    ? 'bg-red-700 text-white hover:bg-red-800 border-2 border-red-800' 
    : 'bg-red-600 text-white hover:bg-red-700'
}`}
title={page.is_main_page ? 'Deleting the main page will delete the entire site and all its pages' : 'Delete this page'}
```

### 4. **Audit Status Updates**
Added automatic refresh of page audit statuses after deletions:
- Calls `loadPageAuditStatuses()` after successful deletions
- Ensures dashboard shows accurate audit limit information

## User Experience

### For Main Page Deletion:
1. **Clear Warning**: User sees ⚠️ WARNING message
2. **Detailed Breakdown**: Shows exactly what will be deleted
3. **Sub-page List**: Lists all sub-pages that will be affected
4. **Confirmation Required**: User must confirm the action
5. **Site Deletion**: Entire site and all pages are deleted

### For Sub-page Deletion:
1. **Normal Confirmation**: Standard delete confirmation
2. **Page-specific**: Only deletes the specific page
3. **Site Preserved**: Main page and other sub-pages remain

### Visual Cues:
- **Main Page Badge**: Green "Main" badge identifies main pages
- **Delete Button**: "Delete Site" vs "Delete" text
- **Button Styling**: Different colors and borders for main pages
- **Tooltips**: Hover text explains the difference

## Technical Implementation

### Database Structure Understanding:
- **Sites Table**: Contains main site information
- **Pages Table**: Contains individual pages with `site_id` references
- **Main Page**: Has `is_main_page: true` and `path: '/'`
- **Sub-pages**: Have `is_main_page: false` and specific paths

### Logic Flow:
1. **Page Deletion Request**: User clicks delete on a page
2. **Page Type Check**: Check if `page.is_main_page === true`
3. **Main Page Path**: If main page, show warning and delete entire site
4. **Sub-page Path**: If sub-page, show normal confirmation and delete only that page
5. **Status Update**: Refresh audit statuses after successful deletion

## Benefits

### 1. **Prevents Data Loss**
- Users understand the full impact of deleting a main page
- Clear warnings prevent accidental site deletion
- Detailed confirmation shows exactly what will be deleted

### 2. **Logical Behavior**
- Main page deletion = site deletion (makes sense conceptually)
- Sub-pages are treated as individual entities
- Maintains data integrity

### 3. **Better UX**
- Clear visual indicators for main vs sub-pages
- Detailed confirmation messages
- Helpful tooltips and warnings

### 4. **Audit Data Consistency**
- Automatically updates audit statuses after deletions
- Maintains accurate limit tracking
- Prevents orphaned audit data

## Example Scenarios

### Scenario 1: Delete Main Page
```
User clicks "Delete Site" on main page
↓
Shows warning: "⚠️ WARNING: You are about to delete the MAIN PAGE!"
↓
Lists all pages that will be deleted
↓
User confirms
↓
Entire site and all pages deleted
↓
Dashboard updates, audit statuses refreshed
```

### Scenario 2: Delete Sub-page
```
User clicks "Delete" on sub-page
↓
Shows confirmation: "Are you sure you want to delete this page?"
↓
User confirms
↓
Only that specific page deleted
↓
Dashboard updates, audit statuses refreshed
```

### Scenario 3: Delete Site (from site header)
```
User clicks "Delete" on site header
↓
Shows detailed breakdown of all pages
↓
User confirms
↓
Entire site and all pages deleted
↓
Dashboard updates, audit statuses refreshed
```

## Testing

### Test Cases:
1. **Delete main page** - Should delete entire site
2. **Delete sub-page** - Should delete only that page
3. **Delete site from header** - Should delete entire site
4. **Cancel deletion** - Should not delete anything
5. **Audit status updates** - Should refresh after deletion

### Expected Behavior:
- Main page deletion shows warning and deletes entire site
- Sub-page deletion shows normal confirmation and deletes only that page
- Visual indicators clearly distinguish main vs sub-pages
- Audit statuses update correctly after deletions
- Confirmation messages are clear and informative

The enhanced delete functionality now properly handles the relationship between main pages and their sub-pages, ensuring users understand the full impact of their actions and preventing accidental data loss.
