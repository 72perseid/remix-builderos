import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectContext } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogoUploader } from '@/components/dashboard/LogoUploader';

const CATEGORIES = ['Productivity', 'Social', 'E-commerce', 'Education', 'Health', 'Finance', 'Entertainment', 'Other'];

export default function AppDetailsPage() {
  const { selectedApp, refreshApps } = useProjectContext();

  const [appName, setAppName] = useState('');
  const [oneLiner, setOneLiner] = useState('');
  const [appCategory, setAppCategory] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [ideaGeneration, setIdeaGeneration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedApp) {
      setAppName(selectedApp.app_name || '');
      setOneLiner(selectedApp.one_liner || '');
      setAppCategory(selectedApp.app_category || '');
      setAppDescription(selectedApp.app_description || '');
      setIdeaGeneration(selectedApp.idea_generation || '');
    }
  }, [selectedApp]);

  const handleSave = async () => {
    if (!selectedApp) return;
    setSaving(true);

    const { error } = await supabase
      .from('app_ideas')
      .update({
        app_name: appName,
        one_liner: oneLiner,
        app_category: appCategory || null,
        app_description: appDescription,
        idea_generation: ideaGeneration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedApp.id);

    if (error) {
      toast.error('Failed to save changes');
    } else {
      toast.success('Changes saved successfully');
      await refreshApps();
    }
    setSaving(false);
  };

  if (!selectedApp) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Select a project from the dropdown above to view its details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl w-full space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">App Details</h1>
        <p className="text-muted-foreground mt-1">View and edit your app information</p>
      </div>

      {/* Section 1: Basic Information */}
      <section className="space-y-5">
        <h2 className="text-lg font-semibold text-primary">Basic Information</h2>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <LogoUploader
            appId={selectedApp.id}
            appName={selectedApp.app_name || 'App'}
            currentLogo={selectedApp.logo}
            size="lg"
          />
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">App Name</Label>
              <Input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="Enter app name" />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">App Category</Label>
              <Select value={appCategory} onValueChange={setAppCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-muted-foreground">One Liner</Label>
              <Textarea value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} placeholder="A short tagline" className="min-h-[80px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Descriptions */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Description</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">App Description</Label>
            <Textarea value={appDescription} onChange={(e) => setAppDescription(e.target.value)} placeholder="Describe your app" className="min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">How did you come up with this idea?</Label>
            <Textarea value={ideaGeneration} onChange={(e) => setIdeaGeneration(e.target.value)} placeholder="Share the origin story" className="min-h-[100px]" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
