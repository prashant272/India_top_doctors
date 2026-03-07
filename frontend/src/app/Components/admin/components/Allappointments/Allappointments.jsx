"use client";
import { useEffect, useState } from "react";
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
    {Array.from({ length: 10 }).map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-slate-100 rounded w-20" />
      </td>
    ))}
  </tr>
);

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const shortId = (id = "") => id.slice(-6).toUpperCase();

const STATUS_OPTIONS = ["all", "completed", "pending", "confirmed", "cancelled"];
const TYPE_OPTIONS = ["all", "video", "in-person", "online"];

export default function AllAppointments() {
  const { appointments, loadingAppointments, fetchAllAppointments } = useAdminContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const filtered = appointments.filter((apt) => {
    const patientName = apt.Patient?.basicInfo?.fullName || "";
    const doctorName = apt.doctor?.basicInfo?.fullName || "";
    const spec = apt.doctor?.professionalInfo?.specialization || "";
    const q = search.toLowerCase();
    const matchSearch =
      patientName.toLowerCase().includes(q) ||
      doctorName.toLowerCase().includes(q) ||
      spec.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchType = typeFilter === "all" || apt.consultationType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalRevenue = filtered.reduce((sum, a) => sum + (a.isPaid ? a.amount || 0 : 0), 0);
  const pendingCount   = filtered.filter((a) => a.status === "pending").length;
  const completedCount = filtered.filter((a) => a.status === "completed").length;
  const confirmedCount = filtered.filter((a) => a.status === "confirmed").length;
  const cancelledCount = filtered.filter((a) => a.status === "cancelled").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
            All Appointments
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loadingAppointments ? "Loading..." : `${filtered.length} appointment${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={fetchAllAppointments}
          className="flex items-center gap-2 text-sm font-medium text-teal-500 hover:text-teal-700 transition self-start sm:self-auto"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <p className="text-xs text-slate-400 mb-1">Total</p>
          <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Syne', sans-serif" }}>
            {filtered.length}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm p-4">
          <p className="text-xs text-emerald-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-700" style={{ fontFamily: "'Syne', sans-serif" }}>
            {completedCount}
          </p>
        </div>
        <div className="bg-blue-50 rounded-2xl border border-blue-100 shadow-sm p-4">
          <p className="text-xs text-blue-500 mb-1">Confirmed</p>
          <p className="text-2xl font-bold text-blue-700" style={{ fontFamily: "'Syne', sans-serif" }}>
            {confirmedCount}
          </p>
        </div>
        <div className="bg-amber-50 rounded-2xl border border-amber-100 shadow-sm p-4">
          <p className="text-xs text-amber-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-700" style={{ fontFamily: "'Syne', sans-serif" }}>
            {pendingCount}
          </p>
        </div>
        <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-4 col-span-2 sm:col-span-1">
          <p className="text-xs text-red-400 mb-1">Cancelled</p>
          <p className="text-2xl font-bold text-red-600" style={{ fontFamily: "'Syne', sans-serif" }}>
            {cancelledCount}
          </p>
        </div>
        <div className="bg-green-50 rounded-2xl border border-green-100 shadow-sm p-4 col-span-2 sm:col-span-3">
          <p className="text-xs text-green-500 mb-1">Collected Revenue</p>
          <p className="text-2xl font-bold text-green-700" style={{ fontFamily: "'Syne', sans-serif" }}>
            ₹{totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex-1 shadow-sm">
          <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, doctor, specialization..."
            className="bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 bg-white outline-none cursor-pointer shadow-sm capitalize"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s === "all" ? "All Status" : s}
            </option>
          ))}
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 text-slate-600 bg-white outline-none cursor-pointer shadow-sm"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t === "all" ? "All Types" : t}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
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
              ) : filtered.length === 0 ? (
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
                filtered.map((apt) => {
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
                        {patientPhone && <p className="text-xs text-slate-400 mt-0.5">{patientPhone}</p>}
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

        {!loadingAppointments && filtered.length > 0 && (
          <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">{filtered.length} records shown</p>
            <p className="text-xs font-semibold text-emerald-600">
              Collected Revenue: ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
