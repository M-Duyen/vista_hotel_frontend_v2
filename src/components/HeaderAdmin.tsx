/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaUserCircle, FaChevronRight } from "react-icons/fa";
import NotificationBell from "./common/NotificationBell";

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

interface UserData {
  id: string;
  userName: string;
  fullName: string;
  email: string;
  userRole?: string;
  roles?: string[];
  memberShipLevel?: string;
  avatarUrl?: string | null;
}

const HeaderAdmin: React.FC<HeaderProps> = ({
    toggleSidebar,
    isSidebarOpen,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const location = useLocation();

  useEffect(() => {
    // Lấy thông tin user từ localStorage
    const loadUserData = () => {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setUserData(user);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };

    loadUserData();

    // Listen for storage changes (when user data is updated in another tab or component)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        loadUserData();
      }
    };

    // Listen for custom event when user data is updated in the same tab
    const handleUserUpdate = () => {
      loadUserData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("userDataUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userDataUpdated", handleUserUpdate);
    };
  }, []);

  // Lấy tên hiển thị (ưu tiên fullName, nếu không có thì dùng userName)
  const displayName = userData?.fullName || userData?.userName || "Admin User";
  const normalizedRole = (userData?.userRole || userData?.roles?.[0] || "")
    .toUpperCase()
    .replace(/^ROLE_/, "");
  const displayRole =
    normalizedRole === "ADMIN" ? "Administrator" : normalizedRole || "Administrator";
  const profilePath =
    normalizedRole === "EMPLOYEE" ? "/employee/profile" : "/admin/profile";

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ name: "Dashboard", path: `/${paths[0]}` }];

    let currentPath = `/${paths[0]}`;
    for (let i = 1; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const name = paths[i]
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      breadcrumbs.push({ name, path: currentPath });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-gradient-to-r from-white via-cream/30 to-white border-b-2 border-gold/20 py- px-6 shadow-md">
      <div className="flex justify-between items-center">
        {/* Left Section - Breadcrumb */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gold hover:bg-gold/10 p-2 rounded-lg transition-all duration-200 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <FaBars size={20} />
          </button>

          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2">
            <div className="h-10 w-1 bg-gradient-to-b from-gold to-primary rounded-full hidden sm:block"></div>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const isFirst = index === 0;

              return (
                <React.Fragment key={crumb.path}>
                  {!isFirst && (
                    <FaChevronRight className="text-gray-400 text-xs" />
                  )}
                  {isLast ? (
                    <span className="text-gold font-semibold text-base">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      to={crumb.path}
                      className="text-gray-600 hover:text-gold transition-colors text-sm font-medium"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <NotificationBell />

          {/* Divider */}
          <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>

          {/* Profile */}
          <Link
            to={profilePath}
            className="flex items-center gap-3 hover:bg-gold/10 px-3 py-2 rounded-lg transition-all duration-200 group cursor-pointer"
          >
            <div className="relative">
              {userData?.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full border-2 border-gold object-cover group-hover:border-gold/70 transition-all"
                />
              ) : (
                <FaUserCircle
                  size={36}
                  className="text-gold group-hover:text-gold transition-colors"
                />
              )}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-800 transition-colors">
                {displayName}
              </p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;
