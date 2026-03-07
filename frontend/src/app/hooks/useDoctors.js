"use client";

import { useCallback, useState } from "react";
import * as doctorService from "@/app/services/doctor.service";

export const useDoctors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (fn, errMsg) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fn();
      return { status: response.status, data: response.data };
    } catch (err) {
      const message = err?.response?.data?.message || errMsg;
      setError(message);
      return { status: err?.response?.status, data: err?.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDoctorProfile = useCallback((id, body) =>
    call(() => doctorService.updateDoctorProfile(id, body), "Failed to update profile"),
  [call]);

  const getDoctorProfile = useCallback((id) =>
    call(() => doctorService.getDoctorProfile(id), "Failed to load profile"),
  [call]);

  const getAllpatientofDoctor = useCallback(() =>
    call(() => doctorService.getAllpatientofDoctor(), "Failed to load patients"),
  [call]);

  const addHospitalAffiliation = useCallback((hospitalId) =>
    call(() => doctorService.addHospitalAffiliation(hospitalId), "Failed to add affiliation"),
  [call]);

  const removeHospitalAffiliation = useCallback((hospitalId) =>
    call(() => doctorService.removeHospitalAffiliation(hospitalId), "Failed to remove affiliation"),
  [call]);

  const getAffiliationHistory = useCallback(() =>
    call(() => doctorService.getAffiliationHistory(), "Failed to load affiliation history"),
  [call]);

  const searchHospitals = useCallback((query) =>
    call(() => doctorService.searchHospitals(query), "Failed to search hospitals"),
  [call]);

  return {
    loading,
    error,
    updateDoctorProfile,
    getDoctorProfile,
    getAllpatientofDoctor,
    addHospitalAffiliation,
    removeHospitalAffiliation,
    getAffiliationHistory,
    searchHospitals,
  };
};
