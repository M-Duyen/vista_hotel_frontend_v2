/* eslint-disable */
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaTimes, FaSave } from 'react-icons/fa';

import TinyMCE from './TinyMCE';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from '../common/Select';

import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { createNews } from '../../services/newsService';
import { useToastContext } from '../../hooks/useToastContext';

interface AddInfoFormProps {
    open: boolean; // 🟢 thêm để điều khiển mở modal
    onClose: () => void;
    onSuccess?: () => void;
    onError?: (msg: string) => void;
}

const AddNewsForm: React.FC<AddInfoFormProps> = ({
    open,
    onClose,
    onSuccess,
    onError,
}) => {
    const toast = useToastContext();

    // REFS FOR SCROLL + FOCUS
    const titleRef = useRef<HTMLInputElement>(null);
    const typeRef = useRef<HTMLDivElement>(null);
    const subtitleRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    let tinyInstance: any = null;

    const [formData, setFormData] = useState({
        title: '',
        type: 'NEWS',
        status: 'published',
        subtitle: '',
        content: '',
        featuredImage: null as File | null,
        startDate: '',
        endDate: '',
    });

    const [errors, setErrors] = useState({
        title: '',
        subtitle: '',
        content: '',
        startDate: '',
        endDate: '',
        image: '',
    });

    const [charCount, setCharCount] = useState({ subtitle: 0 });
    const [featuredImagePreview, setFeaturedImagePreview] = useState<
        string | null
    >(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // INPUT CHANGE
    const handleInputChange = (e: any) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'subtitle') {
            setCharCount({ subtitle: value.length });
        }
    };

    const handleContentChange = (content: string, editor?: any) => {
        tinyInstance = editor;
        setFormData((prev) => ({ ...prev, content }));
    };

    const handleFeaturedImageChange = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, featuredImage: file }));

            setFeaturedImagePreview(URL.createObjectURL(file));
        }
    };

    // VALIDATE
    const validateForm = () => {
        const newErr: any = {};

        if (!formData.title.trim()) newErr.title = 'Title is required';
        if (!formData.subtitle.trim()) newErr.subtitle = 'Subtitle is required';
        if (!formData.content.trim()) newErr.content = 'Content is required';

        if (formData.type !== 'NEWS') {
            if (!formData.startDate)
                newErr.startDate = 'Start date is required';
            if (!formData.endDate) newErr.endDate = 'End date is required';

            if (
                formData.startDate &&
                formData.endDate &&
                new Date(formData.startDate) >= new Date(formData.endDate)
            ) {
                newErr.endDate = 'End date must be greater than start date';
            }
        }

        if (!formData.featuredImage)
            newErr.image = 'Featured image is required';

        setErrors(newErr);

        if (Object.keys(newErr).length > 0) scrollAndFocus(newErr);
        return Object.keys(newErr).length === 0;
    };

    // SCROLL + FOCUS
    const scrollAndFocus = (errObj: any) => {
        const scrollTo = (element: HTMLElement | null) => {
            if (!element) return;
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => element.focus(), 300);
        };

        if (errObj.title) return scrollTo(titleRef.current);
        if (errObj.subtitle) return scrollTo(subtitleRef.current);
        if (errObj.startDate) return scrollTo(startDateRef.current);
        if (errObj.endDate) return scrollTo(endDateRef.current);

        if (errObj.content) {
            contentRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            setTimeout(() => tinyInstance?.focus(), 300);
            return;
        }

        if (errObj.image) {
            imageRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
            imageRef.current?.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => {
                imageRef.current?.classList.remove('ring-2', 'ring-red-500');
            }, 1500);
        }
    };

    // SUBMIT
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            let featuredImageUrl = '';

            if (formData.featuredImage) {
                const uploaded = await uploadImageToCloudinary(
                    formData.featuredImage,
                );
                featuredImageUrl = uploaded.secure_url;
            }

            const payload: any = {
                title: formData.title,
                subtitle: formData.subtitle,
                content: formData.content,
                imageUrl: featuredImageUrl,
                createdAt: new Date().toISOString(),
                highlight: formData.status === 'published',
                type: formData.type,
            };

            if (formData.type !== 'NEWS') {
                payload.startDate = formData.startDate;
                payload.endDate = formData.endDate;
            }

            const res = await createNews(payload);

            if (res?.id || res?._id) {
                onSuccess?.();
                setTimeout(() => onClose(), 500);
            } else {
                onError?.('Failed to create news!');
            }
        } catch (error) {
            onError?.('Server error!');
        } finally {
            setIsSubmitting(false);
        }
    };

    // UI
    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* BACKDROP */}
                    <motion.div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* MODAL */}
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center px-4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                    >
                        <div
                            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl p-6 overflow-y-auto max-h-[90vh] border border-[#F5F0EB]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* HEADER */}
                            <div className="grid grid-cols-3 items-center mb-4">
                                <div></div>

                                <h2 className="text-4xl text-center font-serif mt-4 col-span-1">
                                    ADD NEWS
                                </h2>

                                <div className="flex justify-end">
                                    <button
                                        onClick={onClose}
                                        className="text-gray-600 hover:text-black"
                                    >
                                        <FaTimes size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* FORM */}
                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* BASIC INFO */}
                                <div className="space-y-4 pb-6 border-b border-[#F5F0EB]">
                                    <h3 className="text-xl font-semibold">
                                        Basic Information
                                    </h3>

                                    {/* TYPE */}
                                    <div ref={typeRef}>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Type *
                                        </label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(v) =>
                                                setFormData((p) => ({
                                                    ...p,
                                                    type: v,
                                                }))
                                            }
                                        >
                                            <SelectTrigger />
                                            <SelectContent>
                                                <SelectItem value="NEWS">
                                                    News
                                                </SelectItem>
                                                <SelectItem value="EVENT">
                                                    Event
                                                </SelectItem>
                                                <SelectItem value="PROMOTION">
                                                    Promotion
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* TITLE */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Title *
                                        </label>
                                        <input
                                            ref={titleRef}
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-2xl bg-white ${
                                                errors.title
                                                    ? 'border-red-500'
                                                    : 'border-[#F5F0EB]'
                                            }`}
                                        />
                                        {errors.title && (
                                            <p className="text-red-500 text-sm">
                                                {errors.title}
                                            </p>
                                        )}
                                    </div>

                                    {/* STATUS */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Status
                                        </label>
                                        <Select
                                            value={formData.status}
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    status: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger />
                                            <SelectContent>
                                                <SelectItem value="published">
                                                    Published
                                                </SelectItem>
                                                <SelectItem value="draft">
                                                    Draft
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* DATES */}
                                    {formData.type !== 'NEWS' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block mb-2 text-sm font-semibold">
                                                    Start Date *
                                                </label>
                                                <input
                                                    ref={startDateRef}
                                                    type="datetime-local"
                                                    name="startDate"
                                                    value={formData.startDate}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border-2 rounded-2xl bg-white ${
                                                        errors.startDate
                                                            ? 'border-red-500'
                                                            : 'border-[#F5F0EB]'
                                                    }`}
                                                />
                                                {errors.startDate && (
                                                    <p className="text-red-500 text-sm">
                                                        {errors.startDate}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block mb-2 text-sm font-semibold">
                                                    End Date *
                                                </label>
                                                <input
                                                    ref={endDateRef}
                                                    type="datetime-local"
                                                    name="endDate"
                                                    value={formData.endDate}
                                                    onChange={handleInputChange}
                                                    className={`w-full px-4 py-3 border-2 rounded-2xl bg-white ${
                                                        errors.endDate
                                                            ? 'border-red-500'
                                                            : 'border-[#F5F0EB]'
                                                    }`}
                                                />
                                                {errors.endDate && (
                                                    <p className="text-red-500 text-sm">
                                                        {errors.endDate}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* CONTENT */}
                                <div className="space-y-4 pb-6 border-b border-[#F5F0EB]">
                                    <h3 className="text-xl font-semibold">
                                        Content
                                    </h3>

                                    {/* SUBTITLE */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Subtitle *
                                        </label>
                                        <input
                                            ref={subtitleRef}
                                            type="text"
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 border-2 rounded-2xl bg-white ${
                                                errors.subtitle
                                                    ? 'border-red-500'
                                                    : 'border-[#F5F0EB]'
                                            }`}
                                        />
                                        {errors.subtitle && (
                                            <p className="text-red-500 text-sm">
                                                {errors.subtitle}
                                            </p>
                                        )}
                                    </div>

                                    {/* TINYMCE */}
                                    <div ref={contentRef}>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Full Content *
                                        </label>

                                        <TinyMCE
                                            initialValue=""
                                            onChange={handleContentChange}
                                        />

                                        {errors.content && (
                                            <p className="text-red-500 text-sm">
                                                {errors.content}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* IMAGE UPLOAD */}
                                <div ref={imageRef} className="space-y-4">
                                    <h3 className="text-xl font-semibold">
                                        Featured Image *
                                    </h3>

                                    <div
                                        className={`border-2 border-dashed p-8 rounded-2xl text-center cursor-pointer ${
                                            errors.image
                                                ? 'border-red-500'
                                                : 'border-[#F5F0EB]'
                                        }`}
                                        onClick={() =>
                                            imageInputRef.current?.click()
                                        }
                                    >
                                        <FaCloudUploadAlt className="text-4xl mx-auto mb-3" />
                                        <p className="font-semibold">
                                            Click to upload
                                        </p>

                                        <input
                                            ref={imageInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFeaturedImageChange}
                                        />
                                    </div>

                                    {errors.image && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.image}
                                        </p>
                                    )}

                                    {featuredImagePreview && (
                                        <img
                                            src={featuredImagePreview}
                                            className="w-full h-48 object-cover rounded-2xl shadow mt-4"
                                        />
                                    )}
                                </div>

                                {/* BUTTONS */}
                                <div className="flex justify-end gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-6 py-3 border border-black rounded-2xl hover:bg-black hover:text-white"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-900"
                                    >
                                        {isSubmitting
                                            ? 'Publishing...'
                                            : 'Publish News'}
                                        <FaSave className="inline ml-2" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddNewsForm;
