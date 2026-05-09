/* eslint-disable*/
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Header from "../../../components/Header";
import ReviewsList from "./ReviewList";

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-6">
            <Link
              to="/customer/mybooking"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Bookings
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Review</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Guest Reviews
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Rate your recent bookings and share your experience
            </p>
          </div>
          <ReviewsList />
        </div>
      </main>
    </div>
  );
}