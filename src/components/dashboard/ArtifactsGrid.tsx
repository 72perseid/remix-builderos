import { ArtifactCard, ArtifactStatus } from "./ArtifactCard";

interface ArtifactItem {
  title: string;
  description: string;
  status: ArtifactStatus;
}

const featurePlanningCards: ArtifactItem[] = [
  { 
    title: "Business model", 
    description: "App detail preview: Lorem ipsum dolor sit amet consectetur adipiscing elit.", 
    status: "loading" 
  },
  { 
    title: "Validation strategy", 
    description: "App detail description: Lorem ipsum dolor sit amet consectetur.", 
    status: "locked" 
  },
  { 
    title: "Kanban", 
    description: "Get your project board organized with tasks and milestones.", 
    status: "completed" 
  },
  { 
    title: "Logo and brandkit", 
    description: "App detail description: Lorem ipsum dolor sit amet consectetur.", 
    status: "locked" 
  },
  { 
    title: "User diagram flow", 
    description: "App detail description: Lorem ipsum dolor sit amet consectetur.", 
    status: "locked" 
  },
  { 
    title: "Database design", 
    description: "App detail description: Lorem ipsum dolor sit amet consectetur.", 
    status: "locked" 
  },
];

const launchingCards: ArtifactItem[] = [
  { 
    title: "Logo and Brandkit", 
    description: "Get your Logo and Brandkit generated.", 
    status: "available" 
  },
  { 
    title: "Validation strategy", 
    description: "App detail description: Lorem ipsum dolor sit amet consectetur.", 
    status: "locked" 
  },
  { 
    title: "Landing page", 
    description: "Create a stunning landing page for your app.", 
    status: "locked" 
  },
  { 
    title: "Marketing plan", 
    description: "Strategic marketing plan for your launch.", 
    status: "locked" 
  },
];

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
