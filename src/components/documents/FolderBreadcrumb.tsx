
import { BreadcrumbItem } from "./types";

type FolderBreadcrumbProps = {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
};

const FolderBreadcrumb = ({ breadcrumbs, onBreadcrumbClick }: FolderBreadcrumbProps) => {
  return (
    <nav className="flex mb-4">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-gray-500">/</span>}
            <button
              onClick={() => onBreadcrumbClick(index)}
              className={`text-sm ${
                index === breadcrumbs.length - 1
                  ? "font-medium text-[#B88E23]"
                  : "text-[#5C4E3D] hover:text-[#B88E23]"
              }`}
            >
              {crumb.name}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default FolderBreadcrumb;
