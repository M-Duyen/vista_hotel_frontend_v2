import { Link } from "react-router-dom";
import { FaHome, FaLock, FaShieldAlt } from "react-icons/fa";
import { MdArrowBack, MdSecurity } from "react-icons/md";

const AccessDenied403 = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative z-10 bg-gradient-to-br from-red-500 to-orange-500 p-8 rounded-full">
              <FaLock className="text-white text-7xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* 403 Text */}
        <h1 className="text-9xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-4 tracking-tight">
          403
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h2>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          You don't have permission to access this resource. Please contact your
          administrator if you believe this is an error.
        </p>

        {/* Security Info */}
        <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <MdSecurity className="text-red-500 text-2xl mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-red-800 mb-2">
                Restricted Access
              </h3>
              <p className="text-sm text-red-700">
                This page requires special permissions or authentication. If you
                need access, please request authorization from your system
                administrator.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-red-300"></div>
          <FaShieldAlt className="text-red-400 text-xl" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-red-300"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link
            to="/"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>
        </div>

        {/* Possible Reasons */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Possible Reasons:
          </h3>
          <ul className="text-left text-gray-600 text-sm space-y-2 max-w-md mx-auto">
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>You are not logged in or your session has expired</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>Your account does not have the required permissions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>The resource has been restricted by the administrator</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              <span>You are trying to access a protected resource</span>
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors cursor-pointer"
            >
              <FaLock className="text-sm" />
              Sign In to Continue
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied403;
