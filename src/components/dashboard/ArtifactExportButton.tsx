import { useState } from 'react';
import { Download, Loader2, FileText, FileType, Camera } from 'lucide-react';
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
  landing_copy: 'Landing Copy',
  paywall_prompts: 'Paywall Prompts',
  social_content: 'Social Content',
};

// ── Markdown helpers ──

function jsonToMarkdown(content: unknown, title: string): string {
  const lines: string[] = [`# ${title}`, '', `_Exported on ${new Date().toLocaleDateString()}_`, ''];

  function walk(obj: unknown, depth = 2) {
    if (obj === null || obj === undefined) return;
    if (typeof obj === 'string') { lines.push(obj, ''); return; }
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

// ── Styled PDF helpers ──

const SECTION_COLORS: Record<string, string> = {
  value_proposition: '#3b82f6',
  valueProposition: '#3b82f6',
  customer_segments: '#8b5cf6',
  customerSegments: '#8b5cf6',
  revenue_streams: '#10b981',
  revenueStreams: '#10b981',
  revenue: '#10b981',
  cost_structure: '#ef4444',
  costStructure: '#ef4444',
  expenses: '#ef4444',
  marketing_channels: '#f97316',
  goToMarketApproach: '#f97316',
  elevator_pitch: '#3b82f6',
  core_value_proposition: '#3b82f6',
  problem_statement: '#ef4444',
  problem: '#ef4444',
  target_users: '#8b5cf6',
  targetAudience: '#8b5cf6',
  core_features: '#3b82f6',
  keyFeatures: '#3b82f6',
  v1_features: '#3b82f6',
  success_metrics: '#10b981',
  successMetrics: '#10b981',
  personas: '#8b5cf6',
  user_personas: '#8b5cf6',
  color_palette: '#3b82f6',
  typography: '#10b981',
  design_principles: '#8b5cf6',
  tables: '#3b82f6',
  relationships: '#8b5cf6',
  sql: '#10b981',
};

function renderValueHtml(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return `<p style="margin:4px 0;color:#334155;">${String(value)}</p>`;
  }
  if (Array.isArray(value)) {
    return `<ul style="margin:8px 0;padding-left:20px;">${value.map(item => {
      if (typeof item === 'string' || typeof item === 'number') {
        return `<li style="margin:4px 0;color:#334155;">${item}</li>`;
      }
      if (typeof item === 'object' && item !== null) {
        const entries = Object.entries(item as Record<string, unknown>);
        const title = entries.find(([k]) => ['name', 'feature', 'source', 'title'].includes(k));
        const titleStr = title ? `<strong>${String(title[1])}</strong>` : '';
        const rest = entries
          .filter(([k]) => !['name', 'feature', 'source', 'title'].includes(k))
          .map(([k, v]) => `<span style="color:#64748b;">${k.replace(/_/g, ' ')}: ${typeof v === 'string' || typeof v === 'number' ? v : JSON.stringify(v)}</span>`)
          .join(' · ');
        return `<li style="margin:6px 0;color:#334155;">${titleStr}${rest ? ` — ${rest}` : ''}</li>`;
      }
      return '';
    }).join('')}</ul>`;
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => {
        const label = k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
          return `<p style="margin:4px 0;color:#334155;"><strong style="color:#1e293b;">${label}:</strong> ${v}</p>`;
        }
        return `<p style="margin:8px 0 4px;font-weight:600;color:#475569;">${label}</p>${renderValueHtml(v, depth + 1)}`;
      }).join('');
  }
  return '';
}

