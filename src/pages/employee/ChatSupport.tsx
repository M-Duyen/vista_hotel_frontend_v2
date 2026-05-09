import React, { useEffect, useState, useRef } from "react";
import * as chatSupportService from "../../services/chatSupportService";
import type {
  ChatSessionDTO,
  ChatMessageDTO,
} from "../../services/chatSupportService";

interface StaffMember {
  id: string;
  fullName: string;
  status: "online" | "busy" | "offline";
  activeChats: number;
}

const ChatSupport: React.FC = () => {
  const [staff, setStaff] = useState<any>(null);
  const [chatSessions, setChatSessions] = useState<ChatSessionDTO[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSessionDTO | null>(null);
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStaff, setOnlineStaff] = useState<StaffMember[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedStaffForTransfer, setSelectedStaffForTransfer] =
    useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "waiting" | "active" | "resolved"
  >("all");
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessageDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loadStaff = () => {
      try {
        const staffStr = localStorage.getItem("staff");
        if (staffStr) {
          const staffData = JSON.parse(staffStr);
          setStaff(staffData);
          loadChats(staffData.id);
        } else {
          setStaff({
            id: "s1",
            fullName: "Support Staff",
            role: "Customer Support",
            email: "support@vistahotel.com",
          });
          loadChats("s1");
        }
        loadOnlineStaff();
      } catch (error) {
        console.error("Error loading staff:", error);
        setLoading(false);
      }
    };

    loadStaff();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChats = async (staffId: string) => {
    try {
      setLoading(true);
      const [staffChats, pendingChats] = await Promise.all([
        chatSupportService.getStaffChats(staffId),
        chatSupportService.getPendingChats(),
      ]);
      const allChats = [...staffChats, ...pendingChats];
      const uniqueChats = Array.from(
        new Map(allChats.map((chat) => [chat.sessionId, chat])).values()
      );

      setChatSessions(uniqueChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOnlineStaff = async () => {
    // TODO: Implement real API call to get online staff
    setOnlineStaff([
      {
        id: "s2",
        fullName: "John Doe",
        status: "online",
        activeChats: 2,
      },
      {
        id: "s3",
        fullName: "Jane Smith",
        status: "online",
        activeChats: 1,
      },
      {
        id: "s4",
        fullName: "Mike Johnson",
        status: "busy",
        activeChats: 5,
      },
      {
        id: "s5",
        fullName: "Sarah Williams",
        status: "online",
        activeChats: 3,
      },
    ]);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop =
          messagesContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleSelectChat = async (chat: ChatSessionDTO) => {
    try {
      setSelectedChat(chat);
      setLoading(true);

      const chatMessages = await chatSupportService.getChatMessages(
        chat.sessionId
      );
      setMessages(chatMessages);

      setChatSessions((prev) =>
        prev.map((c) =>
          c.sessionId === chat.sessionId
            ? { ...c, unreadCount: 0, status: "active" as const }
            : c
        )
      );
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat || !staff) return;

    try {
      const newMessage = await chatSupportService.sendStaffMessage(
        selectedChat.sessionId,
        inputValue,
        staff.id
      );

      setMessages((prev) => [...prev, newMessage]);
      setInputValue("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      setChatSessions((prev) =>
        prev.map((c) =>
          c.sessionId === selectedChat.sessionId
            ? {
                ...c,
                lastMessage: inputValue,
                lastMessageTime: new Date().toISOString(),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const handleTransferChat = async () => {
    if (!selectedStaffForTransfer || !selectedChat) return;

    const selectedStaffMember = onlineStaff.find(
      (s) => s.id === selectedStaffForTransfer
    );

    if (selectedStaffMember) {
      try {
        await chatSupportService.assignChatToStaff(
          selectedChat.sessionId,
          selectedStaffMember.id,
          selectedStaffMember.fullName
        );

        // Update local state
        setChatSessions((prev) =>
          prev.map((c) =>
            c.sessionId === selectedChat.sessionId
              ? {
                  ...c,
                  assignedStaff: {
                    id: selectedStaffMember.id,
                    fullName: selectedStaffMember.fullName,
                  },
                }
              : c
          )
        );

        setShowTransferModal(false);
        setSelectedStaffForTransfer("");
        setSelectedChat(null);
        setMessages([]);

        alert(
          `Chat transferred successfully to ${selectedStaffMember.fullName}`
        );
      } catch (error) {
        console.error("Error transferring chat:", error);
        alert("Failed to transfer chat. Please try again.");
      }
    }
  };

  const handleResolveChat = async () => {
    if (!selectedChat) return;

    if (
      window.confirm("Are you sure you want to mark this chat as resolved?")
    ) {
      try {
        await chatSupportService.markChatAsResolved(selectedChat.sessionId);

        setChatSessions((prev) =>
          prev.map((c) =>
            c.sessionId === selectedChat.sessionId
              ? { ...c, status: "resolved" as const }
              : c
          )
        );

        setSelectedChat(null);
        setMessages([]);
      } catch (error) {
        console.error("Error resolving chat:", error);
        alert("Failed to resolve chat. Please try again.");
      }
    }
  };

  const loadChatHistoryData = async (customerId: string) => {
    try {
      const history = await chatSupportService.getChatHistory(customerId);
      setChatHistory(history);
      setShowChatHistory(true);
    } catch (error) {
      console.error("Error loading chat history:", error);
      alert("Failed to load chat history.");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-green-600 bg-green-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-500";
      case "active":
        return "bg-green-500";
      case "resolved":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const filteredChats = chatSessions.filter((chat) => {
    if (filterStatus === "all") return true;
    return chat.status === filterStatus;
  });

  if (!staff || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#CCBDA3] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col overflow-hidden ml-5">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                <i className="fa-solid fa-headset text-[#CCBDA3] mr-3"></i>
                Customer Chat Support
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage customer inquiries and provide real-time assistance
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-semibold text-green-700">
                  Online
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">
                  {staff.fullName}
                </p>
                <p className="text-xs text-gray-600">{staff.role}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Chat List Sidebar */}
          <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
            {/* Filter Tabs */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex gap-1">
                {["all", "waiting", "active", "resolved"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      filterStatus === status
                        ? "bg-[#CCBDA3] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                    <span className="ml-2 text-xs">
                      (
                      {
                        chatSessions.filter((c) =>
                          status === "all" ? true : c.status === status
                        ).length
                      }
                      )
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Sessions List */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <i className="fa-solid fa-inbox text-6xl mb-4 text-gray-300"></i>
                  <p className="text-lg font-semibold">No chats found</p>
                  <p className="text-sm">Waiting for customer inquiries...</p>
                </div>
              ) : (
                <div className="space-y-2 p-3">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.sessionId}
                      onClick={() => handleSelectChat(chat)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedChat?.sessionId === chat.sessionId
                          ? "bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white border-[#CCBDA3] shadow-lg"
                          : "bg-gray-50 hover:bg-gray-100 border-transparent hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              selectedChat?.sessionId === chat.sessionId
                                ? "bg-white text-[#CCBDA3]"
                                : "bg-[#CCBDA3] text-white"
                            }`}
                          >
                            {chat.customer.avatar ? (
                              <img
                                src={chat.customer.avatar}
                                alt={chat.customer.fullName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <i className="fa-solid fa-user text-xl"></i>
                            )}
                          </div>
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                              selectedChat?.sessionId === chat.sessionId
                                ? "border-[#CCBDA3]"
                                : "border-white"
                            } ${getStatusColor(chat.status)}`}
                          ></span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4
                              className={`font-semibold truncate ${
                                selectedChat?.sessionId === chat.sessionId
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}
                            >
                              {chat.customer.fullName}
                            </h4>
                            <span
                              className={`text-xs ${
                                selectedChat?.sessionId === chat.sessionId
                                  ? "text-white text-opacity-80"
                                  : "text-gray-500"
                              }`}
                            >
                              {new Date(
                                chat.lastMessageTime
                              ).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p
                            className={`text-sm truncate mb-2 ${
                              selectedChat?.sessionId === chat.sessionId
                                ? "text-white text-opacity-90"
                                : "text-gray-600"
                            }`}
                          >
                            {chat.lastMessage}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  selectedChat?.sessionId === chat.sessionId
                                    ? "bg-white bg-opacity-20 text-white"
                                    : getPriorityColor(chat.priority)
                                }`}
                              >
                                {chat.priority.toUpperCase()}
                              </span>
                              {chat.unreadCount > 0 && (
                                <span className="px-2 py-1 bg-red-500 text-white rounded-full text-xs font-bold">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>

                            {chat.aiHandoffReason && (
                              <span
                                className={`text-xs ${
                                  selectedChat?.sessionId === chat.sessionId
                                    ? "text-white text-opacity-80"
                                    : "text-gray-500"
                                }`}
                              >
                                <i className="fa-solid fa-robot mr-1"></i>
                                AI Handoff
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedChat ? (
            <div className="flex-1 flex flex-col bg-gray-50">
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] flex items-center justify-center text-white">
                        {selectedChat.customer.avatar ? (
                          <img
                            src={selectedChat.customer.avatar}
                            alt={selectedChat.customer.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <i className="fa-solid fa-user text-xl"></i>
                        )}
                      </div>
                      <span
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                          selectedChat.status
                        )}`}
                      ></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">
                        {selectedChat.customer.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedChat.customer.email}
                      </p>
                    </div>
                    {selectedChat.aiHandoffReason && (
                      <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 flex items-center gap-2">
                          <i className="fa-solid fa-robot"></i>
                          <span className="font-semibold">AI Handoff:</span>
                          {selectedChat.aiHandoffReason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        loadChatHistoryData(selectedChat.customer.id)
                      }
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-history"></i>
                      <span>History</span>
                    </button>
                    <button
                      onClick={() => setShowTransferModal(true)}
                      className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-exchange-alt"></i>
                      <span>Transfer</span>
                    </button>
                    <button
                      onClick={handleResolveChat}
                      className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-all flex items-center gap-2"
                    >
                      <i className="fa-solid fa-check-circle"></i>
                      <span>Resolve</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6"
                style={{
                  scrollBehavior: "smooth",
                }}
              >
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.senderType === "staff" ? "flex-row-reverse" : ""
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                          message.senderType === "ai"
                            ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                            : message.senderType === "staff"
                            ? "bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white"
                            : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            message.senderType === "ai"
                              ? "fa-robot"
                              : message.senderType === "staff"
                              ? "fa-headset"
                              : "fa-user"
                          }`}
                        ></i>
                      </div>

                      <div
                        className={`max-w-[70%] ${
                          message.senderType === "staff" ? "items-end" : ""
                        }`}
                      >
                        <div
                          className={`px-4 py-3 rounded-2xl shadow-sm ${
                            message.senderType === "staff"
                              ? "bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white"
                              : message.senderType === "ai"
                              ? "bg-purple-50 border border-purple-100 text-gray-800"
                              : "bg-white border border-gray-100 text-gray-800"
                          }`}
                        >
                          {message.senderType === "ai" && (
                            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-200">
                              <i className="fa-solid fa-robot text-purple-600"></i>
                              <span className="text-xs font-semibold text-purple-600">
                                AI Assistant
                              </span>
                            </div>
                          )}
                          <p className="whitespace-pre-line leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        <span
                          className={`text-xs text-gray-500 mt-1 block ${
                            message.senderType === "staff" ? "text-right" : ""
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                        <i className="fa-solid fa-user"></i>
                      </div>
                      <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl shadow-sm">
                        <div className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span
                            className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></span>
                          <span
                            className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-200 px-6 py-4">
                <div className="flex items-end gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-5 py-3 focus-within:border-[#CCBDA3] focus-within:ring-4 focus-within:ring-[#CCBDA3] focus-within:ring-opacity-10 transition-all">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <i className="fa-solid fa-paperclip text-xl"></i>
                  </button>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    rows={1}
                    className="flex-1 bg-transparent border-none outline-none resize-none py-2 text-gray-800 placeholder-gray-400"
                    style={{
                      minHeight: "24px",
                      maxHeight: "120px",
                      lineHeight: "1.5",
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    className="w-11 h-11 rounded-xl bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className="fa-solid fa-paper-plane text-white"></i>
                  </button>
                </div>
                <div className="text-xs text-gray-500 text-center mt-2">
                  Press{" "}
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded">Enter</kbd>{" "}
                  to send •{" "}
                  <kbd className="px-2 py-0.5 bg-gray-100 rounded">
                    Shift + Enter
                  </kbd>{" "}
                  for new line
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] rounded-full flex items-center justify-center shadow-lg">
                  <i className="fa-solid fa-comments text-4xl text-white"></i>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Select a Chat
                </h3>
                <p className="text-gray-600">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  <i className="fa-solid fa-exchange-alt text-[#CCBDA3] mr-2"></i>
                  Transfer Chat
                </h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-times text-gray-600"></i>
                </button>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Select a staff member to transfer this chat to:
              </p>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {onlineStaff
                  .filter((s) => s.id !== staff.id)
                  .map((staffMember) => (
                    <label
                      key={staffMember.id}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border-2 ${
                        selectedStaffForTransfer === staffMember.id
                          ? "bg-[#CCBDA3] bg-opacity-10 border-[#CCBDA3]"
                          : "bg-gray-50 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="staffTransfer"
                        value={staffMember.id}
                        checked={selectedStaffForTransfer === staffMember.id}
                        onChange={(e) =>
                          setSelectedStaffForTransfer(e.target.value)
                        }
                        className="w-5 h-5 text-[#CCBDA3]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800">
                            {staffMember.fullName}
                          </p>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              staffMember.status === "online"
                                ? "bg-green-100 text-green-700"
                                : staffMember.status === "busy"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {staffMember.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Active chats: {staffMember.activeChats}
                        </p>
                      </div>
                    </label>
                  ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferChat}
                disabled={!selectedStaffForTransfer}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat History Modal */}
      {showChatHistory && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  <i className="fa-solid fa-history text-[#CCBDA3] mr-2"></i>
                  Chat History
                </h3>
                <button
                  onClick={() => setShowChatHistory(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-times text-gray-600"></i>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.senderType === "staff" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                        message.senderType === "ai"
                          ? "bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                          : message.senderType === "staff"
                          ? "bg-gradient-to-br from-[#CCBDA3] to-[#b8ac94] text-white"
                          : "bg-gradient-to-br from-gray-400 to-gray-500 text-white"
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          message.senderType === "ai"
                            ? "fa-robot"
                            : message.senderType === "staff"
                            ? "fa-headset"
                            : "fa-user"
                        }`}
                      ></i>
                    </div>

                    <div className={`max-w-[70%]`}>
                      <div
                        className={`px-4 py-3 rounded-2xl shadow-sm ${
                          message.senderType === "staff"
                            ? "bg-gradient-to-r from-[#CCBDA3] to-[#b8ac94] text-white"
                            : message.senderType === "ai"
                            ? "bg-purple-50 border border-purple-100 text-gray-800"
                            : "bg-white border border-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed text-sm">
                          {message.content}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
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
      `}</style>
    </div>
  );
};

export default ChatSupport;
