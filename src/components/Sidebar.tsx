/* eslint-disable*/
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaHeadset,
  FaUserCircle,
  FaClipboardList,
} from "react-icons/fa";
import { MdMeetingRoom, MdRateReview } from "react-icons/md";
import { RiInfoCardFill, RiDiscountPercentFill } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { LuMapPinCheckInside } from "react-icons/lu";
import { cn } from "../utils/cn";
import { MdRoomService, MdDiscount } from "react-icons/md";
import {
  BiSolidCategory,
  BiSolidDiscount,
  BiSolidDollarCircle,
} from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface SidebarProps {
  className?: string;
}

interface User {
  userRole?: string;
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const adminMenuItems = [
    {
      icon: <FaTachometerAlt />,
      label: "Dashboard",
      path: "/admin",
    },
    {
      icon: <MdMeetingRoom />,
      label: "Rooms",
      path: "/admin/room-management",
    },
    {
      icon: <BiSolidCategory />,
      label: "Room Types",
      path: "/admin/room-type-management",
    },
    {
      icon: <BiSolidDollarCircle />,
      label: "Pricing",
      path: "/admin/pricing",
    },
    {
      icon: <RiInfoCardFill />,
      label: "Information",
      path: "/admin/info",
    },
    {
      icon: <LuMapPinCheckInside />,
      label: "Check-in",
      path: "/admin/checkin",
    },
    {
      icon: <IoBagCheckOutline />,
      label: "Check-out",
      path: "/admin/checkout",
    },
    {
      icon: <FaUsers />,
      label: "Employees",
      path: "/admin/employees",
    },
    {
      icon: <FaCalendarAlt />,
      label: "Reservations",
      path: "/admin/reservations",
    },
    {
      icon: <FaCalendarAlt />,
      label: "Daily Work",
      path: "/admin/daily",
    },
    {
      icon: <FaUsers />,
      label: "Customers",
      path: "/admin/customers",
    },
    {
      icon: <MdRoomService />,
      label: "Services",
      path: "/admin/services",
    },
    {
      icon: <MdRateReview />,
      label: "Reviews",
      path: "/admin/reviews",
    },
    {
      icon: <FaExclamationTriangle />,
      label: "Incidents",
      path: "/admin/incidents",
    },
    {
      icon: <RiDiscountPercentFill />,
      label: "Promotions",
      path: "/admin/promotion-management",
    },
    {
      icon: <MdDiscount />,
      label: "Promotion Types",
      path: "/admin/promotion-type-management",
    },
    {
      icon: <BiSolidDiscount />,
      label: "Vouchers",
      path: "/admin/voucher-management",
    },
    {
      icon: <FaChartLine />,
      label: "Reports",
      path: "/admin/reports",
    },
    {
      icon: <FaHeadset />,
      label: "Support",
      path: "/admin/support",
    },
  ];

  const employeeMenuItems = [
    {
      icon: <MdMeetingRoom />,
      label: "Rooms",
      path: "/employee/room-management",
    },
    {
      icon: <BiSolidCategory />,
      label: "Room Types",
      path: "/employee/room-type-management",
    },
    { icon: <MdRoomService />, label: "Services", path: "/employee/services" },
    {
      icon: <RiInfoCardFill />,
      label: "Information",
      path: "/employee/info",
    },
    {
      icon: <FaCalendarAlt />,
      label: "Reservations",
      path: "/employee/reservations",
    },
    {
      icon: <LuMapPinCheckInside />,
      label: "Check-in",
      path: "/employee/checkin",
    },
    {
      icon: <IoBagCheckOutline />,
      label: "Check-out",
      path: "/employee/checkout",
    },
    {
      icon: <FaUsers />,
      label: "Customers",
      path: "/employee/customers",
    },
    {
      icon: <FaExclamationTriangle />,
      label: "Incidents",
      path: "/employee/incidents",
    },
    {
      icon: <FaCalendarAlt />,
      label: "Daily Work",
      path: "/employee/daily",
    },
    {
      icon: <MdRateReview />,
      label: "Reviews",
      path: "/employee/reviews",
    },
    {
      icon: <FaHeadset />,
      label: "Support",
      path: "/employee/support",
    },
  ];

