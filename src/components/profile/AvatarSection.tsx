import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { FaCamera, FaUser } from "react-icons/fa";
import type { UserProfile } from "../../types/UserProfile";
import { useToastContext } from "../../hooks/useToastContext";
import { updateUserAvatar } from "../../services/userProfileService";

interface AvatarSectionProps {
  profile: UserProfile;
  onAvatarUpdate: (avatarUrl: string) => void;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({
  profile,
  onAvatarUpdate,
}) => {
  const toast = useToastContext();
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatarUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB!");
      return;
    }

    try {
      setUploading(true);

      // Preview image locally
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary via backend
      const avatarUrl = await updateUserAvatar(
        profile.id,
        profile.userRole || "CUSTOMER",
        file
      );

      // Update parent component
      onAvatarUpdate(avatarUrl);
      toast.success("Avatar updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar!");
      // Reset preview on error
      setAvatarPreview(profile.avatarUrl || null);
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-cream p-6"
    >
      <h2 className="text-2xl font-bold text-[#ccbda3] mb-6">
        Profile Picture
      </h2>

      <div className="flex flex-col items-center space-y-4">
        {/* Avatar Display */}
        <div className="relative group">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#ccbda3] shadow-lg">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <FaUser className="text-6xl text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Overlay */}
          <button
            onClick={handleAvatarClick}
            disabled={uploading}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
          >
            <FaCamera className="text-white text-3xl" />
          </button>

          {/* Loading Spinner */}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
            </div>
          )}
        </div>

        {/* File Input (Hidden) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Upload Button */}
        <button
          onClick={handleAvatarClick}
          disabled={uploading}
          className="px-6 py-2 bg-[#ccbda3] text-white rounded-lg hover:bg-[#b3a68f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
        >
          <FaCamera />
          {uploading ? "Uploading..." : "Change Avatar"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Supported formats: JPG, PNG, GIF
          <br />
          Maximum size: 5MB
        </p>
      </div>
    </motion.div>
  );
};

export default AvatarSection;
