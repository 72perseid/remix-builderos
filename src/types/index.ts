export type TaskStatus = 'backlog' | 'selected' | 'in_progress' | 'qa' | 'done';
export type TaskColor = 'yellow' | 'coral' | 'mint' | 'lavender' | 'sky';
export type TaskCategory = 'MVP' | 'V1' | 'Stretch Goals';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface AcceptanceCriteriaItem {
  id: string;
  text: string;
  done: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  color: TaskColor;
  plannedDate?: string;
  completedDate?: string;
  position: number;
  category?: TaskCategory;
  priority?: TaskPriority;
  estimatedEffort?: string;
  subtasks?: AcceptanceCriteriaItem[];
  checklist?: AcceptanceCriteriaItem[];
  createdAt: string;
  updatedAt: string;
}

export interface AppIdea {
  id: string;
  appName: string;
  appDescription: string;
  appCategory?: string;
  appFor?: string;
  appType?: string;
  personaDescription?: string;
  userDemography?: string;
  oneLiner?: string;
  ideaGeneration?: {
    problemStatement?: string;
    targetUsers?: string;
    coreFeatures?: string[];
    differentiators?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessModel {
  id: string;
  appIdeaId: string;
  targetMarket?: string;
  competitiveAdvantage?: string;
  generatedModel?: {
    valueProposition?: string;
    customerSegments?: string[];
    monetizationStrategy?: string;
    goToMarketApproach?: string;
    keyResources?: string[];
    keyPartners?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseDesign {
  id: string;
  appIdeaId: string;
  roadmapFeatures?: string;
  generatedDesign?: {
    erdDiagram?: string;
    tables?: {
      name: string;
      fields: { name: string; type: string; constraints: string }[];
    }[];
    relationships?: {
      from: string;
      to: string;
      type: string;
      description: string;
    }[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedFeature {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedEffort: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}
