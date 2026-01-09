import { ArtifactCard, ArtifactStatus } from "./ArtifactCard";

interface ArtifactItem {
  title: string;
  description: string;
  status: ArtifactStatus;
}

const featurePlanningCards: ArtifactItem[] = [];

const launchingCards: ArtifactItem[] = [];

export function ArtifactsGrid() {
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
          {featurePlanningCards.map((card, index) => (
            <ArtifactCard
              key={index}
              title={card.title}
              description={card.description}
              status={card.status}
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
            Prepare your branding and marketing materials
          </p>
        </div>
        <div className="grid gap-4">
          {launchingCards.map((card, index) => (
            <ArtifactCard
              key={index}
              title={card.title}
              description={card.description}
              status={card.status}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
