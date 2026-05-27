import React, { useEffect, useMemo, useState, useCallback } from "react";
import { FaUserShield, FaCheckCircle, FaTimesCircle, FaSearch, FaSync, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/Table";
import PermissionGroup from "../../../components/permissions/PermissionGroup";
import {
  replaceUserRole,
  getAllUsers,
  getUserPermissions,
  getUserRoles,
} from "../../../services/permissionService";
import type { RoleCode } from "../../../types/auth";
import { useAuthStore } from "../../../stores/authStore";

// ─── Constants ──────────────────────────────────────────────────────────────

const ROLE_OPTIONS: { value: RoleCode; label: string; color: string }[] = [
  { value: "ADMIN", label: "Admin", color: "bg-red-100 text-red-700 border-red-200" },
  { value: "EMPLOYEE", label: "Employee", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "GUEST", label: "Guest (Remove Access)", color: "bg-gray-100 text-gray-500 border-gray-300" },
];

const PERMISSION_GROUPS: Record<string, string[]> = {
  Booking: [
    "booking_view",
    "booking_create",
    "booking_edit",
    "booking_delete",
    "booking_cancel",
    "booking_checkin",
    "booking_checkout",
    "booking_manage",
  ],
  Employee: [
    "employee_view",
    "employee_create",
    "employee_edit",
    "employee_delete",
  ],
  Customer: [
    "customer_view",
    "customer_create",
    "customer_edit",
    "customer_delete",
  ],
  Room: ["room_view", "room_manage", "room_type_manage"],
  Service: ["service_view", "service_manage"],
  News: ["news_view", "news_manage"],
  Promotion: ["promotion_view", "promotion_manage", "promotion_type_manage"],
  Voucher: ["voucher_view", "voucher_manage"],
  Review: ["review_manage"],
  Pricing: ["pricing_manage"],
  Report: ["report_view", "report_create", "report_delete", "analytics_view"],
  AI: ["ai_chat"],
};

// Types
interface UserRow {
  id: string;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string | null;
  roles?: string[];
  userRole?: string;
  department?: string;
  position?: string;
  employeeStatus?: string;
}

interface Toast {
  id: number;
  type: "success" | "error";
  message: string;
}

// Toast Component
const ToastItem: React.FC<{ toast: Toast; onClose: (id: number) => void }> = ({
  toast,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-slide-in ${
        toast.type === "success"
          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {toast.type === "success" ? (
        <FaCheckCircle className="text-emerald-500 flex-shrink-0" />
      ) : (
        <FaTimesCircle className="text-red-500 flex-shrink-0" />
      )}
      <span>{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="ml-auto text-current opacity-50 hover:opacity-100 cursor-pointer"
      >
        ×
      </button>
    </div>
  );
};

// Status Badge 

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  ACTIVE:   { label: "Active",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  LEAVE:    { label: "On Leave", className: "bg-amber-50 text-amber-700 border-amber-200" },
  INACTIVE: { label: "Inactive", className: "bg-gray-100 text-gray-500 border-gray-200" },
  RETIRED:  { label: "Retired",  className: "bg-slate-100 text-slate-500 border-slate-200" },
};

const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
  const key = (status ?? "").toUpperCase();
  const cfg = STATUS_MAP[key];
  if (!cfg) return <span className="text-xs text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
        key === "ACTIVE" ? "bg-emerald-500" :
        key === "LEAVE"  ? "bg-amber-400"   :
        "bg-gray-400"
      }`} />
      {cfg.label}
    </span>
  );
};

// Role Badge

const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const normalized = role.replace(/^ROLE_/, "").toUpperCase();
  const option = ROLE_OPTIONS.find((o) => o.value === normalized);
  const colorClass = option?.color ?? "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${colorClass}`}
    >
      {option?.label ?? normalized}
    </span>
  );
};

