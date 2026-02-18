
# Make Profile Sheet Editable (Name, Bio, Timezone)

## What Changes

The Profile Sheet will be transformed from a read-only view into an editable form. Users will be able to edit their first name, last name, bio, and timezone. Email will remain read-only with a clear visual cue that it is tied to authentication. A "Save Changes" button will commit the edits to the `profiles` table via Supabase.

## Scope

No database migrations are needed — `first_name`, `last_name`, `bio`, and `timezone` already exist as columns in the `profiles` table, and the `UPDATE` RLS policy is already in place for authenticated users.

## Technical Changes

### 1. `src/hooks/useProfile.ts` — Add `updateProfile` function

Add a new `updateProfile` callback that accepts a partial profile object (first_name, last_name, bio, timezone) and performs a Supabase `UPDATE` on the `profiles` table. It will:
- Accept `{ first_name, last_name, bio, timezone }` as arguments
- Run `supabase.from('profiles').update(...).eq('id', user.id)`
- Update local state on success via `setProfile`
- Return `{ success: true }` or `{ error: string }`

Export `updateProfile` from the hook alongside the existing functions.

### 2. `src/components/dashboard/ProfileSheet.tsx` — Full refactor to editable form

#### State additions
```tsx
const [firstName, setFirstName] = useState('');
const [lastName, setLastName]   = useState('');
const [bio, setBio]             = useState('');
const [timezone, setTimezone]   = useState('');
const [saving, setSaving]       = useState(false);
```

A `useEffect` will seed these state values whenever `profile` loads/changes:
```tsx
useEffect(() => {
  if (profile) {
    setFirstName(profile.first_name || '');
    setLastName(profile.last_name   || '');
    setBio(profile.bio              || '');
    setTimezone(profile.timezone    || '');
  }
}, [profile]);
```

#### Dirty tracking
Compute `isDirty` to only enable the Save button when something actually changed, preventing unnecessary saves:
```tsx
const isDirty =
  firstName !== (profile?.first_name || '') ||
  lastName  !== (profile?.last_name  || '') ||
  bio       !== (profile?.bio        || '') ||
  timezone  !== (profile?.timezone   || '');
```

#### UI layout changes

Replace the static read-only blocks in "User Details" with an editable form:

- **First Name** — `<Input>` field
- **Last Name** — `<Input>` field
- **Email** — read-only display with a small lock icon and a note: *"Email is managed through authentication and cannot be changed here."*
- **Bio** — `<Textarea>` (a few rows, placeholder "Tell us a bit about yourself…")
- **Timezone** — `<Select>` component populated with a curated list of common IANA timezone strings (e.g. `America/New_York`, `Europe/London`, `Asia/Tokyo`, etc. — approximately 20–30 common ones)

#### Save button

A primary "Save Changes" button is placed at the bottom of the form, above the Sign Out button, separated by a `<Separator>`. It:
- Is disabled when `!isDirty || saving || uploading`
- Shows a `<Loader2>` spinner while saving
- Calls `updateProfile({ first_name: firstName, last_name: lastName, bio, timezone })`
- Shows `toast.success('Profile saved')` or `toast.error(...)` accordingly

#### Imports to add
- `Input` from `@/components/ui/input`
- `Textarea` from `@/components/ui/textarea`
- `Select, SelectContent, SelectItem, SelectTrigger, SelectValue` from `@/components/ui/select`
- `Lock` icon from `lucide-react`
- `useState`, `useEffect` from `react`

## Summary of Files Changed

| File | Change |
|---|---|
| `src/hooks/useProfile.ts` | Add `updateProfile` function |
| `src/components/dashboard/ProfileSheet.tsx` | Replace static display with editable form + Save button |

No database migration required.
