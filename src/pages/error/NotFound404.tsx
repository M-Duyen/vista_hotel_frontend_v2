import { Link } from "react-router-dom";
import { FaHome, FaSearch, FaExclamationTriangle } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";

const NotFound404 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#c9b8a8] opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <FaExclamationTriangle className="text-[#c9b8a8] text-8xl relative z-10 animate-bounce" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-bold text-[#c9b8a8] mb-4 tracking-tight">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Oops! Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-gray-300"></div>
          <FaSearch className="text-gray-400 text-xl" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-gray-300"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#c9b8a8] text-[#c9b8a8] rounded-lg hover:bg-[#c9b8a8] hover:text-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link
            to="/"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#c9b8a8] to-[#b8a896] text-white rounded-lg hover:from-[#b8a896] hover:to-[#a89785] transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Need Help?
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            If you believe this is an error, please contact our support team.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link
              to="/contact"
              className="text-[#c9b8a8] hover:text-[#b8a896] font-medium transition-colors cursor-pointer"
            >
              Contact Support
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/faq"
              className="text-[#c9b8a8] hover:text-[#b8a896] font-medium transition-colors cursor-pointer"
            >
              FAQ
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              to="/help"
              className="text-[#c9b8a8] hover:text-[#b8a896] font-medium transition-colors cursor-pointer"
            >
              Help Center
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-[#c9b8a8] rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-[#c9b8a8] rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-[#c9b8a8] rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default NotFound404;
