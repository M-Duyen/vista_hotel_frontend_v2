import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Gift,
  Settings,
  ChevronRight,
  PartyPopper,
} from "lucide-react";
import type { Voucher } from "../../types/Voucher";
import HolidayVoucherModal from "./HolidayVoucherModal";
import type { Holiday } from "../../types/Holiday";
import {
  saveHolidayVouchers,
  getAllHolidayVouchers,
  updateHolidayVoucherActive,
  type HolidayVoucherDTO,
} from "../../services/holidayVoucherService";
import {
  getBirthdayVoucherConfig,
  saveBirthdayVoucherConfig,
} from "../../services/birthdayVoucherService";
import { useToastContext } from "../../hooks/useToastContext";

interface AutoEvent {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  enabled: boolean;
  voucherId?: string;
  config?: {
    daysBeforeEvent?: number;
    minLoyaltyPoints?: number;
  };
}

interface AutoEventsTabProps {
  vouchers: Voucher[];
}

export default function AutoEventsTab({ vouchers }: AutoEventsTabProps) {
  const toast = useToastContext();
  const [events, setEvents] = useState<AutoEvent[]>([
    {
      id: "holiday",
      name: "Holiday Voucher",
      description: "Phân phối voucher tự động theo ngày lễ, ngày đặc biệt",
      icon: <PartyPopper className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      enabled: false,
      voucherId: "",
    },
    {
      id: "birthday",
      name: "Birthday Voucher",
      description: "Automatically send voucher to customers on their birthday",
      icon: <Gift className="w-6 h-6" />,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      enabled: false,
      voucherId: "",
      config: {
        daysBeforeEvent: 3,
      },
    },
    // {
    //   id: "new_year",
    //   name: "New Year Voucher",
    //   description: "Send special voucher to all customers on New Year",
    //   icon: <Calendar className="w-6 h-6" />,
    //   color: "text-blue-600",
    //   bgColor: "bg-blue-50",
    //   enabled: false,
    //   voucherId: "",
    // },
    // {
    //   id: "loyalty_milestone",
    //   name: "Loyalty Milestone",
    //   description: "Reward customers when they reach certain loyalty points",
    //   icon: <Award className="w-6 h-6" />,
    //   color: "text-yellow-600",
    //   bgColor: "bg-yellow-50",
    //   enabled: false,
    //   voucherId: "",
    //   config: {
    //     minLoyaltyPoints: 1000,
    //   },
    // },
    // {
    //   id: "anniversary",
    //   name: "Anniversary Voucher",
    //   description: "Celebrate customer membership anniversary",
    //   icon: <Heart className="w-6 h-6" />,
    //   color: "text-red-600",
    //   bgColor: "bg-red-50",
    //   enabled: false,
    //   voucherId: "",
    //   config: {
    //     daysBeforeEvent: 3,
    //   },
    // },
  ]);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [selectedHolidays, setSelectedHolidays] = useState<
    Array<{ holiday: Holiday; voucherId: string }>
  >([]);
  const [savingConfig, setSavingConfig] = useState(false);

  // Load cấu hình khi component mount
  useEffect(() => {
    const loadHolidayConfig = async () => {
      try {
        const holidayVouchers = await getAllHolidayVouchers();

        // Nếu có dữ liệu trong DB → Bật holiday event
        if (holidayVouchers && holidayVouchers.length > 0) {
          setEvents((prev) =>
            prev.map((event) =>
              event.id === "holiday" ? { ...event, enabled: true } : event
            )
          );

          // Convert backend data sang selectedHolidays format
          const mockHolidays = holidayVouchers.map((hv: any) => ({
            holiday: {
              id: hv.holidayId,
              summary: hv.holidayName,
              start: hv.holidayDate,
              end: hv.holidayDate,
              date: new Date(hv.holidayDate),
            },
            voucherId: hv.voucher?.voucherId || hv.voucher?.voucherID || "",
          }));
          setSelectedHolidays(mockHolidays);

          console.log(
            "Loaded holiday vouchers config:",
            holidayVouchers.length,
            "holidays"
          );
        }
      } catch (error) {
        console.error("Error loading holiday vouchers:", error);
      }
    };

    loadHolidayConfig();
  }, []);

  useEffect(() => {
    const loadBirthdayConfig = async () => {
      try {
        const config = await getBirthdayVoucherConfig();
        if (!config) {
          return;
        }

        setEvents((prev) =>
          prev.map((event) =>
            event.id === "birthday"
              ? {
                  ...event,
                  enabled: config.active,
                  voucherId: config.voucherId,
                  config: {
                    ...event.config,
                    daysBeforeEvent: config.daysBeforeEvent,
                  },
                }
              : event
          )
        );
      } catch (error) {
        console.error("Error loading birthday voucher config:", error);
      }
    };

    loadBirthdayConfig();
  }, []);

  const handleToggleEvent = async (eventId: string) => {
    const event = events.find((item) => item.id === eventId);
    const enabled = !event?.enabled;

    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId ? { ...event, enabled } : event
      )
    );

    try {
      if (eventId === "birthday" && event?.voucherId) {
        await saveBirthdayVoucherConfig({
          voucherId: event.voucherId,
          daysBeforeEvent: event.config?.daysBeforeEvent ?? 0,
          active: enabled,
        });
      }

      if (eventId === "holiday" && selectedHolidays.length > 0) {
        await updateHolidayVoucherActive(enabled);
      }
    } catch (error) {
      console.error("Error updating auto event status:", error);
      toast.error("Error updating auto event status!", {
        duration: 3000,
      });
    }
  };

  const handleConfigureEvent = (eventId: string) => {
    if (eventId === "holiday") {
      setHolidayModalOpen(true);
    } else {
      setSelectedEventId(eventId);
      setConfigModalOpen(true);
    }
  };

  const handleSaveHolidays = async (
    holidays: Array<{ holiday: Holiday; voucherId: string }>
  ) => {
    try {
      // Convert sang DTO format
      const holidayDTOs: HolidayVoucherDTO[] = holidays.map((item) => ({
        holidayId: item.holiday.id,
        holidayName: item.holiday.summary,
        holidayDate: item.holiday.start, // ISO string format
        voucherId: item.voucherId,
        isActive: true,
      }));

      // Gọi API lưu vào backend
      await saveHolidayVouchers(holidayDTOs);

      // Cập nhật state local
      setSelectedHolidays(holidays);

      // Bật toggle Holiday Voucher sau khi lưu thành công
      setEvents((prev) =>
        prev.map((event) =>
          event.id === "holiday" ? { ...event, enabled: true } : event
        )
      );

      toast.success("Holiday Voucher configuration saved successfully!", {
        duration: 2000,
      });
      console.log("Holiday vouchers saved:", holidayDTOs);
    } catch (error) {
      console.error("Error saving holiday vouchers:", error);
      toast.error("Error saving Holiday Voucher configuration!", {
        duration: 3000,
      });
    }
  };

  const handleSaveConfig = async (
    eventId: string,
    voucherId: string,
    config: any
  ) => {
    setSavingConfig(true);

    try {
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? {
                ...event,
                enabled: true,
                voucherId,
                config: { ...event.config, ...config },
              }
            : event
        )
      );
      setConfigModalOpen(false);

      if (eventId === "birthday") {
        await saveBirthdayVoucherConfig({
          voucherId,
          daysBeforeEvent: config?.daysBeforeEvent ?? 0,
          active: true,
        });

        toast.success("Birthday Voucher configuration saved successfully!", {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error saving auto event configuration:", error);
      toast.error("Error saving Birthday Voucher configuration!", {
        duration: 3000,
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const activeVouchers = vouchers.filter((v) => v.isActive);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm border border-[#ebe3d7] p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#6b5e4c] mb-2">
            Auto Event Configuration
          </h3>
          <p className="text-sm text-gray-600">
            Set up automatic voucher distribution for special events and
            milestones
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-2 rounded-lg p-5 transition-all ${
                event.enabled
                  ? "border-[#6b5e4c] bg-[#f5f0eb]"
                  : "border-[#ebe3d7] bg-white"
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`${event.bgColor} ${event.color} p-3 rounded-lg`}
                >
                  {event.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {event.name}
                    </h4>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.enabled}
                        onChange={() => handleToggleEvent(event.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#6b5e4c]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6b5e4c]"></div>
                    </label>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {event.description}
                  </p>

                  {event.enabled && (
                    <div className="space-y-2">
                      {event.id === "holiday" ? (
                        // Hiển thị đặc biệt cho Holiday Voucher
                        selectedHolidays.length > 0 ? (
                          <div className="text-xs bg-green-50 border border-green-200 text-green-800 rounded px-2 py-1.5">
                            {selectedHolidays.length} ngày lễ đã cấu hình
                          </div>
                        ) : (
                          <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-2 py-1.5">
                            No voucher selected
                          </div>
                        )
                      ) : event.voucherId ? (
                        <div className="text-xs bg-white border border-[#ebe3d7] rounded px-2 py-1.5">
                          <span className="text-gray-500">Voucher: </span>
                          <span className="font-medium text-[#6b5e4c]">
                            {vouchers.find(
                              (v) => v.voucherId === event.voucherId
                            )?.voucherName || "Not set"}
                          </span>
                        </div>
                      ) : (
                        <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded px-2 py-1.5">
                          No voucher selected
                        </div>
                      )}

                      <button
                        onClick={() => handleConfigureEvent(event.id)}
                        className="w-full text-sm flex items-center justify-between px-3 py-2 bg-white border border-[#ebe3d7] rounded-lg hover:bg-[#f5f0eb] transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Configure
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Configuration Modal */}
      {configModalOpen && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
          >
            <div className="p-6 border-b border-[#ebe3d7]">
              <div className="flex items-center gap-3">
                <div
                  className={`${selectedEvent.bgColor} ${selectedEvent.color} p-2 rounded-lg`}
                >
                  {selectedEvent.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#6b5e4c]">
                    Configure {selectedEvent.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.description}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Voucher
                </label>
                <select
                  value={selectedEvent.voucherId}
                  onChange={(e) => {
                    const newVoucherId = e.target.value;
                    setEvents((prev) =>
                      prev.map((event) =>
                        event.id === selectedEvent.id
                          ? { ...event, voucherId: newVoucherId }
                          : event
                      )
                    );
                  }}
                  className="w-full px-4 py-2 border border-[#ebe3d7] rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent cursor-pointer"
                >
                  <option value="">Choose a voucher...</option>
                  {activeVouchers.map((voucher) => (
                    <option key={voucher.voucherId} value={voucher.voucherId}>
                      {voucher.voucherName}
                    </option>
                  ))}
                </select>
              </div>

              {selectedEvent.config?.daysBeforeEvent !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Before Event
                  </label>
                  <input
                    type="number"
                    value={selectedEvent.config.daysBeforeEvent}
                    onChange={(e) => {
                      const days = parseInt(e.target.value);
                      setEvents((prev) =>
                        prev.map((event) =>
                          event.id === selectedEvent.id
                            ? {
                                ...event,
                                config: {
                                  ...event.config,
                                  daysBeforeEvent: days,
                                },
                              }
                            : event
                        )
                      );
                    }}
                    min="0"
                    max="30"
                    className="w-full px-4 py-2 border border-[#ebe3d7] rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Send voucher this many days before the event
                  </p>
                </div>
              )}

              {selectedEvent.config?.minLoyaltyPoints !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Loyalty Points
                  </label>
                  <input
                    type="number"
                    value={selectedEvent.config.minLoyaltyPoints}
                    onChange={(e) => {
                      const points = parseInt(e.target.value);
                      setEvents((prev) =>
                        prev.map((event) =>
                          event.id === selectedEvent.id
                            ? {
                                ...event,
                                config: {
                                  ...event.config,
                                  minLoyaltyPoints: points,
                                },
                              }
                            : event
                        )
                      );
                    }}
                    min="0"
                    step="100"
                    className="w-full px-4 py-2 border border-[#ebe3d7] rounded-lg focus:ring-2 focus:ring-[#6b5e4c] focus:border-transparent cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Trigger when customer reaches this point threshold
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[#ebe3d7] flex gap-3">
              <button
                onClick={() => setConfigModalOpen(false)}
                className="flex-1 px-4 py-2 border border-[#ebe3d7] text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedEvent.voucherId) {
                    void handleSaveConfig(
                      selectedEvent.id,
                      selectedEvent.voucherId,
                      selectedEvent.config
                    );
                  }
                }}
                disabled={!selectedEvent.voucherId || savingConfig}
                className="flex-1 px-4 py-2 bg-[#6b5e4c] text-white rounded-lg hover:bg-[#5a4d3d] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {savingConfig ? "Saving..." : "Save Configuration"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Holiday Voucher Modal */}
      <HolidayVoucherModal
        isOpen={holidayModalOpen}
        onClose={() => setHolidayModalOpen(false)}
        vouchers={vouchers}
        onSave={handleSaveHolidays}
      />
    </div>
  );
}
