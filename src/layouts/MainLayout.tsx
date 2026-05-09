import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import AIChatWidget from "../components/aichat/AIChatWidget";

const MainLayout: React.FC = () => {
  return (
    <div>
      <div>
        <Outlet />
      </div>
      <div className="relative z-50">
        <Footer />
      </div>
      <AIChatWidget />
    </div>
  );
};

export default MainLayout;
