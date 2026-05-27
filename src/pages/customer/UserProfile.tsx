import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaUser,
  FaLock,
  FaTrophy,
  FaHistory,
  FaTicketAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaArrowLeft,
} from "react-icons/fa";
import type {
  UserProfile,
  ProfileUpdateRequest,
  PasswordChangeRequest,
} from "../../types/UserProfile";
import type { Booking } from "../../types/Booking";
import userProfileService, {
  updateUserProfile,
} from "../../services/userProfileService";
import ProfileInfoSection from "../../components/profile/ProfileInfoSection";
import PasswordChangeSection from "../../components/profile/PasswordChangeSection";
import MembershipInfoSection from "../../components/profile/MembershipInfoSection";
import BookingHistorySection from "../../components/profile/BookingHistorySection";
import AvatarSection from "../../components/profile/AvatarSection";
import ConfirmDialog from "../../components/dialog/ConfirmDialog";
import { useToastContext } from "../../hooks/useToastContext";
import { handleLogout } from "../../services/authService";
import { getVouchersByCustomerId } from "../../services/voucherService";
import type { Voucher } from "../../types/Voucher";
import VoucherHero from "../../components/voucher/VoucherHero";
import VoucherFilter from "../../components/voucher/VoucherFilter";
import VoucherCard from "../../components/voucher/VoucherCard";
import EmptyVoucher from "../../components/voucher/EmptyVoucher";
import { AnimatePresence } from "framer-motion";
import { changePassword } from "../../services/authService";
import Breadcrumb from "../../components/common/Breadcrumb";
import Header from "../../components/Header";

type MenuTab = "profile" | "password" | "membership" | "bookings" | "vouchers";

type ProfileSource = Partial<UserProfile> & {
  username?: string;
  roles?: string[];
  avatartUrl?: string | null;
};

const getRolesFromToken = (): string[] => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return [];

    const payload = token.split(".")[1];
    if (!payload) return [];

    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decodedPayload = JSON.parse(atob(normalizedPayload));

    return Array.isArray(decodedPayload.roles) ? decodedPayload.roles : [];
  } catch (error) {
    console.error("Error reading roles from token:", error);
    return [];
  }
};

const getAllowedTabs = (role?: string): MenuTab[] => {
  if (role?.toUpperCase() === "CUSTOMER") {
    return ["profile", "password", "membership", "bookings", "vouchers"];
  }

  return ["profile", "password"];
};

