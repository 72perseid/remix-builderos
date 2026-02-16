

# Redesign App Details Page -- Inline Form

## Overview
Replace the current list-of-apps + dialog approach with a single inline form that shows and edits the currently selected app's details. No dialogs, no app list. Project switching is handled by the header dropdown.

## Form Layout

### Section 1: Basic Information (2-column grid)
- **Logo** -- `LogoUploader` component (large size) on the left
- **App Name** -- text input (`app_name`)
- **App One Liner** -- text input (`one_liner`)
- **App Category** -- select dropdown (`app_category`) with options: Productivity, Social, E-commerce, Education, Health, Finance, Entertainment, Other

### Section 2: Who is this app for?
- Radio-style toggle: "For Myself" / "For a Client" (maps to `app_for` column)

### Section 3: Description Fields
- **App Description** -- textarea (`app_description`)
- **How did you come up with this idea?** -- textarea (`idea_generation`)

### Section 4: Target Audience
- **User Persona Description** -- textarea (`persona_description`)
- **User Demographic Description** -- textarea (`user_demography`)

### Section 5: App Type
- Radio-style toggle: B2B / B2C / B2B2C (maps to `app_type` column)

### Footer
- "Save Changes" button aligned right

## Data Flow
- Read `selectedApp` from `useProjectContext()` to pre-fill the form
- On save, update the `app_ideas` row matching `selectedApp.id` via Supabase, then call `refreshApps()` to sync the context
- Show empty state with message if no app is selected

## Styling Rules
- All colors use CSS variable classes: `bg-card`, `text-foreground`, `text-muted-foreground`, `text-primary`, `border-border`, `bg-background`
- No hard-coded hex values or slate/blue color classes
- Labels use `text-primary` for section headers, `text-muted-foreground` for field labels

## Technical Details

### File: `src/pages/AppDetailsPage.tsx` (full rewrite)
- Remove all imports for Dialog, Badge, Check, Pencil, Trash2
- Remove app list rendering, edit dialog, delete dialog, and all associated state
- Add local form state initialized from `selectedApp` fields via `useEffect`
- Add `handleSave` that calls `supabase.from('app_ideas').update({...}).eq('id', selectedApp.id)` with all form fields: `app_name`, `one_liner`, `app_category`, `app_for`, `app_description`, `idea_generation`, `persona_description`, `user_demography`, `app_type`
- After successful save, call `refreshApps()` from ProjectContext and show success toast
- Use `LogoUploader` component with `appId={selectedApp.id}` for logo management
- Wrap content in a scrollable container with max-width for readability

### No database changes needed
The `app_ideas` table already has all the required columns.

