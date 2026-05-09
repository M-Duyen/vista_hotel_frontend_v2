import { motion } from "framer-motion";
import { FaTicketAlt } from "react-icons/fa";

const EmptyVoucher: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md mx-auto border-2 border-cream">
        <div className="w-16 h-16 bg-gradient-to-br from-cream to-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <FaTicketAlt className="text-3xl text-primary" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          No Vouchers Yet
        </h3>
        <p className="text-gray-500 text-sm">
          Check back later for exciting offers!
        </p>
      </div>
    </motion.div>
  );
};

export default EmptyVoucher;