function generateStyledPdfHtml(content: unknown, title: string, appName: string): string {
  let cardsHtml = '';

  if (typeof content === 'object' && content !== null && !Array.isArray(content)) {
    for (const [key, value] of Object.entries(content as Record<string, unknown>)) {
      if (value === null || value === undefined) continue;
      const borderColor = SECTION_COLORS[key] || '#94a3b8';
      const heading = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      cardsHtml += `
        <div style="background:#fff;border:1px solid #e2e8f0;border-left:4px solid ${borderColor};border-radius:12px;padding:20px 24px;margin-bottom:16px;break-inside:avoid;">
          <h3 style="margin:0 0 12px;font-size:14pt;color:${borderColor};font-weight:700;">${heading}</h3>
          ${renderValueHtml(value)}
        </div>`;
    }
  } else {
    cardsHtml = `<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">${renderValueHtml(content)}</div>`;
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; font-size: 11pt; line-height: 1.6; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
  .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 28px 32px; border-radius: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; font-size: 22pt; font-weight: 800; }
  .header p { margin: 0; font-size: 10pt; color: #94a3b8; }
  .grid { columns: 2; column-gap: 16px; }
  @media print {
    body { background: #fff; }
    .header { break-after: avoid; }
  }
</style></head><body>
  <div class="header">
    <h1>${appName}</h1>
    <p>${title} · Exported ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>
  <div class="grid">${cardsHtml}</div>
</body></html>`;
}

// ── Visual PDF (screenshot) ──

async function captureVisualPdf(filename: string) {
  const el = document.getElementById('artifact-export-area');
  if (!el) {
    toast.error('Export area not found on this page.');
    return;
  }

  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableW = pageW - margin * 2;

  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = usableW / imgW;
  const scaledH = imgH * ratio;
  const usableH = pageH - margin * 2;

  if (scaledH <= usableH) {
    pdf.addImage(imgData, 'PNG', margin, margin, usableW, scaledH);
  } else {
    // Multi-page: slice canvas
    const sliceHeight = Math.floor(usableH / ratio);
    let y = 0;
    let page = 0;
    while (y < imgH) {
      if (page > 0) pdf.addPage();
      const h = Math.min(sliceHeight, imgH - y);
      const sliceCanvas = document.createElement('canvas');
      sliceCanvas.width = imgW;
      sliceCanvas.height = h;
      const ctx = sliceCanvas.getContext('2d')!;
      ctx.drawImage(canvas, 0, y, imgW, h, 0, 0, imgW, h);
      const sliceData = sliceCanvas.toDataURL('image/png');
      pdf.addImage(sliceData, 'PNG', margin, margin, usableW, h * ratio);
      y += h;
      page++;
    }
  }

  pdf.save(filename);
}

// ── Component ──

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

  const label = ARTIFACT_LABELS[artifactType] || artifactType;
  const appName = selectedApp?.app_name || 'Project';
  const baseFilename = `${appName.replace(/\s+/g, '-').toLowerCase()}-${artifactType}`;

  const handleExport = async (format: 'markdown' | 'styled-pdf' | 'visual-pdf') => {
    setExporting(true);
    try {
      if (format === 'visual-pdf') {
        await captureVisualPdf(`${baseFilename}-visual.pdf`);
        toast.success(`${label} exported as Visual PDF`);
        return;
      }

      const data = await fetchContent();
      if (!data?.content) {
        toast.error('No content to export for this artifact.');
        return;
      }

      const title = `${appName} — ${label}`;

      if (format === 'markdown') {
        const markdown = jsonToMarkdown(data.content, title);
        downloadBlob(new Blob([markdown], { type: 'text/markdown' }), `${baseFilename}.md`);
        toast.success(`${label} exported as Markdown`);
      } else {
        const html = generateStyledPdfHtml(data.content, label, appName);
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          toast.error('Pop-up blocked. Please allow pop-ups to export as PDF.');
          return;
        }
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.onload = () => printWindow.print();
        toast.success(`${label} opened for PDF export — use Print → Save as PDF`);
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
        <DropdownMenuItem onClick={() => handleExport('styled-pdf')} className="gap-2 cursor-pointer">
          <FileType className="h-4 w-4" />
          Styled PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('visual-pdf')} className="gap-2 cursor-pointer">
          <Camera className="h-4 w-4" />
          Visual PDF (screenshot)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
