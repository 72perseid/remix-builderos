import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { Table2, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── Data types ── */

interface TableField { name: string; type: string; constraints?: string; }
interface TableDefNew { name: string; columns: string[]; }
interface TableDefLegacy { name: string; fields: TableField[]; }
type TableDef = TableDefNew | TableDefLegacy;

interface RelationshipObj { from: string; to: string; type: string; description?: string; }
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

function getColumns(t: TableDef): { name: string; type: string }[] {
  if (isNewFormat(t)) return t.columns.map(parseColumn);
  return t.fields.map(f => ({ name: f.name, type: f.type + (f.constraints ? ` ${f.constraints}` : '') }));
}

/* ── Layout constants ── */
const CARD_W = 260;
const COL_GAP = 100;
const ROW_GAP = 60;
const COLS = 3;
const HEADER_H = 40;
const ROW_H = 28;
const PAD = 80;

function cardHeight(t: TableDef): number {
  return HEADER_H + getColumns(t).length * ROW_H + 16;
}

/** Find which field in a table matches a "Table.field" or "Table" reference */
function resolveFieldRef(ref: string, tables: TableDef[]): { tableIdx: number; fieldIdx: number } | null {
  // Try "TableName.fieldName" format
  const dotIdx = ref.indexOf('.');
  if (dotIdx > 0) {
    const tName = ref.slice(0, dotIdx).toLowerCase();
    const fName = ref.slice(dotIdx + 1).toLowerCase();
    const tIdx = tables.findIndex(t => t.name.toLowerCase() === tName);
    if (tIdx >= 0) {
      const cols = getColumns(tables[tIdx]);
      const fIdx = cols.findIndex(c => c.name.toLowerCase() === fName);
      if (fIdx >= 0) return { tableIdx: tIdx, fieldIdx: fIdx };
      // Field not found, fall back to first key field
      const keyIdx = cols.findIndex(c => isKeyField(c.name));
      return { tableIdx: tIdx, fieldIdx: keyIdx >= 0 ? keyIdx : 0 };
    }
  }
  // Just table name
  const tIdx = tables.findIndex(t => t.name.toLowerCase() === ref.toLowerCase());
  if (tIdx >= 0) {
    const cols = getColumns(tables[tIdx]);
    const keyIdx = cols.findIndex(c => isKeyField(c.name));
    return { tableIdx: tIdx, fieldIdx: keyIdx >= 0 ? keyIdx : 0 };
  }
  return null;
}

/** Get Y position of a specific field row within a card */
function fieldY(cardY: number, fieldIdx: number): number {
  return cardY + HEADER_H + fieldIdx * ROW_H + ROW_H / 2;
}

/* ── Component ── */

export default function SchemaVisualizer({ tables, relationships }: SchemaVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan state (background drag)
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Card drag state
  const [cardOffsets, setCardOffsets] = useState<Record<number, { dx: number; dy: number }>>({});
  const [draggingCard, setDraggingCard] = useState<number | null>(null);
  const cardDragStart = useRef({ x: 0, y: 0, dx: 0, dy: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Middle-click always pans
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      return;
    }
    // Left-click on background pans
    if (e.button === 0 && (e.target as HTMLElement).closest('[data-canvas]') === e.currentTarget) {
      e.preventDefault();
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    }
  }, [pan]);

  const handleCardMouseDown = useCallback((e: React.MouseEvent, idx: number) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    const existing = cardOffsets[idx] || { dx: 0, dy: 0 };
    cardDragStart.current = { x: e.clientX, y: e.clientY, dx: existing.dx, dy: existing.dy };
    setDraggingCard(idx);
  }, [cardOffsets]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: panStart.current.panX + (e.clientX - panStart.current.x),
        y: panStart.current.panY + (e.clientY - panStart.current.y),
      });
    } else if (draggingCard !== null) {
      const dx = cardDragStart.current.dx + (e.clientX - cardDragStart.current.x);
      const dy = cardDragStart.current.dy + (e.clientY - cardDragStart.current.y);
      setCardOffsets(prev => ({ ...prev, [draggingCard]: { dx, dy } }));
    }
  }, [isPanning, draggingCard]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggingCard(null);
  }, []);

  useEffect(() => {
    if (!isPanning && draggingCard === null) return;
    const up = () => { setIsPanning(false); setDraggingCard(null); };
    window.addEventListener('mouseup', up);
    return () => window.removeEventListener('mouseup', up);
  }, [isPanning, draggingCard]);

  // Positions with offsets applied
  const basePositions = useMemo(() => {
    const pos: { x: number; y: number; w: number; h: number }[] = [];
    const colBottoms = Array(COLS).fill(PAD);
    tables.forEach((t) => {
      const col = colBottoms.indexOf(Math.min(...colBottoms));
      const x = PAD + col * (CARD_W + COL_GAP);
      const y = colBottoms[col];
      const h = cardHeight(t);
      pos.push({ x, y, w: CARD_W, h });
      colBottoms[col] = y + h + ROW_GAP;
    });
    return pos;
  }, [tables]);

  // Final positions = base + user drag offsets
  const positions = useMemo(() => {
    return basePositions.map((p, i) => {
      const off = cardOffsets[i];
      if (!off) return p;
      return { ...p, x: p.x + off.dx, y: p.y + off.dy };
    });
  }, [basePositions, cardOffsets]);

  const canvasW = PAD * 2 + COLS * CARD_W + (COLS - 1) * COL_GAP + 200;
  const canvasH = positions.length === 0 ? 400 : Math.max(...positions.map(p => p.y + p.h)) + PAD + 200;

  // Normalised relationships
  const rels = useMemo(() => relationships.map(normaliseRelationship), [relationships]);

  // Compute SVG paths connecting specific fields
  const paths = useMemo(() => {
    return rels.map(rel => {
      const fromRef = resolveFieldRef(rel.from, tables);
      const toRef = resolveFieldRef(rel.to, tables);
      if (!fromRef || !toRef) return null;

      const fromPos = positions[fromRef.tableIdx];
      const toPos = positions[toRef.tableIdx];
      if (!fromPos || !toPos) return null;

      const y1 = fieldY(fromPos.y, fromRef.fieldIdx);
      const y2 = fieldY(toPos.y, toRef.fieldIdx);

      let x1: number, x2: number;
      const fromCX = fromPos.x + fromPos.w / 2;
      const toCX = toPos.x + toPos.w / 2;

      if (fromCX < toCX) {
        x1 = fromPos.x + fromPos.w;
        x2 = toPos.x;
      } else if (fromCX > toCX) {
        x1 = fromPos.x;
        x2 = toPos.x + toPos.w;
      } else {
        x1 = fromPos.x + fromPos.w;
        x2 = toPos.x + toPos.w;
      }

      const dx = Math.abs(x2 - x1) * 0.5 + 30;
      const cx1 = x1 < x2 ? x1 + dx : x1 - dx;
      const cx2 = x1 < x2 ? x2 - dx : x2 + dx;
      const d = `M${x1},${y1} C${cx1},${y1} ${cx2},${y2} ${x2},${y2}`;

      return { d, label: rel.type, x1, y1, x2, y2, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 };
    }).filter(Boolean) as { d: string; label: string; x1: number; y1: number; x2: number; y2: number; midX: number; midY: number }[];
  }, [rels, tables, positions]);

  return (
    <div
      ref={containerRef}
      data-canvas
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-background/50",
        draggingCard !== null ? "cursor-grabbing" : isPanning ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{ height: 'calc(100dvh - 200px)' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Hint */}
      <div className="absolute top-3 right-3 z-10 text-[10px] text-muted-foreground bg-card/80 backdrop-blur px-2 py-1 rounded border border-border pointer-events-none">
        Drag cards to rearrange · Drag background to pan
      </div>

      <div
        className="relative"
        style={{
          width: canvasW,
          height: canvasH,
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          transition: isPanning || draggingCard !== null ? 'none' : 'transform 0.1s ease-out',
        }}
      >
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
                stroke="hsl(var(--primary) / 0.4)"
                strokeWidth={1.5}
              />
              <circle cx={p.x1} cy={p.y1} r={4} fill="hsl(var(--primary))" />
              <circle cx={p.x2} cy={p.y2} r={4} fill="hsl(var(--primary))" />
              <rect
                x={p.midX - 16}
                y={p.midY - 10}
                width={32}
                height={16}
                rx={4}
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                x={p.midX}
                y={p.midY + 2}
                textAnchor="middle"
                className="fill-foreground text-[9px] font-mono font-medium"
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
          const isDragging = draggingCard === i;
          return (
            <div
              key={i}
              onMouseDown={(e) => handleCardMouseDown(e, i)}
              className={cn(
                "absolute rounded-lg border border-border bg-card shadow-lg overflow-hidden select-none",
                isDragging ? "cursor-grabbing shadow-2xl ring-2 ring-primary/40 z-20" : "cursor-grab hover:shadow-xl hover:border-primary/30"
              )}
              style={{
                left: pos.x,
                top: pos.y,
                width: pos.w,
                zIndex: isDragging ? 20 : 1,
                transition: isDragging ? 'none' : 'box-shadow 0.2s, border-color 0.2s',
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border-b border-border">
                <Table2 className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm font-semibold text-foreground truncate">{table.name}</span>
              </div>
              {/* Fields */}
              <div className="py-1">
                {cols.map((col, j) => (
                  <div
                    key={j}
                    className="flex items-center gap-2 px-3 hover:bg-muted/30 transition-colors"
                    style={{ height: ROW_H }}
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
