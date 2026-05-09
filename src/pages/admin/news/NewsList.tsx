/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaPlus,
    FaSearch,
    FaTag,
    FaCalendarAlt,
    FaEye,
    FaEyeSlash,
} from 'react-icons/fa';

import { getAll } from '../../../services/newsService';
import type { NewsItem } from '../../../types/News';
import EditNewsModal from '../../../components/news/EditNewsModal';
import PageHeader from '../../../components/news/PageHeader';
import StatCard from '../../../components/news/StatCard';
import InfoCard from '../../../components/news/NewsCard';
import AddInfoForm from '../../../components/news/AddNewsModal';
import { Dialog } from '../../../components/news/Dialog';
import { useToastContext } from '../../../hooks/useToastContext';

const NewsList: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToastContext();

    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [filteredList, setFilteredList] = useState<NewsItem[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('lastUpdated');
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleEditItem = (item: NewsItem) => {
        setSelectedNews(item);
        setIsEditModalOpen(true);
    };

    // Load API
    const fetchData = async () => {
        try {
            const data = await getAll();
            setNewsList(data);
            setFilteredList(data);
        } catch (error) {
            toast.error('Không thể tải danh sách tin tức');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Hàm sort theo loại tin
    const getSortableDate = (n: NewsItem) => {
        if (n.type === 'NEWS') return new Date(n.createdAt).getTime();
        if (n.startDate) return new Date(n.startDate).getTime();
        return 0;
    };

    // Lọc & sắp xếp
    useEffect(() => {
        let filtered = [...newsList];

        // Search
        if (searchTerm) {
            filtered = filtered.filter(
                (n) =>
                    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    n.subtitle.toLowerCase().includes(searchTerm.toLowerCase()),
            );
        }

        // Category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter((n) => n.type === selectedCategory);
        }

        // Sort
        switch (sortBy) {
            case 'title':
                filtered.sort((a, b) => a.title.localeCompare(b.title));
                break;

            case 'oldest':
                filtered.sort(
                    (a, b) => getSortableDate(a) - getSortableDate(b),
                );
                break;

            default:
                filtered.sort(
                    (a, b) => getSortableDate(b) - getSortableDate(a),
                );
        }

        setFilteredList(filtered);
    }, [searchTerm, selectedCategory, sortBy, newsList]);

    // Đếm sự kiện sắp diễn ra
    const upcomingEvents = newsList.filter(
        (n) =>
            (n.type === 'EVENT' || n.type === 'PROMOTION') &&
            n.startDate &&
            new Date(n.startDate) > new Date(),
    );

    return (
        <div className="p-6 space-y-8">
            <PageHeader
                title="News Management"
                buttonText="Add New"
                buttonIcon={<FaPlus />}
                onButtonClick={() => setIsAddModalOpen(true)}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<FaTag className="text-gold" />}
                    iconBgColor="bg-gold/10"
                    value={newsList.length.toString()}
                    label="Total Items"
                />
                <StatCard
                    icon={<FaEye className="text-blue-500" />}
                    iconBgColor="bg-blue-500/10"
                    value={newsList
                        .filter((n) => n.highlight)
                        .length.toString()}
                    label="Highlighted"
                />
                <StatCard
                    icon={<FaCalendarAlt className="text-green-600" />}
                    iconBgColor="bg-green-600/10"
                    value={upcomingEvents.length.toString()}
                    label="Upcoming Events"
                />
                <StatCard
                    icon={<FaEyeSlash className="text-pink-500" />}
                    iconBgColor="bg-pink-500/10"
                    value="0"
                    label="Archived"
                />
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-cream focus:border-gold focus:ring focus:ring-gold/20 outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="w-full md:w-44">
                        <label className="block text-sm text-gray-500 mb-1">
                            Category:
                        </label>
                        <select
                            className="w-full p-2.5 rounded-lg border border-cream focus:border-gold focus:ring focus:ring-gold/20 outline-none"
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)
                            }
                        >
                            <option value="all">All</option>
                            <option value="NEWS">News</option>
                            <option value="EVENT">Events</option>
                            <option value="PROMOTION">Promotions</option>
                        </select>
                    </div>

                    {/* Sort */}
                    <div className="w-full md:w-44">
                        <label className="block text-sm text-gray-500 mb-1">
                            Sort By:
                        </label>
                        <select
                            className="w-full p-2.5 rounded-lg border border-cream focus:border-gold focus:ring focus:ring-gold/20 outline-none"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="lastUpdated">Last Updated</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredList.map((item) => (
                    <InfoCard
                        key={item.newsId}
                        item={{
                            id: item.newsId,
                            title: item.title,
                            category: item.type,
                            status: item.highlight ? 'published' : 'draft',
                            preview: item.subtitle,
                            image: item.imageUrl,
                            updatedDate: new Date(
                                item.createdAt,
                            ).toLocaleDateString(),
                            views: 0,
                        }}
                        onDelete={() => console.log('delete', item.newsId)}
                        onEdit={() => handleEditItem(item)}
                        onView={() => navigate(`/admin/info/${item.newsId}`)}
                    />
                ))}
            </div>

            {filteredList.length === 0 && (
                <div className="text-center py-12 bg-light/50 rounded-lg">
                    <h3 className="text-xl font-playfair mb-2">
                        No items found
                    </h3>
                    <p className="text-gray-500">Try adjusting your search</p>
                </div>
            )}

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <AddInfoForm
                    open={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        toast.success('Created successfully!');
                        fetchData();
                    }}
                    onError={(msg) => toast.error(msg)}
                />
            </Dialog>

            {/* Edit Modal */}
            <EditNewsModal
                open={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                news={selectedNews}
                onUpdated={() => {
                    toast.success('Updated successfully!');
                    fetchData();
                }}
                onError={(msg) => toast.error(msg)}
            />
        </div>
    );
};

export default NewsList;
