"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import * as patientService from "@/app/services/patient.service";

const initialState = {
  doctors: [],
  loading: false,
  error: null,
};

export const PatientContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_DOCTORS_START":
      return { ...state, loading: true, error: null };
    case "LOAD_DOCTORS_SUCCESS":
      return {
        ...state,
        loading: false,
        doctors: action.payload?.DoctorList || action.payload || [],
      };
    case "LOAD_DOCTORS_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export const PatientProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadDoctors = useCallback(async () => {
    if (state.doctors.length > 0) return; 
    dispatch({ type: "LOAD_DOCTORS_START" });
    try {
      const res = await patientService.getDoctors();
      dispatch({ type: "LOAD_DOCTORS_SUCCESS", payload: res?.data });
    } catch (err) {
      dispatch({
        type: "LOAD_DOCTORS_ERROR",
        payload: err?.message || "Failed to load doctors",
      });
    }
  }, [state.doctors.length]);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  const value = useMemo(
    () => ({
      doctorList: state.doctors,
      loading: state.loading,
      error: state.error,
      dispatch,
    }),
    [state]
  );

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error("usePatientContext must be used within PatientProvider");
  return ctx;
};
