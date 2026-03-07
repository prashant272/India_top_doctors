"use client";

import { useState, useEffect, useRef, useContext, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
    Calendar, Clock, Video, MapPin, CheckCircle, XCircle,
    AlertCircle, ChevronDown, ChevronUp, Stethoscope, FileText,
    IndianRupee, RefreshCw, Filter, Search, Loader2, ChevronLeft,
    Zap, Hash, Activity, Users, HeartPulse, Phone, Droplets,
} from "lucide-react";
import useAppointment from "@/app/hooks/useAppointment";
import { AuthContext } from "@/app/context/AuthContext";
import { SocketContext } from "@/app/context/SocketContext";

const STATUS_CONFIG = {
    pending: {
        label: "Pending", color: "text-amber-600", bg: "bg-amber-50",
        border: "border-amber-200", bar: "from-amber-400 to-orange-400",
        dot: "bg-amber-400", icon: AlertCircle, cardAccent: "border-l-amber-400",
        hoverBg: "hover:bg-amber-50",
    },
    confirmed: {
        label: "Confirmed", color: "text-emerald-600", bg: "bg-emerald-50",
        border: "border-emerald-200", bar: "from-emerald-400 to-teal-400",
        dot: "bg-emerald-400", icon: CheckCircle, cardAccent: "border-l-emerald-400",
        hoverBg: "hover:bg-emerald-50",
    },
    in_progress: {
        label: "In Progress", color: "text-violet-600", bg: "bg-violet-50",
        border: "border-violet-200", bar: "from-violet-400 to-purple-400",
        dot: "bg-violet-400", icon: Activity, cardAccent: "border-l-violet-400",
        hoverBg: "hover:bg-violet-50",
    },
    completed: {
        label: "Completed", color: "text-sky-600", bg: "bg-sky-50",
        border: "border-sky-200", bar: "from-sky-400 to-indigo-400",
        dot: "bg-sky-400", icon: CheckCircle, cardAccent: "border-l-sky-400",
        hoverBg: "hover:bg-sky-50",
    },
    cancelled: {
        label: "Cancelled", color: "text-rose-500", bg: "bg-rose-50",
        border: "border-rose-200", bar: "from-rose-400 to-pink-400",
        dot: "bg-rose-400", icon: XCircle, cardAccent: "border-l-rose-400",
        hoverBg: "hover:bg-rose-50",
    },
    missed: {
        label: "Missed", color: "text-orange-600", bg: "bg-orange-50",
        border: "border-orange-200", bar: "from-orange-400 to-red-400",
        dot: "bg-orange-400", icon: AlertCircle, cardAccent: "border-l-orange-400",
        hoverBg: "hover:bg-orange-50",
    },
};

const STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    in_progress: ["completed"],
    completed: [], cancelled: [], missed: [],
};

const TABS = ["Today", "Upcoming", "Past"];
const STATUS_FILTERS = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled", "missed"];

