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
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

interface ArtifactBreadcrumbProps {
  currentPage: string;
  artifactType?: ArtifactType;
}

export function ArtifactBreadcrumb({ currentPage, artifactType }: ArtifactBreadcrumbProps) {
  const navigate = useNavigate();

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
      {artifactType && <ArtifactExportButton artifactType={artifactType} />}
    </div>
  );
}
