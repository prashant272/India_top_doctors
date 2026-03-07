"use client"
import { useEffect } from "react";
import { useAdminContext } from "@/app/context/AdminContext";

const statusColors = {
  completed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
  confirmed: "bg-blue-100 text-blue-700",
  "in-progress": "bg-violet-100 text-violet-700",
};

const consultationBadge = {
  video: "bg-cyan-50 text-cyan-600",
  "in-person": "bg-teal-50 text-teal-600",
  online: "bg-cyan-50 text-cyan-600",
};

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 8 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-slate-100 rounded w-20" />
      </td>
    ))}
  </tr>
);

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const shortId = (id = "") => id.slice(-6).toUpperCase();

export default function AppointmentsTable() {
  const { appointments, loadingAppointments, fetchAllAppointments } = useAdminContext();

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-slate-800">All Appointments</h2>
          {!loadingAppointments && (
            <span className="text-xs bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded-full">
              {appointments.length}
            </span>
          )}
        </div>
        <button
          onClick={fetchAllAppointments}
          className="flex items-center gap-1.5 text-teal-500 text-sm font-medium hover:underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left text-xs text-slate-400 font-medium px-5 py-3 whitespace-nowrap">ID</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Patient</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Doctor</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap hidden lg:table-cell">Specialization</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Date</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap hidden md:table-cell">Slot</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap hidden md:table-cell">Type</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Amount</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap hidden md:table-cell">Paid</th>
              <th className="text-left text-xs text-slate-400 font-medium px-4 py-3 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loadingAppointments ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-14">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5" />
                    </svg>
                    <span className="text-sm font-medium">No appointments found</span>
                  </div>
                </td>
              </tr>
            ) : (
              appointments.map((apt) => {
                const id = apt._id || "";
                const patientName = apt.Patient?.basicInfo?.fullName || "—";
                const patientPhone = apt.Patient?.basicInfo?.phone || "";
                const doctorName = apt.doctor?.basicInfo?.fullName || "—";
                const specialization = apt.doctor?.professionalInfo?.specialization || "—";
                const date = formatDate(apt.appointmentDate);
                const slot = apt.timeSlot ? `${apt.timeSlot.start} – ${apt.timeSlot.end}` : "—";
                const type = apt.consultationType || "—";
                const amount = apt.amount !== undefined ? `₹${apt.amount}` : "—";
                const isPaid = apt.isPaid;
                const status = apt.status || "unknown";

                return (
                  <tr key={id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-3.5 text-slate-400 font-mono text-xs whitespace-nowrap">
                      {shortId(id)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-medium text-slate-700">{patientName}</p>
                      {patientPhone && (
                        <p className="text-xs text-slate-400 mt-0.5">{patientPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">{doctorName}</td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs hidden lg:table-cell whitespace-nowrap">{specialization}</td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">{date}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs hidden md:table-cell whitespace-nowrap">{slot}</td>
                    <td className="px-4 py-3.5 hidden md:table-cell whitespace-nowrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${consultationBadge[type] || "bg-slate-100 text-slate-500"}`}>
                        {type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700 whitespace-nowrap">{amount}</td>
                    <td className="px-4 py-3.5 hidden md:table-cell whitespace-nowrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isPaid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[status] || "bg-slate-100 text-slate-500"}`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}