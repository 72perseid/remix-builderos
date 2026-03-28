import { useState } from 'react';
import { Download, Loader2, FileText, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

function markdownToHtml(md: string): string {
  return md
    .replace(/^######\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^####\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^###\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^##\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n{2,}/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

function generatePdfHtml(markdown: string, title: string): string {
  const bodyHtml = markdownToHtml(markdown);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @page { size: A4; margin: 24mm 20mm; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12pt; line-height: 1.6; color: #1a1a2e; max-width: 700px; margin: 0 auto; }
  h1 { font-size: 22pt; color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-bottom: 16px; }
  h2 { font-size: 16pt; color: #1e293b; margin-top: 24px; }
  h3 { font-size: 13pt; color: #334155; margin-top: 18px; }
  h4, h5, h6 { font-size: 12pt; color: #475569; margin-top: 14px; }
  strong { color: #1e293b; }
  ul { padding-left: 20px; margin: 8px 0; }
  li { margin: 4px 0; }
  em { color: #64748b; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;
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

  const fetchContent = async () => {
    if (!user?.id || !selectedAppId) return null;

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
    return data;
  };

  const handleExport = async (format: 'markdown' | 'pdf') => {
    setExporting(true);
    try {
      const data = await fetchContent();
      if (!data?.content) {
        toast.error('No content to export for this artifact.');
        return;
      }

      const label = ARTIFACT_LABELS[artifactType] || artifactType;
      const appName = selectedApp?.app_name || 'project';
      const baseFilename = `${appName.replace(/\s+/g, '-').toLowerCase()}-${artifactType}`;
      const markdown = jsonToMarkdown(data.content, `${appName} — ${label}`);

      if (format === 'markdown') {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        downloadBlob(blob, `${baseFilename}.md`);
        toast.success(`${label} exported as Markdown`);
      } else {
        const html = generatePdfHtml(markdown, `${appName} — ${label}`);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          toast.error('Pop-up blocked. Please allow pop-ups to export as PDF.');
          return;
        }
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
        };
        toast.success(`${label} opened for PDF export — use your browser's print dialog to save as PDF`);
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Failed to export artifact.');
    } finally {
      setExporting(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={exporting} className="gap-1.5">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('markdown')} className="gap-2 cursor-pointer">
          <FileText className="h-4 w-4" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="gap-2 cursor-pointer">
          <FileType className="h-4 w-4" />
          PDF (via Print)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
