import React from 'react';
import { Outlet } from 'react-router-dom';
import bgImage from '../assets/images/resort-bg.png';

const AuthLayout: React.FC = () => {
    return (
        <div
            className="fixed inset-0 bg-cover bg-center bg-no-repeat flex items-center justify-center"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"></div>

            <div className="relative z-10 w-full max-w-[560px] max-h-[90vh] bg-gray-600/45 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden m-4">
                <div className="h-full max-h-[90vh] overflow-y-auto scrollbar-thin px-10 py-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
