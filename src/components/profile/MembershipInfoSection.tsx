import { motion } from "framer-motion";
import { FaStar, FaTrophy, FaAward, FaCoins } from "react-icons/fa";
import type { UserProfile } from "../../types/UserProfile";

interface MembershipInfoSectionProps {
  profile: UserProfile;
}

const MembershipInfoSection: React.FC<MembershipInfoSectionProps> = ({
  profile,
}) => {
  const getMembershipColor = (level?: string) => {
    switch (level) {
      case "PLATINUM":
        return "from-gray-400 to-gray-600";
      case "GOLD":
        return "from-yellow-400 to-yellow-600";
      case "SILVER":
        return "from-gray-300 to-gray-500";
      case "BRONZE":
      default:
        return "from-orange-400 to-orange-600";
    }
  };

  const getMembershipLabel = (level?: string) => {
    switch (level) {
      case "PLATINUM":
        return "Platinum";
      case "GOLD":
        return "Gold";
      case "SILVER":
        return "Silver";
      case "BRONZE":
      default:
        return "Bronze";
    }
  };

  const getNextLevel = (currentLevel?: string) => {
    switch (currentLevel) {
      case "BRONZE":
        return { name: "SILVER", label: "Silver", points: 1000 };
      case "SILVER":
        return { name: "GOLD", label: "Gold", points: 5000 };
      case "GOLD":
        return { name: "PLATINUM", label: "Platinum", points: 10000 };
      default:
        return null;
    }
  };

  const nextLevel = getNextLevel(profile.memberShipLevel);
  const currentPoints = profile.loyaltyPoints || 0;
  const progressPercentage = nextLevel
    ? (currentPoints / nextLevel.points) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-cream p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <FaTrophy className="text-[#ccbda3] text-2xl" />
        <h2 className="text-2xl font-bold text-[#ccbda3]">
          Membership Information
        </h2>
      </div>

      <div className="space-y-6">
        {/* Membership Badge */}
        <div
          className={`bg-gradient-to-r ${getMembershipColor(
            profile.memberShipLevel
          )} rounded-xl p-6 text-white`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FaAward className="text-4xl" />
              <div>
                <p className="text-sm opacity-90">Membership Level</p>
                <p className="text-2xl font-bold">
                  {getMembershipLabel(profile.memberShipLevel)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Loyalty Points</p>
              <p className="text-2xl font-bold flex items-center gap-2">
                <FaCoins />
                {currentPoints.toLocaleString()}
              </p>
            </div>
          </div>

          {nextLevel && (
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress to {nextLevel.label}</span>
                <span>
                  {currentPoints.toLocaleString()} /{" "}
                  {nextLevel.points.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {profile.memberShipLevel === "PLATINUM" && (
            <div className="text-center mt-4">
              <p className="text-lg font-semibold">
                You've reached the highest level!
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-light rounded-lg p-4 text-center">
            <FaStar className="text-[#ccbda3] text-3xl mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Reputation Points</p>
            <p className="text-2xl font-bold text-[#ccbda3]">
              {profile.reputationPoint || 100}
            </p>
          </div>

          <div className="bg-light rounded-lg p-4 text-center">
            <FaCoins className="text-[#ccbda3] text-3xl mx-auto mb-2" />
            <p className="text-sm text-gray-600 mb-1">Loyalty Points</p>
            <p className="text-2xl font-bold text-[#ccbda3]">
              {currentPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Joined Date */}
        {profile.joinedDate && (
          <div className="bg-light rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Member Since</p>
            <p className="font-semibold text-gray-900">
              {new Date(profile.joinedDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Benefits Info */}
        <div className="border-t border-cream pt-4">
          <h3 className="font-semibold text-gray-900 mb-3">Member Benefits</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Earn points with every booking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Receive exclusive vouchers and offers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>Priority early check-in</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600 mt-1">✓</span>
              <span>24/7 dedicated member support</span>
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default MembershipInfoSection;
