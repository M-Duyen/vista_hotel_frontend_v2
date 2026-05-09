import React, { useState } from "react";

interface FAQItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeQuestions, setActiveQuestions] = useState<number[]>([]);

  const categories = [
    { id: "all", label: "All" },
    { id: "booking", label: "Booking & Reservations" },
    { id: "payment", label: "Payment & Pricing" },
    { id: "checkin", label: "Check-in & Check-out" },
    { id: "facilities", label: "Facilities & Services" },
    { id: "loyalty", label: "Loyalty Program" },
  ];

  const faqData: FAQItem[] = [
    {
      id: 1,
      category: "booking",
      question: "How do I make a reservation?",
      answer:
        "You can make a reservation through our website by selecting your preferred dates, room type, and completing the booking process. Alternatively, you can contact our reservation desk directly at +1 (555) 123-4567 or email us at reservations@vistahotel.com.",
    },
    {
      id: 2,
      category: "booking",
      question: "Can I modify my reservation after booking?",
      answer:
        "Yes, you can modify your reservation by logging into your account and selecting the booking you wish to change. Modifications are subject to availability and may result in price adjustments if rates have changed. Changes must be made at least 24 hours before check-in.",
    },
    {
      id: 3,
      category: "booking",
      question: "What is your cancellation policy?",
      answer:
        "Our cancellation policy is as follows:\n• Cancellation made 7+ days before check-in: 100% refund\n• Cancellation made 3-7 days before check-in: 50% refund\n• Cancellation made less than 3 days before check-in: No refund\n\nAll refunds will be processed within 24 hours to your original payment method.",
    },
    {
      id: 4,
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept the following payment methods:\n• Major credit cards (Visa, MasterCard, American Express)\n• VNPAY digital wallet\n• Bank transfers\n\nFor guests with high trust scores (81+ points), payment can be made upon check-out.",
    },
    {
      id: 5,
      category: "payment",
      question: "How does dynamic pricing work?",
      answer:
        "Our room rates vary based on several factors including:\n• Seasonality (peak vs. off-peak periods)\n• Day of the week (weekends typically have higher rates)\n• Special events and holidays\n• Current occupancy levels\n\nThe price shown during your booking process is the final price for your selected dates.",
    },
    {
      id: 6,
      category: "payment",
      question: "How does the hourly room booking work?",
      answer:
        "We offer hourly room bookings with rates calculated as a percentage of the standard nightly rate:\n• 1 hour: 15% of nightly rate\n• 4 hours: 45% of nightly rate\n• 8 hours: 85% of nightly rate\n\nAdditional fees apply for evening hours (18:00-06:00) and weekends. The minimum booking is 1 hour, and prices are automatically calculated during the booking process.",
    },
    {
      id: 7,
      category: "checkin",
      question: "What are the standard check-in and check-out times?",
      answer:
        "Standard check-in time is from 14:00 (2:00 PM).\nStandard check-out time is before 12:00 (12:00 PM).\n\nEarly check-in and late check-out may be available for an additional fee, subject to availability.",
    },
    {
      id: 8,
      category: "checkin",
      question: "How much does early check-in cost?",
      answer:
        "Early check-in fees are as follows:\n• 05:00-09:00: 50% of one night's room rate\n• 09:00-13:30: 30% of one night's room rate\n\nEarly check-in is subject to room availability and can be requested during booking or after confirmation through your online account.",
    },
    {
      id: 9,
      category: "checkin",
      question: "What are the late check-out fees?",
      answer:
        "Late check-out fees are structured as follows:\n• 12:00-13:00: Free for Gold members and above, otherwise standard fees apply\n• 13:00-15:00: 30% of room rate\n• 15:00-18:00: 50% of room rate\n• After 18:00: 100% of room rate (full additional night)\n\nLate check-out is subject to availability and should be arranged with the front desk.",
    },
    {
      id: 10,
      category: "facilities",
      question: "Do you offer room service?",
      answer:
        "Yes, we offer 24/7 room service with a variety of dining options. You can order through our website, mobile app, or by calling the front desk. Our menu includes main courses, desserts, beverages, and special dietary options.\n\nOrders can be paid directly or charged to your room. Cancellations are allowed within 15 minutes of ordering, after which a 30% cancellation fee applies.",
    },
    {
      id: 11,
      category: "facilities",
      question: "How do I report an issue with my room?",
      answer:
        'You can report any issues with your room through multiple channels:\n• Through our mobile app or website\'s "Report Issue" feature\n• By calling the front desk\n• In person at the reception\n\nIssues are categorized by priority, and our staff will address them accordingly. For emergency issues like power or water outages, immediate assistance will be provided.',
    },
    {
      id: 12,
      category: "facilities",
      question: "Is WiFi available throughout the hotel?",
      answer:
        "Yes, complimentary high-speed WiFi is available throughout the entire hotel, including all guest rooms, public areas, meeting rooms, and restaurants. No password is required for guests; you'll be automatically connected after accepting our terms of service.",
    },
    {
      id: 13,
      category: "loyalty",
      question: "How does the loyalty points system work?",
      answer:
        "Our loyalty program rewards you with 1 point for every 10,000 VND spent at our hotel. Points are earned on room stays, dining, and additional services. Special multipliers apply during weekends (2x), holidays (3x), and on your birthday (1.5x). Points never expire and can be redeemed for room discounts, upgrades, or exclusive gifts.",
    },
    {
      id: 14,
      category: "loyalty",
      question: "What are the membership tiers and benefits?",
      answer:
        "Our loyalty program has 4 tiers based on accumulated points:\n\n• Bronze (1,000-9,999 points): 100,000 VND voucher and priority check-in\n• Silver (10,000-49,999 points): 2% discount on bookings\n• Gold (50,000-100,000 points): 5% discount on bookings and 5% off room upgrades\n• Platinum (100,000+ points): 8% discount, VIP check-in, and 10% off room upgrades",
    },
    {
      id: 15,
      category: "loyalty",
      question: "How do I redeem my loyalty points?",
      answer:
        "You can redeem your loyalty points in several ways:\n• Direct discounts on bookings (100 points = 100,000 VND)\n• Service vouchers for dining and laundry\n• Room upgrades (500 points to upgrade from Standard to Deluxe)\n• Exclusive hotel merchandise\n\nRedemptions can be made during booking or at the hotel. Log into your account to view your current point balance and redemption options.",
    },
  ];

  const toggleQuestion = (id: number) => {
    setActiveQuestions((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const filteredFAQs = faqData.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      searchTerm === "" ||
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Banner */}
      <div className="pt-20 mb-8 bg-gradient-to-r from-[#CCBDA3] to-[#EBE3D7]">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold text-black mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-700">
            Find answers to common questions about our hotel
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-lg focus:outline-none focus:border-[#CCBDA3] focus:ring-2 focus:ring-[#CCBDA3]/20 transition-all"
              />
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  activeCategory === category.id
                    ? "bg-[#CCBDA3] text-white"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredFAQs.map((item) => (
              <div key={item.id} className="border-b border-gray-200 pb-4">
                <div
                  onClick={() => toggleQuestion(item.id)}
                  className="flex justify-between items-center cursor-pointer py-4 hover:text-[#CCBDA3] transition-colors"
                >
                  <h3
                    className={`text-lg font-medium ${
                      activeQuestions.includes(item.id)
                        ? "text-[#CCBDA3]"
                        : "text-black"
                    }`}
                  >
                    {item.question}
                  </h3>
                  <i
                    className={`fa-solid fa-chevron-down text-[#CCBDA3] transition-transform ${
                      activeQuestions.includes(item.id) ? "rotate-180" : ""
                    }`}
                  ></i>
                </div>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    activeQuestions.includes(item.id)
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="pb-4 text-gray-600 whitespace-pre-line">
                    {item.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No results */}
          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <i className="fa-solid fa-search text-6xl text-[#CCBDA3] mb-4"></i>
              <h3 className="text-2xl font-semibold mb-4">No results found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or category filter
              </p>
            </div>
          )}

          {/* Contact Support */}
          <div className="mt-12 bg-gray-50 rounded-lg p-8 text-center">
            <i className="fa-solid fa-headset text-5xl text-[#CCBDA3] mb-4"></i>
            <h3 className="text-2xl font-semibold mb-3">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6">
              Our customer support team is available 24/7 to assist you with any
              questions.
            </p>
            <a
              href="/customer/contact"
              className="inline-block px-6 py-3 bg-[#CCBDA3] text-white rounded-lg hover:bg-[#b8ac94] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
