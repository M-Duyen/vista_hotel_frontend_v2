import React from "react";

interface PermissionBadgeProps {
  label: string;
  active?: boolean;
}

const PermissionBadge: React.FC<PermissionBadgeProps> = ({ label, active }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide border transition-all ${
        active
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-gray-50 text-gray-400 border-gray-200"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          active ? "bg-emerald-500" : "bg-gray-300"
        }`}
      />
      {label}
    </span>
  );
};

export default PermissionBadge;
