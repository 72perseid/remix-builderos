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
  category: 'planning' | 'launching';
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
  category: 'launching'
}, {
  type: 'kanban',
  title: 'Roadmap & Features',
  description: 'Feature roadmap organized by MVP, V1, and stretch goals.',
  route: '/project-board',
  category: 'launching'
}];
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
  const planningCards = artifactCards.filter(c => c.category === 'planning');
  const launchingCards = artifactCards.filter(c => c.category === 'launching');
  return <div className="space-y-6">
      {/* Architect Banner */}
      <ArchitectBanner onStartBuilding={openChat} hasData={hasAnyData} />

      {/* Feature Planning Header - Above both columns */}
      <div className="mb-2">
        <h3 className="text-sm uppercase tracking-wider text-muted-foreground font-semibold mb-1">
          Feature Planning
        </h3>
        <p className="text-sm text-muted-foreground">
          These artifacts guide you in aligning on scope, functionality, and user experience before moving into building.
        </p>
      </div>

      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Planning Column */}
        <div className="grid gap-4">
          {planningCards.map(card => <ArtifactCard key={card.type} title={card.title} description={card.description} status={getCardStatus(card.type)} onClick={() => navigate(card.route)} />)}
        </div>

        {/* Launching Column */}
        <div className="grid gap-4">
          {launchingCards.map(card => <ArtifactCard key={card.type} title={card.title} description={card.description} status={getCardStatus(card.type)} onClick={() => navigate(card.route)} />)}
        </div>
      </div>
    </div>;
}