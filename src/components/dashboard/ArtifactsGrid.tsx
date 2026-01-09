import { useNavigate } from 'react-router-dom';
import { ArtifactCard, ArtifactStatus } from "./ArtifactCard";
import { useArtifacts } from '@/hooks/useArtifacts';
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

interface ArtifactCardConfig {
  type: ArtifactType;
  title: string;
  description: string;
  route: string;
  category: 'planning' | 'launching';
}

const artifactCards: ArtifactCardConfig[] = [
  {
    type: 'business_model',
    title: 'Business Model',
    description: 'Define your value proposition, revenue streams, and go-to-market strategy.',
    route: '/business-model',
    category: 'planning',
  },
  {
    type: 'validation',
    title: 'Validation Strategy',
    description: 'User personas and validation insights for your target audience.',
    route: '/validation',
    category: 'planning',
  },
  {
    type: 'product_brief',
    title: 'Product Brief',
    description: 'Comprehensive product requirements and feature specifications.',
    route: '/product-brief',
    category: 'planning',
  },
  {
    type: 'db_design',
    title: 'Database Design',
    description: 'ERD diagram and table schema for your application data.',
    route: '/database-design',
    category: 'launching',
  },
  {
    type: 'kanban',
    title: 'Roadmap & Features',
    description: 'Feature roadmap organized by MVP, V1, and stretch goals.',
    route: '/ai-kanban-assistant',
    category: 'launching',
  },
];

export function ArtifactsGrid() {
  const navigate = useNavigate();
  const { artifacts, loading } = useArtifacts();

  const getCardStatus = (type: ArtifactType): ArtifactStatus => {
    if (loading) return 'loading';
    
    const artifact = artifacts.find((a) => a.type === type);
    if (!artifact) return 'available';
    if (artifact.status === 'completed') return 'completed';
    if (artifact.status === 'generating') return 'loading';
    return 'available';
  };

  const planningCards = artifactCards.filter((c) => c.category === 'planning');
  const launchingCards = artifactCards.filter((c) => c.category === 'launching');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Feature Planning Column */}
      <div>
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Feature planning
          </h3>
          <p className="text-xs text-slate-600">
            Plan and organize your app features before development
          </p>
        </div>
        <div className="grid gap-4">
          {planningCards.map((card) => (
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

      {/* Launching Column */}
      <div>
        <div className="mb-4">
          <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">
            Launching
          </h3>
          <p className="text-xs text-slate-600">
            Technical artifacts and implementation guides
          </p>
        </div>
        <div className="grid gap-4">
          {launchingCards.map((card) => (
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
    </div>
  );
}
