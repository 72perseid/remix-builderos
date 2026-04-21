import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminUsersTable } from '@/components/admin/AdminUsersTable';
import { AdminEnrollmentsTable } from '@/components/admin/AdminEnrollmentsTable';
import { Shield } from 'lucide-react';

export default function AdminPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users, roles, and enrollments.</p>
        </div>
      </header>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <AdminUsersTable />
        </TabsContent>
        <TabsContent value="enrollments">
          <AdminEnrollmentsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
