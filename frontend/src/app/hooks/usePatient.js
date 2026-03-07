import React, { useCallback } from 'react'
import * as patientService from "@/app/services/patient.service";

export const usePatient = () => {

    const getDoctoravailability = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getDoctoravailability(id);
      return { status: response.status, data: response.data };
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to load profile";
      setError(message);
      return { status: err?.response?.status, data: err?.response?.data };
    } finally {
      setLoading(false);
    }
  }, []);
  return (
    getDoctoravailability
  )
}

  
  
