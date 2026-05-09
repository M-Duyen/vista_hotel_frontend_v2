import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import HeaderAdmin from '../components/HeaderAdmin';
import Sidebar from '../components/Sidebar';
const EmployeeLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return (
        <div className="flex h-screen bg-light">
            <Sidebar
                userRole="employee"
                className={
                    isMobile
                        ? `z-30 transform ${
                              isSidebarOpen
                                  ? 'translate-x-0'
                                  : '-translate-x-full'
                          }`
                        : ''
                }
            />

            {isSidebarOpen && isMobile && (
                <div
                    className="fixed inset-0 bg-black/50 z-20"
                    onClick={toggleSidebar}
                    style={{ pointerEvents: 'auto' }}
                ></div>
            )}

            <div className="flex flex-col flex-grow ml-13 transition-all duration-300 ease-in-out">
                <HeaderAdmin
                    toggleSidebar={toggleSidebar}
                    isSidebarOpen={isSidebarOpen}
                />

                <main className="flex-grow p-5 overflow-auto bg-light">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default EmployeeLayout;