  const primaryRole = (user?.userRole || user?.roles?.[0] || "")
    .toUpperCase()
    .replace(/^ROLE_/, "");
  const menuItems = primaryRole === "EMPLOYEE" ? employeeMenuItems : adminMenuItems;

  const getIconScale = (index: number) => {
    if (hoveredIndex === null) return 1;

    const distance = Math.abs(index - hoveredIndex);

    if (distance === 0) return 1.3;
    if (distance === 1) return 1.15;
    if (distance === 2) return 1.05;
    return 1;
  };

  const handleHoverStart = (index: number, event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });
    setHoveredIndex(index);
  };

  return (
    <>
      <motion.aside
        className={cn(
          "h-screen w-16 bg-gradient-to-br from-[#F8EBD6] via-[#F0E0C0] to-white flex flex-col fixed z-30 shadow-lg pt-4",
          "border-r border-[#D9C9A8]/30",
          className
        )}
      >
        {/* Logo */}
        <div className="px-3 pb-4 flex items-center justify-center mb-1">
          <div className="w-8 h-8 rounded-full bg-[#6B4B28]/10 flex items-center justify-center">
            <img
              className="w-5 h-5"
              src="../../src/assets/images/logo.png"
              alt="Logo"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-2 py-1 overflow-y-auto no-scrollbar">
          <ul className="space-y-1.5 flex flex-col items-center">
            {menuItems.map((item, index) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" &&
                  location.pathname.startsWith(`${item.path}/`));
              const scale = getIconScale(index);

              return (
                <motion.li
                  key={index}
                  animate={{
                    scale: scale,
                    y: hoveredIndex === index ? -5 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 450,
                    damping: 28,
                  }}
                  onMouseEnter={(e) => handleHoverStart(index, e)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 relative",
                      isActive
                        ? "bg-white shadow-md"
                        : "hover:bg-white/60 bg-white/30"
                    )}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -left-4 w-0.5 h-6 bg-[#6B4B28] rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Icon */}
                    <motion.div
                      className={cn(
                        "flex items-center justify-center text-base",
                        isActive ? "text-[#6B4B28]" : "text-[#6B4B28]/70"
                      )}
                    >
                      {item.icon}
                    </motion.div>
                  </Link>

                  {/* Bounce effect on active */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#6B4B28] rounded-full"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-2 text-center mb-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 mx-auto rounded-full bg-[#6B4B28]/10 flex items-center justify-center cursor-pointer"
          >
            <span className="text-[10px] text-[#6B4B28]/70 font-bold">©</span>
          </motion.div>
        </div>
      </motion.aside>

      {/* Tooltip Portal - Elegant Design */}
      {createPortal(
        <AnimatePresence mode="wait">
          {hoveredIndex !== null && (
            <motion.div
              key="tooltip"
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
              className="fixed pointer-events-none"
              style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                transform: "translateY(-50%)",
                zIndex: 9999,
              }}
            >
              {/* Glass Background */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-[#F8EBD6]/95 backdrop-blur-xl rounded-xl shadow-xl border border-[#D9C9A8]/50"></div>

                {/* Content */}
                <div className="relative px-4 py-2.5 rounded-xl">
                  <span className="text-sm font-semibold text-[#6B4B28] tracking-wide whitespace-nowrap">
                    {menuItems[hoveredIndex].label}
                  </span>

                  {/* Decorative line */}
                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#6B4B28]/30 to-transparent rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  />
                </div>

                {/* Arrow */}
                <div className="absolute -left-1.5 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 bg-gradient-to-br from-white/95 to-[#F8EBD6]/95 border-l border-b border-[#D9C9A8]/50 rotate-45"></div>
                </div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-[#6B4B28]/5 blur-xl rounded-xl -z-10"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default Sidebar;
