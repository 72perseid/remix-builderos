import React, { useMemo, useRef, useState, useCallback } from 'react';
import { Table2, KeyRound, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Data types (matching DatabaseDesignPage formats) ── */

interface TableField {
  name: string;
  type: string;
  constraints?: string;
}

interface TableDefNew {
  name: string;
  columns: string[];
}

interface TableDefLegacy {
  name: string;
  fields: TableField[];
}

type TableDef = TableDefNew | TableDefLegacy;

interface RelationshipObj {
  from: string;
  to: string;
  type: string;
  description?: string;
}

type Relationship = string | RelationshipObj;

export interface SchemaVisualizerProps {
  tables: TableDef[];
  relationships: Relationship[];
}

/* ── Helpers ── */

function isNewFormat(t: TableDef): t is TableDefNew {
  return 'columns' in t && Array.isArray((t as TableDefNew).columns);
}

function parseColumn(col: string): { name: string; type: string } {
  const m = col.match(/^(.+?)\s*\((.+)\)$/);
  return m ? { name: m[1].trim(), type: m[2].trim() } : { name: col, type: 'unknown' };
}

function normaliseRelationship(r: Relationship): RelationshipObj {
  if (typeof r === 'string') {
    const parts = r.split('->').map(s => s.trim());
    return { from: parts[0] || r, to: parts[1] || '', type: '1:N' };
  }
  return r;
}

function isKeyField(name: string): boolean {
  return /\b(id|_id|pk|fk)\b/i.test(name) || name.toLowerCase() === 'id';
}

/* ── Layout constants ── */
const CARD_W = 260;
const CARD_MIN_H = 120;
const COL_GAP = 80;
const ROW_GAP = 60;
const COLS = 3;
const HEADER_H = 40;
const ROW_H = 28;
const PAD = 60;

function getColumns(t: TableDef): { name: string; type: string }[] {
  if (isNewFormat(t)) return t.columns.map(parseColumn);
  return t.fields.map(f => ({ name: f.name, type: f.type + (f.constraints ? ` ${f.constraints}` : '') }));
}

function cardHeight(t: TableDef): number {
  const rows = getColumns(t).length;
  return HEADER_H + rows * ROW_H + 16; // 16 = padding
}

/* ── Component ── */

export default function SchemaVisualizer({ tables, relationships }: SchemaVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Position each table card in a grid
  const positions = useMemo(() => {
    const pos: { x: number; y: number; w: number; h: number }[] = [];
    // Track column bottom positions for masonry-like packing
    const colBottoms = Array(COLS).fill(PAD);

    tables.forEach((t) => {
      // Pick the shortest column
      const col = colBottoms.indexOf(Math.min(...colBottoms));
      const x = PAD + col * (CARD_W + COL_GAP);
      const y = colBottoms[col];
      const h = cardHeight(t);
      pos.push({ x, y, w: CARD_W, h });
      colBottoms[col] = y + h + ROW_GAP;
    });
    return pos;
  }, [tables]);

  const canvasW = useMemo(() => PAD * 2 + COLS * CARD_W + (COLS - 1) * COL_GAP, []);
  const canvasH = useMemo(() => {
    if (positions.length === 0) return 400;
    return Math.max(...positions.map(p => p.y + p.h)) + PAD;
  }, [positions]);

  // Build name→index map for relationship line drawing
  const nameIndex = useMemo(() => {
    const m = new Map<string, number>();
    tables.forEach((t, i) => m.set(t.name.toLowerCase(), i));
    return m;
  }, [tables]);

  // Normalised relationships
  const rels = useMemo(() => relationships.map(normaliseRelationship), [relationships]);

  // Compute SVG paths for relationships
  const paths = useMemo(() => {
    return rels.map(rel => {
      const fi = nameIndex.get(rel.from.toLowerCase());
      const ti = nameIndex.get(rel.to.toLowerCase());
      if (fi === undefined || ti === undefined) return null;
      const from = positions[fi];
      const to = positions[ti];
      if (!from || !to) return null;

      // Connect from right-center of "from" to left-center of "to"
      // If "to" is to the left, swap sides
      let x1: number, y1: number, x2: number, y2: number;
      const fromCX = from.x + from.w / 2;
      const toCX = to.x + to.w / 2;

      if (fromCX < toCX) {
        x1 = from.x + from.w;
        y1 = from.y + from.h / 2;
        x2 = to.x;
        y2 = to.y + to.h / 2;
      } else if (fromCX > toCX) {
        x1 = from.x;
        y1 = from.y + from.h / 2;
        x2 = to.x + to.w;
        y2 = to.y + to.h / 2;
      } else {
        // Same column — connect bottom to top
        if (from.y < to.y) {
          x1 = from.x + from.w / 2;
          y1 = from.y + from.h;
          x2 = to.x + to.w / 2;
          y2 = to.y;
        } else {
          x1 = from.x + from.w / 2;
          y1 = from.y;
          x2 = to.x + to.w / 2;
          y2 = to.y + to.h;
        }
      }

      const dx = (x2 - x1) * 0.5;
      const d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;

      return { d, label: rel.type, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 };
    }).filter(Boolean) as { d: string; label: string; midX: number; midY: number }[];
  }, [rels, nameIndex, positions]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-auto rounded-xl border border-border bg-background/50"
      style={{ maxHeight: 'calc(100dvh - 200px)' }}
    >
      <div className="relative" style={{ width: canvasW, height: canvasH, minWidth: '100%' }}>
        {/* SVG relationship lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={canvasW}
          height={canvasH}
          style={{ zIndex: 0 }}
        >
          {paths.map((p, i) => (
            <g key={i}>
              <path
                d={p.d}
                fill="none"
                stroke="hsl(var(--primary) / 0.5)"
                strokeWidth={2}
                strokeDasharray="6 3"
              />
              {/* Arrow head */}
              <circle cx={p.midX} cy={p.midY} r={3} fill="hsl(var(--primary))" />
              {/* Label */}
              <text
                x={p.midX}
                y={p.midY - 8}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-mono"
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Table cards */}
        {tables.map((table, i) => {
          const pos = positions[i];
          const cols = getColumns(table);
          return (
            <div
              key={i}
              className="absolute rounded-lg border border-border bg-card shadow-lg overflow-hidden"
              style={{ left: pos.x, top: pos.y, width: pos.w, zIndex: 1 }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border-b border-border">
                <Table2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground truncate">{table.name}</span>
              </div>
              {/* Columns */}
              <div className="py-1">
                {cols.map((col, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-2 px-3 py-1 hover:bg-muted/30 transition-colors"
                  >
                    {isKeyField(col.name) ? (
                      <KeyRound className="w-3 h-3 text-yellow-500 shrink-0" />
                    ) : (
                      <span className="w-3 h-3 shrink-0" />
                    )}
                    <span className="text-xs font-mono text-foreground truncate flex-1">{col.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">{col.type}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
