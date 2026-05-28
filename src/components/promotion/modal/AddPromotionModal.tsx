import React, { useState, useEffect } from "react";
import { FaTimes, FaPlus, FaTrash, FaInfoCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "../../Dropdown";
import type { Promotion } from "../../../types/Promotion";
import type { PromotionType } from "../../../types/PromotionType";
import type { RoomType } from "../../../types/RoomType";
import { getAllPromotionTypes } from "../../../services/promotionTypeService";
import { getAllRoomTypes } from "../../../services/roomService";
import {
  getAllRoomTypePromotions,
  getRoomTypePromotionsByPromotionId,
} from "../../../services/roomTypePromotionService";
import { useToastContext } from "../../../hooks/useToastContext";
import { FaSpinner } from "react-icons/fa";

interface AddPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promotion: Partial<Promotion>) => void;
  editPromotion?: Promotion | null;
  submitting?: boolean;
}

interface RoomTypePromotionForm {
  roomTypeId: string;
  roomTypeName: string;
  discountValue: number;
  startDate: string;
  endDate: string;
}

const AddPromotionModal: React.FC<AddPromotionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editPromotion,
  submitting = false,
}) => {
  const toast = useToastContext();

  const [formData, setFormData] = useState<Partial<Promotion>>({
    promotionName: "",
    description: "",
    discountType: undefined,
    active: true,
    promotionType: undefined,
  });

  const [errors, setErrors] = useState<{
    promotionID?: string;
    promotionName?: string;
    promotionType?: string;
    discountType?: string;
    roomTypePromotions?: string;
  }>({});

  const [roomTypePromotions, setRoomTypePromotions] = useState<
    RoomTypePromotionForm[]
  >([]);

  const [promotionTypes, setPromotionTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [roomTypes, setRoomTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [blockedRoomTypeIds, setBlockedRoomTypeIds] = useState<Set<string>>(
    new Set()
  );

  // Fetch promotion types and room types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promotionTypesData, roomTypesData, allRoomTypePromotions] =
          await Promise.all([
          getAllPromotionTypes(),
          getAllRoomTypes(),
            getAllRoomTypePromotions(),
          ]);

        setPromotionTypes(
          promotionTypesData.map((pt: PromotionType) => ({
            value: pt.promotionTypeID || "",
            label: pt.promotionTYPEName || pt.promotionTypeID || "",
          }))
        );

        setRoomTypes(
          roomTypesData.map((rt: RoomType) => ({
            value: rt.roomTypeID || "",
            label: rt.typeName || rt.roomTypeID || "",
          }))
        );

        const today = new Date();
        const currentPromotionId = editPromotion?.promotionID || "";
        const blocked = new Set(
          allRoomTypePromotions
            .filter((rtp: any) => {
              const endDate = rtp.endDate ? new Date(rtp.endDate) : null;
              const promotionId =
                rtp.promotion?.promotionID ||
                rtp.promotion?.promotionId ||
                rtp.id?.promotionId ||
                "";
              return (
                endDate &&
                endDate >= today &&
                promotionId !== currentPromotionId
              );
            })
            .map(
              (rtp: any) =>
                rtp.roomType?.roomTypeID ||
                rtp.roomType?.roomTypeId ||
                rtp.id?.roomTypeId ||
                ""
            )
            .filter((id: string) => id)
        );
        setBlockedRoomTypeIds(blocked);
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, editPromotion]);

  useEffect(() => {
    const loadPromotionData = async () => {
      if (editPromotion) {
        setFormData({
          promotionID: editPromotion.promotionID,
          promotionName: editPromotion.promotionName,
          description: editPromotion.description,
          discountType: editPromotion.discountType,
          active: editPromotion.active,
          promotionType: editPromotion.promotionType,
        });

        // Load room type promotions from backend
        try {
          const rtpData = await getRoomTypePromotionsByPromotionId(
            editPromotion.promotionID || ""
          );

          if (rtpData && rtpData.length > 0) {
            setRoomTypePromotions(
              rtpData.map(
                (rtp: {
                  roomType?: { roomTypeID?: string; typeName?: string };
                  id?: { roomTypeId?: string };
                  discountValue?: number;
                  startDate?: string;
                  endDate?: string;
                }) => ({
                  roomTypeId:
                    rtp.roomType?.roomTypeID || rtp.id?.roomTypeId || "",
                  roomTypeName: rtp.roomType?.typeName || "",
                  discountValue: rtp.discountValue || 0,
                  startDate: rtp.startDate || "",
                  endDate: rtp.endDate || "",
                })
              )
            );
          }
        } catch (error) {
          console.error("Error loading room type promotions:", error);
        }
      } else {
        setFormData({
          promotionName: "",
          description: "",
          discountType: undefined,
          active: true,
          promotionType: undefined,
        });
        setRoomTypePromotions([]);
      }
    };

    if (isOpen) {
      loadPromotionData();
    }
  }, [editPromotion, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate Promotion Code
    if (!editPromotion) {
      if (!formData.promotionID) {
        newErrors.promotionID = "Promotion Code is required";
      } else if (formData.promotionID.length < 3) {
        newErrors.promotionID = "Promotion Code must be at least 3 characters";
      } else if (!/^[A-Z0-9]+$/.test(formData.promotionID)) {
        newErrors.promotionID =
          "Promotion Code must contain only uppercase letters and numbers";
      }
    }

    // Validate Promotion Name
    if (!formData.promotionName || formData.promotionName.trim() === "") {
      newErrors.promotionName = "Promotion Name is required";
    } else if (formData.promotionName.length < 3) {
      newErrors.promotionName = "Promotion Name must be at least 3 characters";
    }

    // Validate Promotion Type
    if (!formData.promotionType) {
      newErrors.promotionType = "Please select a Promotion Type";
    }

    // Validate Discount Type
    if (!formData.discountType) {
      newErrors.discountType = "Please select a Discount Type";
    }

    // Validate Room Type Promotions
    if (roomTypePromotions.length === 0) {
      newErrors.roomTypePromotions =
        "Please add at least one room type promotion";
    } else {
      // Check for duplicate room types
      const roomTypeIds = roomTypePromotions
        .map((rtp) => rtp.roomTypeId)
        .filter((id) => id);
      const duplicates = roomTypeIds.filter(
        (id, index) => roomTypeIds.indexOf(id) !== index
      );
      if (duplicates.length > 0) {
        newErrors.roomTypePromotions = "Duplicate room types are not allowed";
      }

      // Validate each room type promotion
      for (let i = 0; i < roomTypePromotions.length; i++) {
        const rtp = roomTypePromotions[i];

        if (!rtp.roomTypeId) {
          newErrors.roomTypePromotions = `Room Type #${
            i + 1
          }: Please select a room type`;
          break;
        }

        if (!rtp.discountValue || rtp.discountValue <= 0) {
          newErrors.roomTypePromotions = `Room Type #${
            i + 1
          }: Discount value must be greater than 0`;
          break;
        }

        if (formData.discountType === "PERCENT" && rtp.discountValue > 100) {
          newErrors.roomTypePromotions = `Room Type #${
            i + 1
          }: Percentage discount cannot exceed 100%`;
          break;
        }

        if (!rtp.startDate) {
          newErrors.roomTypePromotions = `Room Type #${
            i + 1
          }: Start date is required`;
          break;
        }

        if (!rtp.endDate) {
          newErrors.roomTypePromotions = `Room Type #${
            i + 1
          }: End date is required`;
          break;
        }

        if (new Date(rtp.startDate) >= new Date(rtp.endDate)) {
          newErrors.roomTypePromotions = `Room Type #${
            i + 1
          }: End date must be after start date`;
          break;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    // Format data to match backend expectations
    const submitData: Partial<Promotion> & {
      roomTypePromotions?: Array<{
        roomType: { roomTypeID: string };
        discountValue: number;
        startDate: string;
        endDate: string;
      }>;
    } = {
      promotionID: formData.promotionID,
      promotionName: formData.promotionName,
      description: formData.description,
      discountType: formData.discountType,
      active: formData.active,
      promotionType: formData.promotionType
        ? {
            promotionTypeID: formData.promotionType.promotionTypeID,
            promotionTYPEName: formData.promotionType.promotionTYPEName || "",
          }
        : undefined,
      roomTypePromotions: roomTypePromotions.map((rtp) => ({
        roomType: {
          roomTypeID: rtp.roomTypeId,
        },
        discountValue: Number(rtp.discountValue),
        startDate: rtp.startDate,
        endDate: rtp.endDate,
      })),
    };

    console.log("Submit data:", JSON.stringify(submitData, null, 2));
    onSubmit(submitData);
  };

  const addRoomTypePromotion = () => {
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setRoomTypePromotions([
      ...roomTypePromotions,
      {
        roomTypeId: "",
        roomTypeName: "",
        discountValue: 0,
        startDate: today,
        endDate: nextMonth,
      },
    ]);
  };

  const removeRoomTypePromotion = (index: number) => {
    setRoomTypePromotions(roomTypePromotions.filter((_, i) => i !== index));
  };

  const updateRoomTypePromotion = (
    index: number,
    field: keyof RoomTypePromotionForm,
    value: string | number
  ) => {
    const updated = [...roomTypePromotions];
    updated[index] = { ...updated[index], [field]: value };

    // Update room type name when room type id changes
    if (field === "roomTypeId") {
      const selectedRoom = roomTypes.find((rt) => rt.value === value);
      if (selectedRoom) {
        updated[index].roomTypeName = selectedRoom.label;
      }
    }

    setRoomTypePromotions(updated);
  };

  const discountTypeOptions = [
    { value: "PERCENT", label: "Percentage (%)" },
    { value: "FIXED", label: "Fixed Amount (VND)" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {editPromotion ? "Edit Promotion" : "Add New Promotion"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <FaTimes className="text-gray-600 text-xl" />
              </button>
            </div>

            {/* Form */}
            <div className="overflow-y-auto scrollbar-thin flex-1">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                    <FaInfoCircle className="text-[#5a4d3e]" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Basic Information
                    </h3>
                  </div>

                  {/* Promotion Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promotion Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.promotionID || ""}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          promotionID: e.target.value.toUpperCase(),
                        });
                        if (errors.promotionID) {
                          setErrors({ ...errors, promotionID: undefined });
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-colors text-gray-700 font-mono ${
                        errors.promotionID
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-[#6b5e4c] focus:border-[#6b5e4c]"
                      }`}
                      placeholder="e.g., SUMMER2025"
                      disabled={!!editPromotion}
                      required
                    />
                    {errors.promotionID && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaInfoCircle className="text-xs" />
                        {errors.promotionID}
                      </p>
                    )}
                    {!editPromotion && !errors.promotionID && (
                      <p className="mt-1 text-xs text-gray-500">
                        Enter a unique code for this promotion (e.g.,
                        SUMMER2025, PROMO001)
                      </p>
                    )}
                  </div>

                  {/* Promotion Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Promotion Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.promotionName || ""}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          promotionName: e.target.value,
                        });
                        if (errors.promotionName) {
                          setErrors({ ...errors, promotionName: undefined });
                        }
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 transition-colors text-gray-700 ${
                        errors.promotionName
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300 focus:ring-[#6b5e4c] focus:border-[#6b5e4c]"
                      }`}
                      placeholder="Enter promotion name..."
                      required
                    />
                    {errors.promotionName && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <FaInfoCircle className="text-xs" />
                        {errors.promotionName}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-[#6b5e4c] transition-colors resize-none text-gray-700"
                      placeholder="Enter promotion description..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Promotion Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Promotion Type <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        options={promotionTypes}
                        value={
                          typeof formData.promotionType === "object"
                            ? formData.promotionType?.promotionTypeID || ""
                            : ""
                        }
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            promotionType: value
                              ? {
                                  promotionTypeID: value,
                                  promotionTYPEName:
                                    promotionTypes.find(
                                      (t) => t.value === value
                                    )?.label || "",
                                }
                              : undefined,
                          });
                          if (errors.promotionType) {
                            setErrors({ ...errors, promotionType: undefined });
                          }
                        }}
                        placeholder="Select promotion type"
                      />
                      {errors.promotionType && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaInfoCircle className="text-xs" />
                          {errors.promotionType}
                        </p>
                      )}
                    </div>

                    {/* Discount Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Discount Type <span className="text-red-500">*</span>
                      </label>
                      <Dropdown
                        options={discountTypeOptions}
                        value={formData.discountType || ""}
                        onChange={(value) => {
                          setFormData({
                            ...formData,
                            discountType: value as "PERCENT" | "FIXED",
                          });
                          if (errors.discountType) {
                            setErrors({ ...errors, discountType: undefined });
                          }
                        }}
                        placeholder="Select discount type"
                      />
                      {errors.discountType && (
                        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                          <FaInfoCircle className="text-xs" />
                          {errors.discountType}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked })
                      }
                      className="w-5 h-5 text-[#5a4d3e] border-gray-300 rounded focus:ring-[#5a4d3e] "
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active Promotion
                    </label>
                  </div>
                </div>

                {/* Room Type Promotions Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <FaInfoCircle className="text-[#5a4d3e]" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Room Type Promotions{" "}
                        <span className="text-red-500">*</span>
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addRoomTypePromotion();
                        if (errors.roomTypePromotions) {
                          setErrors({
                            ...errors,
                            roomTypePromotions: undefined,
                          });
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#6b5e4c] text-white text-[18px] rounded-lg hover:bg-[#5a4d3e] transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center"
                    >
                      <FaPlus className="text-xs" />
                      Add Room Type
                    </button>
                  </div>

                  {errors.roomTypePromotions && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 flex items-center gap-2">
                        <FaInfoCircle />
                        {errors.roomTypePromotions}
                      </p>
                    </div>
                  )}

                  {roomTypePromotions.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                        <FaPlus className="text-2xl text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No room types added yet
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        Click "Add Room Type" to start
                      </p>
                    </div>
                  )}

                  {/* Room Type Promotion Items */}
                  <div className="space-y-4">
                    {roomTypePromotions.map((rtp, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-white to-gray-50 hover:border-[#b27c1f] transition-all shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-bold text-gray-700 bg-[#f5f0eb] px-3 py-1 rounded-full">
                            Room Type #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeRoomTypePromotion(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <FaTrash />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Room Type */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Room Type
                            </label>
                            <Dropdown
                              options={roomTypes.filter(
                                (rt) =>
                                  !blockedRoomTypeIds.has(rt.value) ||
                                  rt.value === rtp.roomTypeId
                              )}
                              value={rtp.roomTypeId}
                              onChange={(value) =>
                                updateRoomTypePromotion(
                                  index,
                                  "roomTypeId",
                                  value
                                )
                              }
                              placeholder="Select room type"
                            />
                          </div>

                          {/* Discount Value */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Discount Value{" "}
                              {formData.discountType === "PERCENT"
                                ? "(%)"
                                : "(VND)"}
                            </label>
                            <input
                              type="number"
                              value={rtp.discountValue}
                              onChange={(e) =>
                                updateRoomTypePromotion(
                                  index,
                                  "discountValue",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              min="0"
                              max={
                                formData.discountType === "PERCENT"
                                  ? 100
                                  : undefined
                              }
                              step={
                                formData.discountType === "PERCENT" ? 1 : 1000
                              }
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-[#6b5e4c] text-sm font-medium"
                              required
                            />
                          </div>

                          {/* Start Date */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              Start Date
                            </label>
                            <input
                              type="date"
                              value={rtp.startDate}
                              onChange={(e) =>
                                updateRoomTypePromotion(
                                  index,
                                  "startDate",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-[#6b5e4c] text-sm font-medium"
                              required
                            />
                          </div>

                          {/* End Date */}
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              End Date
                            </label>
                            <input
                              type="date"
                              value={rtp.endDate}
                              onChange={(e) =>
                                updateRoomTypePromotion(
                                  index,
                                  "endDate",
                                  e.target.value
                                )
                              }
                              min={rtp.startDate}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-[#6b5e4c] text-sm font-medium"
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            {/* Sticky Footer with Actions */}
            <div className="sticky bottom-0 z-10 bg-white border-t border-gray-200 p-6 rounded-b-xl shadow-lg">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 inline-flex items-center gap-2 px-6 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3e] transition-colors cursor-pointer font-medium disabled:opacity-50 disabled:cursor-not-allowed text-center justify-center"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="ml-2 animate-spin" />
                      {editPromotion ? "Updating..." : "Creating..."}
                    </>
                  ) : editPromotion ? (
                    "Update Promotion"
                  ) : (
                    "Create Promotion"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddPromotionModal;
