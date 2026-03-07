"use client";

import { usePrescription } from "@/app/hooks/usePrescription";
import { useEffect, useState, useContext, useCallback } from "react";
import { SocketContext } from "@/app/context/SocketContext";

const statusColors = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

function MedicinePill({ med }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{med.name}</p>
            <p className="text-xs text-slate-400">{med.dosage} · {med.frequency}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:block">{med.duration}</span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Duration</p>
            <p className="text-slate-700">{med.duration}</p>
          </div>
          <div>
            <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Frequency</p>
            <p className="text-slate-700">{med.frequency}</p>
          </div>
          {med.instructions && (
            <div className="col-span-2">
              <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Instructions</p>
              <p className="text-slate-700">{med.instructions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function PrescriptionCard({ rx, isSelected, onClick, isNew }) {
  const date = new Date(rx.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isNew
          ? "border-teal-400 bg-teal-50 shadow-md ring-2 ring-teal-300 ring-offset-1"
          : isSelected
          ? "border-teal-500 bg-teal-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 leading-tight">{rx.diagnosis}</p>
          {isNew && (
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-teal-500 text-white rounded-full uppercase tracking-wide">
              New
            </span>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ml-2 flex-shrink-0 ${statusColors[rx.status] || statusColors.Active}`}>
          {rx.status}
        </span>
      </div>
      <p className="text-xs text-slate-400">{date} · {rx.medicines?.length || 0} medicine{rx.medicines?.length !== 1 ? "s" : ""}</p>
    </button>
  );
}

export default function YourPrescription() {
  const { fetchPrescription, loading, error } = usePrescription();
  const { socket } = useContext(SocketContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [newPrescriptionId, setNewPrescriptionId] = useState(null);

  const loadPrescriptions = useCallback(async (selectId = null) => {
    const result = await fetchPrescription();
    if (result?.data?.data) {
      const list = result.data.data;
      setPrescriptions(list);
      if (selectId) {
        const found = list.find((p) => p._id === selectId);
        setSelected(found || list[0] || null);
      } else {
        setSelected((prev) => prev ? list.find((p) => p._id === prev._id) || list[0] : list[0] || null);
      }
    }
  }, [fetchPrescription]);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePrescriptionAdded = ({ notification, data }) => {
      const prescriptionId = data?._id || notification?.data?._id || null;
      setNewPrescriptionId(prescriptionId);
      loadPrescriptions(prescriptionId);

      // Clear "New" badge after 8 seconds
      setTimeout(() => setNewPrescriptionId(null), 8000);
    };

    socket.on("prescriptionAdded", handlePrescriptionAdded);

    return () => {
      socket.off("prescriptionAdded", handlePrescriptionAdded);
    };
  }, [socket, loadPrescriptions]);

  const rx = selected;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—";

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
            Prescription History
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {prescriptions.length} prescription{prescriptions.length !== 1 ? "s" : ""} on record
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-48">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {!loading && !error && prescriptions.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            <p className="text-sm">No prescriptions found</p>
          </div>
        )}

        {!loading && prescriptions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="space-y-2">
              {prescriptions.map((p) => (
                <PrescriptionCard
                  key={p._id}
                  rx={p}
                  isSelected={selected?._id === p._id}
                  isNew={newPrescriptionId === p._id}
                  onClick={() => setSelected(p)}
                />
              ))}
            </div>

            {rx && (
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

                <div className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-5 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-teal-100 text-xs uppercase tracking-widest font-medium mb-1">Diagnosis</p>
                      <h2 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Georgia', serif" }}>
                        {rx.diagnosis}
                      </h2>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize border ${
                      rx.status === "Active"
                        ? "bg-white/20 text-white border-white/30"
                        : rx.status === "completed"
                        ? "bg-blue-200/30 text-blue-100 border-blue-200/40"
                        : "bg-rose-200/30 text-rose-100 border-rose-200/40"
                    }`}>
                      {rx.status}
                    </span>
                  </div>
                  <p className="text-teal-100 text-xs mt-3">
                    Issued: {formatDate(rx.createdAt)}
                    {rx.followUpDate && ` · Follow-up: ${formatDate(rx.followUpDate)}`}
                  </p>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[600px]">

                  {rx.symptoms && (
                    <section>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Symptoms</h3>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl px-4 py-3">{rx.symptoms}</p>
                    </section>
                  )}

                  {rx.medicines?.length > 0 && (
                    <section>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
                        Medicines ({rx.medicines.length})
                      </h3>
                      <div className="space-y-2">
                        {rx.medicines.map((med, i) => (
                          <MedicinePill key={i} med={med} />
                        ))}
                      </div>
                    </section>
                  )}

                  {rx.advice && (
                    <section>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Advice</h3>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex gap-3">
                        <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-amber-800 leading-relaxed">{rx.advice}</p>
                      </div>
                    </section>
                  )}

                  {rx.notes && (
                    <section>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Internal Notes</h3>
                      <p className="text-sm text-slate-500 italic leading-relaxed">{rx.notes}</p>
                    </section>
                  )}

                  <section className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Created</p>
                      <p className="text-slate-600">{formatDate(rx.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Last Updated</p>
                      <p className="text-slate-600">{formatDate(rx.updatedAt)}</p>
                    </div>
                    {rx.followUpDate && (
                      <div>
                        <p className="text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Follow-up</p>
                        <p className="text-teal-600 font-medium">{formatDate(rx.followUpDate)}</p>
                      </div>
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
