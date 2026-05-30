/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import {
  sendChatMessage,
  startNewChat,
  getUserChatSessions,
  getSessionMessages,
} from "../../services/aiService";
import * as roomService from "../../services/roomService";
import type { RoomType } from "../../types/RoomType";

interface Message {
  id: number;
  type: "user" | "ai";
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

interface User {
  id: string;
  fullName?: string;
  email?: string;
}

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [, setCurrentSessionId] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestions = [
    "Tell me about your room types",
    "What amenities do you offer?",
    "I'd like to book a room",
    "What's your cancellation policy?",
  ];

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const userData = JSON.parse(userStr);
          setUser(userData);
          initializeChat(userData.id);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };

    loadUser();
    loadRoomTypes();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      setHasNewMessage(true);
    }
  }, [messages, isOpen]);

  const initializeChat = async (userId: string) => {
    try {
      const sessions = await getUserChatSessions(userId);

      if (sessions.length === 0) {
        const newSessionId = await startNewChat(userId);
        setCurrentSessionId(newSessionId);
        setMessages([
          {
            id: 1,
            type: "ai",
            content:
              "Hello! I'm Vista's AI concierge. How can I assist you today?",
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        const latestSession = sessions[0];
        setCurrentSessionId(latestSession.sessionId);
        const sessionMessages = await getSessionMessages(
          userId,
          latestSession.sessionId
        );

        const convertedMessages: Message[] = sessionMessages.map(
          (msg, index) => ({
            id: index,
            type: msg.sender === "user" ? "user" : "ai",
            content: msg.content,
            time: new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            roomCards: msg.showRoomCards
              ? convertRoomTypesToCards(roomTypes)
              : undefined,
          })
        );

        setMessages(convertedMessages);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
    }
  };

  const loadRoomTypes = async () => {
    try {
      const types = await roomService.getAllRoomTypes();
      setRoomTypes(types);
    } catch (error) {
      console.error("Error loading room types:", error);
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
      id: type.roomTypeID || "",
      name: type.typeName || "Room",
      features: `${type.maxOccupancy} Guests • ${type.area}m²`,
      price: `${type.basePrice?.toLocaleString("vi-VN")} VND per night`,
      image: typeof type.roomTypeImage === "string" ? type.roomTypeImage : "https://via.placeholder.com/300",
    }));
  };

  const handleChatPage = () => {
    window.location.href = "/chat";
  }
  
  const handleSend = async () => {
    if (inputValue.trim() === "" || !user) return;

    const userMessageContent = inputValue;
    const newMessage: Message = {
      id: Date.now(),
      type: "user",
      content: userMessageContent,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const response = await sendChatMessage(user.id, userMessageContent);
      setIsTyping(false);

      const botMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: response.content,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        roomCards: response.showRoomCards
          ? convertRoomTypesToCards(roomTypes)
          : undefined,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setIsTyping(false);
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: "Sorry, I'm having trouble connecting. Please try again.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const toggleWidget = () => {
    setIsOpen(!isOpen);
    setHasNewMessage(false);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!user) {
    return null; // Don't show widget if user is not logged in
  }

  return (
    <>
      {/* Chat Widget Container */}
      {isOpen && (
        <div
          className={`fixed bottom-25 right-50 sm:right-6 z-[9999] bg-white rounded-2xl shadow-2xl transition-all duration-300 ${
            isMinimized ? "h-16" : "h-[600px]"
          } w-[calc(100vw-2rem)] sm:w-96`}
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Widget Header */}
          <div className="bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <img
                  src="/src/assets/images/logo.png"
                  alt="AI"
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h3 className="font-bold text-sm">Vista AI Assistant</h3>
                <span className="text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMinimize}
                className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <i
                  className={`fa-solid ${
                    isMinimized ? "fa-window-maximize" : "fa-window-minimize"
                  }`}
                ></i>
              </button>
              <button
                onClick={handleChatPage}
                className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-up-right-and-down-left-from-center"></i>
              </button>
              <button
                onClick={toggleWidget}
                className="w-8 h-8 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

          {/* Widget Body */}
          {!isMinimized && (
            <>
              {/* Messages Container */}
              <div
                ref={messagesContainerRef}
                className="h-[calc(100%-140px)] overflow-y-auto p-4 bg-gray-50"
                style={{ scrollBehavior: "smooth" }}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${
                        message.type === "user" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === "ai"
                            ? "bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white"
                            : "bg-gray-400 text-white"
                        }`}
                      >
                        <i
                          className={`fa-solid text-xs ${
                            message.type === "ai" ? "fa-robot" : "fa-user"
                          }`}
                        ></i>
                      </div>
                      <div className="max-w-[75%]">
                        <div
                          className={`p-3 rounded-xl ${
                            message.type === "ai"
                              ? "bg-white shadow-sm"
                              : "bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">
                            {message.content}
                          </p>

                          {/* Room Cards */}
                          {message.roomCards && (
                            <div className="mt-3 space-y-2">
                              {message.roomCards.map((room) => (
                                <div
                                  key={room.id}
                                  className="bg-gray-50 rounded-lg overflow-hidden"
                                >
                                  <img
                                    src={room.image}
                                    alt={room.name}
                                    className="w-full h-24 object-cover"
                                  />
                                  <div className="p-2">
                                    <h4 className="font-bold text-xs text-gray-800">
                                      {room.name}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      {room.features}
                                    </p>
                                    <p className="font-bold text-[#CCBDA3] text-xs mt-1">
                                      {room.price}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 block">
                          {message.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white flex items-center justify-center">
                        <i className="fa-solid fa-robot text-xs"></i>
                      </div>
                      <div className="bg-white p-3 rounded-xl">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-[#CCBDA3] rounded-full animate-bounce"></span>
                          <span
                            className="w-2 h-2 bg-[#CCBDA3] rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></span>
                          <span
                            className="w-2 h-2 bg-[#CCBDA3] rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 2 && (
                <div className="px-4 py-2 bg-white">
                  <div className="flex flex-wrap gap-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => setInputValue(suggestion)}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-[#CCBDA3] hover:text-white rounded-full transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 bg-white rounded-b-2xl">
                <div className="flex items-end gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none text-sm"
                    style={{
                      minHeight: "20px",
                      maxHeight: "80px",
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || isTyping}
                    className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] flex items-center justify-center disabled:opacity-50"
                  >
                    <i className="fa-solid fa-paper-plane text-white text-xs"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={toggleWidget}
        className="fixed bottom-4 right-4 sm:right-6 z-[9999] w-14 h-14 bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group"
        aria-label="Toggle AI Assistant"
      >
        {hasNewMessage && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        )}

        <i
          className={`fa-solid text-xl transition-transform ${
            isOpen ? "fa-times rotate-90" : "fa-comment-dots"
          }`}
        ></i>

        {!isOpen && (
          <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with AI
          </span>
        )}
      </button>

      <style>{`
                @keyframes bounce {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-5px);
                    }
                }
            `}</style>
    </>
  );
};

export default AIChatWidget;
