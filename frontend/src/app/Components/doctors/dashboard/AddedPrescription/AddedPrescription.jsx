"use client";

import { useState, useEffect, useContext } from "react";
import { usePrescription } from "@/app/hooks/usePrescription";
import { AuthContext } from "@/app/context/AuthContext";
import { SocketContext } from "@/app/context/SocketContext";

function StatusBadge({ status }) {
  const styles = {
    active: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-blue-100 text-blue-700 border-blue-200",
    cancelled: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${styles[status] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {status}
    </span>
  );
}

function MedicinePill({ med, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0 text-teal-600 text-xs font-bold">
            {index + 1}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{med.name}</p>
            <p className="text-xs text-slate-400">{med.dosage} · {med.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block bg-slate-100 px-2 py-0.5 rounded-full">{med.duration}</span>
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs pt-3">
          <div>
            <p className="text-slate-400 uppercase tracking-widest font-semibold mb-1">Duration</p>
            <p className="text-slate-700">{med.duration}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-widest font-semibold mb-1">Frequency</p>
            <p className="text-slate-700">{med.frequency}</p>
          </div>
          {med.instructions && (
            <div className="col-span-2">
              <p className="text-slate-400 uppercase tracking-widest font-semibold mb-1">Instructions</p>
              <p className="text-slate-700">{med.instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrescriptionModal({ prescription, onClose }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";
  const info = prescription.patient?.basicInfo;
  const appointment = prescription.appointment;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 text-white rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-teal-100 text-xs uppercase tracking-widest font-medium mb-1">Diagnosis</p>
              <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                {prescription.diagnosis}
              </h2>
              <p className="text-teal-100 text-xs mt-2">
                Issued: {formatDate(prescription.createdAt)}
                {prescription.followUpDate && ` · Follow-up: ${formatDate(prescription.followUpDate)}`}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-4">
              <StatusBadge status={prescription.status} />
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Patient Info</p>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0">
                {info?.fullName?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{info?.fullName || "—"}</p>
                <p className="text-xs text-slate-400 capitalize">{info?.gender || "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Age</p>
                <p className="text-slate-700 font-medium">{info?.age > 0 ? info.age : "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Phone</p>
                <p className="text-slate-700 font-medium">{info?.phone || "—"}</p>
              </div>
              <div>
                <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Gender</p>
                <p className="text-slate-700 font-medium capitalize">{info?.gender || "—"}</p>
              </div>
            </div>
          </div>

          {appointment && (
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Appointment</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">ID</p>
                  <p className="text-slate-700 font-medium">#{appointment._id?.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Date</p>
                  <p className="text-slate-700 font-medium">
                    {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Time</p>
                  <p className="text-slate-700 font-medium">{appointment.timeSlot?.start} – {appointment.timeSlot?.end}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Type</p>
                  <p className="text-slate-700 font-medium capitalize">{appointment.consultationType || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Amount</p>
                  <p className="text-slate-700 font-medium">₹{appointment.amount || "—"}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Payment</p>
                  <p className={`font-medium ${appointment.isPaid ? "text-emerald-600" : "text-rose-500"}`}>
                    {appointment.isPaid ? "Paid" : "Unpaid"}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Status</p>
                  <p className="text-slate-700 font-medium capitalize">{appointment.status || "—"}</p>
                </div>
              </div>
            </div>
          )}

          {prescription.symptoms && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Symptoms</h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                {prescription.symptoms}
              </p>
            </section>
          )}

          {prescription.medicines?.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                Medicines ({prescription.medicines.length})
              </h3>
              <div className="space-y-2">
                {prescription.medicines.map((med, i) => (
                  <MedicinePill key={i} med={med} index={i} />
                ))}
              </div>
            </section>
          )}

          {prescription.advice && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Advice</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-amber-800 leading-relaxed">{prescription.advice}</p>
              </div>
            </section>
          )}

          {prescription.notes && (
            <section>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Internal Notes</h3>
              <p className="text-sm text-slate-500 italic leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                {prescription.notes}
              </p>
            </section>
          )}

          <section className="border-t border-slate-100 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-slate-400 uppercase tracking-widest font-semibold mb-1">Created</p>
              <p className="text-slate-600">{formatDate(prescription.createdAt)}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase tracking-widest font-semibold mb-1">Last Updated</p>
              <p className="text-slate-600">{formatDate(prescription.updatedAt)}</p>
            </div>
            {prescription.followUpDate && (
              <div>
                <p className="text-slate-400 uppercase tracking-widest font-semibold mb-1">Follow-up</p>
                <p className="text-teal-600 font-semibold">{formatDate(prescription.followUpDate)}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function PrescriptionCard({ prescription, onClick }) {
  const info = prescription.patient?.basicInfo;
  const appointment = prescription.appointment;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer p-5 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {info?.fullName?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{info?.fullName || "—"}</p>
            <p className="text-xs text-slate-400 capitalize">{info?.gender || "—"} {info?.age > 0 ? `· ${info.age} yrs` : ""}</p>
          </div>
        </div>
        <StatusBadge status={prescription.status} />
      </div>

      <div className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Diagnosis</p>
        <p className="text-sm font-medium text-slate-700">{prescription.diagnosis || "—"}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Medicines</p>
          <p className="text-slate-700 font-medium">{prescription.medicines?.length || 0} item{prescription.medicines?.length !== 1 ? "s" : ""}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Issued</p>
          <p className="text-slate-700 font-medium">{formatDate(prescription.createdAt)}</p>
        </div>
        <div>
          <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Follow-up</p>
          <p className="text-teal-600 font-medium">{formatDate(prescription.followUpDate)}</p>
        </div>
      </div>

      {appointment && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span>Appt #{appointment._id?.slice(-8).toUpperCase()}</span>
          <span className="capitalize">{appointment.consultationType || "—"} · {appointment.timeSlot?.start || "—"}</span>
        </div>
      )}
    </div>
  );
}

function StatsBar({ prescriptions }) {
  const total = prescriptions.length;
  const active = prescriptions.filter((p) => p.status === "active").length;
  const completed = prescriptions.filter((p) => p.status === "completed").length;
  const cancelled = prescriptions.filter((p) => p.status === "cancelled").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { label: "Total", value: total, color: "text-slate-700", bg: "bg-slate-100" },
        { label: "Active", value: active, color: "text-emerald-700", bg: "bg-emerald-50" },
        { label: "Completed", value: completed, color: "text-blue-700", bg: "bg-blue-50" },
        { label: "Cancelled", value: cancelled, color: "text-rose-700", bg: "bg-rose-50" },
      ].map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 border border-slate-100`}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
          <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default function DoctorPrescriptionsPage() {
  const { fetchPrescription, loading } = usePrescription();
  const { UserAuthData } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const doctorId = UserAuthData.userId;

  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (!doctorId) return;
    const load = async () => {
      const result = await fetchPrescription();
      if (result?.success && result?.data?.data?.length > 0) {
        setPrescriptions(result.data.data);
      } else {
        setPrescriptions([]);
      }
    };
    load();
  }, [doctorId]);

  useEffect(() => {
    if (!socket) return;

    const handlePrescriptionAdded = ({ notification }) => {
      const newPrescription = notification?.appointment;
      if (newPrescription) {
        setPrescriptions((prev) => [newPrescription, ...prev]);
      }
    };

    socket.on("prescriptionAdded", handlePrescriptionAdded);

    return () => {
      socket.off("prescriptionAdded", handlePrescriptionAdded);
    };
  }, [socket]);

  const filtered = prescriptions.filter((p) => {
    const name = p.patient?.basicInfo?.fullName?.toLowerCase() || "";
    const diagnosis = p.diagnosis?.toLowerCase() || "";
    const matchSearch = name.includes(search.toLowerCase()) || diagnosis.includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 animate-spin text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading prescriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            My Prescriptions
          </h1>
          <p className="text-slate-500 text-sm mt-1">All prescriptions you have issued to patients</p>
        </div>

        <StatsBar prescriptions={prescriptions} />

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or diagnosis..."
              className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 transition bg-white"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["all", "active", "completed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                  filterStatus === s
                    ? s === "all" ? "bg-slate-800 text-white border-slate-800"
                      : s === "active" ? "bg-emerald-600 text-white border-emerald-600"
                      : s === "completed" ? "bg-blue-600 text-white border-blue-600"
                      : "bg-rose-500 text-white border-rose-500"
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm font-medium">
              {search || filterStatus !== "all" ? "No prescriptions match your filters" : "No prescriptions issued yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((prescription) => (
              <PrescriptionCard
                key={prescription._id}
                prescription={prescription}
                onClick={() => setSelectedPrescription(prescription)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </div>
  );
}
