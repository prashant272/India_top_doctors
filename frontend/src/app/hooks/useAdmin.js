import { useState, useCallback } from "react";
import {
  getDashboardStats,
  getAllDoctors,
  getAllPatients,
  deleteDoctor,
  deletePatient,
  getAllAppointment,
  getAppointmentById,
  getAllAdmins,
  deleteAdmin,
  getAllHospitals,
  verifyHospital,
  toggleHospitalActiveStatus,
  getAllProviders,
  deleteProvider,
} from "../services/admin.service";

const useAdmin = () => {
  const [dashboardStats, setDashboardStats]           = useState(null);
  const [doctors, setDoctors]                         = useState([]);
  const [patients, setPatients]                       = useState([]);
  const [admins, setAdmins]                           = useState([]);
  const [appointments, setAppointments]               = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [hospitals, setHospitals]                     = useState([]);
  const [providers, setProviders]                     = useState([]);

  const [loadingStats, setLoadingStats]               = useState(false);
  const [loadingDoctors, setLoadingDoctors]           = useState(false);
  const [loadingPatients, setLoadingPatients]         = useState(false);
  const [loadingAdmins, setLoadingAdmins]             = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingHospitals, setLoadingHospitals]       = useState(false);
  const [loadingProviders, setLoadingProviders]       = useState(false);

  const [error, setError] = useState(null);

  const handleError = (err, fallback) => {
    const message = err?.response?.data?.message || fallback;
    setError(message);
    throw new Error(message);
  };

  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    setError(null);
    try {
      const [statsResponse, appointmentsResponse] = await Promise.all([
        getDashboardStats(),
        getAllAppointment(),
      ]);

      const data            = statsResponse?.data?.data || {};
      const allAppointments = appointmentsResponse?.data?.data || [];
      const todayStr        = new Date().toISOString().split("T")[0];

      const todayCount = allAppointments.filter((appt) => {
        const apptDate =
          appt?.appointmentDate ||
          appt?.date            ||
          appt?.scheduledDate   ||
          appt?.createdAt;
        if (!apptDate) return false;
        return new Date(apptDate).toISOString().split("T")[0] === todayStr;
      }).length;

      const pendingCount = allAppointments.filter(
        (appt) => appt?.status?.toLowerCase() === "pending"
      ).length;

      const enrichedData = {
        ...data,
        totalAppointmentsToday: todayCount,
        pendingAppointments:    pendingCount,
      };

      setDashboardStats(enrichedData);
      setAppointments(allAppointments);
      return enrichedData;
    } catch (err) {
      handleError(err, "Failed to fetch dashboard stats");
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchAllDoctors = useCallback(async () => {
    setLoadingDoctors(true);
    setError(null);
    try {
      const response = await getAllDoctors();
      const data     = response?.data?.data;
      setDoctors(data || []);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch doctors");
    } finally {
      setLoadingDoctors(false);
    }
  }, []);

  const fetchAllPatients = useCallback(async () => {
    setLoadingPatients(true);
    setError(null);
    try {
      const response = await getAllPatients();
      const data     = response?.data?.data;
      setPatients(data || []);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch patients");
    } finally {
      setLoadingPatients(false);
    }
  }, []);

  const fetchAllAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    setError(null);
    try {
      const response = await getAllAdmins();
      const data     = response?.data?.admins;
      setAdmins(data || []);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch admins");
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  const fetchAllAppointments = useCallback(async () => {
    setLoadingAppointments(true);
    setError(null);
    try {
      const response = await getAllAppointment();
      const data     = response?.data?.data;
      setAppointments(data || []);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch appointments");
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  const fetchAppointmentById = useCallback(async (id) => {
    setLoadingAppointments(true);
    setError(null);
    try {
      const response = await getAppointmentById(id);
      const data     = response?.data?.data;
      setSelectedAppointment(data || null);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch appointment");
    } finally {
      setLoadingAppointments(false);
    }
  }, []);

  const fetchAllHospitals = useCallback(async (params = {}) => {
    setLoadingHospitals(true);
    setError(null);
    try {
      const response = await getAllHospitals(params);
      const data     = response?.data?.hospitals;
      setHospitals(data || []);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch hospitals");
    } finally {
      setLoadingHospitals(false);
    }
  }, []);

  const verifyHospitalById = useCallback(async (id) => {
    setError(null);
    try {
      await verifyHospital(id);
      setHospitals((prev) =>
        prev.map((h) => h._id === id ? { ...h, isVerified: true } : h)
      );
    } catch (err) {
      handleError(err, "Failed to verify hospital");
    }
  }, []);

  const toggleHospitalById = useCallback(async (id) => {
    setError(null);
    try {
      await toggleHospitalActiveStatus(id);
      setHospitals((prev) =>
        prev.map((h) => h._id === id ? { ...h, isActive: !h.isActive } : h)
      );
    } catch (err) {
      handleError(err, "Failed to toggle hospital status");
    }
  }, []);

  const fetchAllProviders = useCallback(async () => {
    setLoadingProviders(true);
    setError(null);
    try {
      const response = await getAllProviders();
      const data     = response?.data?.providers;
      setProviders(data || []);
      return data;
    } catch (err) {
      handleError(err, "Failed to fetch providers");
    } finally {
      setLoadingProviders(false);
    }
  }, []);

  const removeProviderById = useCallback(async (id) => {
    setError(null);
    try {
      await deleteProvider(id);
      setProviders((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      handleError(err, "Failed to delete provider");
    }
  }, []);

  const removeDoctorById = useCallback(async (id) => {
    try {
      await deleteDoctor(id);
      setDoctors((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      handleError(err, "Failed to delete doctor");
    }
  }, []);

  const removePatientById = useCallback(async (id) => {
    try {
      await deletePatient(id);
      setPatients((prev) => prev.filter((pat) => pat._id !== id));
    } catch (err) {
      handleError(err, "Failed to delete patient");
    }
  }, []);

  const removeAdminById = useCallback(async (id) => {
    try {
      await deleteAdmin(id);
      setAdmins((prev) => prev.filter((admin) => admin._id !== id));
    } catch (err) {
      handleError(err, "Failed to delete admin");
    }
  }, []);

  return {
    dashboardStats,
    doctors,
    patients,
    admins,
    appointments,
    selectedAppointment,
    hospitals,
    providers,
    loadingStats,
    loadingDoctors,
    loadingPatients,
    loadingAdmins,
    loadingAppointments,
    loadingHospitals,
    loadingProviders,
    error,
    fetchDashboardStats,
    fetchAllDoctors,
    fetchAllPatients,
    fetchAllAdmins,
    fetchAllAppointments,
    fetchAppointmentById,
    fetchAllHospitals,
    verifyHospitalById,
    toggleHospitalById,
    fetchAllProviders,
    removeProviderById,
    removeDoctorById,
    removePatientById,
    removeAdminById,
  };
};

export default useAdmin;
