import { Link } from "react-router-dom";
import { FaHome, FaTools, FaServer } from "react-icons/fa";
import { MdArrowBack, MdRefresh, MdError } from "react-icons/md";
import { BiErrorCircle } from "react-icons/bi";

const ServerError500 = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 opacity-20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative z-10 bg-gradient-to-br from-purple-500 to-blue-500 p-8 rounded-full">
              <FaServer className="text-white text-7xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* 500 Text */}
        <h1 className="text-9xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent mb-4 tracking-tight">
          500
        </h1>

        {/* Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Internal Server Error
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
          Oops! Something went wrong on our end. We're working to fix the
          problem. Please try again later.
        </p>

        {/* Error Info */}
        <div className="mb-8 p-6 bg-purple-50 border-l-4 border-purple-500 rounded-lg max-w-lg mx-auto">
          <div className="flex items-start gap-3">
            <BiErrorCircle className="text-purple-500 text-2xl mt-1 flex-shrink-0" />
            <div className="text-left">
              <h3 className="font-semibold text-purple-800 mb-2">
                What happened?
              </h3>
              <p className="text-sm text-purple-700">
                The server encountered an unexpected condition that prevented it
                from fulfilling your request. Our technical team has been
                automatically notified and is working on a fix.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-purple-300"></div>
          <FaTools className="text-purple-400 text-xl" />
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-purple-300"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleRefresh}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-500 text-purple-500 rounded-lg hover:bg-purple-500 hover:text-white transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <MdRefresh className="text-xl group-hover:rotate-180 transition-transform duration-500" />
            Refresh Page
          </button>

          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link
            to="/"
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg cursor-pointer"
          >
            <FaHome className="text-xl group-hover:scale-110 transition-transform" />
            Home
          </Link>
        </div>

        {/* What You Can Do */}
        <div className="mt-12 p-6 bg-white rounded-xl shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            What can you do?
          </h3>
          <ul className="text-left text-gray-600 text-sm space-y-3 max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <MdRefresh className="text-purple-500 text-lg mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-gray-800">Refresh the page</strong> –
                This might be a temporary issue
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MdArrowBack className="text-purple-500 text-lg mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-gray-800">Go back</strong> – Try a
                different page or action
              </span>
            </li>
            <li className="flex items-start gap-3">
              <MdError className="text-purple-500 text-lg mt-0.5 flex-shrink-0" />
              <span>
                <strong className="text-gray-800">Wait a moment</strong> – We're
                working to resolve this issue
              </span>
            </li>
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-3">
              If the problem persists, please contact our support team:
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-purple-500 hover:text-purple-600 font-medium transition-colors cursor-pointer"
            >
              Contact Support
            </Link>
          </div>
        </div>

        {/* Status */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <span>System monitoring active</span>
        </div>

        {/* Decorative Elements */}
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default ServerError500;
