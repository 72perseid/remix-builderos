

# Restructure Navigation: Build Tab, App Details, and Route Renaming

## Overview

Three changes requested:
1. The ProfileSheet sidebar content (app details, editing) should become the **App Details** tab/page
2. The **Artifacts** page route should change from `/dashboard` to `/artifacts` (or at minimum, the tab label stays "Artifacts" and the route is updated)
3. The sidebar item becomes **"Build"** and the tab bar expands to 5 tabs

## Changes

### 1. Sidebar: Rename "Dashboard" to "Build" (`src/components/dashboard/DashboardSidebar.tsx`)
- Change `mainNavItems` title from "Dashboard" to "Build"
- Keep the URL pointing to `/dashboard` (or update to `/artifacts` -- see below)
- Optionally swap icon from `LayoutDashboard` to `Hammer` or keep it

### 2. Tab Bar: Expand to 5 tabs (`src/components/dashboard/DashboardTabs.tsx`)
Update the tabs array to:

```text
Project Board  |  Artifacts  |  Database Design  |  Master Prompt  |  App Details
```

- **Project Board** -> `/project-board`
- **Artifacts** -> `/dashboard` (keep existing route to avoid breaking things)
- **Database Design** -> `/database-design`
- **Master Prompt** -> `/master-prompt`
- **App Details** -> `/app-details`

Update `routeToTab` mapping for all these routes.

### 3. New App Details Page (`src/pages/AppDetailsPage.tsx`)
- Move the "Your Apps" section from `ProfileSheet` into a full page
- Show the selected app's details (name, description, one-liner, category, type, logo)
- Include edit and delete functionality (reuse the edit/delete dialog logic from ProfileSheet)
- List all apps with ability to switch between them

### 4. Simplify ProfileSheet (`src/components/dashboard/ProfileSheet.tsx`)
- Remove the "Your Apps" section and the edit/delete app dialogs
- Keep only user profile information (avatar, name, email, bio, location)
- This makes the ProfileSheet focused on user profile only

### 5. Routes (`src/App.tsx`)
- Add `/app-details` route wrapped in `ProtectedRoute` + `DashboardLayout`
- Wrap `/database-design` in `DashboardLayout` (currently missing it)
- Wrap `/master-prompt` in `DashboardLayout` (currently missing it)

### 6. Remove ArtifactBackButton from promoted pages
- `DatabaseDesignPage.tsx`: Remove `ArtifactBackButton` since it is now a top-level tab
- `MasterPromptPage.tsx`: Remove `ArtifactBackButton` since it is now a top-level tab

## Technical Details

### Files to create:
- `src/pages/AppDetailsPage.tsx` -- new page with app details/edit/delete, adapted from ProfileSheet's "Your Apps" section

### Files to modify:
- `src/components/dashboard/DashboardSidebar.tsx` -- rename "Dashboard" to "Build"
- `src/components/dashboard/DashboardTabs.tsx` -- 5 tabs with updated routes and mappings
- `src/components/dashboard/ProfileSheet.tsx` -- remove app-related sections, keep user profile only
- `src/App.tsx` -- add `/app-details` route; wrap `/database-design` and `/master-prompt` in `DashboardLayout`
- `src/pages/DatabaseDesignPage.tsx` -- remove `ArtifactBackButton`, remove outer padding/min-h-screen (DashboardLayout handles it)
- `src/pages/MasterPromptPage.tsx` -- remove `ArtifactBackButton`, remove outer padding/min-h-screen

