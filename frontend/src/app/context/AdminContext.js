"use client"
import React, { createContext, useContext } from "react";
import useAdmin from "../hooks/useAdmin";

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const admin = useAdmin();

  return (
    <AdminContext.Provider value={admin}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);

  return context;
};