"use client";

import { useState, useEffect, useContext, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { usePatientContext } from "@/app/context/PatientContext";
import { AuthContext } from "@/app/context/AuthContext";
import {
  ArrowLeft, Calendar, Clock, User, CheckCircle,
  AlertCircle, Stethoscope, FileText, IndianRupee, Loader2, MapPin, Video, Building2,
} from "lucide-react";

const WORKING_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const periodOrder = ["Morning", "Afternoon", "Evening"];
const periodIcons = { Morning: "🌅", Afternoon: "☀️", Evening: "🌙" };

function generateTimeSlots(start, end, durationMin) {
  const slots = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);
  let current = startH * 60 + startM;
  const endTotal = endH * 60 + endM;
  const fmt = (hh, mm) => {
    const p = hh < 12 ? "AM" : "PM";
    const dh = hh % 12 || 12;
    return `${dh}:${mm.toString().padStart(2, "0")} ${p}`;
  };
  while (current + durationMin <= endTotal) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    const next = current + durationMin;
    const nh = Math.floor(next / 60);
    const nm = next % 60;
    slots.push({
      start: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`,
      end: `${nh.toString().padStart(2, "0")}:${nm.toString().padStart(2, "0")}`,
      label: `${fmt(h, m)} – ${fmt(nh, nm)}`,
      period: h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening",
    });
    current += durationMin;
  }
  return slots;
}

function normalizeDoctorList(doctorList) {
  if (Array.isArray(doctorList)) return doctorList;
  if (Array.isArray(doctorList?.DoctorList)) return doctorList.DoctorList;
  if (Array.isArray(doctorList?.data)) return doctorList.data;
  return [];
}

// Expands a single availability slot with consultationMode "both"
// into two virtual entries: one "online" and one "offline"
function expandAvailability(availabilityList) {
  const expanded = [];
  for (const avail of availabilityList) {
    if (avail.consultationMode === "both") {
      expanded.push({ ...avail, consultationMode: "online", _originalId: avail._id, _id: `${avail._id}_online` });
      expanded.push({ ...avail, consultationMode: "offline", _originalId: avail._id, _id: `${avail._id}_offline` });
    } else {
      expanded.push(avail);
    }
  }
  return expanded;
}

export default function BookAppointment() {
  const params = useParams();
  const router = useRouter();
  const { doctorList } = usePatientContext();
  const { UserAuthData: auth } = useContext(AuthContext);

  const [doctor, setDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState(null);

  const [form, setForm] = useState({
    appointmentDate: "",
    selectedDay: "",
    timeSlot: null,
    symptoms: "",
    notes: "",
  });

  useEffect(() => {
    const list = normalizeDoctorList(doctorList);
    if (!params?.id) return;
    if (list.length === 0) {
      const timer = setTimeout(() => setIsLoading(false), 3000);
      return () => clearTimeout(timer);
    }
    const found = list.find((d) => d._id === params.id);
    if (found) {
      setDoctor(found);
      const avail = Array.isArray(found?.availability) ? found.availability : [];
      if (avail.length > 0) {
        const expanded = expandAvailability(avail);
        const firstMode = expanded[0]?.consultationMode || "offline";
        setSelectedMode(firstMode);
        setSelectedAvailabilityId(expanded[0]?._id || null);
      }
    }
    setIsLoading(false);
  }, [params?.id, doctorList, auth]);

  const availabilityList = useMemo(
    () => expandAvailability(Array.isArray(doctor?.availability) ? doctor.availability : []),
    [doctor]
  );

  const availableModes = useMemo(
    () => [...new Set(availabilityList.map((a) => a.consultationMode).filter(Boolean))],
    [availabilityList]
  );

  const filteredAvailability = useMemo(
    () => availabilityList.filter((a) => a.consultationMode === selectedMode),
    [availabilityList, selectedMode]
  );

  const selectedAvailability = useMemo(
    () => filteredAvailability.find((a) => a._id === selectedAvailabilityId) || filteredAvailability[0] || null,
    [filteredAvailability, selectedAvailabilityId]
  );

  const doctorName = doctor?.basicInfo?.fullName || "Doctor";
  const fee = doctor?.professionalInfo?.consultationFee || 0;
  const specialization = doctor?.professionalInfo?.specialization || "Specialist";
  const startTime = selectedAvailability?.startTime || "09:00";
  const endTime = selectedAvailability?.endTime || "17:00";
  const slotDuration = selectedAvailability?.slotDuration || 30;
  const workingDays = selectedAvailability?.workingDays || [];
  const location = selectedAvailability?.location || null;

  const patientName = auth?.fullName || auth?.name || "";
  const patientEmail = auth?.email || "";
  const patientPhone = auth?.phone || auth?.phoneNumber || "";

  const timeSlots = useMemo(
    () => generateTimeSlots(startTime, endTime, slotDuration),
    [startTime, endTime, slotDuration]
  );

  const groupedSlots = useMemo(
    () =>
      timeSlots.reduce((acc, slot) => {
        acc[slot.period] = acc[slot.period] || [];
        acc[slot.period].push(slot);
        return acc;
      }, {}),
    [timeSlots]
  );

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    const first = availabilityList.find((a) => a.consultationMode === mode);
    setSelectedAvailabilityId(first?._id || null);
    setForm((prev) => ({ ...prev, appointmentDate: "", selectedDay: "", timeSlot: null }));
  };

  const handleAvailabilityChange = (id) => {
    setSelectedAvailabilityId(id);
    setForm((prev) => ({ ...prev, appointmentDate: "", selectedDay: "", timeSlot: null }));
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) return;
    const dayName = WORKING_DAYS[new Date(value).getDay()];
    setForm((prev) => ({ ...prev, appointmentDate: value, selectedDay: dayName, timeSlot: null }));
  };

  const isValidWorkingDay = (dateStr) => {
    if (!dateStr) return false;
    return workingDays.includes(WORKING_DAYS[new Date(dateStr).getDay()]);
  };

  const hasSelectedDate = !!form.appointmentDate;
  const isDateValid = hasSelectedDate && isValidWorkingDay(form.appointmentDate);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!selectedAvailability) return setError("Please select a consultation mode");
    if (!form.appointmentDate) return setError("Please select an appointment date");
    if (!isDateValid) return setError("Doctor is not available on the selected day");
    if (!form.timeSlot) return setError("Please select a time slot");

    const patientId = auth?.userId || auth?._id;
    if (!patientId) return setError("Please login again");

    // Derive consultationType directly from selectedMode — never from a fallback
    const consultationType = selectedMode === "online" ? "video" : "in-person";

    // Use the original DB _id for the availabilityId (strip _online/_offline suffix if expanded)
    const realAvailabilityId = selectedAvailability._originalId || selectedAvailability._id;

    const query = new URLSearchParams({
      doctorId: doctor._id,
      patientId,
      availabilityId: realAvailabilityId,
      doctorName,
      specialization,
      date: form.appointmentDate,
      timeSlotStart: form.timeSlot.start,
      timeSlotEnd: form.timeSlot.end,
      timeSlotLabel: form.timeSlot.label,
      consultationMode: selectedMode,
      consultationType,
      amount: String(fee),
      symptoms: form.symptoms.trim(),
      notes: form.notes.trim(),
      clinicName: location?.clinicName || "",
      clinicAddress: location
        ? `${location.addressLine}, ${location.city}, ${location.state}`
        : "",
    });

    router.push(`/patient/payment?${query.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-3 text-slate-800">Doctor not found</h2>
          <p className="text-slate-500 mb-6">The doctor you are trying to book is not available.</p>
          <button
            onClick={() => router.push("/doctors")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            Back to Doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white py-8 shadow-sm">
        <div className="max-w-5xl mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 mb-3 text-sm hover:text-teal-100 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h1 className="text-3xl font-semibold tracking-tight">Book Appointment</h1>
          <p className="text-sm text-teal-100 mt-1">
            Choose consultation mode, date and time, then complete payment to confirm.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 flex items-center gap-0">
          {[
            { step: 1, label: "Select Slot", active: true },
            { step: 2, label: "Payment", active: false },
            { step: 3, label: "Confirmed", active: false },
          ].map((s, i) => (
            <div key={s.step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${s.active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {s.step}
                </div>
                <p className={`text-xs mt-1 font-medium ${s.active ? "text-teal-700" : "text-slate-400"}`}>{s.label}</p>
              </div>
              {i < 2 && <div className="h-0.5 w-full bg-slate-200 mx-2 mb-4" />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center border border-teal-100 shrink-0">
              <Stethoscope className="text-teal-600" size={30} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-slate-800">{doctorName}</h2>
              <p className="text-sm text-teal-700 font-medium">{specialization}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                {selectedAvailability && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-50 border border-slate-200">
                    <Clock size={13} /> {startTime} – {endTime}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-semibold">
                  <IndianRupee size={13} /> {fee}
                </span>
                {workingDays.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                    <Calendar size={13} /> {workingDays.join(", ")}
                  </span>
                )}
                {selectedMode && (
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border font-medium ${selectedMode === "online" ? "bg-violet-50 border-violet-100 text-violet-700" : "bg-orange-50 border-orange-100 text-orange-700"}`}>
                    {selectedMode === "online" ? <Video size={12} /> : <Building2 size={12} />}
                    {selectedMode === "online" ? "Online / Video" : "In-Person / Clinic"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-800">
                <Stethoscope size={20} className="text-teal-600" /> Consultation Mode
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                {availableModes.length === 1
                  ? `Only ${availableModes[0] === "online" ? "online / video" : "in-person / clinic"} consultation is available.`
                  : "This doctor offers both online and in-person consultations."}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {availableModes.map((mode) => {
                  const isSelected = selectedMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeChange(mode)}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium text-sm ${
                        isSelected
                          ? mode === "online"
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-orange-400 bg-orange-50 text-orange-700"
                          : "border-slate-200 bg-slate-50 text-slate-500 hover:border-teal-300 hover:bg-teal-50/40"
                      }`}
                    >
                      {mode === "online"
                        ? <Video size={24} className={isSelected ? "text-violet-600" : "text-slate-400"} />
                        : <Building2 size={24} className={isSelected ? "text-orange-500" : "text-slate-400"} />
                      }
                      <span>{mode === "online" ? "Online / Video" : "In-Person / Clinic"}</span>
                      {isSelected && (
                        <CheckCircle size={14} className={mode === "online" ? "text-violet-500" : "text-orange-500"} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredAvailability.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                  <MapPin size={20} className="text-teal-600" /> Select Clinic
                </h3>
                <div className="space-y-3">
                  {filteredAvailability.map((avail) => {
                    const isSelected = (selectedAvailability?._id ?? selectedAvailabilityId) === avail._id;
                    return (
                      <button
                        key={avail._id}
                        type="button"
                        onClick={() => handleAvailabilityChange(avail._id)}
                        className={`w-full text-left p-4 rounded-lg border transition-all ${
                          isSelected
                            ? "border-teal-500 bg-teal-50 ring-1 ring-teal-400"
                            : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-teal-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {avail.location?.clinicName || "Clinic"}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {avail.location?.addressLine}, {avail.location?.city}, {avail.location?.state}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                              <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                                <Clock size={10} className="inline mr-1" />
                                {avail.startTime} – {avail.endTime}
                              </span>
                              <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                                {avail.workingDays.slice(0, 3).join(", ")}{avail.workingDays.length > 3 ? "…" : ""}
                              </span>
                            </div>
                          </div>
                          {isSelected && <CheckCircle size={18} className="text-teal-600 shrink-0 mt-0.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <User size={20} className="text-teal-600" /> Patient Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Name", value: patientName, type: "text" },
                  { label: "Email", value: patientEmail, type: "email" },
                  { label: "Phone", value: patientPhone, type: "tel" },
                ].map(({ label, value, type }) => (
                  <div key={label}>
                    <label className="block text-xs mb-1 font-medium text-slate-600">{label}</label>
                    <input
                      type={type}
                      value={value}
                      readOnly
                      className="w-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none cursor-default select-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Calendar size={20} className="text-teal-600" /> Select Date
              </h3>
              <input
                type="date"
                value={form.appointmentDate}
                min={new Date().toISOString().split("T")[0]}
                onChange={handleDateChange}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {workingDays.length > 0 && (
                <p className="mt-2 text-xs text-slate-400">Available on: {workingDays.join(", ")}</p>
              )}
              {hasSelectedDate && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${isDateValid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                  {isDateValid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  {isDateValid
                    ? `✓ Available — ${form.selectedDay}`
                    : `✗ Not available — ${form.selectedDay}. Please choose another day.`}
                </div>
              )}
            </div>

            {isDateValid && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                <h3 className="text-lg font-semibold mb-1 flex items-center gap-2 text-slate-800">
                  <Clock size={20} className="text-teal-600" /> Available Time Slots
                </h3>
                <p className="text-xs text-slate-500 mb-5">
                  {slotDuration} min slots • {startTime} – {endTime}
                </p>
                <div className="space-y-6">
                  {periodOrder.map((period) =>
                    groupedSlots[period]?.length > 0 && (
                      <div key={period}>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg">{periodIcons[period]}</span>
                          <h4 className="font-semibold text-slate-700 text-sm">{period}</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {groupedSlots[period].map((slot) => {
                            const isSelected = form.timeSlot?.start === slot.start;
                            return (
                              <button
                                key={slot.start}
                                type="button"
                                onClick={() => setForm((p) => ({ ...p, timeSlot: slot }))}
                                className={`py-2.5 px-2 rounded-lg border text-center text-xs font-medium transition-all ${
                                  isSelected
                                    ? "bg-teal-600 text-white border-teal-700 shadow-md scale-[1.02]"
                                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-400"
                                }`}
                              >
                                {slot.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}
                </div>
                {form.timeSlot && (
                  <div className="mt-5 p-3 bg-teal-50 border border-teal-200 rounded-lg flex items-center gap-2 text-xs text-teal-800">
                    <CheckCircle size={16} />
                    <span className="font-medium">Selected: {form.timeSlot.label}</span>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-800">
                <Stethoscope size={20} className="text-teal-600" /> Reason for Visit
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">
                    Symptoms <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={form.symptoms}
                    onChange={(e) => setForm((p) => ({ ...p, symptoms: e.target.value }))}
                    placeholder="Describe your symptoms..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-slate-600">
                    Additional Notes <span className="text-slate-400">(optional)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Any other information for the doctor..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-teal-100 sticky top-6">
              <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-slate-800">
                <FileText size={20} className="text-teal-600" /> Summary
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Doctor", value: doctorName },
                  { label: "Specialty", value: specialization },
                  selectedMode && {
                    label: "Mode",
                    value: selectedMode === "online" ? "Online / Video" : "In-Person / Clinic",
                  },
                  selectedAvailability?.location?.clinicName && {
                    label: "Clinic",
                    value: selectedAvailability.location.clinicName,
                  },
                  selectedAvailability?.location && selectedMode === "offline" && {
                    label: "Address",
                    value: `${selectedAvailability.location.addressLine}, ${selectedAvailability.location.city}`,
                  },
                  form.appointmentDate && {
                    label: "Date",
                    value: new Date(form.appointmentDate).toLocaleDateString("en-IN"),
                  },
                  form.timeSlot && { label: "Time", value: form.timeSlot.label },
                ]
                  .filter(Boolean)
                  .map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-3">
                      <span className="text-slate-500 shrink-0">{label}</span>
                      <span className="font-medium text-slate-800 text-right">{value}</span>
                    </div>
                  ))}
                <div className="pt-4 mt-2 border-t border-slate-100 flex justify-between items-center text-base font-semibold">
                  <span className="text-slate-700">Fee</span>
                  <span className="text-teal-700">₹{fee}</span>
                </div>
              </div>

              {error && (
                <div className="mt-5 p-3 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-xs border border-rose-100">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!form.timeSlot || !isDateValid || !selectedAvailability}
                className="mt-6 w-full py-3.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                Proceed to Pay ₹{fee}
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-3">
                Appointment is created only after successful payment
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
