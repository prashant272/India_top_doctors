import { useCallback, useState } from "react";
import * as prescriptionService from "@/app/services/prescription.service";

export const usePrescription = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addPrescription = useCallback(async (body) => {
    
    try {
      setLoading(true);
      setError(null);

      const response = await prescriptionService.addPrescription(body);

      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to add prescription";

      setError(message);

      return {
        success: false,
        status: err?.response?.status || 500,
        data: err?.response?.data,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPrescription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await prescriptionService.getPrescription();

      return {
        success: true,
        status: response.status,
        data: response.data,
      };
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to load prescriptions";

      setError(message);

      return {
        success: false,
        status: err?.response?.status || 500,
        data: err?.response?.data,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

const fetchPrescriptionById = useCallback(async (id) => {
  try {
    setLoading(true);
    setError(null);
    const response = await prescriptionService.getPrescriptionById(id);
    return {
      success: true,
      status: response.status,
      data: response.data,
    };
  } catch (err) {
    const status = err?.response?.status || 500;
    const message = err?.response?.data?.message || "Failed to load prescriptions";

    if (status !== 404) {
      setError(message);
    }

    return {
      success: false,
      status,
      data: err?.response?.data,
      message,
    };
  } finally {
    setLoading(false);
  }
}, []);


  return {
    loading,
    error,
    addPrescription,
    fetchPrescription,
    fetchPrescriptionById
  };
};