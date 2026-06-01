/* eslint-disable */
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  uiType?: string;
  uiData?: any;
  intent?: string;
  bookingDraft?: any;
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
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [, setCurrentSessionId] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [selectedBookingType, setSelectedBookingType] = useState<"DAILY" | "HOURLY">("DAILY");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [durationHours, setDurationHours] = useState(3);
  const [guestCount, setGuestCount] = useState(1);

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

  const asList = (value: any, key: string): any[] => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.[key])) return value[key];
    return [];
  };

  const formatCurrency = (value: any) => {
    const amount = Number(value);
    return Number.isFinite(amount) ? `${amount.toLocaleString("vi-VN")} VND` : "";
  };

  const showLocalAiMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        type: "ai",
        content,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const validateDateSelection = (bookingType?: string): string | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inDate = checkInDate ? new Date(checkInDate) : null;
    const outDate = checkOutDate ? new Date(checkOutDate) : null;

    if (!inDate || Number.isNaN(inDate.getTime())) {
      return "Vui lòng chọn ngày nhận phòng hợp lệ.";
    }
    if (inDate < today) {
      return "Ngày nhận phòng không được nằm trong quá khứ.";
    }
    if (!Number.isFinite(guestCount) || guestCount < 1) {
      return "Số khách phải từ 1 trở lên.";
    }
    if (bookingType === "HOURLY") {
      if (!Number.isFinite(durationHours) || durationHours < 1) {
        return "Số giờ thuê phải từ 1 giờ trở lên.";
      }
      return null;
    }
    if (!outDate || Number.isNaN(outDate.getTime())) {
      return "Vui lòng chọn ngày trả phòng hợp lệ.";
    }
    if (outDate <= inDate) {
      return "Ngày trả phòng phải sau ngày nhận phòng.";
    }
    return null;
  };

  const handleChatPage = () => {
    window.location.href = "/chat";
  }

  const sendDirectMessage = async (content: string) => {
    if (content.trim() === "" || !user) return;

    const userMessageContent = content.trim();
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

      if (response.uiType === "SERVICE_LIST") {
        setSelectedServices([]);
      }
      if (response.uiType === "DATE_PICKER" && response.uiData?.bookingType) {
        setSelectedBookingType(response.uiData.bookingType);
        setCheckInDate(response.bookingDraft?.checkInDate || "");
        setCheckOutDate(response.bookingDraft?.checkOutDate || "");
        setCheckInTime(response.bookingDraft?.checkInTime || "14:00");
        setDurationHours(response.bookingDraft?.durationHours || 3);
        setGuestCount(response.bookingDraft?.guests || response.uiData?.guests || 1);
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        type: "ai",
        content: response.content,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        roomCards: response.showRoomCards && (!response.uiType || response.uiType === "ROOM_GRID")
          ? convertRoomTypesToCards(roomTypes)
          : undefined,
        uiType: response.uiType,
        uiData: response.uiData,
        intent: response.intent,
        bookingDraft: response.bookingDraft,
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

  const handleSend = async () => {
    await sendDirectMessage(inputValue);
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

  const renderRichContent = (message: Message) => {
    if (message.type !== "ai" || !message.uiType) return null;

    if (message.uiType === "ROOM_GRID" && message.uiData) {
      return (
        <div className="mt-3 space-y-2">
          {asList(message.uiData, "rooms").map((room: any) => {
            const roomName = room.typeName || room.roomTypeName || room.name || `Phòng ${room.roomNumber || ""}`;
            return (
              <div
                key={room.roomId || room.roomID || room.roomTypeID || room.roomNumber || roomName}
                className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
              >
                {(room.roomTypeImage || room.image) && (
                  <img
                    src={room.roomTypeImage || room.image}
                    alt={roomName}
                    className="w-full h-24 object-cover"
                  />
                )}
                <div className="p-2">
                  <h4 className="font-bold text-xs text-gray-800">{roomName}</h4>
                  <p className="text-xs text-gray-600">
                    {room.maxOccupancy ? `${room.maxOccupancy} khách` : ""}
                    {room.area ? ` • ${room.area}m²` : ""}
                  </p>
                  <p className="font-bold text-[#CCBDA3] text-xs mt-1">
                    {formatCurrency(room.basePrice || room.price)}
                  </p>
                  <button
                    onClick={() => sendDirectMessage(`Tôi muốn đặt phòng ${roomName}`)}
                    className="mt-2 w-full py-1.5 bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white rounded-lg text-xs font-semibold"
                  >
                    Chọn phòng này
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (message.uiType === "BOOKING_TYPE_SELECT" && message.uiData?.options) {
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(message.uiData.options as any[]).map((opt: any) => (
            <button
              key={opt.value}
              onClick={() => {
                setSelectedBookingType(opt.value === "HOURLY" ? "HOURLY" : "DAILY");
                setSelectedServices([]);
                setCheckInDate("");
                setCheckOutDate("");
                setGuestCount(1);
                sendDirectMessage(`Tôi muốn đặt theo ${opt.label}`);
              }}
              className="p-2 bg-white border border-[#CCBDA3] rounded-lg text-left hover:bg-[#CCBDA3] hover:text-white transition-colors"
            >
              <div className="font-bold text-xs">{opt.label}</div>
              {opt.description && (
                <div className="text-[11px] mt-1 opacity-80">{opt.description}</div>
              )}
            </button>
          ))}
        </div>
      );
    }

    if (message.uiType === "DATE_PICKER") {
      const bookingType = message.uiData?.bookingType || selectedBookingType;
      return (
        <div className="mt-3 bg-gray-50 rounded-lg p-2 space-y-2">
          <div>
            <label className="text-xs font-semibold text-gray-600">Ngày nhận phòng</label>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm"
            />
          </div>

          {bookingType === "HOURLY" ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600">Giờ nhận phòng</label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Số giờ thuê</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={durationHours}
                  onChange={(e) => setDurationHours(Number(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-xs font-semibold text-gray-600">Ngày trả phòng</label>
              <input
                type="date"
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600">Số khách</label>
            <input
              type="number"
              min="1"
              max="10"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="mt-1 w-full border border-gray-300 rounded-lg p-2 text-sm"
            />
          </div>

          <button
            onClick={() => {
              const validationError = validateDateSelection(bookingType);
              if (validationError) {
                showLocalAiMessage(validationError);
                return;
              }
              const timeText =
                bookingType === "HOURLY"
                  ? `Nhận phòng ngày ${checkInDate} lúc ${checkInTime}, thuê ${durationHours} giờ`
                  : `Nhận phòng ngày ${checkInDate}, trả phòng ngày ${checkOutDate}`;
              sendDirectMessage(`${timeText} cho ${guestCount} khách`);
            }}
            className="w-full py-2 bg-[#CCBDA3] text-white rounded-lg text-sm font-semibold hover:bg-[#b8ac94]"
          >
            Xác nhận thời gian
          </button>
        </div>
      );
    }

    if (message.uiType === "SERVICE_LIST" && message.uiData) {
      return (
        <div className="mt-3 space-y-2">
          {asList(message.uiData, "services").map((svc: any) => {
            const serviceId = String(svc.serviceID || svc.serviceId || svc.id || svc.serviceName);
            const selected = selectedServices.includes(serviceId);
            return (
              <button
                key={serviceId}
                onClick={() => {
                  setSelectedServices((prev) =>
                    prev.includes(serviceId)
                      ? prev.filter((id) => id !== serviceId)
                      : [...prev, serviceId]
                  );
                }}
                className={`w-full text-left p-2 rounded-lg border transition-colors ${
                  selected
                    ? "border-[#CCBDA3] bg-[#CCBDA3]/10"
                    : "border-gray-200 bg-white hover:border-[#CCBDA3]"
                }`}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold text-gray-800">{svc.serviceName || svc.name}</div>
                    {svc.description && <div className="text-[11px] text-gray-500">{svc.description}</div>}
                  </div>
                  <div className="text-xs font-bold text-[#CCBDA3] whitespace-nowrap">
                    {formatCurrency(svc.price)}
                  </div>
                </div>
              </button>
            );
          })}
          <button
            onClick={() => {
              const msg =
                selectedServices.length > 0
                  ? `Tôi muốn thêm dịch vụ: ${selectedServices.join(", ")}`
                  : "Không đặt dịch vụ";
              sendDirectMessage(msg);
            }}
            className="w-full py-2 bg-[#CCBDA3] text-white rounded-lg text-sm font-semibold hover:bg-[#b8ac94]"
          >
            Tiếp tục
          </button>
        </div>
      );
    }

    if (message.uiType === "INVOICE_VIEW" && message.uiData) {
      return (
        <div className="mt-3 space-y-2">
          {asList(message.uiData, "bookings").map((booking: any) => (
            <div key={booking.bookingID || booking.id} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
              <div className="flex justify-between gap-2">
                <div>
                  <div className="font-bold text-xs text-gray-800">#{booking.bookingID || booking.id}</div>
                  <div className="text-[11px] text-gray-500">
                    {booking.checkInDate || ""} {booking.checkOutDate ? `→ ${booking.checkOutDate}` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-semibold">
                    {booking.status}
                  </span>
                  <div className="font-bold text-[#CCBDA3] text-xs mt-1">
                    {formatCurrency(booking.totalAmount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (message.uiType === "BOOKING_CONFIRM") {
      return (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-semibold mb-2">Sẵn sàng đặt phòng!</p>
          <button
            onClick={() => {
              const draft = message.bookingDraft || message.uiData?.draft || {};
              navigate("/customer/bookingPage", {
                state: {
                  bookingType: draft.bookingType || selectedBookingType,
                  fromAI: true,
                  checkInDate: draft.checkInDate || checkInDate,
                  checkOutDate: draft.checkOutDate || checkOutDate,
                  hourlyCheckInDate: draft.checkInDate || checkInDate,
                  checkInTime: draft.checkInTime || checkInTime,
                  duration: draft.durationHours || durationHours,
                  guests: draft.guests || guestCount,
                  selectedServices: draft.selectedServiceIds || selectedServices,
                  selectedRooms: draft.selectedRoomNumber ? [draft.selectedRoomNumber] : undefined,
                },
              });
            }}
            className="w-full py-2 bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white rounded-lg text-sm font-bold"
          >
            Đến trang đặt phòng
          </button>
        </div>
      );
    }

    return null;
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

                          {renderRichContent(message)}

                          {/* Room Cards */}
                          {!message.uiType && message.roomCards && (
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
