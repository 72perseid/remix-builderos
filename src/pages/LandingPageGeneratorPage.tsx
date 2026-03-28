import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { BusinessCard } from '@/components/ui/business-card';
import { ArtifactBreadcrumb } from '@/components/dashboard/ArtifactBreadcrumb';
import { CopilotPanel } from '@/components/artifacts/ArtifactCopilot';
import { useLandingPage } from '@/hooks/useLandingPage';
import { useArtifact } from '@/hooks/useArtifact';
import { useProjectContext } from '@/contexts/ProjectContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Rocket, Eye, EyeOff, Globe, Mail, Users, Sparkles, Copy, Check, ExternalLink,
  Loader2, Plus, Trash2, Palette, Type, MousePointerClick, BarChart3, TrendingUp,
  Layout, Zap, Target, Calendar
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
  const { landingPage, loading, signups, generate, isGenerating, togglePublish, refetch } = useLandingPage();
  const { data: bmArtifact } = useArtifact('business_model');
  const { data: uiArtifact } = useArtifact('ui_ux');

  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('Join the Waitlist');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#0F172A');
  const [features, setFeatures] = useState<{ title: string; description: string }[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'signups'>('editor');

  // Populate fields from existing landing page
  useEffect(() => {
    if (landingPage) {
      setHeadline(landingPage.headline || '');
      setSubheadline(landingPage.subheadline || '');
      setCtaText(landingPage.cta_text || 'Join the Waitlist');
      setPrimaryColor(landingPage.primary_color || '#3B82F6');
      setSecondaryColor(landingPage.secondary_color || '#0F172A');
      setFeatures(Array.isArray(landingPage.features) ? landingPage.features : []);
    }
  }, [landingPage]);

  const autoGenerate = () => {
    const bm = parseArtifactContent(bmArtifact?.content);
    const uiux = parseArtifactContent(uiArtifact?.content);
    const appName = selectedApp?.app_name || 'Your App';
    const vp = bm?.value_proposition || bm?.valueProposition || selectedApp?.one_liner || '';
    const desc = selectedApp?.app_description || '';

    setHeadline(vp || `${appName} — The Future is Here`);
    setSubheadline(desc || `Discover what ${appName} can do for you.`);

    const segments = bm?.customer_segments || bm?.customerSegments || [];
    const resources = bm?.keyResources || bm?.key_resources || [];
    const channels = bm?.marketing_channels || [];
    const combined = [...segments.slice(0, 2), ...resources.slice(0, 1), ...channels.slice(0, 1)];

    const autoFeatures = combined.length > 0
      ? combined.map((s: string, i: number) => ({ title: `Feature ${i + 1}`, description: String(s) }))
      : [
          { title: 'Lightning Fast', description: 'Optimized for speed and performance' },
          { title: 'Secure by Default', description: 'Enterprise-grade security built in' },
          { title: 'Beautiful Design', description: 'Intuitive and delightful user experience' },
        ];
    setFeatures(autoFeatures);

    if (uiux?.color_palette) {
      const hexMatch = JSON.stringify(uiux.color_palette).match(/#[0-9A-Fa-f]{6}/);
      if (hexMatch) setPrimaryColor(hexMatch[0]);
    }

    toast.success('Content auto-filled from your artifacts!');
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

  // Stats
  const signupCount = signups.length;
  const todaySignups = signups.filter(s => {
    const d = new Date(s.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const conversionEstimate = landingPage?.is_published ? (signupCount > 0 ? Math.min(signupCount * 3.2, 100).toFixed(1) : '0') : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-[#0B0E14] overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4 pb-2 shrink-0 border-b border-slate-800/50">
        <ArtifactBreadcrumb currentPage="Landing Page" artifactType="business_model" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Copilot Panel */}
        <CopilotPanel context="business_model" heading="Landing Page Architect" onArtifactRefresh={refetch} />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-full space-y-6">

            {/* Header Row */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Rocket className="w-6 h-6 text-primary" />
                  Landing Page Generator
                </h1>
                <p className="text-muted-foreground mt-1">
                  Validate demand by collecting email signups before writing code
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
                  <Badge
                    variant={landingPage.is_published ? 'default' : 'secondary'}
                    className={landingPage.is_published ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                  >
                    {landingPage.is_published ? (
                      <><Globe className="w-3 h-3 mr-1" /> Live</>
                    ) : 'Draft'}
                  </Badge>
                </div>
              )}
            </div>

            {/* Stats Row */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{signupCount}</p>
                      <p className="text-xs text-muted-foreground">Total Signups</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{todaySignups}</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{conversionEstimate}%</p>
                      <p className="text-xs text-muted-foreground">Est. Interest</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Globe className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        {landingPage?.is_published ? 'Live' : 'Offline'}
                      </p>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Public URL Banner */}
            {publicUrl && landingPage?.is_published && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Globe className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">Your public landing page</p>
                        <code className="text-primary font-mono text-sm">{publicUrl}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={copyUrl} className="gap-2">
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                          <ExternalLink className="w-3 h-3" /> Open
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Tab Switcher */}
            <div className="flex gap-1 bg-secondary/50 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layout className="w-4 h-4 inline mr-2" />
                Page Builder
              </button>
              <button
                onClick={() => setActiveTab('signups')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'signups'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Signups
                {signupCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">{signupCount}</Badge>
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'editor' ? (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  id="artifact-export-area"
                >
                  {/* No page yet - empty state */}
                  {!landingPage && !headline && (
                    <Card className="bg-card/50 border-border">
                      <CardContent className="p-12 text-center">
                        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                          <Rocket className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2 text-foreground">Create Your Landing Page</h3>
                        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                          Generate a professional landing page from your Business Model and UI/UX artifacts to validate demand before building.
                        </p>
                        <div className="flex gap-3 justify-center">
                          <Button onClick={autoGenerate} className="gap-2">
                            <Sparkles className="w-4 h-4" />
                            Auto-Generate from Artifacts
                          </Button>
                          <Button variant="outline" onClick={() => setHeadline(' ')}>
                            <Type className="w-4 h-4 mr-2" />
                            Start from Scratch
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Editor Grid */}
                  {(landingPage || headline) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Content Section */}
                      <BusinessCard title="Content & Copy" icon={Type} iconColor="text-blue-500" colSpan={2}>
                        <div className="space-y-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={autoGenerate}
                            className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/5"
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Auto-fill from Business Model & UI/UX Artifacts
                          </Button>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Headline</Label>
                              <Input
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Your compelling headline..."
                                className="bg-secondary/50 border-border"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground text-xs uppercase tracking-wider">CTA Button</Label>
                              <Input
                                value={ctaText}
                                onChange={(e) => setCtaText(e.target.value)}
                                placeholder="Join the Waitlist"
                                className="bg-secondary/50 border-border"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Subheadline</Label>
                            <Textarea
                              value={subheadline}
                              onChange={(e) => setSubheadline(e.target.value)}
                              placeholder="A brief, compelling description of your product..."
                              rows={2}
                              className="bg-secondary/50 border-border resize-none"
                            />
                          </div>
                        </div>
                      </BusinessCard>

                      {/* Branding Section */}
                      <BusinessCard title="Branding & Colors" icon={Palette} iconColor="text-purple-500">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Primary Color</Label>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <input
                                  type="color"
                                  value={primaryColor}
                                  onChange={(e) => setPrimaryColor(e.target.value)}
                                  className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
                                />
                              </div>
                              <Input
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="font-mono text-xs bg-secondary/50 border-border flex-1"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground text-xs uppercase tracking-wider">Background Color</Label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
                              />
                              <Input
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="font-mono text-xs bg-secondary/50 border-border flex-1"
                              />
                            </div>
                          </div>
                          <div className="pt-2">
                            <p className="text-xs text-muted-foreground">Preview</p>
                            <div
                              className="mt-2 h-12 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: secondaryColor }}
                            >
                              <span
                                className="text-sm font-semibold px-4 py-1 rounded-md"
                                style={{ backgroundColor: primaryColor, color: '#fff' }}
                              >
                                {ctaText || 'Button'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </BusinessCard>

                      {/* Features Section */}
                      <BusinessCard title="Key Features" icon={Zap} iconColor="text-amber-500">
                        <div className="space-y-3">
                          {features.map((f, i) => (
                            <div key={i} className="flex gap-2 items-start group">
                              <div className="flex-1 space-y-1.5">
                                <Input
                                  value={f.title}
                                  onChange={(e) => updateFeature(i, 'title', e.target.value)}
                                  placeholder="Feature title"
                                  className="text-sm bg-secondary/50 border-border h-8"
                                />
                                <Input
                                  value={f.description}
                                  onChange={(e) => updateFeature(i, 'description', e.target.value)}
                                  placeholder="Short description"
                                  className="text-sm bg-secondary/50 border-border h-8"
                                />
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeFeature(i)}
                                className="shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                              >
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={addFeature}
                            className="w-full border-dashed border-border"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Add Feature
                          </Button>
                        </div>
                      </BusinessCard>

                      {/* Actions */}
                      <div className="col-span-2 flex gap-3">
                        <Button
                          onClick={handleGenerate}
                          disabled={isGenerating}
                          className="flex-1 h-12 text-base"
                        >
                          {isGenerating ? (
                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
                          ) : landingPage ? (
                            <><Sparkles className="w-5 h-5 mr-2" /> Update Landing Page</>
                          ) : (
                            <><Rocket className="w-5 h-5 mr-2" /> Generate & Save</>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowPreview(!showPreview)}
                          className="h-12 gap-2"
                        >
                          {showPreview ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          {showPreview ? 'Hide Preview' : 'Preview'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Live Preview */}
                  <AnimatePresence>
                    {showPreview && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <Card className="bg-card border-border overflow-hidden">
                          <CardHeader className="pb-0 pt-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                              </div>
                              <span className="text-xs text-muted-foreground font-mono ml-2">
                                {publicUrl || `${window.location.origin}/lp/your-app`}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0 mt-3">
                            <div
                              style={{ backgroundColor: secondaryColor }}
                              className="p-16 text-center min-h-[450px] flex flex-col items-center justify-center"
                            >
                              {selectedApp?.logo && (
                                <img
                                  src={selectedApp.logo}
                                  alt="Logo"
                                  className="w-14 h-14 rounded-xl object-cover mb-6"
                                />
                              )}
                              <h1 className="text-5xl font-bold mb-5 leading-tight" style={{ color: '#ffffff' }}>
                                {headline || 'Your Headline Here'}
                              </h1>
                              <p className="text-xl mb-10 max-w-2xl leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                {subheadline || 'Your compelling subheadline will appear here'}
                              </p>
                              <div className="flex gap-3 items-center mb-16">
                                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-3 border border-white/20 w-64">
                                  <Mail className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.4)' }} />
                                  <span style={{ color: 'rgba(255,255,255,0.4)' }} className="text-sm">
                                    Enter your email
                                  </span>
                                </div>
                                <button
                                  className="px-6 py-3 rounded-lg font-semibold text-sm transition-all"
                                  style={{ backgroundColor: primaryColor, color: '#ffffff' }}
                                >
                                  {ctaText || 'Join the Waitlist'}
                                </button>
                              </div>
                              {features.length > 0 && (
                                <div className={`grid gap-6 max-w-4xl w-full ${features.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                  {features.map((f, i) => (
                                    <div key={i} className="text-left bg-white/5 rounded-xl p-6 border border-white/10">
                                      <h3 className="font-semibold mb-2" style={{ color: '#ffffff' }}>
                                        {f.title || 'Feature'}
                                      </h3>
                                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                        {f.description || 'Description'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="signups"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid md:grid-cols-2 gap-4"
                >
                  {/* Signups List */}
                  <BusinessCard title="Email Signups" icon={Mail} iconColor="text-blue-500" colSpan={signups.length > 0 ? 1 : 2}>
                    {signups.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto mb-4">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Signups Yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Publish your landing page and share the link to start collecting email signups from potential users.
                        </p>
                        {!landingPage?.is_published && landingPage && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => togglePublish(true)}
                          >
                            <Globe className="w-4 h-4 mr-2" /> Publish Now
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[500px] overflow-auto">
                        {signups.map((s, i) => (
                          <motion.div
                            key={s.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                {(s.name?.[0] || s.email[0]).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{s.email}</p>
                                {s.name && <p className="text-xs text-muted-foreground">{s.name}</p>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(s.created_at).toLocaleDateString()}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </BusinessCard>

                  {/* Insights */}
                  {signups.length > 0 && (
                    <BusinessCard title="Validation Insights" icon={Target} iconColor="text-green-500">
                      <div className="space-y-6">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">Signup Progress</span>
                            <span className="text-sm font-semibold text-foreground">{signupCount} / 100</span>
                          </div>
                          <Progress value={Math.min(signupCount, 100)} className="h-2 bg-secondary" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {signupCount >= 100
                              ? '✅ Strong validation signal — consider building an MVP!'
                              : signupCount >= 50
                                ? '📈 Good traction — keep promoting your page'
                                : signupCount >= 10
                                  ? '🌱 Early interest — share on more channels'
                                  : '🚀 Just getting started — share your page link'}
                          </p>
                        </div>
                        <Separator className="bg-border" />
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-foreground">Quick Stats</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-secondary/30 rounded-lg p-3 text-center">
                              <p className="text-lg font-bold text-foreground">{signupCount}</p>
                              <p className="text-xs text-muted-foreground">Total</p>
                            </div>
                            <div className="bg-secondary/30 rounded-lg p-3 text-center">
                              <p className="text-lg font-bold text-foreground">{todaySignups}</p>
                              <p className="text-xs text-muted-foreground">Today</p>
                            </div>
                          </div>
                        </div>
                        <Separator className="bg-border" />
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Next Steps</h4>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                              <MousePointerClick className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              Share on social media & communities
                            </li>
                            <li className="flex items-start gap-2">
                              <MousePointerClick className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              Email your early signups for feedback
                            </li>
                            <li className="flex items-start gap-2">
                              <MousePointerClick className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              Iterate your page based on conversion
                            </li>
                          </ul>
                        </div>
                      </div>
                    </BusinessCard>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
