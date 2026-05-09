import React from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import AIChatWidget from "../components/aichat/AIChatWidget";

const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <AIChatWidget />
    </div>
  );
};

export default CustomerLayout;
