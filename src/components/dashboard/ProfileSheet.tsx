import { useRef, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Camera, Trash2, Upload, Mail, User, Briefcase, Loader2, Check, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user } = useAuth();
  const { profile, appIdeas, loading, uploading, uploadProfileImage, deleteProfileImage, refreshAppIdeas } = useProfile();
  const { selectedAppId, selectApp } = useProjectContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      // If deleted app was selected, clear selection
      if (deletingApp.id === selectedAppId) {
        selectApp(null);
      }
      refreshAppIdeas();
      setDeleteDialogOpen(false);
    }
    setDeleting(false);
  };

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
      : 'User';

  const email = profile?.email || user?.email || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    const result = await uploadProfileImage(file);
    if (result.success) {
      toast.success('Profile image updated');
    } else {
      toast.error(result.error || 'Failed to upload image');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async () => {
    const result = await deleteProfileImage();
    if (result.success) {
      toast.success('Profile image removed');
    } else {
      toast.error(result.error || 'Failed to remove image');
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#0B0E14] border-slate-800 w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-white">Profile</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="space-y-6 py-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-slate-700">
                  <AvatarImage src={profile?.profile_image || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="border-slate-700 text-[#65686f] hover:bg-slate-800 hover:text-white"
                >
                  {profile?.profile_image ? (
                    <>
                      <Camera className="h-4 w-4 mr-2" />
                      Change
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
                {profile?.profile_image && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteImage}
                    disabled={uploading}
                    className="border-red-800 text-red-400 hover:bg-red-900/50 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* User Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">User Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <User className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-500">Name</p>
                    <p className="text-sm text-white">{displayName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <Mail className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="text-sm text-white">{email}</p>
                  </div>
                </div>

                {profile?.bio && (
                  <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <p className="text-xs text-slate-500 mb-1">Bio</p>
                    <p className="text-sm text-slate-300">{profile.bio}</p>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <Briefcase className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-xs text-slate-500">Location</p>
                      <p className="text-sm text-white">{profile.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-slate-800" />

            {/* App Ideas Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Your Apps</h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
                </div>
              ) : appIdeas.length > 0 ? (
                <div className="space-y-3">
                  {appIdeas.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => {
                        selectApp(app.id);
                        onOpenChange(false);
                      }}
                      className={`p-4 rounded-lg border space-y-2 cursor-pointer transition-colors ${
                        app.id === selectedAppId 
                          ? 'bg-blue-900/20 border-blue-600/50' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white flex items-center gap-2">
                          {app.app_name || 'Untitled App'}
                          {app.id === selectedAppId && (
                            <Check className="h-4 w-4 text-blue-400" />
                          )}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-slate-400 hover:text-white hover:bg-slate-800"
                            onClick={(e) => handleEditApp(app, e)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          {app.currently_building && (
                            <Badge className="bg-green-600/20 text-green-400 border-green-600/50 text-xs">
                              Building
                            </Badge>
                          )}
                        </div>
                      </div>
                      {app.one_liner && (
                        <p className="text-xs text-slate-400">{app.one_liner}</p>
                      )}
                      {app.app_description && (
                        <p className="text-xs text-slate-500">
                          {app.app_description}
                        </p>
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
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No apps yet</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>

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
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveApp}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
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
              Are you sure you want to delete <span className="text-white font-medium">{deletingApp?.app_name || 'this app'}</span>? 
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteApp}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}
