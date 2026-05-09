import { motion } from "framer-motion";

interface VoucherFilterProps {
  filter: "all" | "active" | "expiring";
  onFilterChange: (filter: "all" | "active" | "expiring") => void;
}

const VoucherFilter: React.FC<VoucherFilterProps> = ({
  filter,
  onFilterChange,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6 md:mb-8 px-2"
    >
      <button
        onClick={() => onFilterChange("all")}
        className={`cursor-pointer px-4 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shadow-md ${
          filter === "all"
            ? "bg-[#ccbda3] text-white shadow-lg shadow-gold/50 scale-105"
            : "bg-[#ebe3d7] to-white text-gray-700 hover:shadow-lg hover:from-gold/30 hover:to-cream border-2 border-gold/40"
        }`}
      >
        All Vouchers
      </button>
      <button
        onClick={() => onFilterChange("active")}
        className={` cursor-pointer px-4 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shadow-md ${
          filter === "active"
            ? "bg-[#19ba3c] text-white shadow-lg shadow-success/50 scale-105"
            : "bg-[#ebe3d7] to-white text-gray-700 hover:shadow-lg hover:from-gold/30 hover:to-cream border-2 border-gold/40"
        }`}
      >
        Active Only
      </button>
      <button
        onClick={() => onFilterChange("expiring")}
        className={` cursor-pointer px-4 md:px-8 py-2 md:py-3 rounded-full text-xs md:text-sm font-bold transition-all duration-300 shadow-md ${
          filter === "expiring"
            ? "bg-[#f97316] text-white shadow-lg shadow-warning/50 scale-105"
            : "bg-[#ebe3d7] to-white text-gray-700 hover:shadow-lg hover:from-gold/30 hover:to-cream border-2 border-gold/40"
        }`}
      >
        Expiring Soon
      </button>
    </motion.div>
  );
};

export default VoucherFilter;
