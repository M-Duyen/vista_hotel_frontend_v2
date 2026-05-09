import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { RoomType } from "../../../types/RoomType";
import { FaTimes } from "react-icons/fa";

interface RoomTypeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<RoomType>) => Promise<void>;
  roomType?: RoomType | null;
  submitting?: boolean;
}

const RoomTypeFormModal: React.FC<RoomTypeFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  roomType,
  submitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<RoomType>>({
    roomTypeID: "",
    typeName: "",
    description: "",
    area: 0,
    maxOccupancy: 1,
    amenties: [],
    basePrice: 0,
  });
  const [amenityInput, setAmenityInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (roomType) {
        setFormData({
          roomTypeID: roomType.roomTypeID || "",
          typeName: roomType.typeName || "",
          description: roomType.description || "",
          area: roomType.area || 0,
          maxOccupancy: roomType.maxOccupancy || 1,
          amenties: roomType.amenties || [],
          basePrice: roomType.basePrice || 0,
        });
      } else {
        setFormData({
          roomTypeID: "",
          typeName: "",
          description: "",
          area: 0,
          maxOccupancy: 1,
          amenties: [],
          basePrice: 0,
        });
      }
      setErrors({});
    }
  }, [isOpen, roomType]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.roomTypeID?.trim()) {
      newErrors.roomTypeID = "Room Type ID is required";
    }
    if (!formData.typeName?.trim()) {
      newErrors.typeName = "Type name is required";
    }
    if (!formData.basePrice || formData.basePrice <= 0) {
      newErrors.basePrice = "Base price must be greater than 0";
    }
    if (!formData.area || formData.area <= 0) {
      newErrors.area = "Area must be greater than 0";
    }
    if (!formData.maxOccupancy || formData.maxOccupancy < 1) {
      newErrors.maxOccupancy = "Max occupancy must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenties: [...(formData.amenties || []), amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenties: formData.amenties?.filter((_, i) => i !== index),
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {roomType ? "Edit Room Type" : "Add Room Type"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Type ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.roomTypeID}
                onChange={(e) =>
                  setFormData({ ...formData, roomTypeID: e.target.value })
                }
                disabled={!!roomType}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  errors.roomTypeID ? "border-red-500" : "border-gray-300"
                } ${roomType ? "bg-gray-100" : ""}`}
                placeholder="e.g., DLX, STE"
              />
              {errors.roomTypeID && (
                <p className="text-red-500 text-xs mt-1">{errors.roomTypeID}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.typeName}
                onChange={(e) =>
                  setFormData({ ...formData, typeName: e.target.value })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  errors.typeName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., Deluxe Room"
              />
              {errors.typeName && (
                <p className="text-red-500 text-xs mt-1">{errors.typeName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c]"
              placeholder="Room type description..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Area (m²) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: parseFloat(e.target.value) })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  errors.area ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                step="0.1"
              />
              {errors.area && (
                <p className="text-red-500 text-xs mt-1">{errors.area}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Occupancy <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxOccupancy}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxOccupancy: parseInt(e.target.value),
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  errors.maxOccupancy ? "border-red-500" : "border-gray-300"
                }`}
                min="1"
              />
              {errors.maxOccupancy && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.maxOccupancy}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basePrice: parseFloat(e.target.value),
                  })
                }
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c] ${
                  errors.basePrice ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
                step="1000"
              />
              {errors.basePrice && (
                <p className="text-red-500 text-xs mt-1">{errors.basePrice}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amenities
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addAmenity())
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6b5e4c]"
                placeholder="Add amenity..."
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.amenties?.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-[#f5f0eb] text-gray-700 rounded-full text-sm"
                >
                  {amenity}
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3 justify-end -mx-6 -mb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Saving..." : roomType ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RoomTypeFormModal;