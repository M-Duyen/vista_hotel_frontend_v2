import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderAdmin from '../components/HeaderAdmin';
import Sidebar, { SIDEBAR_COLLAPSED_W, SIDEBAR_EXPANDED_W } from '../components/Sidebar';

const EmployeeLayout: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    return localStorage.getItem("sidebarExpanded") === "true";
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const toggleExpanded = () => {
    const next = !isSidebarExpanded;
    setIsSidebarExpanded(next);
    localStorage.setItem("sidebarExpanded", String(next));
  };

  const toggleMobileSidebar = () => setIsMobileSidebarOpen(p => !p);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMobileSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sidebarW = isSidebarExpanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W;

  return (
    <div className="flex h-screen bg-light">
      <Sidebar
        isExpanded={isMobile ? false : isSidebarExpanded}
        onToggle={isMobile ? toggleMobileSidebar : toggleExpanded}
        className={
          isMobile
            ? `z-30 transform transition-transform duration-300 ${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : ''
        }
      />

      {/* Mobile overlay */}
      {isMobileSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Main content — shifts right based on sidebar width */}
      <div
        className="flex flex-col flex-grow transition-all duration-300 ease-in-out min-w-0"
        style={{ marginLeft: isMobile ? 0 : sidebarW }}
      >
        <HeaderAdmin
          toggleSidebar={isMobile ? toggleMobileSidebar : toggleExpanded}
          isSidebarOpen={isMobile ? isMobileSidebarOpen : isSidebarExpanded}
        />
        <main className="flex-grow p-5 overflow-auto bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;