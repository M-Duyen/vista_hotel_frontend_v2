/* eslint-disable */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaSave, FaCloudUploadAlt } from 'react-icons/fa';
import TinyMCE from './TinyMCE';

import { uploadImageToCloudinary } from '../../services/cloudinaryService';
import { updateNews } from '../../services/newsService';

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
} from '../common/Select';

import type { News } from '../../types/News';

interface EditNewsModalProps {
    open: boolean;
    onClose: () => void;
    news: News | null;
    onUpdated: () => void;
    onError?: (msg: string) => void;
}

const EditNewsModal: React.FC<EditNewsModalProps> = ({
    open,
    onClose,
    news,
    onUpdated,
    onError,
}) => {
    const [formData, setFormData] = useState<News | null>(null);
    const [loading, setLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // REFS FOR SCROLL + FOCUS
    const titleRef = useRef<HTMLInputElement>(null);
    const subtitleRef = useRef<HTMLInputElement>(null);
    const startDateRef = useRef<HTMLInputElement>(null);
    const endDateRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    let tinyInstance: any = null;

    const [errors, setErrors] = useState({
        title: '',
        subtitle: '',
        content: '',
        startDate: '',
        endDate: '',
        imageUrl: '', // NEW
    });

    useEffect(() => {
        if (news) {
            setFormData({ ...news });
            setPreviewImage(news.imageUrl || null);
        }
    }, [news]);

    if (!open || !formData) return null;

    // CHANGE INPUT
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData((prev) => ({
            ...prev!,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleContentChange = (value: string, editor?: any) => {
        tinyInstance = editor;
        setFormData((prev) => ({ ...prev!, content: value }));
    };

    // VALIDATION
    const validateForm = () => {
        const newErr: any = {};

        if (!formData.title.trim()) newErr.title = 'Title is required';
        if (!formData.subtitle.trim()) newErr.subtitle = 'Subtitle is required';
        if (!formData.content.trim()) newErr.content = 'Content is required';

        if (!formData.startDate) newErr.startDate = 'Start date required';
        if (!formData.endDate) newErr.endDate = 'End date required';

        if (
            formData.startDate &&
            formData.endDate &&
            new Date(formData.startDate) >= new Date(formData.endDate)
        ) {
            newErr.endDate = 'End date must be greater than start date';
        }

        // IMAGE VALIDATION
        if (!formData.imageUrl) {
            newErr.imageUrl = 'Vui lòng chọn hình ảnh!';
        }

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

        // IMAGE SCROLL
        if (errObj.imageUrl) {
            const imgBox = document.getElementById('editFeatureImgBox');
            if (imgBox) {
                imgBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                imgBox.classList.add('ring-2', 'ring-red-500');

                setTimeout(() => {
                    imgBox.classList.remove('ring-2', 'ring-red-500');
                }, 1500);
            }
        }
    };

    // IMAGE UPLOAD
    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        if (!e.target.files?.[0]) return;
        const file = e.target.files[0];

        setPreviewImage(URL.createObjectURL(file));

        try {
            const uploaded = await uploadImageToCloudinary(file);
            setFormData((prev) => ({
                ...prev!,
                imageUrl: uploaded.secure_url,
            }));
        } catch (err) {
            onError?.('Không thể upload hình ảnh!');
        }
    };

    // SUBMIT
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);

        try {
            await updateNews(formData.newsId, formData);

            onUpdated();
            onClose();
        } catch (error) {
            console.error('Update error:', error);
            onError?.('Cập nhật thất bại!');
        } finally {
            setLoading(false);
        }
    };

    // UI
    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

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
                                    EDIT NEWS
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

                                    {/* Title */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Title *
                                        </label>
                                        <input
                                            ref={titleRef}
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
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

                                    {/* Status */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Status
                                        </label>
                                        <Select
                                            value={
                                                formData.highlight
                                                    ? 'published'
                                                    : 'draft'
                                            }
                                            onValueChange={(value) =>
                                                setFormData((prev) => ({
                                                    ...prev!,
                                                    highlight:
                                                        value === 'published',
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block mb-2 text-sm font-semibold">
                                                Start Date *
                                            </label>
                                            <input
                                                ref={startDateRef}
                                                type="datetime-local"
                                                name="startDate"
                                                value={
                                                    formData.startDate?.slice(
                                                        0,
                                                        16,
                                                    ) || ''
                                                }
                                                onChange={handleChange}
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
                                                value={
                                                    formData.endDate?.slice(
                                                        0,
                                                        16,
                                                    ) || ''
                                                }
                                                onChange={handleChange}
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
                                </div>

                                {/* CONTENT */}
                                <div className="space-y-4 pb-6 border-b border-[#F5F0EB]">
                                    <h3 className="text-xl font-semibold">
                                        Content
                                    </h3>

                                    {/* Subtitle */}
                                    <div>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Subtitle *
                                        </label>
                                        <input
                                            ref={subtitleRef}
                                            type="text"
                                            name="subtitle"
                                            value={formData.subtitle}
                                            onChange={handleChange}
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

                                    {/* TinyMCE */}
                                    <div ref={contentRef}>
                                        <label className="block mb-2 text-sm font-semibold">
                                            Full Content *
                                        </label>

                                        <TinyMCE
                                            initialValue={formData.content}
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
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">
                                        Featured Image *
                                    </h3>

                                    <div
                                        id="editFeatureImgBox"
                                        className={`border-2 border-dashed p-8 rounded-2xl text-center cursor-pointer 
                                            ${
                                                errors.imageUrl
                                                    ? 'border-red-500'
                                                    : 'border-[#F5F0EB]'
                                            }`}
                                        onClick={() =>
                                            document
                                                .getElementById(
                                                    'editFeatureImg',
                                                )
                                                ?.click()
                                        }
                                    >
                                        <FaCloudUploadAlt className="text-4xl mx-auto mb-3" />
                                        <p className="font-semibold">
                                            Click to upload
                                        </p>

                                        <input
                                            id="editFeatureImg"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </div>

                                    {errors.imageUrl && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {errors.imageUrl}
                                        </p>
                                    )}

                                    {previewImage && (
                                        <img
                                            src={previewImage}
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
                                        disabled={loading}
                                        className="px-8 py-3 bg-black text-white rounded-2xl hover:bg-gray-900"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
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

export default EditNewsModal;