import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from 'lucide-react';
import { useAdminUsers, AdminUserRow } from '@/hooks/admin/useAdminUsers';
import { RoleSelect } from './RoleSelect';
import { UserDetailSheet } from './UserDetailSheet';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export function AdminUsersTable() {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const pageSize = 25;

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => setPage(0), [debounced]);

  const { data, isLoading } = useAdminUsers({ search: debounced, page, pageSize });
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Badge variant="secondary">{total} users</Badge>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Last seen</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Active enrollment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin inline-block text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((u: AdminUserRow) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer hover:bg-muted/40"
                  onClick={() => setSelected(u.id)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={u.profile_image ?? undefined} />
                        <AvatarFallback>
                          {(u.first_name?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">
                        {u.first_name || u.last_name ? `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() : '—'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(u.last_seen)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <RoleSelect userId={u.id} role={u.role} />
                  </TableCell>
                  <TableCell>
                    {u.enrollment ? (
                      <div className="flex flex-col gap-0.5">
                        <Badge variant={u.enrollment.status === 'active' ? 'default' : 'secondary'} className="w-fit">
                          {u.enrollment.status ?? 'unknown'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {u.enrollment.access_group_name ?? '—'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelected(u.id); }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page + 1} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <UserDetailSheet userId={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
