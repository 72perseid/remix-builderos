import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  useCreateEnrollment,
  useUpdateEnrollment,
} from '@/hooks/admin/useEnrollmentMutations';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  enrollment: any | null;
}

function toDate(d: string | null | undefined): Date | undefined {
  if (!d) return undefined;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? undefined : dt;
}
function toIso(d: Date | undefined): string | null {
  return d ? d.toISOString() : null;
}

export function EnrollmentEditDialog({ open, onOpenChange, userId, enrollment }: Props) {
  const isEdit = !!enrollment;

  const [accessGroupId, setAccessGroupId] = useState<string>('');
  const [productId, setProductId] = useState<string>('');
  const [status, setStatus] = useState<string>('active');
  const [buildExp, setBuildExp] = useState<Date | undefined>(undefined);
  const [calendarExp, setCalendarExp] = useState<Date | undefined>(undefined);
  const [programsExp, setProgramsExp] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setAccessGroupId(enrollment?.access_group_id ?? '');
    setProductId(enrollment?.product_id?.toString() ?? '');
    setStatus(enrollment?.status ?? 'active');
    setBuildExp(toDate(enrollment?.build_expires_at));
    setCalendarExp(toDate(enrollment?.calendar_expires_at));
    setProgramsExp(toDate(enrollment?.programs_expires_at));
  }, [open, enrollment]);


  const { data: accessGroups } = useQuery({
    queryKey: ['admin-access-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_groups')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: open,
  });

  const { data: products } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, product_name')
        .eq('is_active', true)
        .order('product_name');
      if (error) throw error;
      return data ?? [];
    },
    enabled: open,
  });

  const create = useCreateEnrollment();
  const update = useUpdateEnrollment();

  const handleSubmit = async () => {
    const payload = {
      user_id: userId,
      access_group_id: accessGroupId || null,
      product_id: productId ? Number(productId) : null,
      status,
      build_expires_at: toIso(buildExp),
      calendar_expires_at: toIso(calendarExp),
      programs_expires_at: toIso(programsExp),
    };

    if (isEdit) {
      await update.mutateAsync({ id: enrollment.id, ...payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit enrollment' : 'New enrollment'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Access group</Label>
            <Select value={accessGroupId} onValueChange={setAccessGroupId}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {(accessGroups ?? []).map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>
                {(products ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>{p.product_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold">Access expiration dates</h4>
              <p className="text-xs text-muted-foreground">
                Access flags are derived automatically from these dates.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([
                { label: 'Build', value: buildExp, set: setBuildExp },
                { label: 'Calendar', value: calendarExp, set: setCalendarExp },
                { label: 'Programs', value: programsExp, set: setProgramsExp },
              ] as const).map(({ label, value, set }) => (
                <div key={label} className="space-y-1.5 min-w-0">
                  <Label className="text-xs text-muted-foreground">{label}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          'w-full justify-start text-left font-normal px-2.5 truncate',
                          !value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                        <span className="truncate">
                          {value ? format(value, 'MMM d, yyyy') : 'Pick date'}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={value}
                        onSelect={(d) => set(d ?? undefined)}
                        initialFocus
                        className={cn('p-3 pointer-events-auto')}
                      />
                      {value && (
                        <div className="p-2 border-t border-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => set(undefined)}
                          >
                            Clear date
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
