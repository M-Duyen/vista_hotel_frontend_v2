/* eslint-disable */
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaUsers,
  FaChartLine,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdMeetingRoom, MdRateReview, MdRoomService, MdDiscount } from "react-icons/md";
import { RiInfoCardFill, RiDiscountPercentFill } from "react-icons/ri";
import { IoBagCheckOutline } from "react-icons/io5";
import { LuMapPinCheckInside } from "react-icons/lu";
import {
  BiSolidCategory,
  BiSolidDiscount,
  BiSolidDollarCircle,
} from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { cn } from "../utils/cn";

interface SidebarProps {
  className?: string;
  isExpanded: boolean;
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  onNavigate?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
}

interface User {
  userRole?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  isExpanded,
  setIsExpanded,
  onNavigate,
  isMobile = false,
  isOpen = true,
}) => {
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
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/admin" },
    { icon: <MdMeetingRoom />, label: "Rooms", path: "/admin/room-management" },
    { icon: <BiSolidCategory />, label: "Room Types", path: "/admin/room-type-management" },
    { icon: <BiSolidDollarCircle />, label: "Pricing", path: "/admin/pricing" },
    { icon: <RiInfoCardFill />, label: "Information", path: "/admin/info" },
    { icon: <LuMapPinCheckInside />, label: "Check-in", path: "/admin/checkin" },
    { icon: <IoBagCheckOutline />, label: "Check-out", path: "/admin/checkout" },
    { icon: <FaUsers />, label: "Employees", path: "/admin/employees" },
    { icon: <FaCalendarAlt />, label: "Reservations", path: "/admin/reservations" },
    { icon: <FaUsers />, label: "Customers", path: "/admin/customers" },
    { icon: <MdRoomService />, label: "Services", path: "/admin/services" },
    { icon: <MdRateReview />, label: "Reviews", path: "/admin/reviews" },
    { icon: <FaExclamationTriangle />, label: "Incidents", path: "/admin/incidents" },
    { icon: <RiDiscountPercentFill />, label: "Promotions", path: "/admin/promotion-management" },
    { icon: <MdDiscount />, label: "Promotion Types", path: "/admin/promotion-type-management" },
    { icon: <BiSolidDiscount />, label: "Vouchers", path: "/admin/voucher-management" },
    { icon: <FaChartLine />, label: "Reports", path: "/admin/reports" },
  ];

  const employeeMenuItems = [
    { icon: <MdMeetingRoom />, label: "Rooms", path: "/employee/room-management" },
    { icon: <BiSolidCategory />, label: "Room Types", path: "/employee/room-type-management" },
    { icon: <MdRoomService />, label: "Services", path: "/employee/services" },
    { icon: <RiInfoCardFill />, label: "Information", path: "/employee/info" },
    { icon: <LuMapPinCheckInside />, label: "Check-in", path: "/employee/checkin" },
    { icon: <IoBagCheckOutline />, label: "Check-out", path: "/employee/checkout" },
    { icon: <FaUsers />, label: "Customers", path: "/employee/customers" },
    { icon: <FaCalendarAlt />, label: "Daily Work", path: "/employee/daily" },
    { icon: <MdRateReview />, label: "Reviews", path: "/employee/reviews" },
  ];

  const menuItems =
    user?.userRole === "EMPLOYEE" ? employeeMenuItems : adminMenuItems;

  const getIconScale = (index: number) => {
    if (hoveredIndex === null || isExpanded) return 1;

    const distance = Math.abs(index - hoveredIndex);

    if (distance === 0) return 1.3;
    if (distance === 1) return 1.15;
    if (distance === 2) return 1.05;
    return 1;
  };

  const handleHoverStart = (index: number, event: React.MouseEvent) => {
    if (isExpanded) return;

    const rect = event.currentTarget.getBoundingClientRect();

    setTooltipPosition({
      top: rect.top + rect.height / 2,
      left: rect.right + 12,
    });

    setHoveredIndex(index);
  };

  const toggleSidebar = () => {
    setHoveredIndex(null);
    setIsExpanded((prev) => !prev);
  };

  const handleMenuClick = () => {
    setHoveredIndex(null);
    onNavigate?.();
  };

  const sidebarWidth = isExpanded ? 240 : 64;
  const sidebarX = isMobile ? (isOpen ? 0 : -sidebarWidth) : 0;

  const labelAnimation = {
    opacity: isExpanded ? 1 : 0,
    x: isExpanded ? 0 : -8,
    width: isExpanded ? "auto" : 0,
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{
          width: sidebarWidth,
          x: sidebarX,
        }}
        transition={{
          width: {
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          },
          x: {
            duration: 0.25,
            ease: "easeOut",
          },
        }}
        className={cn(
          "h-screen bg-gradient-to-br from-[#F8EBD6] via-[#F0E0C0] to-white flex flex-col fixed z-30 shadow-lg pt-4 overflow-visible",
          "border-r border-[#D9C9A8]/30",
          className
        )}
        style={{
          willChange: "transform, width",
        }}
      >
        <button
          type="button"
          onClick={toggleSidebar}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white shadow-md border border-[#D9C9A8]/50 flex items-center justify-center text-[#6B4B28] hover:bg-[#F8EBD6] transition-colors z-40"
          title={isExpanded ? "Thu gọn sidebar" : "Mở rộng sidebar"}
        >
          {isExpanded ? <FaChevronLeft size={12} /> : <FaChevronRight size={12} />}
        </button>

        <div
          className={cn(
            "px-3 pb-4 flex items-center mb-1 overflow-hidden",
            isExpanded ? "justify-start gap-3" : "justify-center gap-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-[#6B4B28]/10 flex items-center justify-center shrink-0">
            <img
              className="w-5 h-5"
              src="../../src/assets/images/logo.png"
              alt="Logo"
            />
          </div>

          <motion.span
            initial={false}
            animate={labelAnimation}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="text-sm font-bold text-[#6B4B28] whitespace-nowrap overflow-hidden"
          >
            Hotel Admin
          </motion.span>
        </div>

        <nav className="flex-grow px-2 py-1 overflow-y-auto no-scrollbar">
          <ul
            className={cn(
              "space-y-1.5 flex flex-col",
              isExpanded ? "items-stretch" : "items-center"
            )}
          >
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const scale = getIconScale(index);

              return (
                <motion.li
                  key={item.path}
                  animate={{
                    scale,
                    y: hoveredIndex === index && !isExpanded ? -5 : 0,
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
                    onClick={handleMenuClick}
                    className={cn(
                      "flex items-center rounded-xl relative overflow-hidden",
                      "transition-colors duration-200 ease-out",
                      isExpanded
                        ? "w-full h-10 justify-start px-3 gap-3"
                        : "w-10 h-10 justify-center gap-0",
                      isActive
                        ? "bg-white shadow-md"
                        : "hover:bg-white/60 bg-white/30"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute -left-2 w-0.5 h-6 bg-[#6B4B28] rounded-r-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    <motion.div
                      className={cn(
                        "flex items-center justify-center text-base shrink-0",
                        isActive ? "text-[#6B4B28]" : "text-[#6B4B28]/70"
                      )}
                    >
                      {item.icon}
                    </motion.div>

                    <motion.span
                      initial={false}
                      animate={labelAnimation}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                      className={cn(
                        "text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis",
                        isActive ? "text-[#6B4B28]" : "text-[#6B4B28]/70"
                      )}
                    >
                      {item.label}
                    </motion.span>
                  </Link>

                  {isActive && !isExpanded && (
                    <motion.div
                      className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#6B4B28] rounded-full"
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

        <div className="p-2 text-center mb-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className={cn(
              "h-8 mx-auto rounded-full bg-[#6B4B28]/10 flex items-center justify-center cursor-pointer overflow-hidden",
              isExpanded ? "w-full gap-2 px-3" : "w-8 gap-0 px-0"
            )}
          >
            <span className="text-[10px] text-[#6B4B28]/70 font-bold shrink-0">
              ©
            </span>

            <motion.span
              initial={false}
              animate={{
                opacity: isExpanded ? 1 : 0,
                width: isExpanded ? "auto" : 0,
              }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="text-xs text-[#6B4B28]/70 font-semibold whitespace-nowrap overflow-hidden"
            >
              Vistal Hotel
            </motion.span>
          </motion.div>
        </div>
      </motion.aside>

      {createPortal(
        <AnimatePresence mode="wait">
          {hoveredIndex !== null && !isExpanded && (
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
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white/95 to-[#F8EBD6]/95 backdrop-blur-xl rounded-xl shadow-xl border border-[#D9C9A8]/50" />

                <div className="relative px-4 py-2.5 rounded-xl">
                  <span className="text-sm font-semibold text-[#6B4B28] tracking-wide whitespace-nowrap">
                    {menuItems[hoveredIndex].label}
                  </span>

                  <motion.div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-[#6B4B28]/30 to-transparent rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                  />
                </div>

                <div className="absolute -left-1.5 top-1/2 -translate-y-1/2">
                  <div className="w-3 h-3 bg-gradient-to-br from-white/95 to-[#F8EBD6]/95 border-l border-b border-[#D9C9A8]/50 rotate-45" />
                </div>

                <div className="absolute inset-0 bg-[#6B4B28]/5 blur-xl rounded-xl -z-10" />
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