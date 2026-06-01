/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaCalendarAlt, FaUsers, FaChartLine,
  FaExclamationTriangle, FaHeadset, FaUserShield
} from "react-icons/fa";
import { FaCalendarCheck } from "react-icons/fa6";
import { MdMeetingRoom, MdRateReview, MdRoomService, MdDiscount } from "react-icons/md";
import { RiInfoCardFill, RiDiscountPercentFill } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { LuMapPinCheckInside } from "react-icons/lu";
import { BiSolidCategory, BiSolidDiscount, BiSolidDollarCircle } from "react-icons/bi";
import { HiChevronDoubleLeft, HiChevronDoubleRight } from "react-icons/hi2";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

export const SIDEBAR_COLLAPSED_W = 64;
export const SIDEBAR_EXPANDED_W  = 220;

interface SidebarProps {
  className?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

interface User {
  userRole?: string;
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ className, isExpanded, onToggle }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos]     = useState({ top: 0, left: 0 });
  const [user, setUser]                 = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const s = localStorage.getItem("user");
    if (s) setUser(JSON.parse(s));
  }, []);

  useEffect(() => { if (isExpanded) setHoveredIndex(null); }, [isExpanded]);

  const adminMenuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/admin" },
    { icon: <MdMeetingRoom />, label: "Rooms", path: "/admin/room-management" },
    { icon: <BiSolidCategory />, label: "Room Types", path: "/admin/room-type-management" },
    { icon: <BiSolidDollarCircle />, label: "Pricing", path: "/admin/pricing" },
    { icon: <RiInfoCardFill />, label: "Information", path: "/admin/info" },
    { icon: <LuMapPinCheckInside />, label: "Check-in", path: "/admin/checkin" },
    { icon: <IoBagCheckOutline />, label: "Check-out", path: "/admin/checkout" },
    { icon: <FaUsers />, label: "Employees", path: "/admin/employees" },
    { icon: <FaUserShield />, label: "Permissions", path: "/admin/permissions" },
    { icon: <FaCalendarCheck />, label: "Reservations", path: "/admin/reservations" },
    { icon: <FaCalendarAlt />, label: "Daily Work", path: "/admin/daily" },
    { icon: <FaUsers />, label: "Customers", path: "/admin/customers" },
    { icon: <MdRoomService />, label: "Services", path: "/admin/services" },
    { icon: <MdRateReview />, label: "Reviews", path: "/admin/reviews" },
    { icon: <RiDiscountPercentFill />, label: "Promotions", path: "/admin/promotion-management" },
    { icon: <MdDiscount />, label: "Promotion Types", path: "/admin/promotion-type-management" },
    { icon: <BiSolidDiscount />, label: "Vouchers", path: "/admin/voucher-management" },
    { icon: <FaChartLine />, label: "Reports", path: "/admin/reports" },
    { icon: <FaHeadset />, label: "Support", path: "/admin/support" },
  ];

  const employeeMenuItems = [
    { icon: <MdMeetingRoom />, label: "Rooms", path: "/employee/room-management" },
    { icon: <BiSolidCategory />, label: "Room Types", path: "/employee/room-type-management" },
    { icon: <MdRoomService />, label: "Services", path: "/employee/services" },
    { icon: <RiInfoCardFill />, label: "Information", path: "/employee/info" },
    { icon: <FaCalendarCheck />, label: "Reservations", path: "/employee/reservations" },
    { icon: <LuMapPinCheckInside />, label: "Check-in", path: "/employee/checkin" },
    { icon: <IoBagCheckOutline />, label: "Check-out", path: "/employee/checkout" },
    { icon: <FaUsers />, label: "Customers", path: "/employee/customers" },
    { icon: <FaExclamationTriangle />, label: "Incidents", path: "/employee/incidents" },
    { icon: <FaCalendarAlt />, label: "Daily Work", path: "/employee/daily" },
    { icon: <MdRateReview />, label: "Reviews", path: "/employee/reviews" },
    { icon: <FaHeadset />, label: "Support", path: "/employee/support" },
  ];

  const primaryRole = (user?.userRole || user?.roles?.[0] || "").toUpperCase().replace(/^ROLE_/, "");
  const menuItems = primaryRole === "EMPLOYEE" ? employeeMenuItems : adminMenuItems;

  const getIconScale = (index: number) => {
    if (isExpanded || hoveredIndex === null) return 1;
    const d = Math.abs(index - hoveredIndex);
    if (d === 0) return 1.3;
    if (d === 1) return 1.15;
    if (d === 2) return 1.05;
    return 1;
  };

  const handleMouseEnter = (index: number, e: React.MouseEvent) => {
    if (isExpanded) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 12 });
    setHoveredIndex(index);
  };

  return (
    <>
      <motion.aside
        animate={{ width: isExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W }}
        transition={{ type: "spring", stiffness: 340, damping: 30 }}
        className={cn(
          "h-screen bg-gradient-to-br from-[#F8EBD6] via-[#F0E0C0] to-white",
          "flex flex-col fixed z-30 shadow-lg overflow-hidden",
          "border-r border-[#D9C9A8]/30",
          className,
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 shrink-0 border-b border-[#D9C9A8]/20 gap-3">
          <div className="w-8 h-8 shrink-0 rounded-full bg-[#6B4B28]/10 flex items-center justify-center">
            <img className="w-8 h-8" src="../../src/assets/images/logo.png" alt="Logo" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-[#6B4B28] text-lg whitespace-nowrap overflow-hidden"
              >
                Vista Hotel
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-grow overflow-y-auto no-scrollbar py-3 px-2">
          <ul className="space-y-0.5">
            {menuItems.map((item, index) => {
              const isActive =
                location.pathname === item.path ||
                (item.path !== "/admin" && location.pathname.startsWith(item.path + "/"));
              const scale = getIconScale(index);

              return (
                <motion.li
                  key={index}
                  animate={{
                    scale: isExpanded ? 1 : scale,
                    y: !isExpanded && hoveredIndex === index ? -4 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                  onMouseEnter={(e) => handleMouseEnter(index, e)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="relative"
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center rounded-xl transition-colors duration-150 relative",
                      isExpanded ? "gap-3 px-3 py-2.5" : "justify-center w-10 h-10 mx-auto",
                      isActive ? "bg-white shadow-md" : "hover:bg-white/60 bg-white/20",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBar"
                        className="absolute -left-2 w-0.5 h-5 bg-[#6B4B28] rounded-r-full"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={cn(
                      "text-base shrink-0",
                      isActive ? "text-[#6B4B28]" : "text-[#6B4B28]/65",
                    )}>
                      {item.icon}
                    </span>
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          className={cn(
                            "text-[13px] font-medium whitespace-nowrap",
                            isActive ? "text-[#6B4B28]" : "text-[#6B4B28]/70",
                          )}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Link>

                  {isActive && !isExpanded && (
                    <motion.div
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#6B4B28] rounded-full"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                </motion.li>
              );
            })}
          </ul>
        </nav>

        {/* Toggle button — bottom, aligned right when expanded */}
        <div className={cn(
          "shrink-0 border-t border-[#D9C9A8]/20 px-3 py-3 flex",
          isExpanded ? "justify-end" : "justify-center",
        )}>
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-xl bg-[#6B4B28]/10 hover:bg-[#6B4B28]/20 flex items-center justify-center transition-colors cursor-pointer"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded
              ? <HiChevronDoubleLeft className="text-[#6B4B28] text-sm" />
              : <HiChevronDoubleRight className="text-[#6B4B28] text-sm" />
            }
          </motion.button>
        </div>
      </motion.aside>

      {/* Tooltip portal — only in collapsed mode */}
      {!isExpanded && createPortal(
        <AnimatePresence mode="wait">
          {hoveredIndex !== null && (
            <motion.div
              key="tip"
              initial={{ opacity: 0, x: -8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="fixed pointer-events-none"
              style={{ top: tooltipPos.top, left: tooltipPos.left, transform: "translateY(-50%)", zIndex: 9999 }}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-[#F8EBD6]/95 backdrop-blur-xl rounded-xl shadow-xl border border-[#D9C9A8]/50" />
                <div className="relative px-4 py-2.5 rounded-xl">
                  <span className="text-sm font-semibold text-[#6B4B28] tracking-wide whitespace-nowrap">
                    {menuItems[hoveredIndex]?.label}
                  </span>
                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#6B4B28]/30 to-transparent rounded-full"
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  />
                </div>
                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-white/95 border-l border-b border-[#D9C9A8]/50 rotate-45" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

export default Sidebar;