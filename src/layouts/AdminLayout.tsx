import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderAdmin from "../components/HeaderAdmin";
import Sidebar from "../components/Sidebar";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleSidebarNavigate = () => {
    setIsSidebarExpanded(false);

    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarWidth = isSidebarExpanded ? 240 : 64;

  return (
    <div className="flex h-screen bg-light">
      <Sidebar
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        onNavigate={handleSidebarNavigate}
        className={
          isMobile
            ? `z-30 transform transition-transform duration-300 ease-out ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`
            : ""
        }
      />

      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleSidebar}
        />
      )}

      <div
        className="flex flex-col flex-grow transition-[margin-left] duration-300 ease-out"
        style={{
          marginLeft: isMobile ? 0 : sidebarWidth,
        }}
      >
        <HeaderAdmin
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />

        <main className="flex-grow overflow-auto bg-light mt-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;