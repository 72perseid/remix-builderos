import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

/**
 * Free tier (no `build_access`) is only allowed to use the Business Model
 * artifact. Everything else requires the paid Builder Suite.
 *
 * Single source of truth — extend this list (or replace with a DB-driven
 * lookup) when more artifacts become free.
 */
const FREE_TIER_ALLOWED: readonly ArtifactType[] = ['business_model'];

export function canAccessArtifact(
  type: ArtifactType,
  hasBuildAccess: boolean,
): boolean {
  if (hasBuildAccess) return true;
  return FREE_TIER_ALLOWED.includes(type);
}

export function isFreeTierArtifact(type: ArtifactType): boolean {
  return FREE_TIER_ALLOWED.includes(type);
}
