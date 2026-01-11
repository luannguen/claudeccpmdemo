import React, { useState } from "react";
import { Calendar, AlertCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Hooks
import {
  useAppointments,
  useBookingNotifications,
  useUpdateAppointmentStatus,
  useMarkNotificationViewed,
  useFilteredAppointments,
  useBookingStats,
  useExportBookingsCSV
} from "@/components/hooks/useBookings";

// Components
import BookingsHeader from "@/components/admin/bookings/BookingsHeader";
import BookingsFilters from "@/components/admin/bookings/BookingsFilters";
import BookingCard from "@/components/admin/bookings/BookingCard";
import BookingsStats from "@/components/admin/bookings/BookingsStats";
import BookingNotificationsAlert from "@/components/admin/bookings/BookingNotificationsAlert";

export default function AdminBookings() {
  const queryClient = useQueryClient();

  // State
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Data hooks
  const { data: appointments = [], isLoading, isError, error } = useAppointments();
  const { data: notifications = [] } = useBookingNotifications();
  
  // Mutations
  const updateStatusMutation = useUpdateAppointmentStatus();
  const markViewedMutation = useMarkNotificationViewed();

  // Computed
  const filteredAppointments = useFilteredAppointments(appointments, statusFilter, searchTerm, dateFilter);
  const stats = useBookingStats(appointments);
  const exportCSV = useExportBookingsCSV(filteredAppointments);

  // Handlers
  const handleRefresh = () => {
    queryClient.invalidateQueries(['admin-appointments']);
    queryClient.invalidateQueries(['admin-booking-notifications']);
  };

  const handleUpdateStatus = (appointmentId, newStatus) => {
    updateStatusMutation.mutate({ appointmentId, newStatus });
  };

  const handleMarkViewed = (notificationId) => {
    markViewedMutation.mutate(notificationId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#7CB342] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu booking...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-gray-600 mb-4">{error?.message || 'Không thể tải dữ liệu booking'}</p>
          <button
            onClick={handleRefresh}
            className="bg-[#7CB342] text-white px-6 py-2 rounded-lg hover:bg-[#FF9800] transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <BookingsHeader
        totalAppointments={appointments.length}
        confirmedCount={stats.confirmed}
        onRefresh={handleRefresh}
      />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <BookingNotificationsAlert
          notifications={notifications}
          onMarkViewed={handleMarkViewed}
        />

        <BookingsFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          onExport={exportCSV}
        />

        {/* Appointments Grid */}
        <div className="grid gap-6">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {appointments.length === 0 ? 'Chưa có booking nào' : 'Không tìm thấy booking phù hợp'}
              </h3>
              <p className="text-gray-600">
                {appointments.length === 0 
                  ? 'Booking sẽ hiển thị ở đây khi khách hàng đặt lịch.'
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.'
                }
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => (
              <BookingCard
                key={appointment.id}
                appointment={appointment}
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </div>

        <BookingsStats stats={stats} />
      </div>
    </div>
  );
}