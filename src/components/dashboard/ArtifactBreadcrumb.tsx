import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArtifactExportButton } from "./ArtifactExportButton";
import { ShareDialog } from "@/components/sharing/ShareDialog";
import { useArtifact } from "@/hooks/useArtifact";
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

interface ArtifactBreadcrumbProps {
  currentPage: string;
  artifactType?: ArtifactType;
}

export function ArtifactBreadcrumb({ currentPage, artifactType }: ArtifactBreadcrumbProps) {
  const navigate = useNavigate();
  const { data: artifact } = useArtifact(artifactType || 'business_model');

  return (
    <div className="flex items-center justify-between w-full">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="text-secondary-foreground hover:text-white cursor-pointer text-sm"
              onClick={() => navigate("/artifacts")}
            >
              Artifacts
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-secondary-foreground" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-white text-sm">{currentPage}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-2">
        {artifactType && <ShareDialog artifactId={artifact?.id} />}
        {artifactType && <ArtifactExportButton artifactType={artifactType} />}
      </div>
    </div>
  );
}
