import { motion } from "framer-motion";
import { FaStar, FaGift, FaClock } from "react-icons/fa";

interface VoucherHeroProps {
  stats: {
    total: number;
    active: number;
    expiring: number;
  };
}

const VoucherHero: React.FC<VoucherHeroProps> = ({ stats }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-cream via-gold to-cream">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-40 h-40 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-1/3 w-36 h-36 bg-gold/40 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-5 py-2.5 rounded-full mb-4 shadow-sm">
            <FaStar className="text-[#ccbda3] text-sm" />
            <span className="text-sm font-semibold text-gray-700">
              Your Exclusive Rewards
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-gray-600">
            My Vouchers
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
            Unlock amazing savings and exclusive deals
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border-2 border-gold/50 shadow-md hover:shadow-lg transition-shadow">
            <FaGift className="text-3xl mx-auto mb-2 text-[#ccbda3]" />
            <div className="text-3xl font-bold text-gray-800">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600 mt-1 font-medium">Total</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border-2 border-gold/50 shadow-md hover:shadow-lg transition-shadow">
            <FaStar className="text-3xl mx-auto mb-2 text-success" />
            <div className="text-3xl font-bold text-gray-800">
              {stats.active}
            </div>
            <div className="text-sm text-gray-600 mt-1 font-medium">Active</div>
          </div>
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-5 text-center border-2 border-gold/50 shadow-md hover:shadow-lg transition-shadow">
            <FaClock className="text-3xl mx-auto mb-2 text-warning" />
            <div className="text-3xl font-bold text-gray-800">
              {stats.expiring}
            </div>
            <div className="text-sm text-gray-600 mt-1 font-medium">
              Expiring
            </div>
          </div>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 0L60 8C120 16 240 32 360 37.3C480 43 600 37 720 34.7C840 32 960 32 1080 37.3C1200 43 1320 53 1380 58.7L1440 64V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0V0Z"
            fill="#f5f0eb"
          />
        </svg>
      </div>
    </div>
  );
};

export default VoucherHero;
