export type LandingThemeId = 'modern' | 'minimalist' | 'bold' | 'startup' | 'professional' | 'ecommerce';

export interface LandingThemeConfig {
  id: LandingThemeId;
  name: string;
  description: string;
  // Background & colors
  bgColor: string;
  sectionAltBg: string;
  navBg: string;
  textColor: string;
  textMuted: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  // Typography
  headingClass: string;
  bodyClass: string;
  // Shape
  borderRadius: string;
  cardRadius: string;
  buttonRadius: string;
  // Hero layout
  heroLayout: 'split' | 'centered' | 'fullwidth';
  // Input styling
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  // Badge styling
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  // Footer
  footerBorder: string;
  // Gradient overlay
  heroGradient: (primaryColor: string) => string;
  // Is light theme
  isLight: boolean;
  // Preview colors for theme selector card
  previewBg: string;
  previewAccent: string;
  previewCard: string;
}

export const landingThemes: Record<LandingThemeId, LandingThemeConfig> = {
  modern: {
    id: 'modern',
    name: 'Modern',
    description: 'Dark bg, gradient accents, glass cards',
    bgColor: '#0F172A',
    sectionAltBg: '#0F172ACC',
    navBg: '#0F172AE6',
    textColor: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.55)',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.1)',
    cardHoverBorder: 'rgba(255,255,255,0.2)',
    headingClass: 'font-bold tracking-tight',
    bodyClass: '',
    borderRadius: '1rem',
    cardRadius: '1rem',
    buttonRadius: '0.75rem',
    heroLayout: 'split',
    inputBg: 'rgba(255,255,255,0.1)',
    inputBorder: 'rgba(255,255,255,0.2)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.4)',
    badgeBg: 'rgba(255,255,255,0.1)',
    badgeText: 'rgba(255,255,255,0.7)',
    badgeBorder: 'rgba(255,255,255,0.2)',
    footerBorder: 'rgba(255,255,255,0.05)',
    heroGradient: (c) => `radial-gradient(ellipse at 30% 20%, ${c}30 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, ${c}15 0%, transparent 50%)`,
    isLight: false,
    previewBg: '#0F172A',
    previewAccent: '#3B82F6',
    previewCard: '#1E293B',
  },
  minimalist: {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, light bg, lots of whitespace',
    bgColor: '#FAFAFA',
    sectionAltBg: '#F1F5F9',
    navBg: '#FFFFFFEE',
    textColor: '#1A1A1A',
    textMuted: 'rgba(0,0,0,0.5)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardHoverBorder: 'rgba(0,0,0,0.15)',
    headingClass: 'font-light tracking-tight',
    bodyClass: '',
    borderRadius: '0.5rem',
    cardRadius: '0.5rem',
    buttonRadius: '0.5rem',
    heroLayout: 'centered',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(0,0,0,0.15)',
    inputText: '#1A1A1A',
    inputPlaceholder: 'rgba(0,0,0,0.35)',
    badgeBg: 'rgba(0,0,0,0.05)',
    badgeText: 'rgba(0,0,0,0.6)',
    badgeBorder: 'rgba(0,0,0,0.1)',
    footerBorder: 'rgba(0,0,0,0.06)',
    heroGradient: () => 'none',
    isLight: true,
    previewBg: '#FAFAFA',
    previewAccent: '#111111',
    previewCard: '#FFFFFF',
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'Large type, vibrant colors, strong contrast',
    bgColor: '#000000',
    sectionAltBg: '#111111',
    navBg: '#000000EE',
    textColor: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.6)',
    cardBg: '#1A1A1A',
    cardBorder: 'rgba(255,255,255,0.08)',
    cardHoverBorder: 'rgba(255,255,255,0.2)',
    headingClass: 'font-black uppercase tracking-wide',
    bodyClass: 'font-medium',
    borderRadius: '0',
    cardRadius: '0',
    buttonRadius: '0',
    heroLayout: 'centered',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(255,255,255,0.15)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.35)',
    badgeBg: 'rgba(255,255,255,0.1)',
    badgeText: '#FFFFFF',
    badgeBorder: 'rgba(255,255,255,0.2)',
    footerBorder: 'rgba(255,255,255,0.08)',
    heroGradient: (c) => `linear-gradient(135deg, ${c}20 0%, transparent 50%)`,
    isLight: false,
    previewBg: '#000000',
    previewAccent: '#FF3366',
    previewCard: '#1A1A1A',
  },
  startup: {
    id: 'startup',
    name: 'Startup',
    description: 'Gradient hero, tech-forward, animated feel',
    bgColor: '#0A0118',
    sectionAltBg: '#120228',
    navBg: '#0A0118E6',
    textColor: '#FFFFFF',
    textMuted: 'rgba(255,255,255,0.55)',
    cardBg: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(139,92,246,0.2)',
    cardHoverBorder: 'rgba(139,92,246,0.4)',
    headingClass: 'font-bold tracking-tight',
    bodyClass: '',
    borderRadius: '1.5rem',
    cardRadius: '1.25rem',
    buttonRadius: '9999px',
    heroLayout: 'split',
    inputBg: 'rgba(255,255,255,0.08)',
    inputBorder: 'rgba(139,92,246,0.3)',
    inputText: '#FFFFFF',
    inputPlaceholder: 'rgba(255,255,255,0.35)',
    badgeBg: 'rgba(139,92,246,0.15)',
    badgeText: '#A78BFA',
    badgeBorder: 'rgba(139,92,246,0.3)',
    footerBorder: 'rgba(139,92,246,0.1)',
    heroGradient: (c) => `radial-gradient(ellipse at 20% 50%, #8B5CF640 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, ${c}30 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, #EC489920 0%, transparent 40%)`,
    isLight: false,
    previewBg: '#0A0118',
    previewAccent: '#8B5CF6',
    previewCard: '#1E0A3E',
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate look, structured, muted palette',
    bgColor: '#F8F9FA',
    sectionAltBg: '#FFFFFF',
    navBg: '#FFFFFFEE',
    textColor: '#212529',
    textMuted: 'rgba(33,37,41,0.55)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,0.1)',
    cardHoverBorder: 'rgba(0,0,0,0.18)',
    headingClass: 'font-semibold tracking-tight',
    bodyClass: '',
    borderRadius: '0.375rem',
    cardRadius: '0.5rem',
    buttonRadius: '0.375rem',
    heroLayout: 'split',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(0,0,0,0.15)',
    inputText: '#212529',
    inputPlaceholder: 'rgba(33,37,41,0.4)',
    badgeBg: 'rgba(0,0,0,0.05)',
    badgeText: 'rgba(33,37,41,0.65)',
    badgeBorder: 'rgba(0,0,0,0.1)',
    footerBorder: 'rgba(0,0,0,0.08)',
    heroGradient: () => 'none',
    isLight: true,
    previewBg: '#F8F9FA',
    previewAccent: '#0D6EFD',
    previewCard: '#FFFFFF',
  },
  ecommerce: {
    id: 'ecommerce',
    name: 'Ecommerce',
    description: 'Product-focused, prominent CTAs, trust badges',
    bgColor: '#FFFFFF',
    sectionAltBg: '#F9FAFB',
    navBg: '#FFFFFFEE',
    textColor: '#111827',
    textMuted: 'rgba(17,24,39,0.55)',
    cardBg: '#FFFFFF',
    cardBorder: 'rgba(0,0,0,0.08)',
    cardHoverBorder: 'rgba(0,0,0,0.15)',
    headingClass: 'font-bold tracking-tight',
    bodyClass: '',
    borderRadius: '0.75rem',
    cardRadius: '0.75rem',
    buttonRadius: '0.75rem',
    heroLayout: 'split',
    inputBg: '#FFFFFF',
    inputBorder: 'rgba(0,0,0,0.15)',
    inputText: '#111827',
    inputPlaceholder: 'rgba(17,24,39,0.4)',
    badgeBg: 'rgba(16,185,129,0.1)',
    badgeText: '#059669',
    badgeBorder: 'rgba(16,185,129,0.2)',
    footerBorder: 'rgba(0,0,0,0.06)',
    heroGradient: (c) => `linear-gradient(180deg, ${c}08 0%, transparent 40%)`,
    isLight: true,
    previewBg: '#FFFFFF',
    previewAccent: '#F59E0B',
    previewCard: '#F9FAFB',
  },
};

export const themeIds = Object.keys(landingThemes) as LandingThemeId[];
