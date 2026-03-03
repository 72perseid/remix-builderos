import { useNavigate } from 'react-router-dom';
import { ArtifactCard, ArtifactStatus } from "./ArtifactCard";
import { ArchitectBanner } from "./ArchitectBanner";
import { useArtifacts } from '@/hooks/useArtifacts';
import { useProfile } from '@/hooks/useProfile';
import { useProjectContext } from '@/contexts/ProjectContext';
import type { Database } from '@/integrations/supabase/types';
type ArtifactType = Database['public']['Enums']['artifact_type'];
interface ArtifactCardConfig {
  type: ArtifactType;
  title: string;
  description: string;
  route: string;
  category: 'planning' | 'building' | 'launching';
}
const artifactCards: ArtifactCardConfig[] = [{
  type: 'business_model',
  title: 'Business Model',
  description: 'Define your value proposition, revenue streams, and go-to-market strategy.',
  route: '/business-model',
  category: 'planning'
}, {
  type: 'validation',
  title: 'Validation Strategy',
  description: 'User personas and validation insights for your target audience.',
  route: '/validation',
  category: 'planning'
}, {
  type: 'product_brief',
  title: 'Product Brief',
  description: 'Comprehensive product requirements and feature specifications.',
  route: '/product-brief',
  category: 'planning'
}, {
  type: 'db_design',
  title: 'Database Design',
  description: 'ERD diagram and table schema for your application data.',
  route: '/database-design',
  category: 'building'
}, {
  type: 'master_prompt',
  title: 'Master Prompt / PRD',
  description: 'Generate a comprehensive prompt containing your entire project context (DB, Business, Features) to paste into any AI coding tool.',
  route: '/master-prompt',
  category: 'building'
}];

// Explicit type-to-section mapping for filtering artifacts by phase
const TYPE_SECTION_MAP: Record<ArtifactType, 'planning' | 'building' | 'launching'> = {
  business_model: 'planning',
  validation: 'planning',
  product_brief: 'planning',
  db_design: 'building',
  kanban: 'building',
  master_prompt: 'building',
};

export function ArtifactsGrid() {
  const {
    artifacts,
    loading
  } = useArtifacts();
  const { profile } = useProfile();
  const { selectedApp } = useProjectContext();
  const navigate = useNavigate();

  // Completion mapping from app_ideas fields
  const completionMap: Partial<Record<ArtifactType, number | null>> = {
    business_model: selectedApp?.bm_completion ?? null,
    validation: selectedApp?.uv_completion ?? null,
    product_brief: selectedApp?.pb_completion ?? null,
  };
  const isOnboarded = profile?.onboarded === true;

  // Check if user has any artifacts
  const hasAnyData = artifacts.length > 0;
  
  const getCardStatus = (type: ArtifactType): ArtifactStatus => {
    if (loading) return 'loading';
    const artifact = artifacts.find(a => a.type === type);

    // Special handling for master_prompt
    if (type === 'master_prompt') {
      if (artifact?.status === 'completed') return 'completed';
      if (artifact?.status === 'generating') return 'loading';
      
      // Check if all prerequisites are met
      const prerequisites = ['business_model', 'db_design', 'validation', 'product_brief'];
      const allPrerequisitesMet = prerequisites.every(
        prereq => artifacts.some(a => a.type === prereq)
      );
      
      // If prerequisites met but no master_prompt yet, show "ready"
      if (allPrerequisitesMet) return 'ready';
      
      return 'locked';
    }

    // Default behavior for other artifacts
    if (!artifact) return 'locked';
    if (artifact.status === 'completed') return 'completed';
    if (artifact.status === 'generating') return 'loading';
    return 'available';
  };

  // Filter cards by section using the explicit type mapping
  const planningCards = artifactCards.filter(card => TYPE_SECTION_MAP[card.type] === 'planning');
  const buildingCards = artifactCards.filter(card => TYPE_SECTION_MAP[card.type] === 'building');
  const launchingCards = artifactCards.filter(card => TYPE_SECTION_MAP[card.type] === 'launching');
  
  return <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Artifacts</h1>
        <p className="text-muted-foreground mt-1">Generate and manage your project's key documents and deliverables</p>
      </div>
      {/* Architect Banner - hidden after onboarding */}
      {!isOnboarded && (
        <ArchitectBanner onStartBuilding={() => navigate('/onboarding?mode=setup')} hasData={hasAnyData} />
      )}

      {/* Single column layout with Feature Planning and Launching */}
      <div className="grid grid-cols-1 gap-6 max-w-3xl">
        {/* Feature Planning Section */}
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-white mb-1">
              Feature Planning
            </h2>
            <p className="text-sm text-secondary-foreground">
              Define your value proposition, validate your ideas, and create comprehensive product requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {planningCards.map(card => (
              <ArtifactCard 
                key={card.type} 
                title={card.title} 
                description={card.description} 
                status={getCardStatus(card.type)} 
                completion={completionMap[card.type]}
                onClick={() => navigate(card.route)}
              />
            ))}
          </div>
        </div>

        {/* Launching Section */}
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-white mb-1">
              Launching
            </h2>
            <p className="text-sm text-secondary-foreground">
              Prepare for deployment, optimize performance, and execute your go-to-market strategy.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {launchingCards.length > 0 ? launchingCards.map(card => (
              <ArtifactCard 
                key={card.type} 
                title={card.title} 
                description={card.description} 
                status={getCardStatus(card.type)} 
                onClick={() => navigate(card.route)} 
              />
            )) : (
              <div className="bg-card border border-slate-700/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[140px]">
                <span className="text-lg font-semibold text-secondary-foreground">Coming Soon!</span>
                <p className="text-sm text-secondary-foreground/60 mt-1">Stay tuned for launching tools.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>;
}