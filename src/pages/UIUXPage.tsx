import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useArtifact } from '@/hooks/useArtifact';
import { useProjectContext } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Palette, Type, Layout, Layers, Loader2 } from 'lucide-react';
import { ArtifactBreadcrumb } from '@/components/dashboard/ArtifactBreadcrumb';
import { CopilotPanel } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

// Helper to extract JSON from artifact content
function parseArtifactContent(rawContent: unknown): any {
  if (!rawContent) return null;
  if (typeof rawContent === 'object' && rawContent !== null) {
    const obj = rawContent as Record<string, unknown>;
    if (obj.uiUx && typeof obj.uiUx === 'object') return obj.uiUx;
    if (obj.ui_ux && typeof obj.ui_ux === 'object') return obj.ui_ux;
    return rawContent;
  }
  if (typeof rawContent === 'string') {
    try {
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed.uiUx || parsed.ui_ux || parsed;
      }
      const directParse = JSON.parse(rawContent);
      return directParse.uiUx || directParse.ui_ux || directParse;
    } catch {
      return null;
    }
  }
  return null;
}

export default function UIUXPage() {
  const { data: artifact, loading: artifactLoading, refetch: refetchArtifact } = useArtifact('ui_ux');
  const { selectedAppId } = useProjectContext();

  const { data: completionData } = useQuery({
    queryKey: ['app-completion-ux', selectedAppId],
    queryFn: async () => {
      if (!selectedAppId) return null;
      const { data } = await supabase
        .from('app_ideas')
        .select('ux_completion')
        .eq('id', selectedAppId)
        .maybeSingle();
      return data;
    },
    enabled: !!selectedAppId,
    refetchInterval: 10000,
  });

  const uxCompletion = (completionData as any)?.ux_completion ?? 0;

  const content = parseArtifactContent(artifact?.content);

  // Normalize fields flexibly
  const colorPalette = content?.color_palette || content?.colorPalette || content?.colors || [];
  const typography = content?.typography || content?.fonts || null;
  const spacing = content?.spacing_and_layout || content?.spacing || null;
  const componentStyle = content?.key_ui_components || content?.component_style || content?.componentStyle || content?.components || null;
  const designPrinciples = content?.ui_vibe_and_style || content?.design_principles || content?.designPrinciples || [];
  const brandTone = content?.brand_tone || content?.brandTone || content?.tone || null;

  if (artifactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-[#0B0E14] overflow-hidden">
      <div className="px-6 pt-4 pb-2 shrink-0 border-b border-slate-800/50">
        <ArtifactBreadcrumb currentPage="UI/UX Design System" artifactType="ui_ux" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CopilotPanel context="ui_ux" heading="UX Designer" onArtifactRefresh={refetchArtifact} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">UI/UX Design System</h1>
                <p className="text-secondary-foreground mt-1">Define your design system, colors, typography, and component style guide</p>
              </div>
              {uxCompletion > 0 && (
                <div className="w-40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Completion</span>
                    <span className="text-xs font-semibold text-blue-400">{uxCompletion}%</span>
                  </div>
                  <Progress value={uxCompletion} className="h-1.5 bg-slate-700/50" />
                </div>
              )}
            </div>

            {/* Empty State */}
            {!content && (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-8 text-center">
                  <Palette className="w-12 h-12 mx-auto text-secondary-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Design System Yet</h3>
                  <p className="text-secondary-foreground text-sm">
                    Use the UX Designer copilot to define your design system.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Generated Design System */}
            {content && (
              <motion.div
                className="grid md:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {brandTone && (
                  <BusinessCard title="Brand Tone" icon={Type} iconColor="text-pink-500" colSpan={2}>
                    <p>{typeof brandTone === 'string' ? brandTone : JSON.stringify(brandTone)}</p>
                  </BusinessCard>
                )}

                {designPrinciples.length > 0 && (
                  <BusinessCard title="Design Principles" icon={Layers} iconColor="text-purple-500" colSpan={2}>
                    <ul className="space-y-1.5">
                      {designPrinciples.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>{p}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {Array.isArray(colorPalette) && colorPalette.length > 0 && (
                  <BusinessCard title="Color Palette" icon={Palette} iconColor="text-blue-500" colSpan={2}>
                    <div className="flex flex-wrap gap-3">
                      {colorPalette.map((color: any, i: number) => {
                        let hex: string | undefined;
                        let name: string;
                        if (typeof color === 'string') {
                          const hexMatch = color.match(/#[0-9A-Fa-f]{3,8}/);
                          hex = hexMatch?.[0];
                          name = hex ? color.replace(hex, '').replace(/^\s*for\s*/i, '').trim() : color;
                        } else {
                          hex = color?.hex || color?.value;
                          name = color?.name || color?.label || '';
                        }
                        return (
                          <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-2">
                            {hex && (
                              <div
                                className="w-6 h-6 rounded-full border border-border"
                                style={{ backgroundColor: hex }}
                              />
                            )}
                            <span className="text-sm text-foreground">{name || hex}</span>
                          </div>
                        );
                      })}
                    </div>
                  </BusinessCard>
                )}

                {typography && (Array.isArray(typography) ? typography.length > 0 : true) && (
                  <BusinessCard title="Typography" icon={Type} iconColor="text-green-500">
                    {Array.isArray(typography) ? (
                      <ul className="space-y-1.5">
                        {typography.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>{item}
                          </li>
                        ))}
                      </ul>
                    ) : typeof typography === 'string' ? (
                      <p>{typography}</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(typography).map(([key, value]) => (
                          <p key={key}><span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</p>
                        ))}
                      </div>
                    )}
                  </BusinessCard>
                )}

                {spacing && (Array.isArray(spacing) ? spacing.length > 0 : true) && (
                  <BusinessCard title="Spacing & Layout" icon={Layout} iconColor="text-orange-500">
                    {Array.isArray(spacing) ? (
                      <ul className="space-y-1.5">
                        {spacing.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-orange-500 mt-0.5">•</span>{item}
                          </li>
                        ))}
                      </ul>
                    ) : typeof spacing === 'string' ? (
                      <p>{spacing}</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(spacing).map(([key, value]) => (
                          <p key={key}><span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</p>
                        ))}
                      </div>
                    )}
                  </BusinessCard>
                )}

                {componentStyle && (Array.isArray(componentStyle) ? componentStyle.length > 0 : true) && (
                  <BusinessCard title="Key UI Components" icon={Layers} iconColor="text-cyan-500" colSpan={2}>
                    {Array.isArray(componentStyle) ? (
                      <ul className="space-y-1.5">
                        {componentStyle.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan-500 mt-0.5">•</span>{item}
                          </li>
                        ))}
                      </ul>
                    ) : typeof componentStyle === 'string' ? (
                      <p>{componentStyle}</p>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(componentStyle).map(([key, value]) => (
                          <p key={key}><span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span> {String(value)}</p>
                        ))}
                      </div>
                    )}
                  </BusinessCard>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
