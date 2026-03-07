"use client";

import { useContext } from "react";
import { usePathname } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import NotificationsPage from "@/app/Components/common/NotificationPage/Notification";
import AddedPrescriptionPage from "@/app/Components/doctors/dashboard/AddedPrescription/AddedPrescription";
import AddPrescriptionPage from "@/app/Components/doctors/dashboard/Addprescription/Addprescription";
import MyAppointments from "@/app/Components/doctors/dashboard/Appointments/Appointments";
import Sidebar from "@/app/Components/doctors/dashboard/components/Sidebar";
import TopNav from "@/app/Components/doctors/dashboard/components/Topbar";
import DoctorProfileForm from "@/app/Components/doctors/dashboard/Doctorprofileform/Doctorprofileform";
import DashboardHome from "@/app/Components/doctors/dashboard/Home/Home";
import AllPatients from "../Components/doctors/dashboard/AllPatients/AllPatients";
import BlogPage from "../Components/doctors/dashboard/Blogs/Blog";
import PremiumPage from "../Components/doctors/dashboard/PremiumPage/PremiumPage";
import RoleGuard from "../Components/RoleGuard/RoleGuard";
import PlansDisplay from "../Components/common/PlansDisplay/PlansDisplay";
import DoctorReviews from "../Components/doctors/dashboard/Doctorreviews/Doctorreviews";
import DoctorGalleryManager from "../Components/doctors/dashboard/DoctorGalleryManager/DoctorGalleryManager";
import DoctorVideoCall from "../Components/doctors/dashboard/DoctorVideoCall/DoctorVideoCall";

export default function DoctorDashboard() {
  const pathname = usePathname();
  const { UserAuthData } = useContext(AuthContext);

  let MainContent = <DashboardHome />;

  if (pathname === "/doctor/dashboard") {
    MainContent = <DashboardHome />;
  } else if (pathname === "/doctor/Appointments") {
    MainContent = <MyAppointments />;
  } else if (pathname === "/doctor/profile") {
    MainContent = <DoctorProfileForm />;
  } else if (pathname === "/doctor/notifications") {
    MainContent = <NotificationsPage />;
  } else if (pathname.startsWith("/doctor/Addprescription/")) {
    MainContent = <AddPrescriptionPage />;
  } else if (pathname.startsWith("/doctor/AddedPrescription")) {
    MainContent = <AddedPrescriptionPage />;
  } else if (pathname.startsWith("/doctor/patients")) {
    MainContent = <AllPatients />;
  } else if (pathname.startsWith("/doctor/plans")) {
    MainContent = <PlansDisplay />;
  } else if (pathname.startsWith("/doctor/blog")) {
    MainContent = <BlogPage />;
  } else if (pathname.startsWith("/doctor/reviews")) {
    MainContent = <DoctorReviews />;
  } else if (pathname.startsWith("/doctor/doctorGalleryManager")) {
    MainContent = <DoctorGalleryManager />;
  } else if (pathname.startsWith("/doctor/video-call/")) {
    const patientId = pathname.split("/doctor/video-call/")[1];
    return (
      <RoleGuard allowedRoles={["doctor"]}>
        <DoctorVideoCall patientId={patientId} role="doctor" />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={["doctor"]}>
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-auto p-6">
            {MainContent}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
