import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export function useAppointments() {
  return useQuery({
    queryKey: ['admin-appointments'],
    queryFn: async () => {
      const data = await base44.entities.Appointment.list("-created_date", 100);
      return data || [];
    },
    staleTime: 30 * 1000
  });
}

export function useBookingNotifications() {
  return useQuery({
    queryKey: ['admin-booking-notifications'],
    queryFn: async () => {
      const data = await base44.entities.BookingNotification.list("-created_date", 100);
      return data || [];
    },
    staleTime: 30 * 1000
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ appointmentId, newStatus }) => {
      return base44.entities.Appointment.update(appointmentId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-appointments']);
    }
  });
}

export function useMarkNotificationViewed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId) => {
      return base44.entities.BookingNotification.update(notificationId, { notification_status: "viewed" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-booking-notifications']);
    }
  });
}

export function useFilteredAppointments(appointments, statusFilter, searchTerm, dateFilter) {
  return useMemo(() => {
    if (!appointments) return [];
    
    return appointments.filter(appointment => {
      if (!appointment) return false;
      
      const matchesStatus = statusFilter === "all" || appointment.status === statusFilter;
      const matchesSearch = 
        (appointment.client_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.phone || '').includes(searchTerm) ||
        (appointment.service || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !dateFilter || appointment.preferred_date === dateFilter;
      
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [appointments, statusFilter, searchTerm, dateFilter]);
}

export function useBookingStats(appointments) {
  return useMemo(() => {
    if (!appointments) return { pending: 0, confirmed: 0, completed: 0, totalRevenue: 0 };
    
    return {
      pending: appointments.filter(a => a.status === 'pending').length,
      confirmed: appointments.filter(a => a.status === 'confirmed').length,
      completed: appointments.filter(a => a.status === 'completed').length,
      totalRevenue: appointments.reduce((sum, apt) => sum + (apt.service_price || 0), 0)
    };
  }, [appointments]);
}

export function useExportBookingsCSV(filteredAppointments) {
  return useCallback(() => {
    const formatDateTime = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
      } catch {
        return dateString;
      }
    };

    const csvContent = [
      ["Date Created", "Client Name", "Email", "Phone", "Service", "Price", "Appointment Date", "Time", "Status", "Message"].join(","),
      ...filteredAppointments.map(apt => [
        formatDateTime(apt.created_date),
        apt.client_name || '',
        apt.email || '',
        apt.phone || '',
        apt.service || '',
        apt.service_price || '',
        apt.preferred_date || '',
        apt.preferred_time || '',
        apt.status || '',
        (apt.message || "").replace(/,/g, ";")
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [filteredAppointments]);
}