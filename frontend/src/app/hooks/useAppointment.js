"use client";

import { useState, useCallback } from "react";
import * as appointmentService from "@/app/services/appointment.service";

export default function useAppointment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRequest = async (fn) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fn();
      return { status: response.status, data: response.data };
    } catch (err) {
      const message = err?.response?.data?.message || "Something went wrong";
      setError(message);
      return { status: err?.response?.status, data: err?.response?.data };
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = useCallback(
    (body) => handleRequest(() => appointmentService.createAppointments(body)),
    []
  );

  const fetchAppointments = useCallback(
    (role, id) => handleRequest(() => appointmentService.getAppointments(role, id)),
    []
  );

  const fetchAppointmentById = useCallback(
    (id) => handleRequest(() => appointmentService.getAppointmentById(id)),
    []
  );

  const updateAppointment = useCallback(
    (id, body) => handleRequest(() => appointmentService.updateAppointment(id, body)),
    []
  );

  const confirmAppointment = useCallback(
    (id) => handleRequest(() => appointmentService.confirmAppointment(id)),
    []
  );

  const cancelAppointment = useCallback(
    (id) => handleRequest(() => appointmentService.cancelAppointment(id)),
    []
  );

  const joinCall = useCallback(
    (id, role) => handleRequest(() => appointmentService.joinCall(id, role)),
    []
  );

  const leaveCall = useCallback(
    (id, role) => handleRequest(() => appointmentService.leaveCall(id, role)),
    []
  );

  const deleteAppointment = useCallback(
    (id) => handleRequest(() => appointmentService.deleteAppointment(id)),
    []
  );

  return {
    loading,
    error,
    createAppointment,
    fetchAppointments,
    fetchAppointmentById,
    updateAppointment,
    confirmAppointment,
    cancelAppointment,
    joinCall,
    leaveCall,
    deleteAppointment,
  };
}
