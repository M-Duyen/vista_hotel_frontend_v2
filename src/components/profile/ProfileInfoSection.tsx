import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendar,
  FaVenusMars,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import type {
  UserProfile,
  ProfileUpdateRequest,
} from "../../types/UserProfile";
import { useToastContext } from "../../hooks/useToastContext";

interface ProfileInfoSectionProps {
  profile: UserProfile;
  onUpdate: (data: ProfileUpdateRequest) => Promise<void>;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({
  profile,
  onUpdate,
}) => {
  const toast = useToastContext();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    address: profile.address || "",
    birthDate: profile.birthDate,
    gender: profile.gender,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onUpdate(formData);
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address || "",
      birthDate: profile.birthDate,
      gender: profile.gender,
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-cream p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#ccbda3]">
          Personal Information
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#ccbda3] text-white font-semibold rounded-lg shadow-lg hover:bg-[#b3a68f] transition-colors cursor-pointer"
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
            <FaUser className="text-gold text-xl" />
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-semibold text-gray-900">{profile.userName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
            <FaUser className="text-gold text-xl" />
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-semibold text-gray-900">{profile.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
            <FaEnvelope className="text-gold text-xl" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
            <FaPhone className="text-gold text-xl" />
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="font-semibold text-gray-900">{profile.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
            <FaMapMarkerAlt className="text-gold text-xl" />
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-semibold text-gray-900">
                {profile.address || "Not updated"}
              </p>
            </div>
          </div>

          {profile.birthDate && (
            <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
              <FaCalendar className="text-gold text-xl" />
              <div>
                <p className="text-sm text-gray-600">Birth Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(profile.birthDate).toLocaleDateString("en-US")}
                </p>
              </div>
            </div>
          )}

          {profile.gender && (
            <div className="flex items-center gap-3 p-3 bg-light rounded-lg">
              <FaVenusMars className="text-gold text-xl" />
              <div>
                <p className="text-sm text-gray-600">Gender</p>
                <p className="font-semibold text-gray-900">
                  {profile.gender === "MALE"
                    ? "Male"
                    : profile.gender === "FEMALE"
                    ? "Female"
                    : "Other"}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={profile.userName}
              readOnly
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Username cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {profile.userRole === "CUSTOMER" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Birth Date
                </label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    setFormData({ ...formData, birthDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as "MALE" | "FEMALE" | "OTHER",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer"
                >
                  <option value="">Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#ccbda3] text-white rounded-lg hover:bg-[#b3a68f] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaSave />
              {loading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <FaTimes />
              Cancel
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default ProfileInfoSection;
