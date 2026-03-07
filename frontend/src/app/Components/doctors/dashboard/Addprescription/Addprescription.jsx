"use client"
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useAppointment from "@/app/hooks/useAppointment";
import { usePrescription } from "@/app/hooks/usePrescription";

const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "Four times daily", "Every 6 hours", "Every 8 hours", "As needed", "Weekly"];
const DURATIONS = ["3 days", "5 days", "7 days", "10 days", "14 days", "1 month", "2 months", "3 months", "Ongoing"];

const emptyMedicine = () => ({
  id: Date.now(),
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

export default function AddPrescriptionPage() {
  const { id } = useParams();
  const { getAppointmentById } = useAppointment();
  const { addPrescription, fetchPrescriptionById, loading, error } = usePrescription();

  const [appointmentData, setAppointmentData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [existingPrescription, setExistingPrescription] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const router = useRouter();

  const [form, setForm] = useState({
    diagnosis: "",
    symptoms: "",
    advice: "",
    followUpDate: "",
    notes: "",
    status: "active",
  });

  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [activeTab, setActiveTab] = useState("details");
  const [successMsg, setSuccessMsg] = useState("");

useEffect(() => {
  if (!id) return;
  const fetchData = async () => {
    setFetchLoading(true);
    setFetchError(null);

    const apptResult = await getAppointmentById(id);
    if (apptResult?.data) {
      setAppointmentData(apptResult.data.data);
    } else {
      setFetchError("Failed to load appointment details.");
      setFetchLoading(false);
      return;
    }

    const rxResult = await fetchPrescriptionById(id);
    if (rxResult?.success && rxResult?.data) {
      const rx = rxResult.data;
      setExistingPrescription(rx);
      setForm({
        diagnosis: rx.diagnosis || "",
        symptoms: rx.symptoms || "",
        advice: rx.advice || "",
        followUpDate: rx.followUpDate ? rx.followUpDate.slice(0, 10) : "",
        notes: rx.notes || "",
        status: rx.status || "active",
      });
      setMedicines(
        rx.medicines?.length
          ? rx.medicines.map((m) => ({ ...m, id: Date.now() + Math.random() }))
          : [emptyMedicine()]
      );
    }

    setFetchLoading(false);
  };
  fetchData();
}, [id]);


  const handleFormChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleMedChange = (medId, field, value) => {
    setMedicines((meds) =>
      meds.map((m) => (m.id === medId ? { ...m, [field]: value } : m))
    );
  };

  const addMedicine = () => setMedicines((meds) => [...meds, emptyMedicine()]);
  const removeMedicine = (medId) =>
    setMedicines((meds) => meds.filter((m) => m.id !== medId));

  const handleEnterUpdateMode = () => {
    setIsUpdateMode(true);
    setActiveTab("details");
  };

  const handleSubmit = async () => {
    if (!appointmentData) return;

    const payload = {
      patientId: appointmentData.Patient?._id,
      doctorId: appointmentData.doctor?._id,
      appointmentId: appointmentData._id,
      diagnosis: form.diagnosis,
      symptoms: form.symptoms,
      advice: form.advice,
      notes: form.notes,
      status: form.status,
      followUpDate: form.followUpDate || undefined,
      medicines: medicines.map(({ id: _id, ...m }) => m),
    };

    const result = await addPrescription(payload);
    if (result?.success) {
      setSuccessMsg("Prescription added successfully!");
      setForm({
        diagnosis: "",
        symptoms: "",
        advice: "",
        followUpDate: "",
        notes: "",
        status: "active",
      });
      setMedicines([emptyMedicine()]);
      setActiveTab("details");
      setTimeout(() => {
        router.push("/dashboard/doctor/Appointments");
      }, 1000);
    }
  };

  const handleUpdate = async () => {
    // plug in your update API call here using existingPrescription._id
  };

  const tabs = [
    { key: "details", label: "Clinical Details" },
    { key: "medicines", label: `Medicines (${medicines.length})` },
    { key: "notes", label: "Notes & Follow-up" },
  ];

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-teal-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <p className="text-slate-500 text-sm">Loading appointment...</p>
        </div>
      </div>
    );
  }

  if (fetchError || !appointmentData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-6 py-4 text-sm">
          {fetchError || "Appointment not found."}
        </div>
      </div>
    );
  }

  if (existingPrescription && !isUpdateMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8 flex flex-col items-center text-center gap-5">
          <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-teal-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-1">Prescription Already Exists</h2>
            <p className="text-slate-500 text-sm">
              A prescription has already been issued for this appointment. You can update it if needed.
            </p>
          </div>
          <div className="w-full bg-slate-50 rounded-xl border border-slate-200 p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Diagnosis</span>
              <span className="text-slate-800 font-semibold">{existingPrescription.diagnosis || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Medicines</span>
              <span className="text-slate-800 font-semibold">{existingPrescription.medicines?.length ?? 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 font-medium">Status</span>
              <span className={`capitalize font-semibold text-sm ${
                existingPrescription.status === "active" ? "text-teal-600"
                : existingPrescription.status === "completed" ? "text-blue-600"
                : "text-rose-500"
              }`}>
                {existingPrescription.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => router.push("/dashboard/doctor/Appointments")}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition"
            >
              Go Back
            </button>
            <button
              type="button"
              onClick={handleEnterUpdateMode}
              className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition shadow-sm"
            >
              Update Prescription
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight" style={{ fontFamily: "'Georgia', serif" }}>
              {isUpdateMode ? "Update Prescription" : "New Prescription"}
            </h1>
          </div>
          <p className="text-slate-500 text-sm pl-11">
            {isUpdateMode ? "Modify the existing prescription details" : "Fill in all required fields to issue a prescription"}
          </p>
        </div>

        <div className="space-y-0">
          <div className="flex border-b border-slate-200 mb-6 gap-0">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${
                  activeTab === t.key
                    ? "border-teal-600 text-teal-700 bg-white"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "details" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  name="diagnosis"
                  value={form.diagnosis}
                  onChange={handleFormChange}
                  placeholder="e.g. Type 2 Diabetes Mellitus"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent text-sm transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={form.symptoms}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Describe presenting symptoms..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Status
                </label>
                <div className="flex gap-3">
                  {["active", "completed", "cancelled"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all capitalize ${
                        form.status === s
                          ? s === "active" ? "bg-teal-600 text-white border-teal-600"
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
            </div>
          )}

          {activeTab === "medicines" && (
            <div className="space-y-4">
              {medicines.map((med, idx) => (
                <div key={med.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-semibold text-teal-600 uppercase tracking-widest">
                      Medicine {idx + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(med.id)}
                        className="text-slate-400 hover:text-red-500 transition p-1 rounded-lg hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Medicine Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={med.name}
                        onChange={(e) => handleMedChange(med.id, "name", e.target.value)}
                        placeholder="e.g. Metformin"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Dosage <span className="text-red-500">*</span>
                      </label>
                      <input
                        value={med.dosage}
                        onChange={(e) => handleMedChange(med.id, "dosage", e.target.value)}
                        placeholder="e.g. 500mg"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Frequency <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={med.frequency}
                        onChange={(e) => handleMedChange(med.id, "frequency", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition bg-white"
                      >
                        <option value="">Select frequency</option>
                        {FREQUENCIES.map((f) => <option key={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Duration <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={med.duration}
                        onChange={(e) => handleMedChange(med.id, "duration", e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition bg-white"
                      >
                        <option value="">Select duration</option>
                        {DURATIONS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">
                        Special Instructions
                      </label>
                      <input
                        value={med.instructions}
                        onChange={(e) => handleMedChange(med.id, "instructions", e.target.value)}
                        placeholder="e.g. Take after meals"
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addMedicine}
                className="w-full py-3 rounded-xl border-2 border-dashed border-teal-300 text-teal-600 text-sm font-semibold hover:bg-teal-50 hover:border-teal-400 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Another Medicine
              </button>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Advice to Patient
                </label>
                <textarea
                  name="advice"
                  value={form.advice}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Diet, lifestyle, activity restrictions..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="followUpDate"
                    value={form.followUpDate}
                    onChange={handleFormChange}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  Internal Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows={3}
                  placeholder="Private notes for medical records..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm transition resize-none"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mt-4">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-teal-50 border border-teal-200 text-teal-700 rounded-xl px-4 py-3 text-sm mt-4">
              {successMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-6">
            <div className="flex gap-2">
              {tabs.map((t) => (
                <div
                  key={t.key}
                  className={`h-2 rounded-full transition-all ${activeTab === t.key ? "bg-teal-600 w-5" : "bg-slate-300 w-2"}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              {activeTab !== "details" && (
                <button
                  type="button"
                  onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.key === activeTab) - 1]?.key)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-100 transition"
                >
                  Back
                </button>
              )}
              {activeTab !== "notes" ? (
                <button
                  type="button"
                  onClick={() => setActiveTab(tabs[tabs.findIndex(t => t.key === activeTab) + 1]?.key)}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition shadow-sm"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={isUpdateMode ? handleUpdate : handleSubmit}
                  className="px-7 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                >
                  {loading && (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {isUpdateMode ? "Update Prescription" : "Issue Prescription"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
