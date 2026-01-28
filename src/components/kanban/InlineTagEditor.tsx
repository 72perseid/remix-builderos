import { useState } from 'react';
import { ProjectTag } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useProjectTags, TAG_COLORS } from '@/hooks/useProjectTags';
import { Pencil, X, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InlineTagEditorProps {
  tag: ProjectTag;
}

export function InlineTagEditor({ tag }: InlineTagEditorProps) {
  const [open, setOpen] = useState(false);
  const [editLabel, setEditLabel] = useState(tag.label);
  const [editColor, setEditColor] = useState(tag.color);
  
  const { updateTag, deleteTag, isUpdating } = useProjectTags();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setEditLabel(tag.label);
      setEditColor(tag.color);
    }
    setOpen(isOpen);
  };

  const handleSave = async () => {
    if (!editLabel.trim()) return;
    
    try {
      await updateTag(tag.id, editLabel.trim(), editColor);
      toast.success('Tag updated');
      setOpen(false);
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  const handleDelete = () => {
    deleteTag(tag.id);
    toast.success('Tag deleted');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1"
          style={{
            backgroundColor: `${tag.color}20`,
            color: tag.color,
            border: `1px solid ${tag.color}40`
          }}
        >
          <Pencil className="w-2.5 h-2.5" />
          {tag.label}
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="z-[9999] w-64 p-3 bg-[#1a2744] border-slate-600" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white font-medium">Edit Tag</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Label</Label>
            <Input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              placeholder="Tag name..."
              className="h-8 bg-[#0f1729] border-slate-600 text-white text-sm placeholder:text-slate-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs text-slate-400">Color</Label>
            <div className="flex flex-wrap gap-1.5">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditColor(c);
                  }}
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                    editColor === c && 'ring-2 ring-offset-1 ring-offset-[#1a2744] ring-white'
                  )}
                  style={{ backgroundColor: c }}
                >
                  {editColor === c && <Check className="h-3 w-3 text-white" />}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-600">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={!editLabel.trim() || isUpdating}
              className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
