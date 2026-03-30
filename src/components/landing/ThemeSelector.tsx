import { landingThemes, themeIds, type LandingThemeId } from '@/lib/landingPageThemes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
  value: LandingThemeId;
  onChange: (theme: LandingThemeId) => void;
}

function ThemePreviewCard({ themeId, selected, onClick }: { themeId: LandingThemeId; selected: boolean; onClick: () => void }) {
  const theme = landingThemes[themeId];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left rounded-lg border-2 p-3 transition-all hover:scale-[1.02] ${
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-border/80'
      }`}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center z-10">
          <Check className="w-3 h-3 text-primary-foreground" />
        </div>
      )}

      {/* Mini preview */}
      <div
        className="w-full h-20 rounded-md overflow-hidden mb-2 border"
        style={{ backgroundColor: theme.previewBg, borderColor: theme.isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}
      >
        {/* Navbar */}
        <div className="flex items-center justify-between px-2 py-1" style={{ borderBottom: `1px solid ${theme.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}` }}>
          <div className="w-5 h-1.5 rounded-full" style={{ backgroundColor: theme.previewAccent }} />
          <div className="flex gap-1">
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: theme.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)' }} />
            <div className="w-3 h-1 rounded-full" style={{ backgroundColor: theme.isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)' }} />
          </div>
        </div>
        {/* Hero */}
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="flex-1 space-y-1">
            <div className="w-10 h-1.5 rounded-sm" style={{ backgroundColor: theme.isLight ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }} />
            <div className="w-8 h-1 rounded-sm" style={{ backgroundColor: theme.isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }} />
            <div className="w-6 h-2 mt-1" style={{ backgroundColor: theme.previewAccent, borderRadius: theme.buttonRadius }} />
          </div>
          {theme.heroLayout === 'split' && (
            <div className="w-8 h-8 rounded" style={{ backgroundColor: theme.previewCard, border: `1px solid ${theme.isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}` }} />
          )}
        </div>
        {/* Feature cards */}
        <div className="flex gap-1 px-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-1 h-3" style={{ backgroundColor: theme.previewCard, borderRadius: theme.cardRadius === '0' ? '0' : '2px', border: `1px solid ${theme.isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}` }} />
          ))}
        </div>
      </div>

      <p className="text-sm font-medium text-foreground">{theme.name}</p>
      <p className="text-xs text-muted-foreground leading-snug">{theme.description}</p>
    </button>
  );
}

export default function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {themeIds.map(id => (
        <ThemePreviewCard
          key={id}
          themeId={id}
          selected={value === id}
          onClick={() => onChange(id)}
        />
      ))}
    </div>
  );
}
