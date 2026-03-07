"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminProvider } from "../context/AdminContext";
import Sidebar from "../Components/admin/components/Sidebar";
import Navbar from "../Components/admin/components/Navbar";
import RoleGuard from "../Components/RoleGuard/RoleGuard";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const isAuthPage = pathname === "/admin/auth";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <AdminProvider>
        <div
          className="flex h-screen bg-slate-50 overflow-hidden"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
            ::-webkit-scrollbar { width: 5px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
          `}</style>

          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          <div className="flex-1 flex flex-col overflow-hidden">
            <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </AdminProvider>
    </RoleGuard>
  );
}
