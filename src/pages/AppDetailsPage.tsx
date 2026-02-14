import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Check, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useProfile } from '@/hooks/useProfile';
import { useProjectContext } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AppDetailsPage() {
  const { appIdeas, loading, refreshAppIdeas } = useProfile();
  const { selectedAppId, selectApp } = useProjectContext();

  // Edit app dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<typeof appIdeas[0] | null>(null);
  const [editForm, setEditForm] = useState({ app_name: '', app_description: '', one_liner: '' });
  const [saving, setSaving] = useState(false);

  // Delete app dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState<typeof appIdeas[0] | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleEditApp = (app: typeof appIdeas[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingApp(app);
    setEditForm({
      app_name: app.app_name || '',
      app_description: app.app_description || '',
      one_liner: app.one_liner || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveApp = async () => {
    if (!editingApp) return;
    setSaving(true);

    const { error } = await supabase
      .from('app_ideas')
      .update({
        app_name: editForm.app_name,
        app_description: editForm.app_description,
        one_liner: editForm.one_liner,
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingApp.id);

    if (error) {
      toast.error('Failed to update app');
    } else {
      toast.success('App updated successfully');
      refreshAppIdeas();
      setEditDialogOpen(false);
    }
    setSaving(false);
  };

  const handleDeleteApp = (app: typeof appIdeas[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingApp(app);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteApp = async () => {
    if (!deletingApp) return;
    setDeleting(true);

    const { error } = await supabase
      .from('app_ideas')
      .delete()
      .eq('id', deletingApp.id);

    if (error) {
      toast.error('Failed to delete app');
    } else {
      toast.success('App deleted successfully');
      if (deletingApp.id === selectedAppId) {
        selectApp(null);
      }
      refreshAppIdeas();
      setDeleteDialogOpen(false);
    }
    setDeleting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">App Details</h1>
        <p className="text-muted-foreground mt-1">Manage your apps and switch between projects</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
        </div>
      ) : appIdeas.length > 0 ? (
        <div className="space-y-3">
          {appIdeas.map((app) => (
            <div
              key={app.id}
              onClick={() => selectApp(app.id)}
              className={`p-5 rounded-xl border space-y-2 cursor-pointer transition-colors ${
                app.id === selectedAppId
                  ? 'bg-blue-900/20 border-blue-600/50'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-base font-medium text-white flex items-center gap-2">
                  {app.app_name || 'Untitled App'}
                  {app.id === selectedAppId && (
                    <Check className="h-4 w-4 text-blue-400" />
                  )}
                </h4>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={(e) => handleEditApp(app, e)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-slate-800"
                    onClick={(e) => handleDeleteApp(app, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  {app.currently_building && (
                    <Badge className="bg-green-600/20 text-green-400 border-green-600/50 text-xs">
                      Building
                    </Badge>
                  )}
                </div>
              </div>
              {app.one_liner && (
                <p className="text-sm text-slate-400">{app.one_liner}</p>
              )}
              {app.app_description && (
                <p className="text-sm text-slate-500">{app.app_description}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                {app.app_category && (
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                    {app.app_category}
                  </Badge>
                )}
                {app.app_type && (
                  <Badge variant="outline" className="text-xs border-slate-700 text-slate-400">
                    {app.app_type}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-slate-500">No apps yet. Start by creating one from the onboarding flow.</p>
        </div>
      )}

      {/* Edit App Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-[#0B0E14] border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Edit App Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="app_name" className="text-slate-400">App Name</Label>
              <Input
                id="app_name"
                value={editForm.app_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, app_name: e.target.value }))}
                placeholder="Enter app name"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="one_liner" className="text-slate-400">One Liner</Label>
              <Input
                id="one_liner"
                value={editForm.one_liner}
                onChange={(e) => setEditForm(prev => ({ ...prev, one_liner: e.target.value }))}
                placeholder="A short description"
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="app_description" className="text-slate-400">Description</Label>
              <Textarea
                id="app_description"
                value={editForm.app_description}
                onChange={(e) => setEditForm(prev => ({ ...prev, app_description: e.target.value }))}
                placeholder="Describe your app"
                className="bg-slate-900 border-slate-700 text-white min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="border-slate-700 text-slate-400 hover:bg-slate-800">Cancel</Button>
            <Button onClick={handleSaveApp} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete App Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-[#0B0E14] border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white">Delete App</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-slate-400">
              Are you sure you want to delete <span className="text-white font-medium">{deletingApp?.app_name || 'this app'}</span>? This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-700 text-slate-400 hover:bg-slate-800">Cancel</Button>
            <Button onClick={confirmDeleteApp} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
