import React from "react";
import PermissionBadge from "./PermissionBadge";

interface PermissionGroupProps {
  title: string;
  permissions: string[];
  activePermissions: Set<string>;
}

const PermissionGroup: React.FC<PermissionGroupProps> = ({
  title,
  permissions,
  activePermissions,
}) => {
  if (permissions.length === 0) return null;

  const activeCount = permissions.filter((perm) =>
    activePermissions.has(perm),
  ).length;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
          {title}
        </h3>
        <span className="rounded-full border border-gray-200 bg-[#f5f0eb] px-2.5 py-0.5 text-[10px] font-semibold text-[#6b5e4c]">
          {activeCount}/{permissions.length}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {permissions.map((perm) => (
          <PermissionBadge
            key={perm}
            label={perm.replace(/_/g, " ").toUpperCase()}
            active={activePermissions.has(perm)}
          />
        ))}
      </div>
    </div>
  );
};

export default PermissionGroup;
