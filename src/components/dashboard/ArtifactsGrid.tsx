import { useNavigate } from 'react-router-dom';
import { ArtifactCard, ArtifactStatus } from "./ArtifactCard";
import { ArchitectBanner } from "./ArchitectBanner";
import { useArtifacts } from '@/hooks/useArtifacts';
import { useChatContext } from '@/contexts/ChatContext';
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
}];

// Explicit type-to-section mapping for filtering artifacts by phase
const TYPE_SECTION_MAP: Record<ArtifactType, 'planning' | 'building' | 'launching'> = {
  business_model: 'planning',
  validation: 'planning',
  product_brief: 'planning',
  db_design: 'building',
  kanban: 'building', // Not displayed but included for type completeness
};

export function ArtifactsGrid() {
  const navigate = useNavigate();
  const {
    artifacts,
    loading
  } = useArtifacts();
  const {
    openChat
  } = useChatContext();

  // Check if user has any artifacts
  const hasAnyData = artifacts.length > 0;
  
  const getCardStatus = (type: ArtifactType): ArtifactStatus => {
    if (loading) return 'loading';
    const artifact = artifacts.find(a => a.type === type);

    // No artifact = locked (waiting for AI generation)
    if (!artifact) return 'locked';
    if (artifact.status === 'completed') return 'completed';
    if (artifact.status === 'generating') return 'loading';
    return 'available';
  };

  // Filter cards by section using the explicit type mapping
  const planningCards = artifactCards.filter(card => TYPE_SECTION_MAP[card.type] === 'planning');
  const buildingCards = artifactCards.filter(card => TYPE_SECTION_MAP[card.type] === 'building');
  
  return <div className="space-y-8">
      {/* Architect Banner */}
      <ArchitectBanner onStartBuilding={openChat} hasData={hasAnyData} />

      {/* Three-column layout with Feature Planning, Building, and Launching sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Planning Section */}
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-white mb-1">
              Feature Planning
            </h2>
            <p className="text-sm text-muted-foreground">
              Define your value proposition, validate your ideas, and create comprehensive product requirements.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {planningCards.map(card => (
              <ArtifactCard 
                key={card.type} 
                title={card.title} 
                description={card.description} 
                status={getCardStatus(card.type)} 
                onClick={() => navigate(card.route)} 
              />
            ))}
          </div>
        </div>

        {/* Building Section */}
        <div className="space-y-4">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-white mb-1">
              Building
            </h2>
            <p className="text-sm text-muted-foreground">
              Design your database schema and technical architecture.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {buildingCards.map(card => (
              <ArtifactCard 
                key={card.type} 
                title={card.title} 
                description={card.description} 
                status={getCardStatus(card.type)} 
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
            <p className="text-sm text-muted-foreground">
              Prepare for deployment and go-to-market.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {/* Coming Soon Placeholder */}
            <div className="rounded-2xl border border-dashed border-border/50 bg-muted/20 p-6 text-center min-h-[180px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center mb-3">
                <span className="text-2xl text-muted-foreground/50">🚀</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Coming Soon</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Launch artifacts will appear here</p>
            </div>
          </div>
        </div>
      </div>
    </div>;
}