const normalizeProfile = (
  data: ProfileSource,
  fallback?: UserProfile,
): UserProfile => {
  const userRole = (
    data.userRole ||
    data.roles?.[0] ||
    fallback?.userRole ||
    getRolesFromToken()[0] ||
    "CUSTOMER"
  )
    .toUpperCase()
    .replace(/^ROLE_/, "");

  return {
    id: data.id ?? fallback?.id ?? "",
    userName: data.userName ?? data.username ?? fallback?.userName ?? "",
    email: data.email ?? fallback?.email ?? "",
    phone: data.phone ?? fallback?.phone ?? "",
    fullName: data.fullName ?? fallback?.fullName ?? "",
    address: data.address ?? fallback?.address ?? null,
    userRole,
    avatarUrl: data.avatarUrl ?? data.avatartUrl ?? fallback?.avatarUrl ?? null,
    birthDate: data.birthDate ?? fallback?.birthDate,
    gender: data.gender ?? fallback?.gender,
    joinedDate: data.joinedDate ?? fallback?.joinedDate,
    loyaltyPoints: data.loyaltyPoints ?? fallback?.loyaltyPoints ?? 0,
    memberShipLevel:
      data.memberShipLevel ?? fallback?.memberShipLevel ?? "BRONZE",
    reputationPoint: data.reputationPoint ?? fallback?.reputationPoint ?? 100,
    department: data.department ?? fallback?.department,
    position: data.position ?? fallback?.position,
    salary: data.salary ?? fallback?.salary,
    hireDate: data.hireDate ?? fallback?.hireDate,
    adminLevel: data.adminLevel ?? fallback?.adminLevel,
    permissions: data.permissions ?? fallback?.permissions,
  };
};

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToastContext();
  const [activeTab, setActiveTab] = useState<MenuTab>("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [voucherFilter, setVoucherFilter] = useState<
    "all" | "active" | "expiring"
  >("all");
  const [copiedCode, setCopiedCode] = useState<string>("");

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (
      tab === "profile" ||
      tab === "password" ||
      tab === "membership" ||
      tab === "bookings" ||
      tab === "vouchers"
    ) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!profile) return;

    const allowedTabs = getAllowedTabs(profile.userRole);
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab("profile");
    }
  }, [activeTab, profile]);

  useEffect(() => {
    if (activeTab === "bookings" && profile?.id) {
      loadBookings();
    }
    if (activeTab === "vouchers" && profile?.id) {
      loadVouchers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = userProfileService.getCurrentUserFromStorage();

      if (!user) {
        toast.error("Please login!");
        navigate("/auth/login");
        return;
      }

      const storedProfile = normalizeProfile(user as ProfileSource);

      // Only customer profile has a matching customer endpoint; the UI below is shared for all roles.
      if (storedProfile.userRole === "CUSTOMER") {
        const customerData = await userProfileService.getCustomerProfile(
          storedProfile.id,
        );
        const normalizedCustomer = normalizeProfile(
          customerData as ProfileSource,
          storedProfile,
        );
        setProfile(normalizedCustomer);
        userProfileService.updateUserInStorage(normalizedCustomer);
      } else {
        const userData = await userProfileService.getUserProfile(
          storedProfile.id,
        );
        const normalizedUser = normalizeProfile(
          userData as ProfileSource,
          storedProfile,
        );
        setProfile(normalizedUser);
        userProfileService.updateUserInStorage(normalizedUser);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to localStorage data
      const user = userProfileService.getCurrentUserFromStorage();
      if (user) {
        setProfile(normalizeProfile(user as ProfileSource));
      } else {
        toast.error("Cannot load account information!");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!profile?.id) return;

    try {
      setBookingsLoading(true);
      if (profile.userRole && profile.userRole !== "CUSTOMER") {
        setBookings([]);
        return;
      }
      const data = await userProfileService.getCustomerBookings(profile.id);
      setBookings(data);
    } catch (error) {
      console.error("Error loading bookings:", error);
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const loadVouchers = async () => {
    if (!profile?.id) return;

    try {
      setVouchersLoading(true);
      if (profile.userRole && profile.userRole !== "CUSTOMER") {
        setVouchers([]);
        return;
      }
      const data = await getVouchersByCustomerId(profile.id);
      setVouchers(data);
    } catch (error) {
      console.error("Error loading vouchers:", error);
      setVouchers([]);
    } finally {
      setVouchersLoading(false);
    }
  };

  const getFilteredVouchers = () => {
    return vouchers.filter((v) => {
      const { status } = getVoucherStatus(v.endDate);
      if (voucherFilter === "all") return true;
      if (voucherFilter === "active") return status === "active";
      if (voucherFilter === "expiring") return status === "expiring";
      return true;
    });
  };

  const getVoucherStats = () => {
    return {
      total: vouchers.length,
      active: vouchers.filter(
        (v) => getVoucherStatus(v.endDate).status === "active",
      ).length,
      expiring: vouchers.filter(
        (v) => getVoucherStatus(v.endDate).status === "expiring",
      ).length,
    };
  };

  const getVoucherStatus = (
    endDate: Date | string,
  ): {
    status: "active" | "expiring" | "expired";
    label: string;
    daysLeft: number;
  } => {
    const now = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil(
      (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (end < now) return { status: "expired", label: "Expired", daysLeft: 0 };
    if (daysUntilExpiry <= 7)
      return {
        status: "expiring",
        label: `${daysUntilExpiry}d left`,
        daysLeft: daysUntilExpiry,
      };
    return { status: "active", label: "Active", daysLeft: daysUntilExpiry };
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleUpdateProfile = async (data: ProfileUpdateRequest) => {
    if (!profile) return;

    // Sử dụng hàm updateUserProfile chung cho tất cả role
    const updated = await updateUserProfile(
      profile.id,
      profile.userRole || "CUSTOMER",
      data,
    );
    const normalizedProfile = normalizeProfile(
      updated as ProfileSource,
      profile,
    );
    setProfile(normalizedProfile);
    userProfileService.updateUserInStorage(normalizedProfile);
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    if (!profile) return;

    // Cập nhật avatar trong state và localStorage
    const updatedProfile = { ...profile, avatarUrl };
    setProfile(updatedProfile);
    userProfileService.updateUserInStorage(updatedProfile);
  };

  const handleChangePassword = async (data: PasswordChangeRequest) => {
    if (!profile) return;

    await changePassword(profile.id, data);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const confirmLogout = () => {
    const result = handleLogout();
    if (result.success) {
      toast.success(result.message || "Logged out successfully!");
    }
    setShowLogoutDialog(false);
    navigate("/auth/login", { replace: true });
  };

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isCustomerProfile = profile.userRole === "CUSTOMER";
  const menuItems: { id: MenuTab; label: string; icon: React.JSX.Element }[] = [
    { id: "profile", label: "Personal Information", icon: <FaUser /> },
    { id: "password", label: "Change Password", icon: <FaLock /> },
  ];

  if (isCustomerProfile) {
    menuItems.push(
      { id: "membership", label: "Membership Info", icon: <FaTrophy /> },
      { id: "bookings", label: "Booking History", icon: <FaHistory /> },
      { id: "vouchers", label: "My Vouchers", icon: <FaTicketAlt /> },
    );
  }

  const getActiveTabLabel = () => {
    const item = menuItems.find((item) => item.id === activeTab);
    return item?.label || "My Account";
  };

  const isStaffProfilePage =
    location.pathname.startsWith("/admin/profile") ||
    location.pathname.startsWith("/employee/profile");

  return (
    <>
      {/* Fixed Header - Only show in the customer profile area */}
      {!isStaffProfilePage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[#F5F0EB] shadow-md">
          <Header />
        </div>
      )}

      {/* Main Content with top padding to account for fixed header */}
      <div className={`min-h-screen ${!isStaffProfilePage ? "pt-20" : ""}`}>
        <div className="container mx-auto px-6 py-4 ">
          {/* Mobile Header with Menu Toggle */}
          <div className="lg:hidden flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-cream to-gold rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <FaUser className="text-xl text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">
                  {profile.fullName}
                </h3>
                <p className="text-xs text-gray-600">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/80 backdrop-blur-sm text-primary hover:bg-white transition-colors shadow-sm"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <FaTimes className="text-2xl" />
              ) : (
                <FaBars className="text-2xl" />
              )}
            </button>
          </div>

          {/* Breadcrumb - Only show for customer route */}
          {location.pathname.startsWith("/customer/profile") && (
            <div className="mb-2 md:mb-4 hidden md:block">
              <Breadcrumb
                items={[
                  { label: "Home", path: "/home" },
                  { label: "My Account", path: "/customer/profile" },
                  {
                    label: getActiveTabLabel(),
                    icon: menuItems.find((item) => item.id === activeTab)?.icon,
                  },
                ]}
              />
            </div>
          )}

          {/* Back Button */}
          <div className="mb-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-primary hover:bg-cream/50 rounded-lg transition-all duration-200 group cursor-pointer"
            >
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Menu */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`${
                sidebarOpen
                  ? "fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl"
                  : "hidden"
              } lg:block lg:relative lg:w-64 lg:shadow-none`}
            >
              <div className="bg-white rounded-none lg:rounded-xl shadow-none lg:shadow-md border-0 lg:border border-cream overflow-hidden lg:sticky lg:top-4 h-full lg:h-auto">
                {/* Close button for mobile */}
                <div className="lg:hidden flex justify-end p-4 border-b border-cream">
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 rounded-lg hover:bg-cream transition-colors"
                  >
                    <FaTimes className="text-xl text-gray-600" />
                  </button>
                </div>

                <div className="p-4 md:p-6 bg-[#ccbda3] text-white">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 mx-auto mb-3 md:mb-4">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm"></div>
                    <div className="relative w-full h-full bg-white rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white/30 overflow-hidden">
                      {profile.avatarUrl ? (
                        <img
                          src={profile.avatarUrl}
                          alt="Avatar"
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <FaUser className="text-3xl md:text-4xl text-[#ccbda3]" />
                      )}
                    </div>
                  </div>
                  <h3 className="text-center font-semibold text-base md:text-lg">
                    {profile.fullName}
                  </h3>
                  <p className="text-center text-xs md:text-sm text-white/80">
                    {profile.email}
                  </p>
                  {isCustomerProfile && profile.memberShipLevel && (
                    <div className="mt-3 text-center">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold">
                        {profile.memberShipLevel === "PLATINUM"
                          ? "Platinum"
                          : profile.memberShipLevel === "GOLD"
                            ? "Gold"
                            : profile.memberShipLevel === "SILVER"
                              ? "Silver"
                              : "Bronze"}
                      </span>
                    </div>
                  )}
                </div>

                <nav className="p-2 md:p-2 max-h-[calc(100vh-280px)] lg:max-h-none overflow-y-auto">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 md:py-3 rounded-lg transition-colors mb-1 text-sm md:text-base ${
                        activeTab === item.id
                          ? "bg-[#ccbda3] text-white"
                          : "text-gray-700 hover:bg-cream"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}

                  <button
                    onClick={handleLogoutClick}
                    className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50 mt-4"
                  >
                    <FaSignOutAlt className="text-xl" />
                    <span className="font-medium">Logout</span>
                  </button>
                </nav>
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    {/* Avatar Section */}
                    <AvatarSection
                      profile={profile}
                      onAvatarUpdate={handleAvatarUpdate}
                    />

                    {/* Profile Info Section */}
                    <ProfileInfoSection
                      profile={profile}
                      onUpdate={handleUpdateProfile}
                    />
                  </div>
                )}

                {activeTab === "password" && (
                  <PasswordChangeSection
                    onChangePassword={handleChangePassword}
                  />
                )}

                {isCustomerProfile && activeTab === "membership" && (
                  <MembershipInfoSection profile={profile} />
                )}

                {isCustomerProfile && activeTab === "bookings" && (
                  <BookingHistorySection
                    bookings={bookings}
                    loading={bookingsLoading}
                  />
                )}

                {isCustomerProfile && activeTab === "vouchers" && (
                  <div>
                    {vouchersLoading ? (
                      <div className="bg-white rounded-xl shadow-md border border-cream p-6">
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <div className="relative">
                              <div className="animate-spin rounded-full h-14 w-14 border-4 border-cream mx-auto"></div>
                              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-primary absolute top-0 left-1/2 -translate-x-1/2"></div>
                            </div>
                            <p className="mt-4 text-gray-700 font-medium text-sm">
                              Loading your vouchers...
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <VoucherHero stats={getVoucherStats()} />

                        <div className="mt-6">
                          <VoucherFilter
                            filter={voucherFilter}
                            onFilterChange={setVoucherFilter}
                          />

                          {getFilteredVouchers().length === 0 ? (
                            <EmptyVoucher />
                          ) : (
                            <div className="space-y-4 mt-4">
                              <AnimatePresence>
                                {getFilteredVouchers().map((voucher, index) => {
                                  const { status, label } = getVoucherStatus(
                                    voucher.endDate,
                                  );
                                  return (
                                    <VoucherCard
                                      key={`${voucher.voucherId}-${index}`}
                                      voucher={voucher}
                                      index={index}
                                      status={status}
                                      label={label}
                                      copiedCode={copiedCode}
                                      onCopy={copyToClipboard}
                                    />
                                  );
                                })}
                              </AnimatePresence>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Logout Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showLogoutDialog}
          onClose={() => setShowLogoutDialog(false)}
          onConfirm={confirmLogout}
          title="Confirm Logout"
          message="Are you sure you want to logout from your account?"
          type="warning"
          confirmText="Logout"
          cancelText="Cancel"
        />
      </div>
    </>
  );
};

export default UserProfilePage;
