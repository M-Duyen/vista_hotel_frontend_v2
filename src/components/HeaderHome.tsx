import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CiSearch } from "react-icons/ci";
import SearchSidebar from "./SearchSidebar";
import {
  faUser,
  faUserCircle,
  faBookmark,
  faSignOutAlt,
  faChartLine,
  faTasks,
  faTicketAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { handleLogout } from "../services/authService";
import ConfirmDialog from "./dialog/ConfirmDialog";
import { useToastContext } from "../hooks/useToastContext";
import NotificationBell from "./common/NotificationBell";

interface User {
  id: string;
  userName: string;
  fullName?: string;
  email: string;
  userRole?: string;
  roles?: string[];
  avatarUrl?: string | null;
}

const HeaderHome: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const toast = useToastContext();

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    const result = handleLogout();
    if (result.success) {
      toast.success(result.message || "Logged out successfully!");
    }
    setUser(null);
    setShowLogoutDialog(false);
    navigate("/auth/login", { replace: true });
  };

  const navItems = [
    { label: "Overview", path: "/home" },
    { label: "About Us", path: "/contact" },
    { label: "Accommodation", path: "/room" },
    { label: "Services", path: "/service" },
    { label: "Events", path: "/news" },
    { label: "Exclusive Offers", path: "/promotion-and-voucher" },
  ];

  const getPrimaryRole = () =>
    (user?.userRole || user?.roles?.[0] || "").toUpperCase();

  const getProfilePath = () => {
    const role = getPrimaryRole();
    if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin/profile";
    if (role === "EMPLOYEE") return "/employee/profile";
    return "/customer/profile";
  };

  const getUserMenuItems = () => {
    const role = getPrimaryRole();
    const roleItems =
      role === "SUPER_ADMIN" || role === "ADMIN"
        ? [
            { label: "Dashboard", path: "/admin", icon: faChartLine },
            { label: "Management", path: "/admin/room-management", icon: faTasks },
          ]
        : role === "EMPLOYEE"
          ? [
              { label: "Dashboard", path: "/employee/customers", icon: faChartLine },
              {
                label: "Booking Management",
                path: "/employee/bookingPage",
                icon: faTasks,
              },
            ]
          : [];

    return [
      ...roleItems,
      { label: "Profile", path: getProfilePath(), icon: faUserCircle },
      { label: "My Booking", path: "/customer/mybooking", icon: faBookmark },
      { label: "My Vouchers", path: `${getProfilePath()}?tab=vouchers`, icon: faTicketAlt },
    ];
  };

  const getLastTwoWords = (name: string): string => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length <= 2) return name;
    return parts.slice(-2).join(" ");
  };

  // Check user login status
  useEffect(() => {
    const checkUserStatus = () => {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
          localStorage.removeItem("user");
        }
      } else {
        setUser(null);
      }
    };

    checkUserStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    window.addEventListener("storage", checkUserStatus);
    window.addEventListener("authChanged", checkUserStatus);
    window.addEventListener("userDataUpdated", checkUserStatus);
    return () => {
      window.removeEventListener("storage", checkUserStatus);
      window.removeEventListener("authChanged", checkUserStatus);
      window.removeEventListener("userDataUpdated", checkUserStatus);
    };
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-[9999]">
      {/* Top Section */}
      <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b border-white/20">
        {/* Left: Search Icon & Mobile Menu */}
        <div className="flex items-center space-x-3 z-10">
          <button
            className="hover:opacity-80 transition-opacity"
            onClick={() => setSearchOpen(true)}
          >
            <CiSearch className="text-xl sm:text-2xl text-white cursor-pointer" />
          </button>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden hover:opacity-80 transition-opacity"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <div className="flex flex-col space-y-1">
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  mobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center">
          <a
            href="/"
            className="text-2xl sm:text-3xl lg:text-5xl text-white font-serif tracking-[0.2em] sm:tracking-[0.4em] font-light"
          >
            VISTA
          </a>
        </div>

        {/* Right: EN / User / Reserve */}
        <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 z-10">
          {/* Language Dropdown - Hidden on mobile */}
          <div className="relative group hidden sm:block">
            <div className="flex items-center space-x-1 cursor-pointer py-2">
              <span className="text-sm lg:text-base text-white font-serif">
                EN
              </span>
              <i className="fa-solid fa-chevron-down text-white text-xs transition-transform duration-300 group-hover:rotate-180"></i>
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-2 w-40 bg-black/50 backdrop-blur-md rounded-md shadow-lg ring-1 ring-white/10 py-1 z-50 opacity-0 invisible scale-95 transform transition-all duration-300 ease-out group-hover:opacity-100 group-hover:visible group-hover:scale-100">
              <Link
                to="/auth/login"
                className="block px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
              >
                English (EN)
              </Link>

              <Link
                to="/auth/login?lang=vi"
                className="block px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
              >
                Vietnamese (VI)
              </Link>
            </div>
          </div>

          {/* Notification Bell */}
          <NotificationBell variant="light" />

          {/* User Dropdown */}
          <div className="relative group">
            <button className="flex items-center text-white hover:opacity-80 transition cursor-pointer p-2">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-sm lg:text-base text-white"
                />
              )}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-black/50 backdrop-blur-md rounded-md shadow-lg ring-1 ring-white/10 py-1 z-50 opacity-0 invisible scale-95 transform transition-all duration-300 ease-out group-hover:opacity-100 group-hover:visible group-hover:scale-100">
              {user ? (
                // Logged in user menu
                <>
                  <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-white/20 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-serif truncate">
                        {getLastTwoWords(user.fullName || user.userName)}
                      </p>
                      {getPrimaryRole() && (
                        <p className="text-xs text-gray-400 font-serif">
                          {getPrimaryRole()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dynamic menu items based on user role */}
                  {getUserMenuItems().map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
                      >
                        <FontAwesomeIcon
                          icon={item.icon}
                          className="mr-2 w-4"
                        />
                        {item.label}
                      </Link>
                    ))}

                  <button
                    onClick={() => handleLogoutClick()}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition cursor-pointer"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-2 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                // Not logged in menu
                <>
                  <Link
                    to="/auth/login"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
                  >
                    Login
                  </Link>

                  <Link
                    to="/auth/register"
                    className="block px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Reserve Button */}
          <Link
            to="/customer/cart"
            className="bg-white text-black px-3 py-1.5 sm:px-4 sm:py-2 lg:px-6 lg:py-2 rounded font-serif border border-transparent hover:bg-black/40 hover:text-white transition-all duration-300 ease-in-out text-xs sm:text-sm lg:text-base"
          >
            <span className="hidden sm:inline">Reserve</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </div>
      </div>

      {/* Desktop Navigation Menu */}
      <nav className="hidden lg:flex justify-center space-x-8 xl:space-x-12 px-4 sm:px-6 lg:px-8">
        {navItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="group relative text-white py-3 lg:py-4 px-3 lg:px-6 font-serif text-sm lg:text-base xl:text-lg hover:text-white/80 transition-colors"
          >
            {item.label}
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-white transform origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
          </Link>
        ))}
      </nav>

      {/* Backdrop Overlay */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-500 ${
          mobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>

      {/* Mobile Navigation Menu - Slide from Left */}
      <div
        className={`lg:hidden fixed top-0 left-0 w-64 h-full border-r border-white/20 shadow-2xl z-50 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-hidden`}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-white/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>

        <nav className="relative px-4 py-3 h-full flex flex-col">
          {/* Header Section with Close Button */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h2 className="text-lg font-serif text-white/90 tracking-wider mb-1">
                VISTA
              </h2>
              <div className="w-8 h-0.5 bg-gradient-to-r from-white/50 to-transparent"></div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
            >
              <svg
                className="w-3.5 h-3.5 text-white/80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Main Navigation - Compact */}
          <div className="flex-1 space-y-0 mb-3">
            {navItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="group flex items-center text-white py-2 px-3 font-serif text-xs rounded-md hover:bg-white/10 transition-all duration-200"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="w-1 h-1 rounded-full bg-white/40 group-hover:bg-white/80 mr-2.5 transition-all duration-200"></div>
                <span className="group-hover:text-white/95 transition-colors flex-1 truncate">
                  {item.label}
                </span>
                <svg
                  className="w-3 h-3 text-white/30 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>

          {/* Language Selection - Inline Style */}
          <div className="border-t border-white/10 pt-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white/60 font-serif">Language:</span>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 px-2 py-1 bg-white text-black rounded-md font-serif text-xs transition-all duration-200 hover:bg-white/90">
                  <span>🇺🇸</span>
                  <span>EN</span>
                </button>
                <span className="text-white/40">|</span>
                <button className="flex items-center space-x-1 px-2 py-1 text-white/70 hover:text-white hover:bg-white/10 rounded-md font-serif text-xs transition-all duration-200">
                  <span>🇻🇳</span>
                  <span>VI</span>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout from your account?"
        type="warning"
        confirmText="Logout"
        cancelText="Cancel"
      />
    </header>
  );
};

export default HeaderHome;
