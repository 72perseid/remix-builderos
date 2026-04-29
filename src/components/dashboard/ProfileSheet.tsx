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
import { Switch } from '@/components/ui/switch';
import { Camera, Trash2, Upload, Mail, Lock, Loader2, LogOut, MapPin, Linkedin, Twitter } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useUserAccessGroup } from '@/hooks/useUserAccessGroup';
import { Badge } from '@/components/ui/badge';
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
  const { accessGroup } = useUserAccessGroup();
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
    if (result?.success) { toast.success('Profile saved'); }
    else { toast.error(result?.error || 'Failed to save profile'); }
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="border-border w-[420px] sm:w-[500px] p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle className="text-foreground">Profile</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-8">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage src={profile?.profile_image ? `${profile.profile_image}?t=${profile.updated_at || ''}` : ''} />
                  <AvatarFallback className="bg-secondary text-foreground text-xl font-semibold">
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
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  {profile?.profile_image ? (<><Camera className="h-4 w-4 mr-1.5" />Change</>) : (<><Upload className="h-4 w-4 mr-1.5" />Upload</>)}
                </Button>
                {profile?.profile_image && (
                  <Button variant="outline" size="sm" onClick={handleDeleteImage} disabled={uploading} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4 mr-1.5" />Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Personal Info */}
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-primary">Personal Information</h2>
                {accessGroup && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border border-primary/20 font-medium"
                  >
                    {accessGroup.name}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">First Name</Label>
                  <Input
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Name</Label>
                  <Input
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>

              {/* Email — read-only */}
              <div className="space-y-2">
                <Label className="text-muted-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Email
                </Label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-secondary/40 opacity-60">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">{email}</span>
                </div>
                <p className="text-xs text-muted-foreground/60">Managed through authentication — cannot be changed here.</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Bio</Label>
                <Textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us a bit about yourself…"
                  className="min-h-[80px] resize-none"
                />
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label className="text-muted-foreground">Timezone</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map(tz => (
                      <SelectItem key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Footer actions */}
            <div className="space-y-3 border-t border-border pt-6">
              <Button
                className="w-full"
                disabled={!isDirty || saving || uploading}
                onClick={handleSave}
              >
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : 'Save Changes'}
              </Button>

              <Button
                variant="outline"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={async () => {
                  const { error } = await signOut();
                  if (error) { toast.error('Failed to sign out'); }
                  else { toast.success('Signed out successfully'); navigate('/login'); }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>

          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
