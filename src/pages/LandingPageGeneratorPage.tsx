import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArtifactBreadcrumb } from '@/components/dashboard/ArtifactBreadcrumb';
import { useLandingPage } from '@/hooks/useLandingPage';
import { useArtifact } from '@/hooks/useArtifact';
import { useProjectContext } from '@/contexts/ProjectContext';
import { motion } from 'framer-motion';
import {
  Rocket, Eye, Globe, Mail, Users, Sparkles, Copy, Check, ExternalLink,
  Loader2, Plus, Trash2
} from 'lucide-react';
import { toast } from 'sonner';

function parseArtifactContent(raw: unknown): any {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      const m = (raw as string).match(/```json\s*([\s\S]*?)\s*```/);
      if (m?.[1]) return JSON.parse(m[1]);
      return JSON.parse(raw);
    } catch { return null; }
  }
  return null;
}

export default function LandingPageGeneratorPage() {
  const { selectedApp } = useProjectContext();
  const { landingPage, loading, signups, generate, isGenerating, togglePublish } = useLandingPage();
  const { data: bmArtifact } = useArtifact('business_model');
  const { data: uiArtifact } = useArtifact('ui_ux');

  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('Join the Waitlist');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#1E293B');
  const [features, setFeatures] = useState<{ title: string; description: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-populate from artifacts
  const autoGenerate = () => {
    const bm = parseArtifactContent(bmArtifact?.content);
    const uiux = parseArtifactContent(uiArtifact?.content);

    const appName = selectedApp?.app_name || 'Your App';
    const vp = bm?.value_proposition || bm?.valueProposition || selectedApp?.one_liner || '';
    const desc = selectedApp?.app_description || '';

    setHeadline(vp || `${appName} — The Future is Here`);
    setSubheadline(desc || `Discover what ${appName} can do for you.`);

    // Extract features from business model
    const segments = bm?.customer_segments || bm?.customerSegments || [];
    const resources = bm?.keyResources || bm?.key_resources || [];
    const combined = [...segments.slice(0, 2), ...resources.slice(0, 2)];

    const autoFeatures = combined.length > 0
      ? combined.map((s: string, i: number) => ({ title: `Feature ${i + 1}`, description: String(s) }))
      : [
          { title: 'Fast', description: 'Lightning-fast performance' },
          { title: 'Secure', description: 'Enterprise-grade security' },
          { title: 'Simple', description: 'Intuitive user experience' },
        ];
    setFeatures(autoFeatures);

    // Extract colors from UI/UX if available
    if (uiux?.color_palette) {
      const hexMatch = JSON.stringify(uiux.color_palette).match(/#[0-9A-Fa-f]{6}/);
      if (hexMatch) setPrimaryColor(hexMatch[0]);
    }
  };

  const handleGenerate = async () => {
    if (!headline) {
      autoGenerate();
      return;
    }
    await generate({
      headline,
      subheadline,
      features,
      cta_text: ctaText,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
  };

  const publicUrl = landingPage?.slug
    ? `${window.location.origin}/lp/${landingPage.slug}`
    : null;

  const copyUrl = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('URL copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const addFeature = () => setFeatures([...features, { title: '', description: '' }]);
  const removeFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));
  const updateFeature = (i: number, field: 'title' | 'description', value: string) => {
    const updated = [...features];
    updated[i] = { ...updated[i], [field]: value };
    setFeatures(updated);
  };

  // Populate fields from existing landing page
  useMemo(() => {
    if (landingPage && !headline) {
      setHeadline(landingPage.headline || '');
      setSubheadline(landingPage.subheadline || '');
      setCtaText(landingPage.cta_text || 'Join the Waitlist');
      setPrimaryColor(landingPage.primary_color || '#3B82F6');
      setSecondaryColor(landingPage.secondary_color || '#1E293B');
      setFeatures(Array.isArray(landingPage.features) ? landingPage.features : []);
    }
  }, [landingPage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-background overflow-hidden">
      <div className="px-6 pt-4 pb-2 shrink-0 border-b border-border">
        <ArtifactBreadcrumb currentPage="Landing Page" artifactType="business_model" />
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Rocket className="w-6 h-6 text-primary" />
                Landing Page Generator
              </h1>
              <p className="text-secondary-foreground mt-1">
                Generate a live landing page to validate demand before writing code
              </p>
            </div>
            {landingPage && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="publish-toggle" className="text-sm text-muted-foreground">
                    {landingPage.is_published ? 'Published' : 'Draft'}
                  </Label>
                  <Switch
                    id="publish-toggle"
                    checked={landingPage.is_published}
                    onCheckedChange={(checked) => togglePublish(checked)}
                  />
                </div>
                <Badge variant={landingPage.is_published ? 'default' : 'secondary'}>
                  {landingPage.is_published ? (
                    <><Globe className="w-3 h-3 mr-1" /> Live</>
                  ) : (
                    'Draft'
                  )}
                </Badge>
              </div>
            )}
          </div>

          {/* Public URL */}
          {publicUrl && landingPage?.is_published && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Public URL:</span>
                  <code className="text-primary font-mono text-xs bg-primary/10 px-2 py-1 rounded">
                    {publicUrl}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={copyUrl}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Editor Panel */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Page Content
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={autoGenerate}
                    className="w-full border-dashed"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Auto-fill from Business Model & UI/UX
                  </Button>

                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="Your compelling headline..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subheadline</Label>
                    <Textarea
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      placeholder="A brief description of your product..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      value={ctaText}
                      onChange={(e) => setCtaText(e.target.value)}
                      placeholder="Join the Waitlist"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Features</Label>
                      <Button size="sm" variant="ghost" onClick={addFeature}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    {features.map((f, i) => (
                      <div key={i} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <Input
                            value={f.title}
                            onChange={(e) => updateFeature(i, 'title', e.target.value)}
                            placeholder="Feature title"
                            className="text-sm"
                          />
                          <Input
                            value={f.description}
                            onChange={(e) => updateFeature(i, 'description', e.target.value)}
                            placeholder="Short description"
                            className="text-sm"
                          />
                        </div>
                        <Button size="icon" variant="ghost" onClick={() => removeFeature(i)} className="shrink-0 mt-1">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
                      {isGenerating ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                      ) : landingPage ? (
                        <><Sparkles className="w-4 h-4 mr-2" /> Update Landing Page</>
                      ) : (
                        <><Rocket className="w-4 h-4 mr-2" /> Generate Landing Page</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {showPreview ? 'Hide' : 'Preview'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Signups Panel */}
            <div className="space-y-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Email Signups
                    <Badge variant="secondary" className="ml-auto">{signups.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {signups.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No signups yet. Publish your page and share the link!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-auto">
                      {signups.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-2 rounded bg-secondary/50 text-sm">
                          <div>
                            <p className="font-medium text-foreground">{s.email}</p>
                            {s.name && <p className="text-xs text-muted-foreground">{s.name}</p>}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(s.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden border border-border"
            >
              <div className="bg-muted px-4 py-2 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-xs text-muted-foreground ml-2 font-mono">
                  {publicUrl || 'yourapp.lovable.app/lp/your-slug'}
                </span>
              </div>
              <div
                style={{ backgroundColor: secondaryColor }}
                className="p-12 text-center min-h-[400px] flex flex-col items-center justify-center"
              >
                <h1
                  className="text-4xl font-bold mb-4"
                  style={{ color: '#ffffff' }}
                >
                  {headline || 'Your Headline Here'}
                </h1>
                <p className="text-lg mb-8 max-w-xl" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {subheadline || 'Your subheadline will appear here'}
                </p>
                <button
                  className="px-8 py-3 rounded-lg font-semibold text-white text-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  {ctaText || 'Join the Waitlist'}
                </button>
                {features.length > 0 && (
                  <div className="grid grid-cols-3 gap-6 mt-12 max-w-3xl">
                    {features.map((f, i) => (
                      <div key={i} className="text-left">
                        <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
