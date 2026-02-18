import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Trash2, Upload, Mail, Lock, Loader2, LogOut } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'America/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'America/Mexico_City',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Rome',
  'Europe/Amsterdam',
  'Europe/Stockholm',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
];

export function ProfileSheet({ open, onOpenChange }: ProfileSheetProps) {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, uploading, uploadProfileImage, deleteProfileImage, updateProfile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setBio(profile.bio || '');
      setTimezone(profile.timezone || '');
    }
  }, [profile]);

  const isDirty =
    firstName !== (profile?.first_name || '') ||
    lastName !== (profile?.last_name || '') ||
    bio !== (profile?.bio || '') ||
    timezone !== (profile?.timezone || '');

  const displayName = firstName && lastName
    ? `${firstName} ${lastName}`
    : profile?.first_name && profile?.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : user?.user_metadata?.first_name
        ? `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`
        : 'User';

  const email = profile?.email || user?.email || '';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }

    const result = await uploadProfileImage(file);
    if (result.success) { toast.success('Profile image updated'); }
    else { toast.error(result.error || 'Failed to upload image'); }
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };

  const handleDeleteImage = async () => {
    const result = await deleteProfileImage();
    if (result.success) { toast.success('Profile image removed'); }
    else { toast.error(result.error || 'Failed to remove image'); }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({ first_name: firstName, last_name: lastName, bio, timezone });
    if (result?.success) {
      toast.success('Profile saved');
    } else {
      toast.error(result?.error || 'Failed to save profile');
    }
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-[#0f1219] border-slate-700 w-[400px] sm:w-[480px]">
        <SheetHeader>
          <SheetTitle className="text-white">Profile</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)] pr-4">
          <div className="space-y-6 py-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20 border-2 border-slate-600">
                  <AvatarImage src={profile?.profile_image || ''} />
                  <AvatarFallback className="bg-[#1a2744] text-white text-xl font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {uploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white">
                  {profile?.profile_image ? (<><Camera className="h-4 w-4 mr-2" />Change</>) : (<><Upload className="h-4 w-4 mr-2" />Upload</>)}
                </Button>
                {profile?.profile_image && (
                  <Button variant="outline" size="sm" onClick={handleDeleteImage} disabled={uploading} className="border-slate-600 text-red-400 hover:bg-red-900/30 hover:text-red-300">
                    <Trash2 className="h-4 w-4 mr-2" />Remove
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Editable User Details */}
            <div className="space-y-4">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">User Details</h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-slate-300">First Name</Label>
                  <Input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="bg-[#1a2744] border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="bg-[#1a2744] border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Email — read-only */}
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-slate-500" />
                  Email
                </Label>
                <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#1a2744]/50 border border-slate-700 opacity-60">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <span className="text-sm text-slate-400">{email}</span>
                </div>
                <p className="text-xs text-slate-500">Email is managed through authentication and cannot be changed here.</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-slate-300">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself…"
                  rows={3}
                  className="bg-[#1a2744] border-slate-600 text-white placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label className="text-slate-300">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="bg-[#1a2744] border-slate-600 text-white">
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2744] border-slate-600 max-h-60">
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz} className="text-white hover:bg-slate-700">
                        {tz.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="bg-slate-700" />

            {/* Save Changes */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isDirty || saving || uploading}
              onClick={handleSave}
            >
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              ) : (
                'Save Changes'
              )}
            </Button>

            <Separator className="bg-slate-700" />

            <Button
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
              onClick={async () => {
                const { error } = await signOut();
                if (error) {
                  toast.error("Failed to sign out");
                } else {
                  toast.success("Signed out successfully");
                  navigate("/login");
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
