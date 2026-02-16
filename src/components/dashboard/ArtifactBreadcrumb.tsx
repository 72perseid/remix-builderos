import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface ArtifactBreadcrumbProps {
  currentPage: string;
}

export function ArtifactBreadcrumb({ currentPage }: ArtifactBreadcrumbProps) {
  const navigate = useNavigate();

  return (
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
  );
}
