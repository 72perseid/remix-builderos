## Goal

Add an access group badge next to the "Personal Information" section heading in the Profile drawer.

## Implementation

### 1. New hook: `src/hooks/useUserAccessGroup.ts`

Fetches the user's enrollment joined to `access_groups` and returns `{ accessGroup, loading }` where `accessGroup` is `{ name, slug } | null`.

```ts
supabase
  .from('enrollments')
  .select('access_group_id, access_groups:access_group_id ( name, slug )')
  .eq('user_id', user.id)
  .maybeSingle();
```

Wrapped in React Query with a 5‑minute staleTime, keyed by `user.id`.

### 2. Update `src/components/dashboard/ProfileSheet.tsx`

In the "Personal Information" section heading row, switch the `<h2>` into a flex container and render the badge on the right:

```tsx
<div className="flex items-center justify-between gap-2">
  <h2 className="text-base font-semibold text-primary">Personal Information</h2>
  {accessGroup && (
    <Badge
      variant="secondary"
      className="bg-primary/10 text-primary border border-primary/20 font-medium"
    >
      {accessGroup.name}
    </Badge>
  )}
</div>
```

The badge is hidden while loading or when no group exists, so users without an enrollment never see an empty chip.

## Notes

- Uses the existing `Badge` component and semantic tokens (`primary`, `border`) — no hardcoded colors, fits the dark navy + blue accent system.
- No DB migration: existing RLS on `enrollments` (`user_id = auth.uid()`) and `access_groups` ("authenticated users can view") already permit this read.
- No changes to `useUserFeatures` — keeping the new hook small and single‑purpose.