function StatusDropdown({ transitions, onSelect, onClose, anchorEl }) {
    const dropdownRef = useRef(null);
    const [style, setStyle] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorEl) {
            const rect = anchorEl.getBoundingClientRect();
            setStyle({
                top: rect.bottom + window.scrollY + 6,
                left: rect.left + window.scrollX,
            });
        }
    }, [anchorEl]);

    useEffect(() => {
        const handle = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) && !anchorEl?.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [onClose, anchorEl]);

    const dropdown = (
        <div
            ref={dropdownRef}
            style={{ position: "absolute", top: style.top, left: style.left, zIndex: 9999 }}
            className="bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 overflow-hidden min-w-[180px]"
        >
            <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Change Status</p>
            </div>
            {transitions.map((s) => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                return (
                    <button
                        key={s}
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onSelect(s); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-all duration-150 ${cfg.hoverBg}`}
                    >
                        <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                        <span className={cfg.color}>{cfg.label}</span>
                    </button>
                );
            })}
        </div>
    );

    if (typeof document === "undefined") return null;
    return createPortal(dropdown, document.body);
}

function AppointmentCard({ appointment, role, onCancel, onReschedule, onUpdateStatus }) {
    const router = useRouter();
    const [expanded, setExpanded] = useState(false);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [updating, setUpdating] = useState(false);
    const triggerRef = useRef(null);

    const status = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.pending;
    const StatusIcon = status.icon;
    const availableTransitions = STATUS_TRANSITIONS[appointment.status] || [];

    const date = new Date(appointment.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDay = new Date(date);
    apptDay.setHours(0, 0, 0, 0);
    const isToday = apptDay.getTime() === today.getTime();
    const isTomorrow = apptDay.getTime() === today.getTime() + 86400000;

    const formattedDate = date.toLocaleDateString("en-IN", {
        weekday: "short", day: "numeric", month: "short", year: "numeric",
    });

    const patientInfo = appointment.Patient?.basicInfo;
    const patientName = patientInfo?.fullName || "Patient";
    const patientAge = patientInfo?.age && patientInfo.age > 0 ? patientInfo.age : null;
    const patientGender = patientInfo?.gender;
    const patientBloodGroup = patientInfo?.bloodGroup;
    const patientPhone = patientInfo?.phone;
    const patientId = appointment.Patient?._id || appointment?.Patient;

    const doctorName = appointment.doctor?.basicInfo?.fullName || "Doctor";
    const doctorImage = appointment.doctor?.basicInfo?.profileImage;
    const specialization = appointment.doctor?.professionalInfo?.specialization || "Specialist";
    const amount = appointment.amount || appointment.doctor?.professionalInfo?.consultationFee || 0;
    const isVideo = appointment.consultationType === "video";
    const isVideoConfirmed = isVideo && appointment.status === "confirmed";
    const isInProgress = appointment.status === "in_progress";
    const shortId = appointment._id ? `#${appointment._id.slice(-6).toUpperCase()}` : "";

    const displayName = role === "doctor" ? patientName : doctorName;
    const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        setStatusDropdownOpen(false);
        await onUpdateStatus(appointment._id, newStatus, patientId);
        setUpdating(false);
    };

    const handleStartCall = () => router.push(`/doctor/video-call/${appointment._id}?patientId=${patientId}`);
    const handleJoinCall = () => router.push(`/patient/video-call/${appointment._id}`);

    return (
        <div className={`group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300 flex flex-col border-l-4 ${status.cardAccent}`}>
            <div className={`h-1 w-full bg-gradient-to-r ${status.bar}`} />

            {(isToday || isTomorrow) && (
                <div className={`flex items-center gap-2 px-5 py-2 border-b ${isToday ? "bg-rose-50 border-rose-100" : "bg-violet-50 border-violet-100"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isToday ? "bg-rose-500" : "bg-violet-400"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${isToday ? "text-rose-600" : "text-violet-600"}`}>
                        {isToday ? "Today's Appointment" : "Tomorrow"}
                    </span>
                </div>
            )}

            {appointment.status === "missed" && (
                <div className="flex items-center gap-2 px-5 py-2 bg-orange-50 border-b border-orange-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] text-orange-600">Appointment Missed</span>
                </div>
            )}

            {isInProgress && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-violet-600">Call In Progress</span>
                    </div>
                    <button
                        onClick={role === "doctor" ? handleStartCall : handleJoinCall}
                        className="flex items-center gap-1.5 px-3 py-1 bg-violet-600 text-white font-black text-[10px] uppercase tracking-wider rounded-lg hover:bg-violet-700 transition-all shadow-md shadow-violet-500/25"
                    >
                        <Video className="w-3 h-3" /> Rejoin
                    </button>
                </div>
            )}

            {isVideoConfirmed && (
                <div className="flex items-center justify-between px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">Video Consultation Ready</span>
                    </div>
                    <button
                        onClick={role === "doctor" ? handleStartCall : handleJoinCall}
                        className={`flex items-center gap-1.5 px-3 py-1 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-md ${role === "doctor" ? "bg-violet-600 hover:bg-violet-700 shadow-violet-500/25" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25"}`}
                    >
                        <Video className="w-3 h-3" />
                        {role === "doctor" ? "Start Call" : "Join Now"}
                    </button>
                </div>
            )}

            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                        {role === "patient" && doctorImage ? (
                            <img src={doctorImage} alt={doctorName} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                        ) : (
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black shadow-md ${role === "doctor" ? "bg-gradient-to-br from-rose-100 via-rose-200 to-orange-100 text-rose-700" : "bg-gradient-to-br from-sky-100 via-sky-200 to-indigo-100 text-sky-700"}`}>
                                {initials}
                            </div>
                        )}
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${status.dot}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="font-black text-slate-800 text-[15px] leading-tight truncate">
                                    {displayName}
                                </h3>
                                {role === "doctor" ? (
                                    <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                                        {patientAge && (
                                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-lg">{patientAge} yrs</span>
                                        )}
                                        {patientGender && (
                                            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-lg border border-rose-100 capitalize">{patientGender}</span>
                                        )}
                                        {patientBloodGroup && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] bg-red-500 text-white font-black px-2 py-0.5 rounded-lg">
                                                <Droplets className="w-2.5 h-2.5" />{patientBloodGroup}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-xs text-sky-600 font-bold mt-1">{specialization}</p>
                                )}
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border flex-shrink-0 ${status.bg} ${status.border} ${status.color}`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-mono">
                                <Hash className="w-2.5 h-2.5" />{shortId}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-2xl px-3 py-2.5">
                        <Calendar className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                        <span className="text-[11px] text-slate-700 font-semibold truncate">{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl px-3 py-2.5">
                        <Clock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                        <span className="text-[11px] text-slate-700 font-semibold truncate">
                            {appointment.timeSlot?.start} – {appointment.timeSlot?.end}
                        </span>
                    </div>
                    <div className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 border ${isVideo ? "bg-sky-50 border-sky-100" : "bg-teal-50 border-teal-100"}`}>
                        {isVideo
                            ? <Video className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                            : <MapPin className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />}
                        <span className="text-[11px] text-slate-700 font-semibold">
                            {isVideo ? "Video Call" : "In-Person"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
                        <IndianRupee className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-700">₹{amount}</span>
                        <span className={`text-[10px] font-black ml-auto ${appointment.isPaid ? "text-emerald-500" : "text-rose-500"}`}>
                            {appointment.isPaid ? "✓ Paid" : "✗ Due"}
                        </span>
                    </div>
                </div>

                {expanded && (
                    <div className="mb-4 space-y-2.5 border-t border-slate-100 pt-4">
                        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-2xl px-3 py-2.5">
                            <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appointment ID</p>
                                <p className="text-[11px] text-slate-700 font-bold font-mono">{appointment._id}</p>
                            </div>
                        </div>
                        {role === "doctor" && patientPhone && (
                            <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-100 rounded-2xl px-3 py-2.5">
                                <Phone className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Patient Contact</p>
                                    <p className="text-[12px] text-slate-700 font-semibold">{patientPhone}</p>
                                </div>
                            </div>
                        )}
                        {appointment.callDuration > 0 && (
                            <div className="flex items-center gap-2.5 bg-violet-50 border border-violet-100 rounded-2xl px-3 py-2.5">
                                <Clock className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest">Call Duration</p>
                                    <p className="text-[11px] text-slate-700 font-semibold">
                                        {Math.floor(appointment.callDuration / 60)}m {appointment.callDuration % 60}s
                                    </p>
                                </div>
                            </div>
                        )}
                        {appointment.symptoms && (
                            <div className="flex items-start gap-2.5 bg-teal-50 border border-teal-100 rounded-2xl p-3">
                                <Stethoscope className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Symptoms</p>
                                    <p className="text-[12px] text-slate-700 leading-relaxed">{appointment.symptoms}</p>
                                </div>
                            </div>
                        )}
                        {appointment.notes && (
                            <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-100 rounded-2xl p-3">
                                <FileText className="w-4 h-4 text-sky-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Notes</p>
                                    <p className="text-[12px] text-slate-700 leading-relaxed">{appointment.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
                    {availableTransitions.length > 0 && (
                        <div className="relative">
                            <button
                                ref={triggerRef}
                                onClick={() => setStatusDropdownOpen((prev) => !prev)}
                                disabled={updating}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition-all duration-200 shadow-lg shadow-slate-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                {updating ? "Updating..." : "Update Status"}
                                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                            {statusDropdownOpen && (
                                <StatusDropdown
                                    transitions={availableTransitions}
                                    onSelect={handleStatusUpdate}
                                    onClose={() => setStatusDropdownOpen(false)}
                                    anchorEl={triggerRef.current}
                                />
                            )}
                        </div>
                    )}

                    {(isVideoConfirmed || isInProgress) && role === "doctor" && (
                        <button
                            onClick={handleStartCall}
                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white font-bold text-xs rounded-xl hover:bg-violet-700 transition-all duration-200 shadow-lg shadow-violet-500/25"
                        >
                            <Video className="w-3.5 h-3.5" />
                            {isInProgress ? "Rejoin" : "Start Call"}
                        </button>
                    )}

                    {(isVideoConfirmed || isInProgress) && role === "patient" && (
                        <button
                            onClick={handleJoinCall}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all duration-200 shadow-lg shadow-emerald-500/25"
                        >
                            <Video className="w-3.5 h-3.5" />
                            {isInProgress ? "Rejoin" : "Join Call"}
                        </button>
                    )}

                    {role === "doctor" && appointment.status === "completed" && (
                        <button
                            onClick={() => router.push(`/doctor/Addprescription/${appointment._id}`)}
                            className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white font-bold text-xs rounded-xl hover:bg-sky-600 transition-all duration-200 shadow-lg shadow-sky-500/25"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Add Prescription
                        </button>
                    )}

                    {role === "patient" && ["pending", "confirmed"].includes(appointment.status) && (
                        <button
                            onClick={() => onReschedule(appointment._id)}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-amber-200 text-amber-600 font-bold text-xs rounded-xl hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Reschedule
                        </button>
                    )}

                    {role === "patient" && ["pending", "confirmed"].includes(appointment.status) && (
                        <button
                            onClick={() => onCancel(appointment._id)}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-rose-200 text-rose-500 font-bold text-xs rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all duration-200"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                    )}

                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="ml-auto flex items-center gap-1.5 px-3 py-2 text-slate-400 font-semibold text-xs rounded-xl hover:text-slate-600 hover:bg-slate-50 transition-all duration-200"
                    >
                        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        {expanded ? "Less" : "Details"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
    return (
        <div className={`${bg} rounded-2xl p-5 border border-white/60 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow duration-200`}>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} bg-white shadow-sm`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-2xl font-black text-slate-800 leading-none">{value}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">{label}</p>
            </div>
        </div>
    );
}

export default function DoctorMyAppointments() {
    const router = useRouter();
    const auth = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const {
        fetchAppointments, fetchAppointmentById,
        updateAppointment, confirmAppointment, cancelAppointment,
        loading, error,
    } = useAppointment();

    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState(0);
    const [statusFilter, setStatusFilter] = useState("all");
    const [nameSearch, setNameSearch] = useState("");
    const [idSearch, setIdSearch] = useState("");
    const [idResult, setIdResult] = useState(null);
    const [idSearchMode, setIdSearchMode] = useState(false);
    const [idLoading, setIdLoading] = useState(false);
    const [idError, setIdError] = useState("");

    const userRole = auth?.UserAuthData?.role;

    useEffect(() => {
        const load = async () => {
            const role = auth?.UserAuthData?.role;
            const id = auth?.UserAuthData?.userId || auth?.UserAuthData?._id;
            if (!role || !id) return;
            const res = await fetchAppointments(role, id);
            if (res?.status === 200) {
                const data = res.data?.data || res.data || [];
                setAppointments(Array.isArray(data) ? data : []);
            }
        };
        load();
    }, [auth?.UserAuthData?.role, auth?.UserAuthData?.userId, auth?.UserAuthData?._id]);

    useEffect(() => {
        if (!socket) return;

        const upsert = (incoming) => {
            if (!incoming?._id) return;
            setAppointments((prev) => {
                const exists = prev.some((a) => a._id === incoming._id);
                if (exists) return prev.map((a) => a._id === incoming._id ? { ...a, ...incoming } : a);
                return [incoming, ...prev];
            });
            setIdResult((prev) => prev?._id === incoming._id ? { ...prev, ...incoming } : prev);
        };

        const handleAppointmentEvent = (payload) => {
            const appt =
                payload?.notification?.appointment ||
                payload?.data?.appointment ||
                payload?.appointment ||
                payload?.data ||
                payload;
            upsert(appt);
        };

        const handleMissed = (data) => {
            if (!data?.appointmentId) return;
            setAppointments((prev) =>
                prev.map((a) => a._id === data.appointmentId ? { ...a, status: "missed" } : a)
            );
            setIdResult((prev) => prev?._id === data.appointmentId ? { ...prev, status: "missed" } : prev);
        };

        const handleCallUpdate = (data) => {
            if (!data?.appointmentId) return;
            setAppointments((prev) =>
                prev.map((a) => a._id === data.appointmentId ? { ...a, ...data } : a)
            );
            setIdResult((prev) => prev?._id === data.appointmentId ? { ...prev, ...data } : prev);
        };

        socket.on("newMessage", handleAppointmentEvent);
        socket.on("appointmentConfirmed", handleAppointmentEvent);
        socket.on("appointmentCancelled", handleAppointmentEvent);
        socket.on("appointmentCompleted", handleAppointmentEvent);
        socket.on("appointmentRescheduled", handleAppointmentEvent);
        socket.on("appointment:missed", handleMissed);
        socket.on("appointment:updated", handleCallUpdate);

        return () => {
            socket.off("newMessage", handleAppointmentEvent);
            socket.off("appointmentConfirmed", handleAppointmentEvent);
            socket.off("appointmentCancelled", handleAppointmentEvent);
            socket.off("appointmentCompleted", handleAppointmentEvent);
            socket.off("appointmentRescheduled", handleAppointmentEvent);
            socket.off("appointment:missed", handleMissed);
            socket.off("appointment:updated", handleCallUpdate);
        };
    }, [socket]);

    const today = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    }, []);

    const tabFiltered = useMemo(() => appointments.filter((appt) => {
        const apptDay = new Date(appt.appointmentDate);
        apptDay.setHours(0, 0, 0, 0);
        if (activeTab === 0) return apptDay.getTime() === today.getTime();
        if (activeTab === 1) return apptDay > today;
        if (activeTab === 2) return apptDay < today;
        return true;
    }), [appointments, activeTab, today]);

    const filtered = useMemo(() => tabFiltered.filter((apt) => {
        const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
        const searchTarget = userRole === "doctor"
            ? apt.Patient?.basicInfo?.fullName || ""
            : apt.doctor?.basicInfo?.fullName || apt.doctor?.basicInfo?.name || "";
        const spec = apt.doctor?.professionalInfo?.specialization || "";
        const matchesName =
            nameSearch === "" ||
            searchTarget.toLowerCase().includes(nameSearch.toLowerCase()) ||
            (userRole !== "doctor" && spec.toLowerCase().includes(nameSearch.toLowerCase()));
        return matchesStatus && matchesName;
    }), [tabFiltered, statusFilter, nameSearch, userRole]);

    const tabCounts = useMemo(() => TABS.map((_, index) =>
        appointments.filter((appt) => {
            const apptDay = new Date(appt.appointmentDate);
            apptDay.setHours(0, 0, 0, 0);
            if (index === 0) return apptDay.getTime() === today.getTime();
            if (index === 1) return apptDay > today;
            if (index === 2) return apptDay < today;
            return false;
        }).length
    ), [appointments, today]);

    const counts = useMemo(() => STATUS_FILTERS.reduce((acc, f) => {
        acc[f] = f === "all" ? tabFiltered.length : tabFiltered.filter((a) => a.status === f).length;
        return acc;
    }, {}), [tabFiltered]);

    const totalPatients = appointments.length;
    const todayCount = tabCounts[0];
    const confirmedCount = useMemo(() => appointments.filter((a) => a.status === "confirmed").length, [appointments]);
    const missedCount = useMemo(() => appointments.filter((a) => a.status === "missed").length, [appointments]);

    const handleIdSearch = async () => {
        const trimmed = idSearch.trim();
        if (!trimmed) return;
        setIdLoading(true);
        setIdError("");
        setIdResult(null);
        setIdSearchMode(true);
        const res = await fetchAppointmentById(trimmed);
        if (res?.status === 200) {
            const data = res.data?.data || res.data || null;
            data ? setIdResult(data) : setIdError("No appointment found with this ID.");
        } else {
            setIdError("No appointment found with this ID.");
        }
        setIdLoading(false);
    };

    const handleClearIdSearch = () => {
        setIdSearch("");
        setIdResult(null);
        setIdSearchMode(false);
        setIdError("");
    };

    const syncAppointmentState = useCallback((id, updates) => {
        setAppointments((prev) => prev.map((apt) => apt._id === id ? { ...apt, ...updates } : apt));
        setIdResult((prev) => prev?._id === id ? { ...prev, ...updates } : prev);
    }, []);

    const handleCancel = useCallback(async (id) => {
        const res = await cancelAppointment(id);
        if (res?.status === 200) syncAppointmentState(id, { status: "cancelled" });
    }, [cancelAppointment, syncAppointmentState]);

    const handleReschedule = useCallback((id) => router.push(`/patient/reschedule/${id}`), [router]);

    const handleUpdateStatus = useCallback(async (appointmentId, newStatus, patientId) => {
        let res;
        if (newStatus === "confirmed") res = await confirmAppointment(appointmentId);
        else if (newStatus === "cancelled") res = await cancelAppointment(appointmentId);
        else res = await updateAppointment(appointmentId, { status: newStatus });
        if (res?.status === 200) syncAppointmentState(appointmentId, { status: newStatus });
    }, [confirmAppointment, cancelAppointment, updateAppointment, syncAppointmentState]);

    const TABS_CONFIG = [
        { label: "Today", color: "bg-rose-600 text-white shadow-rose-200 shadow-lg", inactive: "text-slate-600 hover:bg-slate-100" },
        { label: "Upcoming", color: "bg-violet-600 text-white shadow-violet-200 shadow-lg", inactive: "text-slate-600 hover:bg-slate-100" },
        { label: "Past", color: "bg-slate-700 text-white shadow-slate-200 shadow-lg", inactive: "text-slate-600 hover:bg-slate-100" },
    ];

    return (
        <section className="min-h-screen bg-slate-50">
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 mb-6 transition-colors uppercase tracking-wider"
                    >
                        <ChevronLeft size={16} /> Back
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-200">
                                <HeartPulse className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                    {userRole === "doctor" ? "Patient Appointments" : "My Appointments"}
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    {userRole === "doctor" ? "Manage your daily schedule" : "Track all your medical visits"}
                                </p>
                            </div>
                        </div>
                        {userRole === "patient" && (
                            <button
                                onClick={() => router.push("/patient/doctors")}
                                className="self-start sm:self-auto px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-slate-700 transition-all duration-200 shadow-lg shadow-slate-900/20 uppercase tracking-wider"
                            >
                                + Book New
                            </button>
                        )}
                    </div>

                    {userRole === "doctor" && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                            <StatCard icon={Users} label="Total Patients" value={totalPatients} color="text-rose-500" bg="bg-rose-50" />
                            <StatCard icon={Calendar} label="Today" value={todayCount} color="text-violet-500" bg="bg-violet-50" />
                            <StatCard icon={CheckCircle} label="Confirmed" value={confirmedCount} color="text-emerald-500" bg="bg-emerald-50" />
                            <StatCard icon={AlertCircle} label="Missed" value={missedCount} color="text-orange-500" bg="bg-orange-50" />
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 mb-7">
                    <div className="flex gap-2.5 mb-5">
                        <div className="relative flex-1">
                            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="text"
                                placeholder="Search by Appointment ID..."
                                value={idSearch}
                                onChange={(e) => { setIdSearch(e.target.value); if (!e.target.value.trim()) handleClearIdSearch(); }}
                                onKeyDown={(e) => e.key === "Enter" && handleIdSearch()}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all font-medium"
                            />
                        </div>
                        <button
                            onClick={handleIdSearch}
                            disabled={!idSearch.trim() || idLoading}
                            className="px-5 py-2.5 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            {idLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                            Find
                        </button>
                        {idSearchMode && (
                            <button onClick={handleClearIdSearch} className="px-4 py-2.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
                                <XCircle className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-5">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input
                                type="text"
                                placeholder={userRole === "doctor" ? "Search patient name..." : "Search doctor or specialization..."}
                                value={nameSearch}
                                onChange={(e) => setNameSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-400 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
                            {TABS_CONFIG.map((tab, index) => (
                                <button
                                    key={tab.label}
                                    onClick={() => { setActiveTab(index); setStatusFilter("all"); }}
                                    className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 flex items-center gap-2 ${activeTab === index ? tab.color : `bg-transparent ${tab.inactive}`}`}
                                >
                                    {tab.label}
                                    {tabCounts[index] > 0 && (
                                        <span className={`px-1.5 py-0.5 rounded-lg text-[10px] font-black ${activeTab === index ? "bg-white/20 text-white" : "bg-white text-slate-500 shadow-sm"}`}>
                                            {tabCounts[index]}
                                        </span>
                                    )}
                                    {index === 0 && tabCounts[0] > 0 && activeTab !== 0 && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-4 border-t border-slate-100 scrollbar-hide">
                        <Filter className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
                        {STATUS_FILTERS.map((f) => {
                            const cfg = f !== "all" ? STATUS_CONFIG[f] : null;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setStatusFilter(f)}
                                    className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-black capitalize transition-all duration-200 ${statusFilter === f
                                        ? f === "all" ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : `${cfg.bg} ${cfg.color} ${cfg.border} border`
                                        : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-transparent"
                                    }`}
                                >
                                    {f.replace(/_/g, " ")} <span className="opacity-60">({counts[f]})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {idSearchMode && (
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-1 h-4 bg-slate-900 rounded-full" />
                            <h2 className="text-xs font-black text-slate-700 uppercase tracking-[0.15em]">ID Search Result</h2>
                        </div>
                        {idLoading && (
                            <div className="flex items-center justify-center py-16 bg-white rounded-3xl border border-slate-100">
                                <Loader2 className="w-8 h-8 text-slate-300 animate-spin" />
                            </div>
                        )}
                        {idError && !idLoading && (
                            <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-4">
                                <XCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm font-semibold">{idError}</p>
                            </div>
                        )}
                        {idResult && !idLoading && (
                            <div className="grid md:grid-cols-2 gap-5">
                                <AppointmentCard appointment={idResult} role={userRole} onCancel={handleCancel} onReschedule={handleReschedule} onUpdateStatus={handleUpdateStatus} />
                            </div>
                        )}
                    </div>
                )}

                {!idSearchMode && loading && (
                    <div className="flex items-center justify-center py-24">
                        <div className="text-center">
                            <Loader2 className="w-10 h-10 text-slate-300 animate-spin mx-auto mb-3" />
                            <p className="text-xs text-slate-400 font-semibold">Loading appointments...</p>
                        </div>
                    </div>
                )}

                {!idSearchMode && error && !loading && (
                    <div className="flex items-center gap-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl px-5 py-4 mb-6">
                        <XCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm font-semibold">{error}</p>
                    </div>
                )}

                {!idSearchMode && !loading && !error && filtered.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-700 mb-2">No appointments found</h3>
                        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto">
                            {nameSearch ? "No results match your search criteria."
                                : activeTab === 0 ? "Nothing scheduled for today."
                                : activeTab === 1 ? "No upcoming appointments yet."
                                : "No past appointments on record."}
                        </p>
                        {userRole === "patient" && (
                            <button onClick={() => router.push("/patient/doctors")} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/20">
                                Book an Appointment
                            </button>
                        )}
                    </div>
                )}

                {!idSearchMode && !loading && filtered.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-1 h-4 bg-slate-900 rounded-full" />
                                <p className="text-xs font-black text-slate-500 uppercase tracking-[0.15em]">
                                    {filtered.length} {filtered.length === 1 ? "Appointment" : "Appointments"}
                                </p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-5">
                            {filtered.map((apt) => (
                                <AppointmentCard
                                    key={apt._id}
                                    appointment={apt}
                                    role={userRole}
                                    onCancel={handleCancel}
                                    onReschedule={handleReschedule}
                                    onUpdateStatus={handleUpdateStatus}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}