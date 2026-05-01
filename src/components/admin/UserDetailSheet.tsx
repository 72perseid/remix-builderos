import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { useAdminUserDetail } from '@/hooks/admin/useAdminUserDetail';
import { useExpireEnrollment } from '@/hooks/admin/useEnrollmentMutations';
import { RoleSelect } from './RoleSelect';
import { EnrollmentEditDialog } from './EnrollmentEditDialog';

interface Props {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString();
}

export function UserDetailSheet({ userId, onOpenChange }: Props) {
  const { data, isLoading } = useAdminUserDetail(userId);
  const expire = useExpireEnrollment();
  const [editing, setEditing] = useState<string | null | 'new'>(null);

  return (
    <Sheet open={!!userId} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        {isLoading || !data?.profile ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={data.profile.profile_image ?? undefined} />
                  <AvatarFallback>
                    {(data.profile.first_name?.[0] ?? data.profile.email?.[0] ?? 'U').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <SheetTitle>
                    {data.profile.first_name || data.profile.last_name
                      ? `${data.profile.first_name ?? ''} ${data.profile.last_name ?? ''}`.trim()
                      : data.profile.email ?? 'User'}
                  </SheetTitle>
                  <SheetDescription>{data.profile.email}</SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <section>
                <h3 className="text-sm font-semibold mb-2">Profile</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{formatDateTime(data.profile.created_at)}</dd>
                  <dt className="text-muted-foreground">Last seen</dt>
                  <dd>{formatDateTime(data.profile.last_seen)}</dd>
                  <dt className="text-muted-foreground">Onboarded</dt>
                  <dd>{data.profile.onboarded ? 'Yes' : 'No'}</dd>
                  <dt className="text-muted-foreground">Country</dt>
                  <dd>{data.profile.country ?? '—'}</dd>
                </dl>
              </section>

              <Separator />

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Role</h3>
                <RoleSelect userId={data.profile.id} role={data.role} />
              </section>

              <Separator />

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Enrollments</h3>
                  <Button size="sm" onClick={() => setEditing('new')}>
                    + New enrollment
                  </Button>
                </div>

                {data.enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No enrollments.</p>
                ) : (
                  <div className="space-y-3">
                    {data.enrollments.map((e: any) => (
                      <div key={e.id} className="rounded-lg border border-border p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>
                            {e.status ?? 'unknown'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{e.enrollment_method}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Access group</div>
                            <div className="font-medium">{e.access_group_name ?? '—'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Product</div>
                            <div className="font-medium">{e.product_name ?? '—'}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <div className="text-muted-foreground">Build</div>
                            <div>{e.build_access ? '✓' : '—'}</div>
                            <div className="text-muted-foreground">{formatDateTime(e.build_expires_at)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Calendar</div>
                            <div>{e.calendar_access ? '✓' : '—'}</div>
                            <div className="text-muted-foreground">{formatDateTime(e.calendar_expires_at)}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Programs</div>
                            <div>{e.programs_access ? '✓' : '—'}</div>
                            <div className="text-muted-foreground">{formatDateTime(e.programs_expires_at)}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setEditing(e.id)}>
                            Edit
                          </Button>
                          {e.status !== 'expired' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={expire.isPending}
                              onClick={() => expire.mutate(e.id)}
                            >
                              Expire
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <EnrollmentEditDialog
              open={editing !== null}
              onOpenChange={(o) => !o && setEditing(null)}
              userId={data.profile.id}
              enrollment={
                editing && editing !== 'new'
                  ? data.enrollments.find((e: any) => e.id === editing) ?? null
                  : null
              }
            />
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
