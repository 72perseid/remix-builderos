import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { EnrollmentEditDialog } from './EnrollmentEditDialog';

function formatDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString();
}

export function AdminEnrollmentsTable() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');
  const [editing, setEditing] = useState<{ enrollment: any; userId: string } | null>(null);

  const { data: groups } = useQuery({
    queryKey: ['admin-access-groups-list'],
    queryFn: async () => {
      const { data } = await supabase.from('access_groups').select('id, name').order('name');
      return data ?? [];
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-enrollments', statusFilter, groupFilter],
    queryFn: async () => {
      let q = supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      if (groupFilter !== 'all') q = q.eq('access_group_id', groupFilter);
      const { data, error } = await q;
      if (error) throw error;

      const userIds = Array.from(new Set((data ?? []).map((e) => e.user_id).filter(Boolean))) as string[];
      const productIds = Array.from(
        new Set((data ?? []).map((e) => e.product_id).filter((v) => v !== null)),
      ) as number[];
      const groupIds = Array.from(
        new Set((data ?? []).map((e) => e.access_group_id).filter(Boolean)),
      ) as string[];

      const [profilesRes, productsRes, groupsRes] = await Promise.all([
        userIds.length
          ? supabase.from('profiles').select('id, first_name, last_name, email').in('id', userIds)
          : Promise.resolve({ data: [] as any[] }),
        productIds.length
          ? supabase.from('products').select('id, product_name').in('id', productIds)
          : Promise.resolve({ data: [] as any[] }),
        groupIds.length
          ? supabase.from('access_groups').select('id, name').in('id', groupIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const pMap = new Map((profilesRes.data ?? []).map((p: any) => [p.id, p]));
      const prodMap = new Map((productsRes.data ?? []).map((p: any) => [p.id, p.product_name]));
      const gMap = new Map((groupsRes.data ?? []).map((g: any) => [g.id, g.name]));

      return (data ?? []).map((e) => ({
        ...e,
        _profile: pMap.get(e.user_id),
        _product: e.product_id ? prodMap.get(e.product_id) : null,
        _group: e.access_group_id ? gMap.get(e.access_group_id) : null,
      }));
    },
  });

  const rows = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All access groups</SelectItem>
            {(groups ?? []).map((g) => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="secondary">{rows.length} enrollments</Badge>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Access group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Build expires</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-5 w-5 animate-spin inline-block text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No enrollments.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((e: any) => (
                <TableRow key={e.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setEditing({ enrollment: e, userId: e.user_id })}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {e._profile?.first_name || e._profile?.last_name
                          ? `${e._profile?.first_name ?? ''} ${e._profile?.last_name ?? ''}`.trim()
                          : '—'}
                      </span>
                      <span className="text-xs text-muted-foreground">{e._profile?.email ?? '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{e._product ?? '—'}</TableCell>
                  <TableCell className="text-sm">{e._group ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>{e.status ?? 'unknown'}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{e.enrollment_method}</TableCell>
                  <TableCell className="text-sm">{formatDate(e.build_expires_at)}</TableCell>
                  <TableCell className="text-right" onClick={(ev) => ev.stopPropagation()}>
                    <Button size="sm" variant="ghost" onClick={() => setEditing({ enrollment: e, userId: e.user_id })}>
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editing && (
        <EnrollmentEditDialog
          open={!!editing}
          onOpenChange={(o) => !o && setEditing(null)}
          userId={editing.userId}
          enrollment={editing.enrollment}
        />
      )}
    </div>
  );
}
