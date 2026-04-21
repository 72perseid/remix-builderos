import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateUserRole } from '@/hooks/admin/useUpdateUserRole';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  userId: string;
  role: 'admin' | 'user';
  disabled?: boolean;
}

export function RoleSelect({ userId, role, disabled }: Props) {
  const { user } = useAuth();
  const update = useUpdateUserRole();
  const isSelf = user?.id === userId;

  return (
    <Select
      value={role}
      disabled={disabled || update.isPending}
      onValueChange={(next) => {
        if (next === role) return;
        if (isSelf && next === 'user') {
          toast.error("You can't demote yourself.");
          return;
        }
        update.mutate({ userId, role: next as 'admin' | 'user' });
      }}
    >
      <SelectTrigger className="h-8 w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="user">User</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
