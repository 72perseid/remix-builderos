import { useRef } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Camera, Trash2, Upload, Mail, User, Briefcase, Loader2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const { user } = useAuth();
  const { profile, appIdeas, loading, uploading, uploadProfileImage, deleteProfileImage } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
                      className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white">
                          {app.app_name || 'Untitled App'}
                        </h4>
                        {app.currently_building && (
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/50 text-xs">
                            Building
                          </Badge>
                        )}
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
    </Sheet>
  );
}