// Main Component
const PermissionsManagement: React.FC = () => {
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCode | "">("");
  const [activePermissions, setActivePermissions] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = React.useRef(0);

  const addToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load users 
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const data = await getAllUsers();
      setUsers(data as UserRow[]);
    } catch {
      addToast("error", "Could not load staff list. Please try again.");
    } finally {
      setLoadingUsers(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Load selected user details
  useEffect(() => {
    if (!selectedUser?.id) return;

    const fetchDetails = async () => {
      setLoadingDetails(true);
      try {
        const [roles, permissions] = await Promise.all([
          getUserRoles(selectedUser.id),
          getUserPermissions(selectedUser.id),
        ]);

        const currentRole = (roles?.[0] ?? selectedUser.userRole ?? "")
          .replace(/^ROLE_/, "")
          .toUpperCase();

        setSelectedRole(currentRole as RoleCode);
        setActivePermissions(
          new Set((permissions as string[]).map((p) => p.toLowerCase()))
        );
      } catch {
        addToast("error", "Could not load permission details for the selected user.");
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchDetails();
  }, [selectedUser?.id, addToast]);

  // Handlers

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      [user.fullName, user.username, user.email, user.phone, user.department, user.position]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(keyword))
    );
  }, [search, users]);

  const getInitials = (user: UserRow) => {
    const base = user.fullName || user.username || user.email || "";
    if (!base) return "?";
    const parts = base.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return `${first}${last}`.toUpperCase() || "?";
  };

  const getCurrentRoleLabel = (user: UserRow) => {
    const raw = user.userRole || user.roles?.[0] || "";
    return raw.replace(/^ROLE_/, "").toUpperCase();
  };

  const handleSelectUser = (user: UserRow) => {
    if (selectedUser?.id === user.id) return;
    setSelectedUser(user);
    setSelectedRole("");
    setActivePermissions(new Set());
  };

  const isSelf = !!(selectedUser && currentUser && selectedUser.id === currentUser.id);

  const handleApplyRole = async () => {
    if (!selectedUser?.id || !selectedRole) return;
    if (isSelf) {
      addToast("error", "You cannot change your own role while logged in.");
      return;
    }
    setSaving(true);
    try {
      await replaceUserRole(selectedUser.id, selectedRole as RoleCode);

      const [updatedRoles, updatedPermissions] = await Promise.all([
        getUserRoles(selectedUser.id),
        getUserPermissions(selectedUser.id),
      ]);

      setActivePermissions(
        new Set((updatedPermissions as string[]).map((p) => p.toLowerCase()))
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, roles: updatedRoles as string[], userRole: selectedRole }
            : u
        )
      );

      setSelectedUser((prev) =>
        prev ? { ...prev, roles: updatedRoles as string[], userRole: selectedRole } : prev
      );

      addToast(
        "success",
        `Role "${selectedRole}" has been applied to ${selectedUser.fullName || selectedUser.username}.`
      );
    } catch {
      addToast("error", "Could not update role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Render 

  const totalPermissions = Object.values(PERMISSION_GROUPS).flat().length;
  const activeCount = activePermissions.size;

  return (
    <div className="min-h-screen bg-[#f5f0eb] p-5">
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 min-w-[320px]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={removeToast} />
        ))}
      </div>

      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[#6b5e4c] p-3 text-white shadow-lg">
              <FaUserShield size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#6b5e4c]">User Permissions</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Assign roles and review permission access per user.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                className="pl-8 pr-4 py-2 w-80 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 shadow-sm focus:border-[#6b5e4c] focus:outline-none focus:ring-2 focus:ring-[#6b5e4c]/20"
                placeholder="Search by name, email, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={fetchUsers}
              disabled={loadingUsers}
              className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-50 transition cursor-pointer disabled:cursor-not-allowed"
              title="Refresh list"
            >
              <FaSync className={loadingUsers ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">

          {/*Staff Table */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">User List</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Click on a user to view and update permissions.
                </p>
              </div>
              <span className="rounded-full bg-[#f5f0eb] border border-[#d9c9a8] px-3 py-1 text-xs font-semibold text-[#6b5e4c]">
                {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
              </span>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#f9f6f2] border-b border-[#d9c9a8]">
                    <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Contact
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </TableHead>
                    <TableHead className="py-3 px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Role
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingUsers && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                          <FaSync className="animate-spin" />
                          Loading users...
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingUsers && filteredUsers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-sm text-gray-400">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}

                  {!loadingUsers &&
                    filteredUsers.map((user) => {
                      const isSelected = selectedUser?.id === user.id;
                      const roleLabel = getCurrentRoleLabel(user);

                      return (
                        <TableRow
                          key={user.id}
                          onClick={() => handleSelectUser(user)}
                          data-state={isSelected ? "selected" : undefined}
                          className={`cursor-pointer select-none transition-colors hover:bg-[#f9f6f2] ${
                            isSelected ? "bg-[#f5f0eb] border-b border-[#d9c9a8]" : "border-b border-[#d9c9a8]"
                          }`}
                        >
                          {/* Avatar + Name */}
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 overflow-hidden rounded-full border border-[#d9c9a8] bg-[#f5f0eb] flex-shrink-0">
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.fullName || user.username || "Avatar"}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-[#6b5e4c]">
                                    {getInitials(user)}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {user.fullName || user.username || "-"}
                                </div>
                                <div className="text-xs text-gray-400">
                                  @{user.username || "—"}
                                </div>
                              </div>
                              {isSelected && (
                                <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#6b5e4c] flex-shrink-0" />
                              )}
                            </div>
                          </TableCell>


                          {/* Contact */}
                          <TableCell className="py-3 px-4">
                            <div className="text-sm text-gray-700">{user.email || "—"}</div>
                            <div className="text-xs text-gray-400">{user.phone || "—"}</div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="py-3 px-4">
                            <StatusBadge status={user.employeeStatus} />
                          </TableCell>

                          {/* Role */}
                          <TableCell className="py-3 px-4">
                            {roleLabel ? (
                              <RoleBadge role={roleLabel} />
                            ) : (
                              <span className="text-xs text-gray-400">No role</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Permission Panel  */}
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Role & Permissions</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Permissions are automatically derived from the assigned role.
                </p>
              </div>
              {selectedUser && !loadingDetails && (
                <span className="rounded-full bg-[#f5f0eb] border border-[#d9c9a8] px-2.5 py-1 text-[10px] font-semibold text-[#6b5e4c]">
                  {activeCount}/{totalPermissions} permissions
                </span>
              )}
            </div>

            <div className="p-5 space-y-4 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {/* Empty state */}
              {!selectedUser && (
                <div className="rounded-xl border-1 border-dashed border-[#d9c9a8] bg-[#f8f2e7] px-4 py-10 text-center">
                  <FaUserShield className="mx-auto mb-3 text-[#c9b89a] text-3xl" />
                  <p className="text-sm font-medium text-[#8a7c67]">
                    Select a staff member to view and update permissions.
                  </p>
                </div>
              )}

              {selectedUser && (
                <>
                  {/* Selected user info */}
                  <div className="rounded-lg border border-[#d9c9a8] bg-[#f8f2e7] px-4 py-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border-1 border-[#d9c9a8] bg-[#f5f0eb] flex items-center justify-center text-sm font-bold text-[#6b5e4c] flex-shrink-0">
                      {getInitials(selectedUser)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {selectedUser.fullName || selectedUser.username || "User"}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {selectedUser.email || selectedUser.phone || "—"}
                      </div>
                    </div>
                  </div>

                  {/* Role selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Assign Role
                    </label>

                    {/* Self-edit warning */}
                    {isSelf && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                        <FaExclamationTriangle className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <span>You cannot change your own role while logged in. Select another staff member.</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {ROLE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => !isSelf && setSelectedRole(opt.value)}
                          disabled={isSelf}
                          title={opt.value === "GUEST" ? "Revoke all system access — user becomes a read-only guest." : undefined}
                          className={`cursor-pointer px-4 py-2 rounded-lg border text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
                            selectedRole === opt.value
                              ? opt.color + " shadow-sm"
                              : "bg-white text-gray-500 border-gray-300 hover:border-gray-400"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleApplyRole}
                      disabled={saving || !selectedRole || isSelf}
                      className="w-full cursor-pointer rounded-lg bg-[#6b5e4c] py-2.5 text-sm font-semibold text-white shadow transition hover:bg-[#5b4f3f] disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <FaSync className="animate-spin text-xs" />
                          Saving...
                        </>
                      ) : selectedRole === "GUEST" ? (
                        "Remove Access"
                      ) : (
                        "Apply Role"
                      )}
                    </button>

                    {/* Re-login notice */}
                    {!isSelf && selectedUser && (
                      <div className="flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-blue-700">
                        <FaInfoCircle className="flex-shrink-0 mt-0.5 text-blue-400" />
                        <span>Role changes take effect after the user logs out and back in.</span>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100" />

                  {/* Permissions preview */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Current Permissions (read-only)
                    </p>

                    {loadingDetails ? (
                      <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
                        <FaSync className="animate-spin text-xs" />
                        Loading permissions...
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Object.entries(PERMISSION_GROUPS).map(([title, list]) => (
                          <PermissionGroup
                            key={title}
                            title={title}
                            permissions={list}
                            activePermissions={activePermissions}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsManagement;
