/* eslint-disable */
import React, { useEffect, useState, useRef } from 'react';
import Header from '../../components/Header';
import {
    sendChatMessage,
    startNewChat,
    getUserChatSessions,
    getSessionMessages,
    deleteChatSession,
    type ChatHistoryItem,
} from '../../services/aiService';
import * as roomService from '../../services/roomService';
import type { RoomType } from '../../types/RoomType';

interface Message {
    id: number;
    type: 'user' | 'ai';
    content: string;
    time: string;
    roomCards?: RoomCard[];
}

interface RoomCard {
    id: string;
    name: string;
    features: string;
    price: string;
    image: string;
}

interface ChatHistory {
    sessionId: string;
    title: string;
    time: string;
    active: boolean;
    messageCount: number;
}

interface User {
    id: string;
    fullName?: string;
    email?: string;
}

const AIConcierge: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(
        null,
    );
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const suggestions = [
        'Tell me about your room types',
        'What amenities do you offer?',
        "I'd like to book a room",
        "What's your cancellation policy?",
    ];

    useEffect(() => {
        const loadUser = () => {
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                    loadChatHistory(userData.id);
                }
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
            }
        };

        loadUser();
        loadRoomTypes();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const loadChatHistory = async (userId: string) => {
        try {
            setLoading(true);
            const sessions = await getUserChatSessions(userId);

            const histories: ChatHistory[] = sessions.map((session) => ({
                sessionId: session.sessionId,
                title: session.title || 'New conversation',
                time: new Date(session.lastMessageTime).toLocaleString(),
                active: false,
                messageCount: session.messageCount,
            }));

            setChatHistories(histories);

            if (histories.length === 0) {
                await handleNewChat();
            } else {
                await loadChatSession(histories[0].sessionId);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);

            await handleNewChat();
        } finally {
            setLoading(false);
        }
    };

    const loadChatSession = async (sessionId: string) => {
        if (!user) return;

        try {
            setLoading(true);
            const sessionMessages = await getSessionMessages(
                user.id,
                sessionId,
            );

            const convertedMessages: Message[] = sessionMessages.map(
                (msg, index) => ({
                    id: index,
                    type: msg.sender === 'user' ? 'user' : 'ai',
                    content: msg.content,
                    time: new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                    roomCards: msg.showRoomCards
                        ? convertRoomTypesToCards(roomTypes)
                        : undefined,
                }),
            );

            setMessages(convertedMessages);
            setCurrentSessionId(sessionId);

            setChatHistories((prev) =>
                prev.map((chat) => ({
                    ...chat,
                    active: chat.sessionId === sessionId,
                })),
            );

            setIsSidebarOpen(false);
        } catch (error) {
            console.error('Error loading chat session:', error);
            alert('Failed to load chat session');
        } finally {
            setLoading(false);
        }
    };

    const loadRoomTypes = async () => {
        try {
            const types = await roomService.getAllRoomTypes();
            setRoomTypes(types);
        } catch (error) {
            console.error('Error loading room types:', error);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            if (messagesContainerRef.current) {
                messagesContainerRef.current.scrollTop =
                    messagesContainerRef.current.scrollHeight;
            }
        }, 100);
    };

    const convertRoomTypesToCards = (types: RoomType[]): RoomCard[] => {
        return types.slice(0, 3).map((type) => ({
            id: type.roomTypeID,
            name: type.typeName,
            features: `${type.maxOccupancy} Guests • ${type.area}m²`,
            price: `${type.basePrice?.toLocaleString('vi-VN')} VND per night`,
            image: type.roomTypeImage || 'https://via.placeholder.com/300',
        }));
    };

    const handleSend = async () => {
        if (inputValue.trim() === '' || !user) {
            console.warn(
                'Cannot send message: user not logged in or empty input',
            );
            return;
        }

        const userMessageContent = inputValue;
        const newMessage: Message = {
            id: Date.now(),
            type: 'user',
            content: userMessageContent,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        try {
            const response = await sendChatMessage(user.id, userMessageContent);

            setIsTyping(false);

            const botMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.content,
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                roomCards: response.showRoomCards
                    ? convertRoomTypesToCards(roomTypes)
                    : undefined,
            };

            setMessages((prev) => [...prev, botMessage]);

            // Update chat history with new message
            if (currentSessionId) {
                setChatHistories((prev) =>
                    prev.map((chat) =>
                        chat.sessionId === currentSessionId
                            ? {
                                  ...chat,
                                  time: 'Just now',
                                  messageCount: chat.messageCount + 2,
                              }
                            : chat,
                    ),
                );
            }
        } catch (error) {
            setIsTyping(false);
            console.error('Error sending chat message:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content:
                    "Sorry, I'm having trouble connecting. Please try again.",
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };
            setMessages((prev) => [...prev, errorMessage]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        textareaRef.current?.focus();
    };

    const handleRoomSelect = async (roomName: string) => {
        if (!user) return;

        const userMessage: Message = {
            id: Date.now(),
            type: 'user',
            content: `I'd like to book the ${roomName}`,
            time: new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsTyping(true);

        try {
            const response = await sendChatMessage(
                user.id,
                `I'd like to book the ${roomName}`,
            );

            setIsTyping(false);

            const botMessage: Message = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.content,
                time: new Date().toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setIsTyping(false);
            console.error('Error:', error);
        }
    };

    const handleNewChat = async () => {
        if (!user) {
            console.warn('Cannot start new chat: user not logged in');
            return;
        }

        try {
            setLoading(true);
            const newSessionId = await startNewChat(user.id);

            setMessages([
                {
                    id: 1,
                    type: 'ai',
                    content:
                        "Hello! I'm Vista's AI concierge. How can I assist you today?",
                    time: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ]);

            const newChat: ChatHistory = {
                sessionId: newSessionId,
                title: 'New conversation',
                time: 'Just now',
                active: true,
                messageCount: 1,
            };

            setChatHistories((prev) => [
                newChat,
                ...prev.map((c) => ({ ...c, active: false })),
            ]);

            setCurrentSessionId(newSessionId);
            setIsSidebarOpen(false);
        } catch (error) {
            console.error('Error starting new chat:', error);
            alert('Failed to start new chat. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChatHistoryClick = async (sessionId: string) => {
        if (sessionId === currentSessionId) {
            setIsSidebarOpen(false);
            return;
        }

        await loadChatSession(sessionId);
    };

    const handleDeleteChat = async (
        sessionId: string,
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.stopPropagation();

        if (!user) return;

        if (
            window.confirm(
                'Are you sure you want to delete this conversation? This cannot be undone.',
            )
        ) {
            try {
                await deleteChatSession(user.id, sessionId);

                setChatHistories((prev) =>
                    prev.filter((chat) => chat.sessionId !== sessionId),
                );

                if (sessionId === currentSessionId) {
                    await handleNewChat();
                }
            } catch (error) {
                console.error('Error deleting chat:', error);
                alert('Failed to delete chat. Please try again.');
            }
        }
    };

    const handleClearHistory = async () => {
        if (!user) return;

        if (
            window.confirm(
                'Are you sure you want to clear all chat history? This cannot be undone.',
            )
        ) {
            try {
                setLoading(true);

                await Promise.all(
                    chatHistories.map((chat) =>
                        deleteChatSession(user.id, chat.sessionId),
                    ),
                );

                await handleNewChat();
            } catch (error) {
                console.error('Error clearing history:', error);
                alert('Failed to clear history. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    if (!user) {
        return (
            <div className="bg-gray-50 min-h-screen">
                <Header />
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-12 text-center">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-md">
                            <i className="fa-solid fa-user-lock text-3xl sm:text-4xl text-white"></i>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                            Authentication Required
                        </h2>
                        <p className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg px-4">
                            Please log in to access Vista's AI Concierge service
                            and get personalized assistance.
                        </p>
                        <a
                            href="/auth/login"
                            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-[#CCBDA3] text-white rounded-lg hover:bg-[#b8ac94] transition-all shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
                        >
                            <i className="fa-solid fa-sign-in-alt"></i>
                            Sign In Now
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#CCBDA3] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading your chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <Header />

            <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-[1600px]">
                {/* Page Title - Hidden on mobile */}
                <div className="text-center mb-4 sm:mb-6 hidden sm:block">
                    <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
                        AI Concierge Assistant
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">
                        Your 24/7 intelligent hotel companion
                    </p>
                </div>

                <div
                    className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden"
                    style={{
                        height: 'calc(100vh - 140px)',
                        minHeight: '500px',
                    }}
                >
                    <div className="flex h-full relative">
                        {/* Mobile Toggle Button */}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="lg:hidden absolute top-3 left-3 z-50 w-10 h-10 bg-[#CCBDA3] text-white rounded-lg shadow-lg flex items-center justify-center"
                            aria-label="Toggle sidebar"
                        >
                            <i
                                className={`fa-solid ${
                                    isSidebarOpen ? 'fa-times' : 'fa-bars'
                                }`}
                            ></i>
                        </button>

                        {/* Sidebar */}
                        <div
                            className={`${
                                isSidebarOpen
                                    ? 'translate-x-0'
                                    : '-translate-x-full'
                            } lg:translate-x-0 fixed lg:relative inset-y-0 left-0 z-40 w-72 sm:w-80 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out`}
                            style={{ height: '100%' }}
                        >
                            <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">
                                    <i className="fa-solid fa-history text-[#CCBDA3] mr-2"></i>
                                    Chat History
                                </h3>
                                <button
                                    onClick={handleNewChat}
                                    disabled={loading}
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Start New Chat
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
                                {chatHistories.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <i className="fa-solid fa-inbox text-4xl mb-2"></i>
                                        <p className="text-sm">
                                            No chat history
                                        </p>
                                    </div>
                                ) : (
                                    chatHistories.map((chat) => (
                                        <div
                                            key={chat.sessionId}
                                            onClick={() =>
                                                handleChatHistoryClick(
                                                    chat.sessionId,
                                                )
                                            }
                                            className={`p-3 sm:p-4 rounded-xl cursor-pointer transition-all group ${
                                                chat.active
                                                    ? 'bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white shadow-md'
                                                    : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                                        <i
                                                            className={`fa-solid fa-comment text-sm sm:text-base ${
                                                                chat.active
                                                                    ? 'text-white'
                                                                    : 'text-[#CCBDA3]'
                                                            }`}
                                                        ></i>
                                                        <span className="font-semibold text-xs sm:text-sm truncate">
                                                            {chat.title}
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`text-xs flex items-center gap-2 ${
                                                            chat.active
                                                                ? 'text-white text-opacity-80'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        <span>{chat.time}</span>
                                                        <span>•</span>
                                                        <span>
                                                            {chat.messageCount}{' '}
                                                            messages
                                                        </span>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) =>
                                                        handleDeleteChat(
                                                            chat.sessionId,
                                                            e,
                                                        )
                                                    }
                                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg ${
                                                        chat.active
                                                            ? 'hover:bg-white hover:bg-opacity-20'
                                                            : 'hover:bg-red-50'
                                                    }`}
                                                >
                                                    <i
                                                        className={`fa-solid fa-trash text-sm ${
                                                            chat.active
                                                                ? 'text-white'
                                                                : 'text-red-500 hover:text-red-600'
                                                        }`}
                                                    ></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-3 sm:p-4 border-t border-gray-200 bg-white">
                                <button
                                    onClick={handleClearHistory}
                                    disabled={
                                        loading || chatHistories.length === 0
                                    }
                                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base disabled:opacity-50"
                                >
                                    <i className="fa-solid fa-trash-alt"></i>
                                    <span className="hidden sm:inline">
                                        Clear All History
                                    </span>
                                    <span className="sm:hidden">
                                        Clear History
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Overlay for mobile */}
                        {isSidebarOpen && (
                            <div
                                className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                                onClick={() => setIsSidebarOpen(false)}
                            ></div>
                        )}

                        {/* Main Chat Area */}
                        <div className="flex-1 flex flex-col min-w-0">
                            {/* Chat Header */}
                            <div className="p-3 sm:p-5 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-2 sm:gap-4 ml-12 lg:ml-0">
                                    <div className="w-12 h-12 sm:w-15 sm:h-15 mx-auto bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] rounded-full flex items-center justify-center shadow-lg">
                                        <img
                                            src="../../../src/assets/images/logo.png"
                                            alt="robot icon"
                                            className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                                        />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-sm sm:text-lg text-gray-800">
                                            Vista AI Concierge
                                        </h3>
                                        <span className="text-xs sm:text-sm text-green-600 flex items-center gap-1 sm:gap-2">
                                            <span className="relative flex h-2 w-2 sm:h-3 sm:w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-full w-full bg-green-500"></span>
                                            </span>
                                            <span className="hidden sm:inline">
                                                Online & Ready
                                            </span>
                                            <span className="sm:hidden">
                                                Online
                                            </span>
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center">
                                        <i className="fa-solid fa-ellipsis-v text-gray-600 text-sm sm:text-base"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Messages Container */}
                            <div
                                ref={messagesContainerRef}
                                className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-white"
                                style={{
                                    scrollBehavior: 'smooth',
                                    overflowAnchor: 'auto',
                                }}
                            >
                                {/* Welcome Card */}
                                {messages.length === 1 && (
                                    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl p-6 sm:p-10 text-center mb-4 sm:mb-6 shadow-lg border border-gray-100">
                                        <div className="mb-4 sm:mb-6">
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] rounded-full flex items-center justify-center shadow-lg">
                                                <img
                                                    src="../../../src/assets/images/logo.png"
                                                    alt="logo"
                                                    className="w-8 h-8 sm:w-12 sm:h-12 object-contain"
                                                />
                                            </div>
                                        </div>
                                        <h2 className="text-xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] mb-3 sm:mb-4">
                                            Welcome to Vista AI Concierge
                                        </h2>
                                        <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-lg leading-relaxed px-4">
                                            I'm your personal AI assistant,
                                            powered by advanced AI technology. I
                                            can help you with room bookings,
                                            hotel information, amenities, and
                                            answer any questions you may have.
                                        </p>
                                    </div>
                                )}

                                {/* Messages */}
                                <div className="space-y-4 sm:space-y-6">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex gap-2 sm:gap-4 animate-fade-in ${
                                                message.type === 'user'
                                                    ? 'flex-row-reverse'
                                                    : ''
                                            }`}
                                        >
                                            <div
                                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                                                    message.type === 'ai'
                                                        ? 'bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white'
                                                        : 'bg-gradient-to-br from-gray-400 to-gray-500 text-white'
                                                }`}
                                            >
                                                <i
                                                    className={`fa-solid text-xs sm:text-sm ${
                                                        message.type === 'ai'
                                                            ? 'fa-robot'
                                                            : 'fa-user'
                                                    }`}
                                                ></i>
                                            </div>
                                            <div
                                                className={`max-w-[85%] sm:max-w-[75%] ${
                                                    message.type === 'user'
                                                        ? 'items-end'
                                                        : ''
                                                }`}
                                            >
                                                <div
                                                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm ${
                                                        message.type === 'ai'
                                                            ? 'bg-white border border-gray-100'
                                                            : 'bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white'
                                                    }`}
                                                >
                                                    <p className="whitespace-pre-line leading-relaxed text-sm sm:text-base">
                                                        {message.content}
                                                    </p>

                                                    {/* Room Cards */}
                                                    {message.roomCards && (
                                                        <div className="flex gap-3 sm:gap-4 overflow-x-auto py-3 sm:py-4 mt-3 sm:mt-4 -mx-2 px-2 snap-x snap-mandatory">
                                                            {message.roomCards.map(
                                                                (room) => (
                                                                    <div
                                                                        key={
                                                                            room.id
                                                                        }
                                                                        className="min-w-[240px] sm:min-w-[280px] bg-gradient-to-b from-gray-50 to-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100 snap-start"
                                                                    >
                                                                        <div className="h-32 sm:h-40 overflow-hidden relative group">
                                                                            <img
                                                                                src={
                                                                                    room.image
                                                                                }
                                                                                alt={
                                                                                    room.name
                                                                                }
                                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                            />
                                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                                        </div>
                                                                        <div className="p-4 sm:p-5">
                                                                            <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">
                                                                                {
                                                                                    room.name
                                                                                }
                                                                            </h4>
                                                                            <p className="text-xs sm:text-sm text-gray-600 mb-3 flex items-center gap-2">
                                                                                <i className="fa-solid fa-info-circle text-[#CCBDA3]"></i>
                                                                                {
                                                                                    room.features
                                                                                }
                                                                            </p>
                                                                            <p className="font-bold text-[#CCBDA3] mb-3 sm:mb-4 text-base sm:text-lg">
                                                                                {
                                                                                    room.price
                                                                                }
                                                                            </p>
                                                                            <button
                                                                                onClick={() =>
                                                                                    handleRoomSelect(
                                                                                        room.name,
                                                                                    )
                                                                                }
                                                                                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm sm:text-base"
                                                                            >
                                                                                <i className="fa-solid fa-check-circle mr-2"></i>
                                                                                Select
                                                                                Room
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className={`text-xs text-gray-500 mt-1 sm:mt-2 block ${
                                                        message.type === 'user'
                                                            ? 'text-right'
                                                            : ''
                                                    }`}
                                                >
                                                    {message.time}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Typing Indicator */}
                                    {isTyping && (
                                        <div className="flex gap-2 sm:gap-4 animate-fade-in">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                                <i className="fa-solid fa-robot text-xs sm:text-sm"></i>
                                            </div>
                                            <div className="bg-white border border-gray-100 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm">
                                                <div className="flex gap-1.5">
                                                    <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#CCBDA3] rounded-full animate-bounce"></span>
                                                    <span
                                                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#CCBDA3] rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '0.1s',
                                                        }}
                                                    ></span>
                                                    <span
                                                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#CCBDA3] rounded-full animate-bounce"
                                                        style={{
                                                            animationDelay:
                                                                '0.2s',
                                                        }}
                                                    ></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div ref={messagesEndRef} className="h-4" />
                            </div>

                            {/* Suggestions */}
                            {messages.length <= 2 && (
                                <div className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200">
                                    <div className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-semibold flex items-center gap-2">
                                        <i className="fa-solid fa-lightbulb text-[#CCBDA3]"></i>
                                        <span className="hidden sm:inline">
                                            Quick suggestions:
                                        </span>
                                        <span className="sm:hidden">
                                            Suggestions:
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestions.map(
                                            (suggestion, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            suggestion,
                                                        )
                                                    }
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-full text-xs sm:text-sm hover:from-[#CCBDA3] hover:to-[#b8ac94] hover:text-white hover:border-transparent transition-all shadow-sm hover:shadow-md font-medium"
                                                >
                                                    {suggestion}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Input Area */}
                            <div className="p-3 sm:p-6 border-t border-gray-200 bg-white safe-area-padding-bottom">
                                <div className="flex items-end gap-2 sm:gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 focus-within:border-[#CCBDA3] focus-within:ring-2 sm:focus-within:ring-4 focus-within:ring-[#CCBDA3] focus-within:ring-opacity-10 transition-all">
                                    <textarea
                                        ref={textareaRef}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your message..."
                                        rows={1}
                                        className="flex-1 bg-transparent border-none outline-none resize-none py-1 sm:py-2 text-sm sm:text-base text-gray-800 placeholder-gray-400"
                                        style={{
                                            minHeight: '20px',
                                            maxHeight: '100px',
                                            lineHeight: '1.5',
                                        }}
                                    />
                                    <button
                                        onClick={handleSend}
                                        disabled={
                                            !inputValue.trim() || isTyping
                                        }
                                        className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                    >
                                        <i className="fa-solid fa-paper-plane text-white text-sm sm:text-base"></i>
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 text-center mt-2 hidden sm:block">
                                    Press{' '}
                                    <kbd className="px-2 py-0.5 bg-gray-100 rounded">
                                        Enter
                                    </kbd>{' '}
                                    to send •{' '}
                                    <kbd className="px-2 py-0.5 bg-gray-100 rounded">
                                        Shift + Enter
                                    </kbd>{' '}
                                    for new line
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section - Hidden on mobile */}
                <div className="mt-8 sm:mt-12 hidden md:block">
                    <h2 className="text-3xl sm:text-4xl font-bold text-center mb-2 sm:mb-3 text-gray-800">
                        Why Choose Our AI Concierge?
                    </h2>
                    <p className="text-center text-gray-600 mb-8 sm:mb-10 text-base sm:text-lg">
                        Powered by advanced AI technology for the best
                        hospitality experience
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        {[
                            {
                                icon: 'fa-clock',
                                title: '24/7 Availability',
                                desc: 'Round-the-clock assistance for all your hotel inquiries, anytime, anywhere.',
                            },
                            {
                                icon: 'fa-language',
                                title: 'Multilingual Support',
                                desc: 'Communicate in your preferred language with intelligent translation.',
                            },
                            {
                                icon: 'fa-shield-alt',
                                title: 'Secure & Private',
                                desc: 'End-to-end encryption ensures your conversations remain confidential.',
                            },
                            {
                                icon: 'fa-brain',
                                title: 'Smart Assistance',
                                desc: 'AI-powered responses that understand context and provide accurate information.',
                            },
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center shadow-lg hover:shadow-xl transition-all border border-gray-100 group"
                            >
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md group-hover:scale-110 transition-transform">
                                    <i
                                        className={`fa-solid ${feature.icon} text-2xl sm:text-3xl text-white`}
                                    ></i>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-gray-800">
                                    {feature.title}
                                </h3>
                                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        @media (min-width: 640px) {
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #CCBDA3;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #b8ac94;
        }

        /* Smooth scrolling */
        * {
          scroll-behavior: smooth;
        }

        /* Safe area for iOS notch/home indicator */
        .safe-area-padding-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Prevent zoom on input focus (iOS) */
        @media screen and (max-width: 640px) {
          input[type="text"],
          textarea {
            font-size: 16px !important;
          }
        }

        /* Snap scroll for room cards */
        .snap-x {
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }

        .snap-start {
          scroll-snap-align: start;
        }

        /* Disable pull-to-refresh on mobile */
        body {
          overscroll-behavior-y: contain;
        }
      `}</style>
        </div>
    );
};

export default AIConcierge;
