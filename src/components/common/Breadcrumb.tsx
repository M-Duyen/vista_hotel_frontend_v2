import { Link } from "react-router-dom";
import { FaHome, FaChevronRight } from "react-icons/fa";

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = "" }) => {
  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Breadcrumb Items */}
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const isFirst = index === 0;

        return (
          <div key={index} className="flex items-center gap-2">
            {!isFirst && <FaChevronRight className="text-xs text-gray-400" />}

            {item.path && !isLast ? (
              <Link
                to={item.path}
                className="flex items-center gap-1.5 text-gray-600 hover:text-[#ccbda3] transition-colors"
              >
                {item.icon && <span className="text-sm">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-[#ccbda3] font-semibold">
                {item.icon && <span className="text-sm">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumb;
