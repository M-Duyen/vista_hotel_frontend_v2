import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MenuSidebar from "./MenuSidebar";
import SearchSidebar from "./SearchSidebar";
import { Link, useNavigate } from "react-router-dom";
import {
  faUser,
  faUserCircle,
  faBookmark,
  faSignOutAlt,
  faChartLine,
  faTasks,
  faTicketAlt,
} from "@fortawesome/free-solid-svg-icons";
import { CiShoppingCart, CiSearch, CiMenuBurger } from "react-icons/ci";

import type { NavItem } from "../types/Header";
import NotificationBell from "./common/NotificationBell";
import { handleLogout as logout } from "../services/authService";
interface User {
  id: string;
  userName: string;
  fullName?: string;
  email: string;
  userRole?: string;
  roles?: string[];
}

const navItems: NavItem[] = [
  { label: "Overview", path: "/home" },
  { label: "About Us", path: "/contact" },
  { label: "Accommodation", path: "/customer/room" },
  { label: "Services", path: "/services" },
  { label: "Events", path: "/newsPage" },
  { label: "Exclusive Offers", path: "/promotion-and-voucher" },
  { label: "My bookings", path: "/customer/mybooking" },
];

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
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

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate("/auth/login", { replace: true });
  };
  const getLastTwoWords = (name: string): string => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    if (parts.length <= 2) return name; // Nếu tên chỉ có 1–2 từ thì giữ nguyên
    return parts.slice(-2).join(" "); // Lấy 2 từ cuối
  };

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
      { label: "My Profile", path: getProfilePath(), icon: faUserCircle },
      { label: "My Booking", path: "/customer/mybooking", icon: faBookmark },
      { label: "My Vouchers", path: `${getProfilePath()}?tab=vouchers`, icon: faTicketAlt },
    ];
  };

  return (
    <div className="relative flex items-center px-6 py-4 bg-[#F5F0EB] shadow">
      <button
        onClick={() => setMenuOpen(true)}
        className="text-2xl text-black hover:text-amber-400 transition"
      >
        <CiMenuBurger className="cursor-pointer text-black text-2xl hover:opacity-80 transition" />
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className="ml-3 text-xl text-black hover:text-amber-400 transition"
      >
        <CiSearch className="cursor-pointer ml-1 text-black text-2xl hover:opacity-80 transition" />
      </button>

      <Link to="/home" className="absolute left-1/2 -translate-x-1/2">
        <img
          src="/src/assets/images/logo.png"
          className="w-13 cursor-pointer"
          alt="logo"
        />
      </Link>

      <div className="ml-auto flex items-center gap-4">
        {/* Notification Bell */}
        <NotificationBell variant="dark" />

        {/* User Menu */}
        <div className="relative group">
          <button className="flex items-center text-black hover:opacity-80 transition">
            <FontAwesomeIcon
              icon={faUser}
              className="cursor-pointer text-black text-xl"
            />
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-black/50 backdrop-blur-md rounded-md shadow-lg ring-1 ring-white/10 py-1 z-50 opacity-0 invisible scale-95 transform transition-all duration-300 ease-out group-hover:opacity-100 group-hover:visible group-hover:scale-100">
            {user ? (
              // Logged in user menu
              <>
                <div className="px-4 py-2 border-b border-white/10">
                  <p className="text-sm text-white font-serif">
                    Hello, {getLastTwoWords(user.fullName || user.userName)}
                  </p>
                </div>

                {getUserMenuItems().map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
                  >
                    <FontAwesomeIcon icon={item.icon} className="mr-2 w-4" />
                    {item.label}
                  </Link>
                ))}

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 font-serif transition"
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

        {/* Cart */}
        <Link to="/customer/cart">
          <CiShoppingCart className="text-black text-2xl hover:opacity-80 transition" />
        </Link>
      </div>

      <MenuSidebar
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        navItems={navItems}
      />

      <SearchSidebar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default Header;
