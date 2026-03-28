import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

const ARTIFACT_LABELS: Record<ArtifactType, string> = {
  business_model: 'Business Model',
  validation: 'User Validation',
  product_brief: 'Product Brief',
  ui_ux: 'UI/UX Design',
  db_design: 'Database Design',
  kanban: 'Kanban Board',
  master_prompt: 'Master Prompt',
};

function jsonToMarkdown(content: unknown, title: string): string {
  const lines: string[] = [`# ${title}`, '', `_Exported on ${new Date().toLocaleDateString()}_`, ''];

  function walk(obj: unknown, depth = 2) {
    if (obj === null || obj === undefined) return;
    if (typeof obj === 'string') {
      lines.push(obj, '');
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => {
        if (typeof item === 'string') {
          lines.push(`- ${item}`);
        } else if (typeof item === 'object' && item !== null) {
          lines.push(`${'#'.repeat(Math.min(depth, 6))} Item ${i + 1}`);
          walk(item, depth + 1);
        }
      });
      lines.push('');
      return;
    }
    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        const heading = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          lines.push(`**${heading}:** ${value}`, '');
        } else {
          lines.push(`${'#'.repeat(Math.min(depth, 6))} ${heading}`, '');
          walk(value, depth + 1);
        }
      }
    }
  }

  walk(content);
  return lines.join('\n');
}

interface ArtifactExportButtonProps {
  artifactType: ArtifactType;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon';
}

export function ArtifactExportButton({ artifactType, variant = 'outline', size = 'sm' }: ArtifactExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const { user } = useAuth();
  const { selectedAppId, selectedApp } = useProjectContext();

  const handleExport = async () => {
    if (!user?.id || !selectedAppId) return;

    setExporting(true);
    try {
      const { data, error } = await supabase
        .from('artifacts')
        .select('content, type')
        .eq('user_id', user.id)
        .eq('app_idea_id', selectedAppId)
        .eq('type', artifactType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data?.content) {
        toast.error('No content to export for this artifact.');
        return;
      }

      const label = ARTIFACT_LABELS[artifactType] || artifactType;
      const appName = selectedApp?.app_name || 'project';
      const markdown = jsonToMarkdown(data.content, `${appName} — ${label}`);
      const filename = `${appName.replace(/\s+/g, '-').toLowerCase()}-${artifactType}.md`;

      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${label} exported as Markdown`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export artifact.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant={variant}
      size={size}
      disabled={exporting}
      className="gap-1.5"
    >
      {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export
    </Button>
  );
}
